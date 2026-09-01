import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  GraduationCap,
  FileText,
  Award,
  FolderKanban,
  BookUser,
  Mail,
  FileSignature,
  LayoutList,
  PanelTop,
  Newspaper,
  UserCog,
  KeyRound,
  History,
  Settings,
} from "lucide-react";
import { getCurrentUser } from "@/modules/shared/dal";
import { logout, countPendingPasswordResetRequests } from "@/modules/auth/actions";
import { listRecentAuditLogs } from "@/modules/shared/audit";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationsBell from "@/components/admin/NotificationsBell";

// Bu layout sadece giriş yapılmış admin sayfalarını sarar (/admin/login hariç
// tutulur — bkz. klasör yapısı: login, bu (protected) grubunun dışında).
// verifySession() burada DB'ye kadar giden GERÇEK kontrolü yapar; proxy.ts'deki
// kontrol sadece hızlı/optimistik yönlendirmedir.
//
// NOT: Admin paneli çoklu dil desteğine dahil değil (bilinçli kapsam kararı) —
// tek admin hesabı Türkçe kullanıyor, sadece açık/koyu tema uygulanıyor.

const navLinkClass =
  "flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, recentLogs, pendingResetCount] = await Promise.all([
    getCurrentUser(),
    listRecentAuditLogs(),
    countPendingPasswordResetRequests(),
  ]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="flex w-60 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-6">
        <span className="mb-8 px-2 text-lg font-extrabold text-slate-900 dark:text-white">
          Ortisoft <span className="text-blue-600 dark:text-blue-400">Admin</span>
        </span>
        <nav className="flex flex-1 flex-col gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link href="/admin/dashboard" className={navLinkClass}>
            <LayoutDashboard className="h-4 w-4 flex-shrink-0" /> Panel
          </Link>
          <Link href="/admin/about" className={navLinkClass}>
            <Building2 className="h-4 w-4 flex-shrink-0" /> Hakkımızda
          </Link>
          <Link href="/admin/services" className={navLinkClass}>
            <Briefcase className="h-4 w-4 flex-shrink-0" /> Hizmetlerimiz
          </Link>
          <Link href="/admin/career" className={navLinkClass}>
            <GraduationCap className="h-4 w-4 flex-shrink-0" /> Kariyer
          </Link>
          <Link href="/admin/career/cvs" className="flex items-center gap-2.5 rounded-lg px-3 py-2 pl-6 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white">
            <FileText className="h-3.5 w-3.5 flex-shrink-0" /> ↳ Aday CV&apos;leri
          </Link>
          <Link href="/admin/references" className={navLinkClass}>
            <Award className="h-4 w-4 flex-shrink-0" /> Referanslar
          </Link>
          <Link href="/admin/projects" className={navLinkClass}>
            <FolderKanban className="h-4 w-4 flex-shrink-0" /> Projeler
          </Link>
          <Link href="/admin/guide" className={navLinkClass}>
            <BookUser className="h-4 w-4 flex-shrink-0" /> Rehber
          </Link>
          <Link href="/admin/messages" className={navLinkClass}>
            <Mail className="h-4 w-4 flex-shrink-0" /> Mesajlar
          </Link>
          <Link href="/admin/contracts" className={navLinkClass}>
            <FileSignature className="h-4 w-4 flex-shrink-0" /> Sözleşmeler
          </Link>
          <Link href="/admin/pages" className={navLinkClass}>
            <LayoutList className="h-4 w-4 flex-shrink-0" /> Sayfa Yönetimi
          </Link>
          <Link href="/admin/site-settings" className={navLinkClass}>
            <PanelTop className="h-4 w-4 flex-shrink-0" /> Header/Footer Ayarları
          </Link>
          <Link href="/admin/blog" className={navLinkClass}>
            <Newspaper className="h-4 w-4 flex-shrink-0" /> Blog
          </Link>
          <div className="my-2 h-px bg-slate-200 dark:bg-slate-800" />
          {user?.role === "ADMIN" && (
            <Link href="/admin/users" className={navLinkClass}>
              <UserCog className="h-4 w-4 flex-shrink-0" /> Kullanıcılar
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin/password-resets" className={navLinkClass}>
              <KeyRound className="h-4 w-4 flex-shrink-0" /> Şifre Sıfırlama Talepleri
              {pendingResetCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {pendingResetCount}
                </span>
              )}
            </Link>
          )}
          <Link href="/admin/audit-log" className={navLinkClass}>
            <History className="h-4 w-4 flex-shrink-0" /> Denetim Kaydı
          </Link>
          <Link href="/admin/settings" className={navLinkClass}>
            <Settings className="h-4 w-4 flex-shrink-0" /> Ayarlar
          </Link>
        </nav>

        <p className="mt-6 px-2 text-center text-[11px] leading-tight text-slate-400 dark:text-slate-600">
          Development by Ortisoft Software Team — 2026
        </p>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {user ? (
              <>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{user.name}</span>{" "}
                <span className="text-slate-400 dark:text-slate-600">·</span>{" "}
                <span>{user.email}</span>{" "}
                <span className="ml-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                  {user.role}
                </span>
              </>
            ) : (
              "Oturum yükleniyor…"
            )}
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell logs={recentLogs} />
            <ThemeToggle />
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
              >
                Çıkış Yap
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
