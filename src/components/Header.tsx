import React from "react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-brand-black/95 backdrop-blur-md border-b border-brand-seal/15 py-4 md:py-5 flex items-center justify-center px-6 md:px-12 shadow-sm">
      {/* Elegant Logo matching the uploaded image */}
      <div id="brand-logo" className="flex flex-col items-center select-none text-center">
        <span className="font-script text-brand-ivory text-2.5xl sm:text-3.5xl md:text-[38px] leading-tight select-none tracking-normal py-0.5">
          Nights Worth Remembering
        </span>
        <span className="font-serif text-brand-gray text-[8px] sm:text-[9.5px] md:text-[11px] tracking-[0.2em] mt-1.5 leading-none font-semibold uppercase">
          The Slightly Different Mail Club
        </span>
      </div>
    </header>
  );
}
