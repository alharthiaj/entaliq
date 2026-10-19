import { q } from "@/lib/db";
import { getSession } from "@/lib/auth";
export async function GET() {
  if (!(await getSession())) return new Response("unauthorized", { status: 401 });
  const rows = await q<{ email: string; created_at: Date }>("SELECT email, created_at FROM subscribers ORDER BY created_at");
  const csv = "email,subscribed_at\n" + rows.map((r) => `${r.email},${new Date(r.created_at).toISOString()}`).join("\n");
  return new Response("﻿" + csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=subscribers.csv" } });
}
