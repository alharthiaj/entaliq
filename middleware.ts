import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { authKey } from "./lib/env";

// Guards every /admin page and /api/admin route; the login page stays public.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const token = req.cookies.get("madar_admin")?.value;
  let ok = false;
  if (token) {
    try { await jwtVerify(token, await authKey()); ok = true; } catch {}
  }
  if (ok) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = req.nextUrl.clone(); url.pathname = "/admin/login"; url.search = "";
  return NextResponse.redirect(url);
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
