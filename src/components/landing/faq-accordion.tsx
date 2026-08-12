"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export function FAQAccordion({ faqs }: { faqs: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`border rounded-lg transition-all ${
              isOpen ? "bg-card border-accent/40" : "bg-card/60 border-border hover:border-muted"
            }`}
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full text-left p-5 flex items-center justify-between gap-4 font-mono focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-background border border-border text-muted">
                  {faq.category}
                </span>
                <span className="text-sm sm:text-base font-semibold text-foreground">
                  {faq.question}
                </span>
              </div>
              <span className={`text-accent font-bold text-lg transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}>
                +
              </span>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 text-xs text-muted leading-relaxed font-sans border-t border-border/40 pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
