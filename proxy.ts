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

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await decrypt(cookie);
  const isAuthenticated = Boolean(session?.userId);

  const isLoginPage = pathname === LOGIN_PATH;

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL(DEFAULT_ADMIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
