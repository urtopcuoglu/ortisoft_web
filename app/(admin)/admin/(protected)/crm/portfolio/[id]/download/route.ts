import { NextResponse } from "next/server";
import { getPortfolioSignedFileUrl } from "@/modules/portfolio/actions";

// verifySession() zaten getPortfolioSignedFileUrl() içinde çağrılıyor (savunma katmanı).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const signedUrl = await getPortfolioSignedFileUrl(id);

  if (!signedUrl) {
    return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
  }

  return NextResponse.redirect(signedUrl);
}
