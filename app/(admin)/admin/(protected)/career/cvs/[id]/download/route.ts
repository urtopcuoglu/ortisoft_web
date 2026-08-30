import { NextResponse } from "next/server";
import { getCvSignedUrl } from "@/modules/messages/actions";

// verifySession() zaten getCvSignedUrl() içinde çağrılıyor (savunma katmanı).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const signedUrl = await getCvSignedUrl(id);

  if (!signedUrl) {
    return NextResponse.json({ error: "CV bulunamadı." }, { status: 404 });
  }

  return NextResponse.redirect(signedUrl);
}
