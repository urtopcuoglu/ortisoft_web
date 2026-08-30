import Link from "next/link";
import type { Metadata } from "next";
import {
  Mail,
  Info,
  Briefcase,
  Users,
  FileText,
  UserSquare2,
  DollarSign,
} from "lucide-react";
import { getCurrentUser } from "@/modules/shared/dal";
import { getDashboardStats } from "@/modules/shared/dashboard";
import { getUsdTryRate } from "@/lib/exchange-rate";
import { MESSAGE_PURPOSE_LABEL } from "@/modules/messages/schema";

export const metadata: Metadata = {
  title: "Panel | Ortisoft Admin",
  robots: { index: false, follow: false },
};

const BLOG_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Taslak",
  SCHEDULED: "Zamanlanmış",
  PUBLISHED: "Yayında",
};

const BLOG_STATUS_CLASS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  SCHEDULED: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  PUBLISHED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
};

const MESSAGE_STATUS_LABEL: Record<string, string> = {
  NEW: "Yeni",
  IN_PROGRESS: "İşlemde",
  REPLIED: "Yanıtlandı",
  CLOSED: "Kapalı",
};

const USER_ROLE_LABEL: Record<string, string> = { ADMIN: "Yönetici", EDITOR: "Editör" };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</div>
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </div>
  );
}

function BarReport({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <h2 className="mb-4 text-sm font-bold text-slate-800 dark:text-slate-200">{title}</h2>
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">{row.label}</span>
              <span className="font-bold text-slate-500 dark:text-slate-400">{row.value}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-2 rounded-full bg-blue-500 dark:bg-blue-400"
                style={{ width: `${(row.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [user, stats, usdTry] = await Promise.all([getCurrentUser(), getDashboardStats(), getUsdTryRate()]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-extrabold text-slate-900 dark:text-white">
            Hoş geldin{user?.name ? `, ${user.name}` : ""} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Site genelinde güncel durum özeti.</p>
        </div>
        {usdTry && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                1 USD ={" "}
                {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(usdTry.rate)}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">
                {usdTry.date} tarihli kur (ECB) — hizmet fiyatlandırmasında referans için
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Üst metrik kartları */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          icon={Mail}
          label="Toplam Mesaj"
          value={stats.totalMessages}
          accent="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        />
        <StatCard
          icon={Info}
          label="Bilgi Talebi"
          value={stats.infoRequests}
          accent="bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400"
        />
        <StatCard
          icon={Briefcase}
          label="Hizmet Talebi"
          value={stats.serviceRequests}
          accent="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        />
        <StatCard
          icon={Users}
          label="Panel Kullanıcısı"
          value={stats.totalUsers}
          accent="bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
        />
        <StatCard
          icon={FileText}
          label="Blog Yazısı (Yayında)"
          value={stats.publishedBlogPosts}
          accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <StatCard
          icon={UserSquare2}
          label="Ekip Üyesi"
          value={stats.totalTeamMembers}
          accent="bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
        />
      </div>

      {/* Raporlar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarReport
          title="Talep Türü Dağılımı"
          rows={Object.entries(stats.purposeCounts).map(([key, value]) => ({
            label: MESSAGE_PURPOSE_LABEL[key as keyof typeof MESSAGE_PURPOSE_LABEL],
            value,
          }))}
        />
        <BarReport
          title="Mesaj Durumu Dağılımı"
          rows={Object.entries(stats.statusCounts).map(([key, value]) => ({
            label: MESSAGE_STATUS_LABEL[key],
            value,
          }))}
        />
      </div>

      {/* Son etkinlikler */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="mb-4 text-sm font-bold text-slate-800 dark:text-slate-200">Son Eklenen Yazılar</h2>
          {stats.recentBlogPosts.length === 0 ? (
            <p className="text-sm text-slate-400">Henüz blog yazısı yok.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {stats.recentBlogPosts.map((post) => (
                <li key={post.id} className="flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {post.title}
                  </Link>
                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${BLOG_STATUS_CLASS[post.status]}`}
                  >
                    {BLOG_STATUS_LABEL[post.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/blog" className="mt-4 inline-block text-xs font-semibold text-blue-600 dark:text-blue-400">
            Tüm yazılar →
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="mb-4 text-sm font-bold text-slate-800 dark:text-slate-200">Son Düzenlenen Sayfalar</h2>
          {stats.recentPages.length === 0 ? (
            <p className="text-sm text-slate-400">Henüz sayfa kaydı yok.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {stats.recentPages.map((page) => (
                <li key={page.key} className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {page.label}
                  </span>
                  <span className="flex-shrink-0 text-xs text-slate-400 dark:text-slate-500">
                    {formatDate(page.updatedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/pages" className="mt-4 inline-block text-xs font-semibold text-blue-600 dark:text-blue-400">
            Sayfa yönetimi →
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="mb-4 text-sm font-bold text-slate-800 dark:text-slate-200">Son Eklenen Kullanıcılar</h2>
          {stats.recentUsers.length === 0 ? (
            <p className="text-sm text-slate-400">Henüz kullanıcı yok.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {stats.recentUsers.map((u) => (
                <li key={u.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/users/${u.id}/edit`}
                      className="block truncate text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {u.name}
                    </Link>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{u.title || USER_ROLE_LABEL[u.role]}</span>
                  </div>
                  <span className="flex-shrink-0 text-xs text-slate-400 dark:text-slate-500">
                    {formatDate(u.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/users" className="mt-4 inline-block text-xs font-semibold text-blue-600 dark:text-blue-400">
            Tüm kullanıcılar →
          </Link>
        </div>
      </div>
    </div>
  );
}
