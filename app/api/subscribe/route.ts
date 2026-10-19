import { NextResponse } from "next/server";
import { q } from "@/lib/db";
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const email = String(b.email || "").trim().toLowerCase().slice(0, 160);
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ ok: false }, { status: 400 });
  await q("INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT DO NOTHING", [email]);
  return NextResponse.json({ ok: true });
}
