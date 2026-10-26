import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "rw_session";
const MAX_AGE = 60 * 60 * 24 * 30;

// Stored in the (encrypted + authenticated) cookie until a database exists.
export type Session = {
  athleteId: number;
  firstname: string;
  profile: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix seconds
};

function key(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return createHash("sha256").update(secret).digest();
}

// AES-256-GCM: tamper-proof (signed) and unreadable, since the cookie holds tokens.
export function seal(data: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64url");
}

export function unseal<T>(value: string): T | null {
  try {
    const buf = Buffer.from(value, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key(), buf.subarray(0, 12));
    decipher.setAuthTag(buf.subarray(12, 28));
    const dec = Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]);
    return JSON.parse(dec.toString("utf8")) as T;
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};

export async function getSession(): Promise<Session | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  return raw ? unseal<Session>(raw) : null;
}

export async function setSession(session: Session): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, seal(session), cookieOptions);
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
