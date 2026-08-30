"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={faq.q}
          className={cn(
            "rounded-xl overflow-hidden border transition-all duration-200",
            openFaq === i ? "border-blue-200 shadow-sm" : "border-slate-200 hover:border-slate-300"
          )}
        >
          <button
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4.5 text-left bg-white hover:bg-slate-50 transition-colors"
          >
            <span className="font-semibold text-slate-900 text-sm pr-6">{faq.q}</span>
            {openFaq === i ? (
              <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
            )}
          </button>
          {openFaq === i && (
            <div className="px-6 pb-5 bg-white border-t border-slate-100">
              <p className="text-slate-600 text-sm leading-relaxed pt-3">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
