import type { Metadata } from "next";
import {
  listPasswordResetRequests,
  approvePasswordResetRequest,
  dismissPasswordResetRequest,
} from "@/modules/auth/actions";

export const metadata: Metadata = {
  title: "Şifre Sıfırlama Talepleri | Ortisoft Admin",
  robots: { index: false, follow: false },
};

// Reset linkleri /admin/reset-password/[token] altında, ana domain üzerinden
// üretiliyor — admin subdomain'inden görüntüleniyor olsa bile link her zaman
// çalışır (proxy.ts admin.ortisoft.com.tr'yi zaten /admin'e eşliyor).
const SITE_URL = "https://ortisoft.com.tr";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Bekliyor",
  APPROVED: "Onaylandı",
  DISMISSED: "Reddedildi",
  USED: "Kullanıldı",
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  APPROVED: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  DISMISSED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  USED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
};

export default async function PasswordResetsPage() {
  const requests = await listPasswordResetRequests();

  return (
    <div>
      <div className="mb-1">
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Şifre Sıfırlama Talepleri</h1>
      </div>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Kullanıcılar giriş sayfasındaki &quot;Şifremi Unuttum&quot; ile talep oluşturur. Onaylarsanız tek
        kullanımlık, 1 saat geçerli bir bağlantı üretilir — bu bağlantıyı kullanıcıya telefon/WhatsApp gibi
        bir kanaldan elle iletmeniz gerekir (otomatik e-posta gönderimi yok).
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Kullanıcı</th>
              <th className="px-4 py-3">Talep Tarihi</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Bağlantı</th>
              <th className="px-4 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400 dark:text-slate-500">
                  Henüz talep yok.
                </td>
              </tr>
            )}
            {requests.map((r) => {
              const isExpired = !r.tokenExpiresAt || r.tokenExpiresAt < new Date();
              const showLink = r.status === "APPROVED" && r.token && !isExpired;
              const canApprove = r.status === "PENDING" || (r.status === "APPROVED" && isExpired);
              const canDismiss = r.status === "PENDING" || r.status === "APPROVED";

              return (
                <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 align-top">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{r.user?.name ?? "—"}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">{r.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                    {r.requestedAt.toLocaleString("tr-TR")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_CLASS[r.status]}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                    {r.resolvedBy && (
                      <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{r.resolvedBy.name}</div>
                    )}
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    {showLink ? (
                      <code className="block break-all text-xs text-blue-600 dark:text-blue-400">
                        {`${SITE_URL}/admin/reset-password/${r.token}`}
                      </code>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {canApprove && (
                        <form action={approvePasswordResetRequest.bind(null, r.id)}>
                          <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            {r.status === "APPROVED" ? "Yeniden Onayla" : "Onayla"}
                          </button>
                        </form>
                      )}
                      {canDismiss && (
                        <form action={dismissPasswordResetRequest.bind(null, r.id)}>
                          <button
                            type="submit"
                            className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                          >
                            Reddet
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
