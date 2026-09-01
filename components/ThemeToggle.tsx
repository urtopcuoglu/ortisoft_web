"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@teispace/next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThemeToggle({ dark = false }: { dark?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Next.js SSR ile tarayıcının kayıtlı tercihi farklı olabileceğinden,
  // hydration tamamlanana kadar sabit bir ikon gösterilir (mismatch önlemi).
  // Bu, next-themes'in resmi önerdiği "mounted" deseni — burada render
  // sırasında yapılamaz, çünkü ilk render (SSR) ile mount sonrası durumun
  // KASITLI olarak farklı olması gerekiyor.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      aria-label="Tema değiştir"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        dark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {mounted && resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
