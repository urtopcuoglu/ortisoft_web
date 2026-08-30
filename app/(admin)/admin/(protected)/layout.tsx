import Link from "next/link";
import { getCurrentUser } from "@/modules/shared/dal";
import { logout } from "@/modules/auth/actions";
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
export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, recentLogs] = await Promise.all([getCurrentUser(), listRecentAuditLogs()]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="flex w-60 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-6">
        <span className="mb-8 px-2 text-lg font-extrabold text-slate-900 dark:text-white">
          Ortisoft <span className="text-blue-600 dark:text-blue-400">Admin</span>
        </span>
        <nav className="flex flex-col gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link href="/admin/dashboard" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
            Panel
          </Link>
          <Link href="/admin/about" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
            Hakkımızda
          </Link>
          <Link href="/admin/services" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
            Hizmetlerimiz
          </Link>
          <Link href="/admin/career" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
            Kariyer
          </Link>
          <Link href="/admin/career/cvs" className="rounded-lg px-3 py-2 pl-6 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white">
            ↳ Aday CV&apos;leri
          </Link>
          <Link href="/admin/references" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
            Referanslar
          </Link>
          <Link href="/admin/projects" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
            Projeler
          </Link>
          <Link href="/admin/messages" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
            Mesajlar
          </Link>
          <Link href="/admin/contracts" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
            Sözleşmeler
          </Link>
          <Link href="/admin/pages" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
            Sayfa Yönetimi
          </Link>
          <Link href="/admin/blog" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
            Blog
          </Link>
          <div className="my-2 h-px bg-slate-200 dark:bg-slate-800" />
          {user?.role === "ADMIN" && (
            <Link href="/admin/users" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
              Kullanıcılar
            </Link>
          )}
          <Link href="/admin/audit-log" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
            Denetim Kaydı
          </Link>
          <Link href="/admin/settings" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
            Ayarlar
          </Link>
        </nav>
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
