import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "accent" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-blue-100 text-blue-700 border-blue-200",
    secondary: "bg-slate-100 text-slate-700 border-slate-200",
    accent: "bg-violet-100 text-violet-700 border-violet-200",
    outline: "bg-transparent border-slate-300 text-slate-600",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };