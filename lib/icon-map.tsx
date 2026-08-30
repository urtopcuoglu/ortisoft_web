import {
  Target, Eye, Heart, Zap, Shield, Users, TrendingUp, Star,
  Linkedin, ExternalLink, CheckCircle2, Building2, Rocket, Code2,
  BarChart3, ArrowRight, Search, Lightbulb, Wrench, LineChart,
  Monitor, Server, Share2, ShoppingCart, Briefcase, Award, Palette,
  Store, Leaf, Train,
  type LucideIcon,
} from "lucide-react";

/**
 * DB'de ikon adı (string) saklanır, gerçek React bileşeni bu sabit eşleme
 * üzerinden çözülür. Admin panelinden keyfi kod/HTML çalıştırılmasını
 * engellemek için buradaki listenin dışına çıkılamaz (Zod enum ile sınırlanır).
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  Target, Eye, Heart, Zap, Shield, Users, TrendingUp, Star,
  Linkedin, ExternalLink, CheckCircle2, Building2, Rocket, Code2,
  BarChart3, ArrowRight, Search, Lightbulb, Wrench, LineChart,
  Monitor, Server, Share2, ShoppingCart, Briefcase, Award, Palette,
  Store, Leaf, Train,
};

export const ICON_NAMES = Object.keys(ICON_MAP) as [string, ...string[]];

export function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Building2;
}
