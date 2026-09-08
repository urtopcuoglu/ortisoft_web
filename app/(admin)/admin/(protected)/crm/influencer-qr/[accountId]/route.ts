import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getInfluencerAccountForQr } from "@/modules/influencer/actions";
import { resolveInfluencerProfileUrl } from "@/lib/social-platform";

// verifySession() zaten getInfluencerAccountForQr() içinde çağrılıyor
// (savunma katmanı) — bkz. career/cvs/[id]/download/route.ts ile aynı desen.
// Statik "influencer-qr" segmenti, aynı seviyedeki dinamik "crm/[id]"
// route'undan önce eşleşir (Next.js: static > dynamic, bkz. blog/rss.xml).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params;
  const account = await getInfluencerAccountForQr(accountId);

  if (!account) {
    return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });
  }

  const targetUrl = account.profileUrl || resolveInfluencerProfileUrl(account.platform.slug, account.username);
  if (!targetUrl) {
    return NextResponse.json({ error: "Bu hesap için profil linki yok." }, { status: 400 });
  }

  // Okutunca doğrudan o kişinin ilgili profiline gitsin diye QR, profil
  // URL'ini kodluyor (deep-link değil, evrensel https linki — Instagram/
  // TikTok uygulaması kuruluysa OS otomatik olarak uygulamaya yönlendirir).
  const png = await QRCode.toBuffer(targetUrl, { width: 320, margin: 1 });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
