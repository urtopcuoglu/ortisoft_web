"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { toggleComingSoon } from "@/modules/pages/actions";

export default function ComingSoonToggle({
  pageKey,
  initialValue,
}: {
  pageKey: string;
  initialValue: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={initialValue}
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          toggleComingSoon(pageKey, !initialValue);
        });
      }}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-60",
        initialValue ? "bg-amber-500" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200",
          initialValue ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
