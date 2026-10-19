import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { normPhone } from "@/lib/format";
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const num = parseInt(String(b.number || "").replace(/\D/g, ""), 10);
  const phone = normPhone(String(b.phone || ""));
  if (!num || !phone) return NextResponse.json({ ok: false }, { status: 404 });
  const o = await one<{ id: string }>("SELECT id FROM orders WHERE number=$1 AND phone=$2", [num, phone]);
  return o ? NextResponse.json({ ok: true, id: o.id }) : NextResponse.json({ ok: false }, { status: 404 });
}
