import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { decrypt, getSessionCookie } from "@/lib/session";
import { prisma } from "@/lib/prisma";

/**
 * Data Access Layer — tüm admin sayfaları/Server Action'ları oturumu bu
 * fonksiyon üzerinden doğrular. React `cache()` ile bir render pass'i
 * içinde tekrar tekrar cookie çözülmesi/DB sorgusu yapılmaz.
 *
 * NOT: proxy.ts'deki kontrol sadece "optimistik" (hızlı yönlendirme) içindir.
 * Gerçek güvenlik sınırı burasıdır — her Server Action ve her veri erişimi
 * bunu çağırmalıdır (defense-in-depth, bkz. plan dokümanı Bölüm 3.3).
 */
export const verifySession = cache(async () => {
  const cookie = await getSessionCookie();
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/admin/login");
  }

  return { isAuth: true, userId: session.userId, role: session.role };
});

/**
 * verifySession()'ın redirect etmeyen hali — proxy.ts gibi, oturum yoksa
 * kendi yönlendirme mantığını kuracak yerlerde kullanılır.
 */
export async function getOptionalSession() {
  const cookie = await getSessionCookie();
  return decrypt(cookie);
}

/**
 * verifySession()'ın rol kontrollü hali — sadece ADMIN rolündeki hesapların
 * erişebilmesi gereken alanlar için (Kullanıcı Yönetimi). EDITOR bir hesap
 * buraya gelirse dashboard'a geri yönlendirilir.
 */
export const verifyAdminSession = cache(async () => {
  const session = await verifySession();
  if (session.role !== "ADMIN") {
    redirect("/admin/dashboard");
  }
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await verifySession();

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, role: true },
    });
    return user;
  } catch {
    return null;
  }
});
