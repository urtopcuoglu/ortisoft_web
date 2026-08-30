import "server-only";
import { hash, verify } from "@node-rs/argon2";

// OWASP önerilen Argon2id parametreleri (m=19MiB, t=2, p=1) civarında.
const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(
  hashed: string,
  plain: string
): Promise<boolean> {
  return verify(hashed, plain);
}
