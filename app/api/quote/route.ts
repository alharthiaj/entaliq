import { NextResponse } from "next/server";
import { q } from "@/lib/db";
const c = (s: unknown, n = 300) => String(s ?? "").trim().slice(0, n);
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!c(b.name) || !c(b.phone)) return NextResponse.json({ ok: false }, { status: 400 });
  await q("INSERT INTO quotes (name,company,phone,email,note) VALUES ($1,$2,$3,$4,$5)", [c(b.name, 120), c(b.company, 160), c(b.phone, 30), c(b.email, 160), c(b.note, 2000)]);
  return NextResponse.json({ ok: true });
}
