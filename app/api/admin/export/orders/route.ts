import { q } from "@/lib/db";
import { getSession } from "@/lib/auth";
const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
export async function GET() {
  if (!(await getSession())) return new Response("unauthorized", { status: 401 });
  const rows = await q("SELECT number,created_at,name,phone,email,city,address,pay_method,pay_status,status,subtotal,shipping,cod_fee,total FROM orders ORDER BY created_at DESC");
  const head = ["number", "created_at", "name", "phone", "email", "city", "address", "pay_method", "pay_status", "status", "subtotal", "shipping", "cod_fee", "total"];
  const csv = head.join(",") + "\n" + rows.map((r: any) => head.map((h) => esc(h === "created_at" ? new Date(r[h]).toISOString() : r[h])).join(",")).join("\n");
  return new Response("﻿" + csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=orders.csv" } });
}
