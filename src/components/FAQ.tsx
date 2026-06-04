import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, HelpCircle, ShieldAlert } from "lucide-react";
import { FAQItem } from "../types";

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: "delivery",
      question: "When will I receive my first edition?",
      answer: "Subscribers who join before the 25th of the month will receive the upcoming month's edition (for example, joining on June 3rd results in your first physical folder leaving our sorting guild on July 1st). Subscriptions placed after the 25th will begin with the following month's edition.",
    },
    {
      id: "cancel",
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, absolutely. Your subscription operates on a month-to-month schedule with zero long-term commitments or penalty fees. You can pause or cancel your registry account with a single click inside your correspondence portal, or by sending a brief letter/email to our concierge.",
    },
    {
      id: "birthday",
      question: "Do I receive a birthday gift?",
      answer: "Yes. Every verified subscriber of the correspondence club receives an additional themed sensory surprise pack sealed inside their black envelope during their birthday month. Please ensure you declare your correct birthday accurate to your shipping journal during registration.",
    },
    {
      id: "delivery-cost",
      question: "Are shipping and postage fees included?",
      answer: "Yes, standard shipping has been fully integrated into the $11.00 flat-rate price across all European Union member states. Letters are posted first-class via national mail handlers and fit directly inside standard letterboxes. No signature required.",
    }
  ];

  return (
    <section id="faq-section" className="w-full bg-brand-charcoal text-brand-ivory py-16 md:py-24 border-t border-brand-seal/15">
      <div className="w-full max-w-3xl mx-auto px-6">
        
        {/* Header Block */}
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.2em] font-sans text-brand-gray font-semibold">
            Clarifications
          </span>
          <h2 className="font-serif text-2xl md:text-4xl text-brand-ivory font-medium mt-2">
            Frequently Asked Questions
          </h2>
          <div className="w-8 h-0.5 bg-brand-seal mx-auto mt-4" />
        </div>

        {/* Accordion list */}
        <div className="space-y-4 text-left">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-brand-seal/15 rounded-lg bg-brand-black overflow-hidden transition-colors hover:border-brand-seal/35"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex justify-between items-center text-left px-6 py-4 md:py-5 cursor-pointer select-none"
                >
                  <span className="font-serif text-sm md:text-base font-semibold text-brand-ivory">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-brand-seal ml-4"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-5 pt-1 text-xs md:text-sm font-sans font-light text-brand-gray leading-relaxed border-t border-brand-seal/10">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
