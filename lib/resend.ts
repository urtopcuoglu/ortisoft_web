import "server-only";
import { Resend } from "resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Ortisoft <onboarding@resend.dev>";

let client: Resend | null = null;

/**
 * RESEND_API_KEY tanımlı değilse null döner — çağıran taraf (createReply)
 * bu durumda mevcut mailto: yedeğine düşer, hata fırlatılmaz. Diğer
 * lazy-init modüllerimizle (supabase-admin, session) aynı desen: modül
 * import edilirken değil, gerçekten kullanılırken kontrol edilir.
 */
function getClient(): Resend | null {
  if (client) return client;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  client = new Resend(apiKey);
  return client;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: true; id: string } | { sent: false; reason: string }> {
  const resend = getClient();
  if (!resend) {
    return { sent: false, reason: "RESEND_API_KEY tanımlı değil." };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    if (error || !data) {
      return { sent: false, reason: error?.message ?? "Bilinmeyen bir hata oluştu." };
    }
    return { sent: true, id: data.id };
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu." };
  }
}
