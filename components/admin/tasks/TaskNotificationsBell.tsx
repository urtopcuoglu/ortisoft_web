"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { markTaskNotificationRead, markAllTaskNotificationsRead } from "@/modules/tasks/actions";

const TYPE_LABEL: Record<string, string> = {
  TASK_ASSIGNED: "Atama",
  TASK_UPDATED: "Güncelleme",
  TASK_MOVED: "Taşındı",
  TASK_COMMENT: "Yeni yorum",
  TASK_COMMENT_REPLY: "Yanıt",
  TASK_REQUEST_ASSIGNED: "Talep ataması",
  TASK_REQUEST_UPDATED: "Talep güncellendi",
};

export type TaskNotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
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
 * Görev Yönetimi'ne özel, kişiye hedefli bildirim çanı — mevcut global
 * NotificationsBell'den (AuditLog tabanlı, herkese aynı akış, localStorage
 * "son görülme") bilinçli olarak AYRI: burada okundu durumu sunucuda,
 * kullanıcı bazında kalıcı (bkz. modules/shared/notifications.ts). İkisi
 * admin üst çubuğunda yan yana durur.
 */
export default function TaskNotificationsBell({
  notifications,
  unreadCount: initialUnread,
}: {
  notifications: TaskNotificationRow[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const ref = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleClickItem(id: string, isRead: boolean) {
    if (isRead) return;
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    startTransition(() => {
      markTaskNotificationRead(id);
    });
  }

  function handleMarkAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    startTransition(() => {
      markAllTaskNotificationsRead();
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Görev bildirimleri"
        className="relative rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Görev Bildirimleri</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Tümünü okundu işaretle
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">Henüz bildirim yok.</p>
            ) : (
              <ul>
                {items.map((n) => (
                  <li
                    key={n.id}
                    className={`border-b border-slate-50 dark:border-slate-800/60 last:border-0 ${
                      !n.isRead ? "bg-blue-50/60 dark:bg-blue-500/5" : ""
                    }`}
                  >
                    <Link
                      href={n.link ?? "/admin/crm?tab=tasks"}
                      onClick={() => {
                        handleClickItem(n.id, n.isRead);
                        setOpen(false);
                      }}
                      className="block px-4 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      <span className="mb-0.5 block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
                        {TYPE_LABEL[n.type] ?? n.type}
                      </span>
                      <span
                        className={`font-semibold ${!n.isRead ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
                      >
                        {n.title}
                      </span>
                      {n.body && <p className="mt-0.5 line-clamp-2 text-slate-500 dark:text-slate-400">{n.body}</p>}
                      <div className="mt-0.5 text-slate-400 dark:text-slate-500">{relativeTime(new Date(n.createdAt))}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
