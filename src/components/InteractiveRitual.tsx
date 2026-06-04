import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Mail, CheckCircle2, Award, Printer, ArrowRight, NotebookIcon as NotebookPen } from "lucide-react";
import { SubscriberData } from "../types";

interface InteractiveRitualProps {
  data: SubscriberData;
  onRestart: () => void;
}

export default function InteractiveRitual({ data, onRestart }: InteractiveRitualProps) {
  const [sealBroken, setSealBroken] = useState(false);
  const [opening, setOpening] = useState(false);

  // Derive starting edition name based on actual live date
  const today = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  let startingMonthIdx = (today.getMonth() + 1) % 12; // July
  if (today.getDate() > 25) {
    startingMonthIdx = (today.getMonth() + 2) % 12; // August
  }
  const startingEdition = monthNames[startingMonthIdx] + " Edition";

  // Generate a premium Membership Sequence number
  const membershipId = `NWR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleBreakSeal = () => {
    setOpening(true);
    // Sequence timing
    setTimeout(() => {
      setSealBroken(true);
      setOpening(false);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="interactive-ritual-portal" className="w-full bg-brand-black text-brand-ivory min-h-[85vh] flex items-center justify-center p-6 relative overflow-hidden py-16">
      {/* Dynamic particles bounciness */}
      <div className="absolute inset-0 bg-[radial-gradient(#F2ECE6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <AnimatePresence mode="wait">
        {!sealBroken ? (
          /* SECTION 1: Sealed Black Envelope */
          <motion.div
            key="sealed"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92, y: -20 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-xl text-center flex flex-col items-center space-y-8 relative z-10"
          >
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-brand-seal font-semibold">
                An Invitation Sealed for Your Eyes Only
              </span>
              <h1 className="font-serif text-2xl md:text-3xl font-medium text-brand-ivory tracking-tight">
                Your Entrance is Prepared
              </h1>
              <p className="text-brand-gray text-xs font-sans max-w-md mx-auto leading-relaxed">
                Break the cream wax seal to confirm your placement on the private correspondence ledger and reveal your membership credentials.
              </p>
            </div>

            {/* Interactive Black Envelope Box */}
            <div className="relative w-full max-w-[420px] aspect-[1.6/1] bg-[#1C1A17] rounded shadow-2xl border border-white/[0.08] p-6 flex items-center justify-center overflow-hidden group select-none">
              {/* Envelope flap lines */}
              <div className="absolute top-0 inset-x-0 h-1/2 border-b border-black/40 bg-gradient-to-b from-[#25221F] to-[#1C1A17] pointer-events-none transform origin-top skew-y-12" />
              <div className="absolute top-0 inset-x-0 h-1/2 border-b border-black/40 bg-gradient-to-b from-[#25221F] to-[#1C1A17] pointer-events-none transform origin-top -skew-y-12" />

              {/* Holographic address text in soft offwhite */}
              <div className="relative z-10 select-none text-left font-serif text-[#FFF1DF]/80 text-[13px] tracking-wide space-y-0.5">
                <p className="font-sans font-semibold tracking-widest text-[8px] uppercase text-brand-seal/80 mb-1.5">MEMBER DECREE</p>
                <p className="font-medium text-[#FFFDF8]">{data.firstName} {data.lastName}</p>
                <p className="font-sans font-light text-[11px] text-[#A69585]">{data.streetAddress}</p>
                <p className="font-sans font-light text-[11px] text-[#A69585]">{data.postalCode} {data.city}</p>
                <p className="font-sans font-light text-[10px] text-[#A69585]/60 uppercase tracking-widest mt-1">{data.country}</p>
              </div>

              {/* The Wax Seal */}
              <motion.div
                animate={opening ? { 
                  scale: [1, 1.15, 0.85], 
                  rotate: [0, 15, -15, 0],
                  filter: ["brightness(1)", "brightness(1.5)", "brightness(0.3)"]
                } : {}}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                onClick={handleBreakSeal}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-brand-seal hover:bg-brand-seal-hover shadow-[0_0_15px_rgba(242,236,230,0.55)] border-2 border-brand-seal-hover cursor-pointer z-20 flex items-center justify-center select-none active:scale-95"
              >
                {/* Wax Seal monogram detail */}
                <div className="w-12 h-12 rounded-full border border-dashed border-brand-black/25 flex flex-col items-center justify-center select-none">
                  <span className="font-serif text-sm font-semibold tracking-tighter text-brand-black select-none">NWR</span>
                  <span className="text-[7px] text-brand-black/70 uppercase -mt-1 select-none font-sans">SEAL</span>
                </div>
              </motion.div>
            </div>

            <button
              onClick={handleBreakSeal}
              disabled={opening}
              className="px-8 py-3 bg-brand-charcoal hover:bg-brand-charcoal-light border border-brand-seal/30 text-xs font-bold uppercase tracking-[0.25em] transition-all rounded text-brand-ivory cursor-pointer font-sans shadow-md"
            >
              {opening ? "Breaking Wax Seal..." : "Break the Wax Seal →"}
            </button>
          </motion.div>
        ) : (
          /* SECTION 2: Cream Parchment Invitation Letter Revealed */
          <motion.div
            key="revealed"
            initial={{ opacity: 0, y: 35, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 45, damping: 15 }}
            className="w-full max-w-2xl bg-brand-ivory text-brand-black border-2 border-brand-cream rounded-md p-8 md:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative z-10 text-left"
          >
            {/* Fine print layout inner border */}
            <div className="absolute top-3 left-3 right-3 bottom-3 pointer-events-none border border-brand-gray-dark/10" />

            <div className="space-y-8 relative z-10">
              
              {/* Letter Header */}
              <div className="flex justify-between items-start border-b border-brand-gray-dark/15 pb-6">
                <div className="flex flex-col select-none">
                  <span className="font-script text-brand-seal text-3.5xl md:text-4xl leading-none select-none">
                    Nights Worth Remembering
                  </span>
                  <span className="font-serif text-[9px] md:text-[11px] tracking-[0.18em] text-brand-gray-dark mt-1 leading-none font-medium">
                    The Slightly Different Mail Club
                  </span>
                </div>
                <div className="text-right font-sans text-[10px] tracking-wider text-brand-gray-dark uppercase space-y-0.5">
                  <p className="font-semibold text-brand-seal flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Registry Complete
                  </p>
                  <p>SEQUENCE {membershipId}</p>
                  <p>DATE: 03 JUNE MMXXVI</p>
                </div>
              </div>

              {/* The Written Letter Body */}
              <div className="space-y-6 font-serif text-sm md:text-base leading-relaxed text-brand-gray-dark italic">
                <p className="font-sans not-italic font-bold text-xs uppercase tracking-widest text-brand-black mb-3 text-brand-seal">
                  An Official Greeting to {data.firstName} {data.lastName},
                </p>
                
                <p>
                  Your registration onto the private ledger of our association is officially complete. A striking matte black envelope, individually heated and hand-pressed with our wax registry stamp, has been reserved in your name.
                </p>

                <p>
                  Your introductory experience—the highly anticipated <strong className="not-italic font-sans font-bold text-brand-black border-b-2 border-brand-seal pb-0.5">{startingEdition}</strong>—will be posted on the <strong className="not-italic font-sans font-semibold text-brand-black">1st of the upcoming month</strong> and fit cleanly inside your postal letterbox.
                </p>

                <p>
                  Our guild’s design is physical and unhurried. When the black envelope reaches your hands, do not rush. Wait for the dark to settle, prepare your favorite recipe, dim the lights, and light your candles. Let the prompt cards and records guide your focus. 
                </p>

                <p className="not-italic font-normal">
                  Life does not need to be extraordinary to be memorable. From this evening on, your ordinary nights are in good hands.
                </p>
              </div>

              {/* Curators Signature */}
              <div className="flex justify-between items-end border-t border-brand-gray-dark/10 pt-6">
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gray text-xs">With respectful regards,</p>
                  <p className="font-script text-brand-seal text-3xl mt-1 select-none">The Curators</p>
                </div>
                
                {/* Visual Membership Badge */}
                <div className="hidden sm:flex flex-col items-center bg-brand-cream/80 border border-brand-gray-dark/15 p-3 rounded font-sans scale-90">
                  <Award className="w-5 h-5 text-brand-seal mb-1" />
                  <span className="text-[8px] uppercase tracking-widest text-brand-black font-semibold">Gold Tier Member</span>
                  <span className="text-[10px] font-mono text-brand-gray-dark font-medium mt-0.5">{membershipId}</span>
                </div>
              </div>

              {/* Final Confirm Buttons (Print & Resume browsing) */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-between items-center sm:hidden-print">
                <button
                  onClick={handlePrint}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-cream hover:bg-brand-cream/80 border border-brand-gray-dark/20 text-xs font-semibold uppercase tracking-wider rounded text-brand-black cursor-pointer font-sans"
                >
                  <Printer className="w-4 h-4 text-brand-seal" />
                  <span>Print Decree</span>
                </button>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={onRestart}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-seal hover:bg-brand-seal-hover border border-brand-seal text-xs font-semibold uppercase tracking-[0.15em] rounded text-brand-black cursor-pointer font-sans"
                  >
                    <span>Return to Club Lobby</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
