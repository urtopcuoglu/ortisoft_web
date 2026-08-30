import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ComingSoonPage({ pageName }: { pageName: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center overflow-hidden py-24 animated-gradient relative">
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute top-1/3 left-16 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl float" />
      <div className="absolute bottom-1/3 right-16 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl float" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 narrow-container text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25 pulse-glow">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <Badge className="mb-6 bg-white/10 text-white border-white/20">Çok Yakında</Badge>
        <h1 className="heading-lg text-white mb-5">
          <span className="gradient-text">{pageName}</span> Sayfası Güncelleniyor
        </h1>
        <p className="body-lg text-slate-300 max-w-lg mx-auto">
          Bu sayfa üzerinde çalışıyoruz, çok yakında yeniden yayında olacak.
        </p>
      </div>
    </div>
  );
}
