import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "madar_admin";
import { authKey } from "./env";

export type Session = { id: string; name: string; email: string; role: string };

export async function createSession(s: Session) {
  const token = await new SignJWT(s).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(await authKey());
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export function destroySession() {
  cookies().delete(COOKIE);
}
export async function verifyToken(token?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await authKey());
    return payload as unknown as Session;
  } catch {
    return null;
  }
}
export async function getSession() {
  return verifyToken(cookies().get(COOKIE)?.value);
}
export async function requireAdmin(role?: "admin") {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (role === "admin" && s.role !== "admin") redirect("/admin");
  return s;
}
export const ADMIN_COOKIE = COOKIE;
