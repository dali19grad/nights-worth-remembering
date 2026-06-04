import React from "react";

interface FooterProps {
  onOpenAdmin?: () => void;
}

export default function Footer({ onOpenAdmin }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-brand-black text-brand-gray border-t border-brand-seal/15 py-12 md:py-16 select-none">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center space-y-6">
        
        {/* Branding Sublabel matching the main logo */}
        <div className="flex flex-col items-center text-center select-none">
          <span className="font-script text-brand-ivory text-2.5xl sm:text-3xl leading-tight">
            Nights Worth Remembering
          </span>
          <span className="font-serif text-brand-gray/60 text-[10px] md:text-xs tracking-[0.15em] mt-0.5 leading-none">
            The Slightly Different Mail Club
          </span>
        </div>

        {/* Accepted Payment badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-brand-gray/60">
          <span className="px-2 py-1 bg-brand-charcoal border border-brand-seal/15 rounded tracking-widest text-[10px] uppercase font-semibold">Visa</span>
          <span className="px-2 py-1 bg-brand-charcoal border border-brand-seal/15 rounded tracking-widest text-[10px] uppercase font-semibold">Mastercard</span>
          <span className="px-2 py-1 bg-brand-charcoal border border-brand-seal/15 rounded tracking-widest text-[10px] uppercase font-semibold">Amex</span>
          <span className="px-2 py-1 bg-brand-charcoal border border-brand-seal/15 rounded tracking-widest text-[10px] uppercase font-semibold">PayPal</span>
          <span className="px-2 py-1 bg-brand-charcoal border border-brand-seal/15 rounded tracking-widest text-[10px] uppercase font-semibold">SEPA</span>
        </div>

        {/* Copyright Notice & Curator Entry */}
        <div className="text-[10px] font-sans text-brand-gray/40 text-center tracking-wide space-y-3 pt-4 border-t border-brand-seal/10 w-full max-w-lg flex flex-col items-center">
          <p>© {year} Nights Worth Remembering. All privileges reserved.</p>
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="text-[9px] font-mono tracking-[0.2em] uppercase text-brand-gray/30 hover:text-brand-seal hover:opacity-100 transition-all cursor-pointer"
            >
              ⚜ Curator Portal ⚜
            </button>
          )}
        </div>

      </div>
    </footer>
  );
}
