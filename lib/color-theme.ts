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
};

export function resolveTeamGradient(name: string) {
  return TEAM_GRADIENTS[name as ColorThemeName] ?? TEAM_GRADIENTS.blue;
}
