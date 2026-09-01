"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

const ACTION_LABEL: Record<string, string> = {
  CREATE: "oluşturdu",
  UPDATE: "güncelledi",
  DELETE: "sildi",
};

const ENTITY_LABEL: Record<string, string> = {
  AboutContent: "Hakkımızda içeriği",
  BlogPost: "blog yazısı",
  CareerPosting: "kariyer ilanı",
  ContactMessage: "mesaj",
  Contract: "sözleşme",
  MessageReply: "mesaj yanıtı",
  PasswordResetRequest: "şifre sıfırlama talebi",
  Project: "proje",
  Reference: "referans",
  Service: "hizmet",
  SitePage: "sayfa durumu",
  TeamMember: "ekip üyesi",
  User: "kullanıcı",
};

const STORAGE_KEY = "ortisoft_admin_notif_last_seen";

type LogEntry = {
  id: string;
  action: string;
  entityType: string;
  createdAt: Date;
  actor: { name: string; email: string } | null;
};

function relativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} sa önce`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} gün önce`;
}

/**
 * Ayrı bir "notification" tablosu açmak yerine mevcut AuditLog'u (zaten her
 * ekleme/güncelleme/silme işlemini kaydediyor) doğrudan bildirim kaynağı
 * olarak kullanıyoruz — "okunmadı" sayacı için tek kişilik panelde yeterli
 * olan hafif bir çözüm: son görülme zamanı tarayıcının localStorage'ında
 * tutulur (sunucu tarafında ayrı bir "okundu" alanına gerek kalmaz).
 */
export default function NotificationsBell({ logs }: { logs: LogEntry[] }) {
  const [open, setOpen] = useState(false);
  // localStorage bir "harici sistem"den abonelik değil, tek seferlik senkron
  // bir okuma — bu yüzden useEffect+setState yerine tembel initializer'da
  // hesaplanır (React'in "muhtemelen effect'e ihtiyacın yok" önerisiyle uyumlu).
  const [unreadCount, setUnreadCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    try {
      const lastSeen = localStorage.getItem(STORAGE_KEY);
      const lastSeenTime = lastSeen ? Number(lastSeen) : 0;
      return logs.filter((l) => l.createdAt.getTime() > lastSeenTime).length;
    } catch {
      // localStorage erişilemiyorsa (gizli sekme vb.) sessizce hepsini okunmamış say.
      return logs.length;
    }
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleOpen() {
    setOpen((v) => !v);
    if (!open) {
      setUnreadCount(0);
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        // best-effort — sessizce yut
      }
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Bildirimler"
        className="relative rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
          <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Son İşlemler</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                Henüz işlem yok.
              </p>
            ) : (
              <ul>
                {logs.map((log) => (
                  <li
                    key={log.id}
                    className="border-b border-slate-50 dark:border-slate-800/60 px-4 py-2.5 text-xs last:border-0"
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {log.actor?.name ?? "Silinmiş kullanıcı"}
                    </span>{" "}
                    <span className="text-slate-500 dark:text-slate-400">
                      {ENTITY_LABEL[log.entityType] ?? log.entityType} {ACTION_LABEL[log.action] ?? log.action}
                    </span>
                    <div className="mt-0.5 text-slate-400 dark:text-slate-500">{relativeTime(log.createdAt)}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <a
            href="/admin/audit-log"
            className="block border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            Tüm denetim kaydını gör →
          </a>
        </div>
      )}
    </div>
  );
}
