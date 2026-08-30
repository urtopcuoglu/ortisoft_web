import "server-only";

/**
 * Basit, bellek-içi (in-memory) sabit pencereli rate limiter. Redis/Upstash
 * gerektirmez — yeni bir dış servis/kimlik bilgisi eklemeden temel kaba kuvvet
 * koruması sağlar.
 *
 * BİLİNEN SINIRLAMA: Vercel gibi serverless ortamlarda her fonksiyon örneği
 * kendi belleğini tutar ve soğuk başlangıçlarda sıfırlanır — dağıtık/çoklu
 * örnek senaryolarında tam güvenilir değildir. Trafik/saldırı riski arttıkça
 * Upstash Redis gibi paylaşılan bir depoya geçilmesi önerilir.
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

// Bellek sızıntısını önlemek için süresi dolmuş kayıtları periyodik temizle.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

export function checkRateLimit(
  key: string,
  { maxAttempts, windowMs }: { maxAttempts: number; windowMs: number }
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}
