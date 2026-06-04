import React from "react";

export default function AboutClub() {
  return (
    <section id="about-club" className="w-full bg-brand-black text-brand-ivory py-24 md:py-40 relative">
      <div className="w-full max-w-4xl mx-auto px-6 md:px-12 flex flex-col space-y-12 items-center">
        
        {/* Copywriting narrative representing the club ethos */}
        <div className="space-y-12 text-center max-w-3xl flex flex-col items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] font-sans text-brand-seal font-semibold">
              The Club Ethos
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-medium text-brand-ivory tracking-tight">
              Why Nights Worth Remembering?
            </h2>
          </div>

          <div className="space-y-8 font-sans font-light text-brand-gray leading-relaxed text-sm md:text-base max-w-2xl text-center">
            <p>
              Life does not need to be extraordinary to be memorable. Yet, we live in a world of constant digital acceleration. We save our finest recipes, beautiful crystal glasses, vintage records, and meaningful conversations for <em className="italic font-semibold text-brand-seal">"another day"</em>—an elusive future that rarely comes.
            </p>
            
            <p>
              <strong className="text-brand-ivory font-bold">Nights Worth Remembering encourages the opposite.</strong> We believe that an ordinary Tuesday evening with a handwritten letter and a beautifully prepared drink can hold more magic than a loud, pre-packaged weekend.
            </p>

            <p>
              Each monthly edition serves as a tactile physical anchor in your mailbox. It is an invitation to slow down, disconnect your screens, dim the lights, light a candle, and enjoy the delicate art of being fully present.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
