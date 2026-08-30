import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from "./config";
import trMessages from "./messages/tr.json";
import enMessages from "./messages/en.json";
import { createTranslator } from "./translate";

const DICTIONARIES: Record<Locale, typeof trMessages> = {
  tr: trMessages,
  en: enMessages,
};

export const getLocale = cache(async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return (LOCALES as readonly string[]).includes(value ?? "")
    ? (value as Locale)
    : DEFAULT_LOCALE;
});

export const getMessages = cache(async () => {
  const locale = await getLocale();
  return { locale, messages: DICTIONARIES[locale] };
});

/** Server Component'lerde doğrudan kullanım için — `const t = await getT();` */
export async function getT() {
  const { messages } = await getMessages();
  return createTranslator(messages);
}
