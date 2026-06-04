import React from "react";
import { Heart } from "lucide-react";

export default function DeadlineBar() {
  // Month Names for dynamic presentation
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Use actual live date instead of hardcoded mock date
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonthIdx = currentDate.getMonth(); // 0 = Jan, 5 = June

  // Determine starting edition and deadline details
  let targetMonthIdx = (currentMonthIdx + 1) % 12; // July
  let deadlineMonthIdx = currentMonthIdx; // June

  if (currentDay > 25) {
    targetMonthIdx = (currentMonthIdx + 2) % 12; // August
    deadlineMonthIdx = (currentMonthIdx + 1) % 12; // July
  }

  const editionName = `${monthNames[targetMonthIdx]} Edition`;
  const deadlineDay = 25;
  const deadlineMonthName = monthNames[deadlineMonthIdx];

  return (
    <div id="deadline-bar" className="w-full bg-brand-seal text-[11px] md:text-xs font-sans border-b border-brand-seal-hover/60 py-2.5 px-6 flex justify-center items-center gap-1.5 sm:gap-6 text-brand-cream tracking-[0.1em] select-none text-center shadow-inner">
      <div className="flex items-center space-x-2">
        <Heart className="w-3.5 h-3.5 fill-brand-cream text-brand-cream animate-pulse flex-shrink-0" />
        <span>
          Join before <strong className="text-white normal-case font-bold">{deadlineMonthName} {deadlineDay}th</strong> to receive the upcoming <span className="text-white font-bold italic underline decoration-white decoration-2 underline-offset-4">{editionName}</span>.
        </span>
      </div>
    </div>
  );
}
