import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  Heart,
  Loader2,
  AlertCircle
} from "lucide-react";
import productEnvelopeImg from "../assets/images/product_envelope_1780488353589.png";
import { SubscriberData } from "../types";

interface ProductFormProps {
  onSubscribe?: (data: SubscriberData) => void;
}

export default function ProductForm({ onSubscribe }: ProductFormProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectError, setRedirectError] = useState("");

  const includedPoints = [
    {
      title: "A letter for the month ahead",
    },
    {
      title: "A collectible postcard",
    },
    {
      title: "A signature cocktail recipe",
    },
    {
      title: "A carefully curated playlist",
    },
    {
      title: "Conversation starters",
    },
    {
      title: "Notes for the evening",
    },
    {
      title: "A collectible sticker",
    },
    {
      title: "A birthday surprise during your birthday month",
    },
  ];

  const handleStartStripeCheckout = () => {
    setIsRedirecting(true);
    setRedirectError("");
    
    // Smooth transition with secure connecting backdrop to maintain luxury aesthetic
    setTimeout(() => {
      window.location.href = "https://buy.stripe.com/9B63cugv29VF2vf7669k400";
    }, 1200);
  };

  return (
    <section id="subscription-offer" className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-16 pb-20 md:pb-36 flex flex-col items-center space-y-16 md:space-y-24">
      {/* Key Content Grid (Product Shot + CTA Detail columns) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-28 items-start">
        {/* LEFT COLUMN: Visual Product Shot */}
        <div className="lg:col-span-6 flex flex-col space-y-4 w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group overflow-hidden rounded-lg border border-brand-seal/15 bg-brand-charcoal p-1.5 shadow-xl"
          >
            {/* Candlelight glow simulation over the oil painting */}
            <div className="absolute inset-0 bg-radial-gradient from-brand-seal/10 to-transparent pointer-events-none" />
            
            <img
              src={productEnvelopeImg}
              alt="An exquisite oil painting of the signature black envelope, hand-sealed with cream wax featuring a leaf imprint"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover rounded shadow-inner transition-transform duration-1000 group-hover:scale-[1.02]"
            />
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Product Details & Immediate CTA */}
        <div className="lg:col-span-6 flex flex-col space-y-12 text-left w-full">
          <div>
            <span className="text-xs uppercase font-sans tracking-[0.25em] text-brand-seal font-semibold">
              The Snail Mail Guild
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-tight text-brand-ivory mt-2 select-none">
              Nights Worth Remembering
            </h1>
            
            <p className="text-brand-gray-dark font-sans font-light leading-relaxed text-sm md:text-base mt-5 max-w-xl">
              A monthly snail mail subscription designed to transform ordinary evenings into memorable rituals. Slow down, break the routine of digital noise, and light a candle for a structured, private sensory experience.
            </p>

            {/* Pristine Pricing Ticker */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 py-6 border-y border-brand-seal/15 w-full max-w-lg gap-4">
              <div className="flex items-baseline space-x-1 font-sans">
                <span className="font-serif text-4xl text-brand-ivory font-bold">$11.00</span>
                <span className="text-brand-gray font-sans text-xs tracking-wider">/ month</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded bg-brand-seal/10 border border-brand-seal/35 text-[10px] uppercase font-bold text-brand-seal tracking-widest font-sans">
                Monthly Subscription
              </span>
            </div>
          </div>

          {/* Direct Subscription Action */}
          <div className="w-full max-w-lg">
            {redirectError && (
              <div className="mb-4 p-4 rounded bg-rose-500/10 border border-rose-500/35 text-rose-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{redirectError}</span>
              </div>
            )}

            <motion.button
              whileHover={{ scale: isRedirecting ? 1 : 1.01 }}
              whileTap={{ scale: isRedirecting ? 1 : 0.99 }}
              disabled={isRedirecting}
              onClick={handleStartStripeCheckout}
              id="begin-subscription-btn"
              className="w-full relative bg-brand-seal hover:bg-brand-seal-hover text-brand-black border border-brand-seal/40 font-sans py-4 px-8 text-xs font-bold uppercase tracking-[0.25em] transition-all rounded shadow-md flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-85 disabled:cursor-not-allowed"
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="w-4 h-4 text-brand-black animate-spin" />
                  <span>Connecting to Stripe...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-brand-black animate-pulse" />
                  <span>Subscribe to Snail Mail</span>
                </>
              )}
            </motion.button>
            
            <div className="flex items-center justify-center mt-4 text-xs text-brand-gray font-sans tracking-wide space-x-2">
              <span>Free Shipping Worldwide</span>
              <span>•</span>
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* List of Points of Inside the Mail */}
      <div className="pt-16 border-t border-brand-seal/15 w-full max-w-5xl flex flex-col items-center text-center font-sans">
        <div className="mb-10 text-center">
          <h3 className="font-serif text-2xl text-brand-ivory font-bold">Inside your envelope</h3>
          <p className="text-[10px] sm:text-xs font-sans tracking-[0.15em] text-brand-gray uppercase mt-1">Every envelope carefully composed with low-tech artifacts</p>
        </div>
        
        <ul className="flex flex-col items-center space-y-4 max-w-xl mx-auto text-center font-sans">
          {includedPoints.map((item, idx) => (
            <li 
              key={idx} 
              className="flex items-center justify-center space-x-3 text-sm sm:text-base font-bold text-brand-ivory tracking-wide"
            >
              <Heart className="w-4 h-4 fill-brand-seal text-brand-seal flex-shrink-0" />
              <span>{item.title}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* FULL-SCREEN AMBIENT SEAMLESS LOADING BACKDROP OVERLAY */}
      <AnimatePresence>
        {isRedirecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#120E0A]/95 backdrop-blur-md text-brand-ivory"
          >
            <div className="relative flex flex-col items-center max-w-md p-8 text-center space-y-6">
              {/* Outer orbit animation of branding elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="w-16 h-16 rounded-full border border-dashed border-brand-seal/40 flex items-center justify-center"
              >
                <Sparkles className="w-5 h-5 text-brand-seal animate-pulse" />
              </motion.div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-brand-seal font-bold">
                  Sicherer Kaufvorgang
                </span>
                <h2 className="font-serif text-xl font-medium tracking-tight text-brand-ivory">
                  Weiterleitung zu Stripe Checkout
                </h2>
                <p className="text-xs font-sans text-brand-gray leading-relaxed max-w-xs">
                  Bitte warten Sie, während wir Ihre verschlüsselte Abonnement-Sitzung initialisieren. Ihre Versandadresse und Geburtsdatum werden direkt im Anschluss sicher über Stripe hinterlegt.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-[10px] text-brand-gray font-mono tracking-wider border-t border-brand-seal/10 pt-4 w-full justify-center">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="uppercase text-emerald-600 font-bold">SSL 256-Bit</span>
                <span>•</span>
                <ShieldCheck className="w-3.5 h-3.5 text-brand-seal" />
                <span>Stripe Verified</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
