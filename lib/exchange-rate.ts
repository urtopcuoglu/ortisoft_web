/**
 * Güncel USD/TRY kuru — Frankfurter (ECB verisine dayanan, ücretsiz/API
 * key gerektirmeyen) servisinden. Diğer dış servislerle aynı desen: hata
 * durumunda (ağ/servis kesintisi) null döner, sayfayı asla çökertmez.
 * Next'in fetch cache'i ile saatte bir tazelenir (next: revalidate).
 */
export async function getUsdTryRate(): Promise<{ rate: number; date: string } | null> {
  try {
    const res = await fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=TRY", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { date?: string; rates?: Record<string, number> };
    const rate = data.rates?.TRY;
    if (typeof rate !== "number" || !data.date) return null;

    return { rate, date: data.date };
  } catch {
    return null;
  }
}
