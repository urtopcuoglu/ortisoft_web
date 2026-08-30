"use client";

import { useTransition } from "react";
import { updateMessageStatus } from "@/modules/messages/actions";
import type { MessageStatusValue } from "@/modules/messages/schema";

const STATUS_LABEL: Record<MessageStatusValue, string> = {
  NEW: "Yeni",
  IN_PROGRESS: "İşlemde",
  REPLIED: "Yanıtlandı",
  CLOSED: "Kapalı",
};

export default function MessageStatusSelect({
  messageId,
  status,
}: {
  messageId: string;
  status: MessageStatusValue;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as MessageStatusValue;
        startTransition(() => {
          updateMessageStatus(messageId, next);
        });
      }}
      className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500"
    >
      {Object.entries(STATUS_LABEL).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  );
}
