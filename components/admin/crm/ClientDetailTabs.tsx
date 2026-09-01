"use client";

import { useState } from "react";
import MeetingsPanel, { type MeetingRow } from "./MeetingsPanel";
import ProposalsPanel, { type ProposalRow } from "./ProposalsPanel";
import AgreementsPanel, { type AgreementRow } from "./AgreementsPanel";
import PaymentsPanel, { type PaymentRow } from "./PaymentsPanel";

type Tab = "meetings" | "proposals" | "agreements" | "payments";

const TABS: { key: Tab; label: string }[] = [
  { key: "meetings", label: "Görüşmeler" },
  { key: "proposals", label: "Teklifler" },
  { key: "agreements", label: "Sözleşmeler" },
  { key: "payments", label: "Ödemeler" },
];

export default function ClientDetailTabs({
  contactId,
  meetings,
  proposals,
  agreements,
  payments,
}: {
  contactId: string;
  meetings: MeetingRow[];
  proposals: ProposalRow[];
  agreements: AgreementRow[];
  payments: PaymentRow[];
}) {
  const [tab, setTab] = useState<Tab>("meetings");

  const counts: Record<Tab, number> = {
    meetings: meetings.length,
    proposals: proposals.length,
    agreements: agreements.length,
    payments: payments.length,
  };

  return (
    <div>
      <div className="mb-5 flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {t.label} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">({counts[t.key]})</span>
          </button>
        ))}
      </div>

      {tab === "meetings" && <MeetingsPanel contactId={contactId} meetings={meetings} />}
      {tab === "proposals" && <ProposalsPanel contactId={contactId} proposals={proposals} />}
      {tab === "agreements" && <AgreementsPanel contactId={contactId} agreements={agreements} />}
      {tab === "payments" && <PaymentsPanel contactId={contactId} payments={payments} />}
    </div>
  );
}
