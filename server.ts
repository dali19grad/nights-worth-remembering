import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Firebase configuration manually to bypass TS compilation / assertion rules cleanly
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));

// Initialize secure Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}
const adminDb = getFirestore(undefined, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Stripe Webhook Endpoint (MUST be configured before express.json() to capture raw payload buffer for signature validation)
  app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    let event: Stripe.Event;
    const signature = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const apiKey = process.env.STRIPE_SECRET_KEY;

    try {
      if (apiKey && webhookSecret && signature) {
        const stripe = new Stripe(apiKey);
        event = stripe.webhooks.constructEvent(
          req.body,
          signature as string,
          webhookSecret
        );
      } else {
        // Fallback parsing body directly if Stripe is not fully configured or in sandbox testing
        console.warn("Stripe webhook received without database verification. Processing raw event payload.");
        const payloadString = req.body.toString("utf8");
        event = JSON.parse(payloadString);
      }
    } catch (err: any) {
      console.error(`Stripe Webhook signature verification issue:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`Webhook Event Received: ${event.type}`);

    // Process completed checkout session event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriberId = session.metadata?.subscriberId || session.client_reference_id;
      const stripeCustomerId = session.customer as string;
      const stripeSessionId = session.id;

      if (subscriberId) {
        try {
          const docRef = adminDb.collection("subscribers").doc(subscriberId);
          await docRef.update({
            status: "active",
            paymentStatus: "paid",
            stripeCustomerId: stripeCustomerId || "cus_live_unknown",
            stripeSessionId: stripeSessionId || "cs_live_unknown",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`Webhook successfully active: Solidified member status for sub ${subscriberId}`);
        } catch (dbErr: any) {
          console.error(`Webhook database sync failure for subscriber ${subscriberId}:`, dbErr.message);
          return res.status(500).send(`Database Error: ${dbErr.message}`);
        }
      } else {
        console.warn("Event processed successfully, but metadata.subscriberId is missing.");
      }
    }

    return res.json({ received: true });
  });

  // 2. Parse general application/json payloads for other API endpoints
  app.use(express.json());

  // Helper to dynamically calculate base application URL including reverse-proxy SSL configurations
  const getAppUrl = (req: express.Request) => {
    if (process.env.APP_URL) return process.env.APP_URL;
    const origin = req.get("origin");
    if (origin) return origin;
    const host = req.get("host");
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    if (host) return `${protocol}://${host}`;
    return "http://localhost:3000";
  };

  // API Route for secure client-to-server subscriber session initialization
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { subscriberId } = req.body || {};
      const subId = subscriberId || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      const baseUrl = getAppUrl(req);
      const successUrl = `${baseUrl}?success=true&session_id={CHECKOUT_SESSION_ID}&subscriber_id=${subId}`;
      const cancelUrl = `${baseUrl}?cancel=true&subscriber_id=${subId}`;

      const apiKey = process.env.STRIPE_SECRET_KEY;

      // 1. Conditional sandbox switch if key is physically missing
      if (!apiKey) {
        console.warn("Stripe private keys unconfigured. Relocating subscriber to visual payments sandbox.");
        const params = new URLSearchParams({
          subscriberId: subId,
          successUrl,
          cancelUrl
        });
        return res.json({ url: `/stripe-payment-sandbox?${params.toString()}` });
      }

      // 2. Fire standard Stripe API implementation
      const stripe = new Stripe(apiKey);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Nights Worth Remembering Subscription",
                description: "Monthly subscription package delivering hand-sealed physical correspondence, low-tech artifacts, postcards, and sensory rituals.",
              },
              unit_amount: 1100, // 11.00 USD
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        // Force Stripe to collect shipping addresses for EU and US member states
        shipping_address_collection: {
          allowed_countries: ["DE", "AT", "CH", "FR", "NL", "BE", "IT", "GB", "US", "ES", "DK", "SE"],
        },
        billing_address_collection: "required",
        // Collect Birthday as custom mandatory text field
        custom_fields: [
          {
            key: "birthdate",
            label: {
              type: "custom",
              custom: "Geburtsdatum (TT.MM.JJJJ) / Date of Birth (DD.MM.YYYY)",
            },
            type: "text",
            optional: false
          }
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          subscriberId: subId
        }
      });

      // Optionally record pending status in database, safely continuing if database is not set up
      try {
        const docRef = adminDb.collection("subscribers").doc(subId);
        await docRef.set({
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          status: "pending",
          stripeSessionId: session.id
        });
      } catch (dbErr) {
        console.warn("Could not save pending subscriber record to Firestore database (bypassed):", dbErr);
      }

      return res.json({ url: session.url });
    } catch (err: any) {
      console.error("Failed to generate payment session:", err);
      return res.status(500).json({ error: err.message || "Failed to contact payment providers." });
    }
  });

  // API Route to retrieve checkout session details from Stripe to preserve a database-free architecture
  app.get("/api/get-session-info", async (req, res) => {
    try {
      const sessionId = req.query.session_id as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID parameter is required." });
      }

      const apiKey = process.env.STRIPE_SECRET_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "Stripe key is unconfigured. Cannot fetch live session details." });
      }

      const stripe = new Stripe(apiKey);
      const session = (await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items"]
      })) as any;

      // Extract Name and Contact info
      const fullName = session.shipping_details?.name || session.customer_details?.name || "Premium Member";
      const email = session.customer_details?.email || "";
      
      const parts = fullName.split(" ");
      const firstName = parts[0] || "Premium";
      const lastName = parts.slice(1).join(" ") || "Member";

      // Extract Addresses
      const address = session.shipping_details?.address || session.customer_details?.address || {};
      const streetAddress = address.line1 ? `${address.line1}${address.line2 ? ', ' + address.line2 : ''}` : "";
      const postalCode = address.postal_code || "";
      const city = address.city || "";
      const country = address.country || "Germany";

      // Extract Birthday Custom Field
      let birthday = "";
      if (session.custom_fields) {
        const birthdayField = session.custom_fields.find((f: any) => f.key === "birthdate");
        if (birthdayField && birthdayField.text) {
          birthday = birthdayField.text.value || "";
        }
      }

      // Optionally sync database values if database matches
      try {
        const subId = session.metadata?.subscriberId || `sub_sync_${Date.now()}`;
        const docRef = adminDb.collection("subscribers").doc(subId);
        await docRef.set({
          firstName,
          lastName,
          email,
          streetAddress,
          postalCode,
          city,
          country,
          birthday,
          status: "active",
          paymentStatus: "paid",
          stripeCustomerId: session.customer || "cus_unknown",
          stripeSessionId: session.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`Successfully synced active subscriber info into Firestore for sub ID ${subId}`);
      } catch (dbErr) {
        console.warn("Firestore sync not executed or failed (continuing naturally):", dbErr);
      }

      return res.json({
        firstName,
        lastName,
        email,
        streetAddress,
        postalCode,
        city,
        country,
        birthday
      });
    } catch (err: any) {
      console.error("Failed to retrieve checkout session info from Stripe:", err);
      return res.status(500).json({ error: err.message || "Failed to fetch session detail coordinates." });
    }
  });

  // API Route simulating instant Stripe success callbacks during Sandbox flow
  app.post("/api/simulate-payment-success", async (req, res) => {
    try {
      const { subscriberId } = req.body;
      if (!subscriberId) {
        return res.status(400).json({ error: "subscriberId is required for simulation." });
      }

      console.log(`Simulation Target active: Solidifying subscriber: ${subscriberId}`);
      const docRef = adminDb.collection("subscribers").doc(subscriberId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return res.status(404).json({ error: "Subscriber was not registered in pending state." });
      }

      // Update as paid and active in database
      await docRef.update({
        status: "active",
        paymentStatus: "paid",
        stripeCustomerId: `cus_sandbox_${Math.random().toString(36).substring(2, 11)}`,
        stripeSessionId: `cs_sandbox_${Math.random().toString(36).substring(2, 11)}`,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Simulation Sync Successful for subscriber: ${subscriberId}`);
      return res.json({ success: true });
    } catch (err: any) {
      console.error("Simulation database finalize failed:", err);
      return res.status(500).json({ error: err.message || "Failed to execute simulation logic." });
    }
  });

  // Vite development server integration or production build delivery
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NWR Server launched and listening on port ${PORT}`);
  });
}

startServer();
