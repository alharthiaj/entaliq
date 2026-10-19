import { NextResponse } from "next/server";
export function GET(req: Request) {
  const u = new URL(req.url);
  const to = u.searchParams.get("to") === "en" ? "en" : "ar";
  let back = u.searchParams.get("back") || "/";
  if (!back.startsWith("/") || back.startsWith("//")) back = "/";
  const res = NextResponse.redirect(new URL(back, u.origin));
  res.cookies.set("lang", to, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}
