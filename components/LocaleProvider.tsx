"use client";

import { createContext, useContext, useMemo } from "react";
import { createTranslator, type Messages } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/config";

const LocaleContext = createContext<{
  locale: Locale;
  t: (key: string) => string;
} | null>(null);

export function LocaleProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ locale, t: createTranslator(messages) }), [locale, messages]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useTranslations() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useTranslations() bir <LocaleProvider> içinde kullanılmalı.");
  }
  return ctx;
}
