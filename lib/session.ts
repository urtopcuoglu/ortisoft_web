import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "ortisoft_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün

// Tembel (lazy) okunuyor — modül import edilir edilmez SESSION_SECRET
// kontrol edilseydi, ortam değişkeni tanımlı olmayan build ortamlarında
// (ör. Vercel'e env var eklenmeden önceki build'ler) build'in kendisi
// çökerdi. Artık hata sadece gerçekten bir oturum işlemi yapılırken atılır.
function getEncodedKey() {
  const secretKey = process.env.SESSION_SECRET;
  if (!secretKey) {
    throw new Error("SESSION_SECRET ortam değişkeni tanımlı değil (.env.local)");
  }
  return new TextEncoder().encode(secretKey);
}

export type SessionPayload = {
  userId: string;
  role: "ADMIN" | "EDITOR";
  expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(new Date(payload.expiresAt))
    .sign(getEncodedKey());
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, getEncodedKey(), {
      algorithms: ["HS256"],
    });
    return payload as { userId: string; role: "ADMIN" | "EDITOR" };
  } catch {
    // Süresi dolmuş, bozulmuş veya sahte bir token — sessizce reddet.
    return null;
  }
}

export async function createSession(userId: string, role: "ADMIN" | "EDITOR") {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await encrypt({ userId, role, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export { SESSION_COOKIE_NAME };
