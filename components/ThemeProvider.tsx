"use client";

// next-themes yerine @teispace/next-themes kullanılıyor (2026-09-01) — API
// (attribute/defaultTheme/enableSystem/disableTransitionOnChange, useTheme)
// birebir aynı, ama anti-FOUC script'ini useServerInsertedHTML ile enjekte
// ediyor. next-themes ise ham bir <script> React elemanı render ediyordu,
// bu da React 19'da "Encountered a script tag while rendering React
// component" konsol uyarısına yol açıyordu (next-themes bakımsız, resmi
// düzeltme yok). Bkz. https://github.com/pacocoursey/next-themes/issues/387
import { ThemeProvider as NextThemesProvider } from "@teispace/next-themes";
import type { ComponentProps } from "react";

export default function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
