import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt, SESSION_COOKIE_NAME } from "@/lib/session";

// NOT: Bu sadece "optimistik" bir kontroldür (hızlı yönlendirme, iyi UX için).
// Gerçek yetkilendirme her Server Action ve DAL çağrısında ayrıca yapılır
// (modules/shared/dal.ts -> verifySession()). Next.js'in kendi güvenlik
// rehberi de Proxy'nin tek başına yeterli olmadığını, veri kaynağına en
// yakın noktada tekrar kontrol edilmesi gerektiğini vurguluyor.

const LOGIN_PATH = "/admin/login";
const DEFAULT_ADMIN_PATH = "/admin/dashboard";

// admin.ortisoft.com.tr -> aynı Next.js uygulaması, ama bu host'ta gelen
// istekler /admin altına rewrite edilir (kullanıcıya görünmeyen, sunucu
// tarafı bir eşleme). Böylece "admin.ortisoft.com.tr" kökü doğrudan admin
// panelini açar; ayrı bir Vercel projesi/deployment gerekmez.
const ADMIN_HOSTNAMES = ["admin.ortisoft.com.tr"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host")?.split(":")[0] ?? "";
  const isAdminHost = ADMIN_HOSTNAMES.includes(hostname);

  // Admin bağlamı dışındaki (public site) istekler hiçbir ek işlem
  // görmeden geçer — cookie çözme/JWT doğrulama maliyeti sadece admin
  // bölümüne giden isteklerde harcanır.
  if (!isAdminHost && !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // admin.ortisoft.com.tr'de "/admin" öneki olmayan yollar (ör. "/", "/users")
  // dahili olarak "/admin" altına eşlenir. Zaten "/admin" ile başlayan yollar
  // (panel içi tüm Link/redirect'ler bu şekilde) olduğu gibi bırakılır —
  // tekrar önek eklenmez.
  let effectivePathname =
    isAdminHost && !pathname.startsWith("/admin")
      ? `/admin${pathname === "/" ? "" : pathname}`
      : pathname;

  // Çıplak "/admin" için (subdomain kökü) hiçbir sayfa yok — ana domainde de
  // yok. Varsayılan panel sayfasına eşitleriz; aşağıdaki mevcut oturum
  // mantığı bunu zaten doğru yere (girişliyse dashboard, değilse login)
  // yönlendirir.
  if (effectivePathname === "/admin") {
    effectivePathname = DEFAULT_ADMIN_PATH;
  }

  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await decrypt(cookie);
  const isAuthenticated = Boolean(session?.userId);
  const isLoginPage = effectivePathname === LOGIN_PATH;

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL(DEFAULT_ADMIN_PATH, request.url));
  }

  if (effectivePathname !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = effectivePathname;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Statik dosyalar/Next iç yolları hariç HER yol eşleşir — admin.ortisoft.com.tr'de
  // "/" gibi /admin ile başlamayan yolları da yakalayabilmek için matcher artık
  // sadece "/admin/:path*" ile sınırlı değil (host'a göre koşullu matcher Next.js'te
  // desteklenmiyor, ayrım yukarıdaki erken çıkış ile fonksiyon içinde yapılıyor).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
