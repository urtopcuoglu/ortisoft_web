/**
 * Sabit renk paleti — admin panelinden ham Tailwind class'ı girilmesini
 * önlemek için bir dropdown'dan seçilen "tema adı" burada gerçek class'lara
 * çevrilir. Yeni bir tema eklemek için hem burayı hem Zod enum'unu güncelle.
 */

export const SERVICE_COLOR_THEMES = {
  blue: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    check: "text-blue-500",
    border: "border-blue-100 hover:border-blue-300",
    glow: "hover:shadow-blue-100",
  },
  violet: {
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    iconBg: "bg-violet-100",
    iconText: "text-violet-600",
    check: "text-violet-500",
    border: "border-violet-100 hover:border-violet-300",
    glow: "hover:shadow-violet-100",
  },
  cyan: {
    badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
    iconBg: "bg-cyan-100",
    iconText: "text-cyan-600",
    check: "text-cyan-500",
    border: "border-cyan-100 hover:border-cyan-300",
    glow: "hover:shadow-cyan-100",
  },
  emerald: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
    check: "text-emerald-500",
    border: "border-emerald-100 hover:border-emerald-300",
    glow: "hover:shadow-emerald-100",
  },
  pink: {
    badge: "bg-pink-50 text-pink-700 border-pink-200",
    iconBg: "bg-pink-100",
    iconText: "text-pink-600",
    check: "text-pink-500",
    border: "border-pink-100 hover:border-pink-300",
    glow: "hover:shadow-pink-100",
  },
  orange: {
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    iconBg: "bg-orange-100",
    iconText: "text-orange-600",
    check: "text-orange-500",
    border: "border-orange-100 hover:border-orange-300",
    glow: "hover:shadow-orange-100",
  },
  indigo: {
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-600",
    check: "text-indigo-500",
    border: "border-indigo-100 hover:border-indigo-300",
    glow: "hover:shadow-indigo-100",
  },
  rose: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    iconBg: "bg-rose-100",
    iconText: "text-rose-600",
    check: "text-rose-500",
    border: "border-rose-100 hover:border-rose-300",
    glow: "hover:shadow-rose-100",
  },
  amber: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
    check: "text-amber-500",
    border: "border-amber-100 hover:border-amber-300",
    glow: "hover:shadow-amber-100",
  },
  purple: {
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    iconBg: "bg-purple-100",
    iconText: "text-purple-600",
    check: "text-purple-500",
    border: "border-purple-100 hover:border-purple-300",
    glow: "hover:shadow-purple-100",
  },
  slate: {
    badge: "bg-slate-50 text-slate-700 border-slate-200",
    iconBg: "bg-slate-100",
    iconText: "text-slate-600",
    check: "text-slate-500",
    border: "border-slate-100 hover:border-slate-300",
    glow: "hover:shadow-slate-100",
  },
} as const;

export type ColorThemeName = keyof typeof SERVICE_COLOR_THEMES;
export const COLOR_THEME_NAMES = Object.keys(
  SERVICE_COLOR_THEMES
) as [ColorThemeName, ...ColorThemeName[]];

export function resolveServiceTheme(name: string) {
  return (
    SERVICE_COLOR_THEMES[name as ColorThemeName] ?? SERVICE_COLOR_THEMES.blue
  );
}

// Ekip üyesi avatarları için sadece gradient class'ı yeterli.
export const TEAM_GRADIENTS: Record<ColorThemeName, string> = {
  blue: "from-blue-500 to-blue-600",
  violet: "from-violet-500 to-violet-600",
  cyan: "from-cyan-500 to-cyan-600",
  emerald: "from-emerald-500 to-emerald-600",
  pink: "from-pink-500 to-pink-600",
  orange: "from-orange-500 to-orange-600",
  indigo: "from-indigo-500 to-indigo-600",
  rose: "from-rose-500 to-rose-600",
  amber: "from-amber-500 to-amber-600",
  purple: "from-purple-500 to-purple-600",
  slate: "from-slate-500 to-slate-600",
};

export function resolveTeamGradient(name: string) {
  return TEAM_GRADIENTS[name as ColorThemeName] ?? TEAM_GRADIENTS.blue;
}

// Proje kartları (yarı saydam arka plan gradyanı + kenarlık + fon rozeti).
export const PROJECT_COLOR_THEMES: Record<
  ColorThemeName,
  { cardGradient: string; cardBorder: string; fundingBadge: string }
> = {
  blue: {
    cardGradient: "from-blue-500/20 to-indigo-500/20",
    cardBorder: "border-blue-500/30",
    fundingBadge: "bg-blue-900/40 text-blue-300 border-blue-700/50",
  },
  violet: {
    cardGradient: "from-violet-500/20 to-purple-500/20",
    cardBorder: "border-violet-500/30",
    fundingBadge: "bg-violet-900/40 text-violet-300 border-violet-700/50",
  },
  cyan: {
    cardGradient: "from-cyan-500/20 to-blue-500/20",
    cardBorder: "border-cyan-500/30",
    fundingBadge: "bg-cyan-900/40 text-cyan-300 border-cyan-700/50",
  },
  emerald: {
    cardGradient: "from-emerald-500/20 to-green-500/20",
    cardBorder: "border-emerald-500/30",
    fundingBadge: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
  },
  pink: {
    cardGradient: "from-pink-500/20 to-rose-500/20",
    cardBorder: "border-pink-500/30",
    fundingBadge: "bg-pink-900/40 text-pink-300 border-pink-700/50",
  },
  orange: {
    cardGradient: "from-orange-500/20 to-amber-500/20",
    cardBorder: "border-orange-500/30",
    fundingBadge: "bg-orange-900/40 text-orange-300 border-orange-700/50",
  },
  indigo: {
    cardGradient: "from-indigo-500/20 to-blue-500/20",
    cardBorder: "border-indigo-500/30",
    fundingBadge: "bg-indigo-900/40 text-indigo-300 border-indigo-700/50",
  },
  rose: {
    cardGradient: "from-rose-500/20 to-pink-500/20",
    cardBorder: "border-rose-500/30",
    fundingBadge: "bg-rose-900/40 text-rose-300 border-rose-700/50",
  },
  amber: {
    cardGradient: "from-amber-500/20 to-orange-500/20",
    cardBorder: "border-amber-500/30",
    fundingBadge: "bg-amber-900/40 text-amber-300 border-amber-700/50",
  },
  purple: {
    cardGradient: "from-purple-500/20 to-violet-500/20",
    cardBorder: "border-purple-500/30",
    fundingBadge: "bg-purple-900/40 text-purple-300 border-purple-700/50",
  },
  slate: {
    cardGradient: "from-slate-500/20 to-slate-400/20",
    cardBorder: "border-slate-500/30",
    fundingBadge: "bg-slate-700 text-slate-300 border-slate-600",
  },
};

export function resolveProjectTheme(name: string) {
  return PROJECT_COLOR_THEMES[name as ColorThemeName] ?? PROJECT_COLOR_THEMES.blue;
}
