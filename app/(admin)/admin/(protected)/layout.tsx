import Link from "next/link";
import { getCurrentUser } from "@/modules/shared/dal";
import { logout } from "@/modules/auth/actions";

// Bu layout sadece giriş yapılmış admin sayfalarını sarar (/admin/login hariç
// tutulur — bkz. klasör yapısı: login, bu (protected) grubunun dışında).
// verifySession() burada DB'ye kadar giden GERÇEK kontrolü yapar; proxy.ts'deki
// kontrol sadece hızlı/optimistik yönlendirmedir.
export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white px-4 py-6">
        <span className="mb-8 px-2 text-lg font-extrabold text-slate-900">
          Ortisoft <span className="text-blue-600">Admin</span>
        </span>
        <nav className="flex flex-col gap-1 text-sm font-semibold text-slate-600">
          <Link href="/admin/dashboard" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900">
            Panel
          </Link>
          <Link href="/admin/about" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900">
            Hakkımızda
          </Link>
          <Link href="/admin/services" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900">
            Hizmetlerimiz
          </Link>
          <Link href="/admin/career" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900">
            Kariyer
          </Link>
          <Link href="/admin/career/cvs" className="rounded-lg px-3 py-2 pl-6 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            ↳ Aday CV&apos;leri
          </Link>
          <Link href="/admin/references" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900">
            Referanslar
          </Link>
          <Link href="/admin/projects" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900">
            Projeler
          </Link>
          <Link href="/admin/messages" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900">
            Mesajlar
          </Link>
          <Link href="/admin/contracts" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900">
            Sözleşmeler
          </Link>
          <Link href="/admin/pages" className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900">
            Sayfa Yönetimi
          </Link>
          {/* Faz 5: Blog */}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div className="text-sm text-slate-500">
            {user ? (
              <>
                <span className="font-semibold text-slate-800">{user.name}</span>{" "}
                <span className="text-slate-400">·</span>{" "}
                <span>{user.email}</span>{" "}
                <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold uppercase text-slate-500">
                  {user.role}
                </span>
              </>
            ) : (
              "Oturum yükleniyor…"
            )}
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Çıkış Yap
            </button>
          </form>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
