/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, FlameKindling, Minimize2 } from "lucide-react";
import Header from "./components/Header";
import DeadlineBar from "./components/DeadlineBar";
import ProductForm from "./components/ProductForm";
import AboutClub from "./components/AboutClub";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import InteractiveRitual from "./components/InteractiveRitual";
import { SubscriberData } from "./types";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./lib/firebase";
import AdminPortal from "./components/AdminPortal";
import StripeSandbox from "./components/StripeSandbox";

export default function App() {
  const [view, setView] = useState<"landing" | "success" | "admin">("landing");
  const [subscriberData, setSubscriberData] = useState<SubscriberData | null>(null);
  const [candlelightMode, setCandlelightMode] = useState(false);

  // Check if there is an active membership stored in localStorage for continuity or a Stripe redirect success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const subId = params.get("subscriber_id");
    const sessionId = params.get("session_id");
    
    if (success === "true") {
      const firstName = params.get("firstName") || "";
      const saved = localStorage.getItem("nwr_member");
      let activeMemberData: SubscriberData | null = null;
      
      if (saved) {
        try {
          activeMemberData = JSON.parse(saved);
        } catch (e) {
          // Fall back to compiling from params
        }
      }
      
      if (!activeMemberData) {
        activeMemberData = {
          firstName: firstName || "Premium",
          lastName: params.get("lastName") || "Mitglied",
          email: params.get("email") || "member@nights-worth-remembering.com",
          streetAddress: params.get("streetAddress") || "Weg der Entschleunigung 1",
          postalCode: params.get("postalCode") || "10115",
          city: params.get("city") || "Berlin",
          country: params.get("country") || "Deutschland",
          birthday: params.get("birthday") || "14.11.1994",
        };
      }

      // If we have a sessionId and don't have member details loaded yet, query live from Stripe Checkout Session
      if (sessionId && (!saved || !firstName)) {
        const fetchLiveSessionData = async () => {
          try {
            const response = await fetch(`/api/get-session-info?session_id=${encodeURIComponent(sessionId)}`);
            if (response.ok) {
              const liveData = await response.json();
              setSubscriberData(liveData);
              localStorage.setItem("nwr_member", JSON.stringify(liveData));
              setView("success");
              // Clear URL params
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch (err) {
            console.error("Failed to load live data from Stripe secure session:", err);
          }
        };
        fetchLiveSessionData();
        return;
      }

      // Synchronize database subscription status as finalized
      if (subId) {
        const finalizeDatabaseStatus = async () => {
          try {
            const { updateDoc, doc } = await import("firebase/firestore");
            await updateDoc(doc(db, "subscribers", subId), {
              status: "active"
            });
            console.log("Successfully solidified active membership status for ID:", subId);
          } catch (e) {
            console.warn("Could not finalize status transition (non-blocking):", e);
          }
        };
        finalizeDatabaseStatus();
      }

      if (activeMemberData) {
        setSubscriberData(activeMemberData);
        localStorage.setItem("nwr_member", JSON.stringify(activeMemberData));
        setView("success");
        // Clear query parameters gracefully to restore beautiful URL state
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
    }

    const saved = localStorage.getItem("nwr_member");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSubscriberData(parsed);
      } catch (e) {
        // Safe skip
      }
    }
  }, []);

  const handleSubscribe = async (data: SubscriberData) => {
    // Generate a unique transaction id
    const subscriberId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const docRef = doc(db, "subscribers", subscriberId);

    try {
      // Direct Firestore Guest Submissions (strictly controlled by security rules layout)
      await setDoc(docRef, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        streetAddress: data.streetAddress,
        postalCode: data.postalCode,
        city: data.city,
        country: data.country,
        birthday: data.birthday,
        createdAt: serverTimestamp(), // MANDATORY under "Temporal Integrity" Rules
        status: "active"
      });
    } catch (error) {
      console.error("Firestore persistence failed:", error);
      try {
        handleFirestoreError(error, OperationType.CREATE, `subscribers/${subscriberId}`);
      } catch (processedErr) {
        // Log processed exception structure in console
      }
    }

    setSubscriberData(data);
    localStorage.setItem("nwr_member", JSON.stringify(data));
    setView("success");
    // Scroll smoothly to top on register to witness the wax seal unboxing
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRestart = () => {
    setView("landing");
  };

  const handleClearMembership = () => {
    localStorage.removeItem("nwr_member");
    setSubscriberData(null);
    setView("landing");
  };

  // If viewing the Stripe Sandbox Payment module, render Sandbox Form directly
  if (window.location.pathname === "/stripe-payment-sandbox" || window.location.pathname.startsWith("/stripe-payment-sandbox")) {
    return <StripeSandbox />;
  }

  // If viewing the Admin Panel Curatorial overview, isolate layout from consumer sections
  if (view === "admin") {
    return <AdminPortal onClose={() => setView("landing")} />;
  }

  return (
    <div className={`relative min-h-screen bg-brand-black text-brand-ivory overflow-x-hidden font-sans selection:bg-brand-seal selection:text-brand-black candlelight-transition ${candlelightMode ? "candlelight" : ""}`}>
      
      {/* Dynamic Candlelight Ambience Mode Overlay */}
      <AnimatePresence>
        {candlelightMode && (
          <>
            {/* Cinematic dark home vignette with natural drifting candlelight glow screen filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.82, 0.88, 0.80, 0.86, 0.82],
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                opacity: { duration: 5, repeat: Infinity, ease: "easeInOut" }
              }}
              className="fixed inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_50%_50%,rgba(222,143,38,0.22)_0%,rgba(140,28,28,0.06)_40%,rgba(8,6,4,0.92)_100%)] mix-blend-screen"
            />
            {/* Physical burning candle warm glow under-wash */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.18 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="fixed inset-0 bg-[#A66E38] pointer-events-none mix-blend-color-burn z-40"
              style={{
                boxShadow: "inset 0 0 160px rgba(178, 30, 30, 0.35)",
              }}
            />
          </>
        )}
      </AnimatePresence>

      <Header />

      <AnimatePresence mode="wait">
        {view === "landing" ? (
          <motion.main
            key="landing-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col w-full"
          >
            <DeadlineBar />

            {/* Product Offer Grid & Subscription Form */}
            <ProductForm onSubscribe={handleSubscribe} />

            {/* Brand Philosophy - About section */}
            <AboutClub />

            {/* F.A.Q Section */}
            <FAQ />
          </motion.main>
        ) : (
          <motion.div
            key="success-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {subscriberData && (
              <InteractiveRitual 
                data={subscriberData} 
                onRestart={handleRestart} 
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Block */}
      <Footer onOpenAdmin={() => setView("admin")} />

      {/* Candlelight Lounge Mode floating selector button in bottom-right */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2">
        {subscriberData && view === "landing" && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setView("success")}
            className="bg-brand-charcoal hover:bg-brand-charcoal-light border border-brand-seal/30 text-[9px] tracking-widest font-sans uppercase px-3 py-1.5 rounded shadow-lg text-brand-ivory font-semibold cursor-pointer"
          >
            My Letter Decreed
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCandlelightMode(!candlelightMode)}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-full shadow-xl transition-colors border cursor-pointer select-none ${
            candlelightMode 
              ? "bg-brand-seal hover:bg-brand-seal-hover text-brand-black font-semibold border-brand-seal" 
              : "bg-brand-charcoal hover:bg-brand-charcoal-light text-brand-gray border-brand-seal/20"
          }`}
          title="Toggle Candlelight Lounge Mode"
        >
          {candlelightMode ? (
            <FlameKindling className="w-4 h-4 text-brand-black animate-bounce" />
          ) : (
            <Flame className="w-4 h-4 text-brand-seal" />
          )}
          <span className="text-[10px] uppercase font-sans tracking-widest font-semibold pr-1">
            {candlelightMode ? "Lounge Mode Active" : "Light candles"}
          </span>
        </motion.button>

        {subscriberData && (
          <button
            onClick={handleClearMembership}
            title="Reset Membership for Testing"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-charcoal border border-brand-seal/20 hover:border-rose-300 text-brand-gray hover:text-rose-600 transition-colors cursor-pointer text-[10px]"
          >
            Reset
          </button>
        )}
      </div>

    </div>
  );
}
