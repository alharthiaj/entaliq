import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { siteUrl } from "@/lib/env";
import { quoteEmail, sendMail } from "@/lib/mail";

const c = (s: unknown, n = 300) => String(s ?? "").trim().slice(0, n);

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const qd = { name: c(b.name, 120), company: c(b.company, 160), phone: c(b.phone, 30), email: c(b.email, 160), note: c(b.note, 2000) };
  if (!qd.name || !qd.phone) return NextResponse.json({ ok: false }, { status: 400 });
  if (qd.email && !/^\S+@\S+\.\S+$/.test(qd.email)) qd.email = "";
  await q("INSERT INTO quotes (name,company,phone,email,note) VALUES ($1,$2,$3,$4,$5)", [qd.name, qd.company, qd.phone, qd.email, qd.note]);
  // The request is already saved; email is a notification on top, so a mail failure never fails the form.
  try { await sendMail(quoteEmail(qd, `${siteUrl()}/admin/quotes`), { kind: "quote" }); } catch (e) { console.error("quote mail failed", e); }
  return NextResponse.json({ ok: true });
}
