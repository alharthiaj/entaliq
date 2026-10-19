import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/env";
import { one } from "@/lib/db";
import { markPaid } from "@/lib/orders";

// Moyasar redirects the shopper here after the card step: ?id=<payment id>&status=...&order=<order id>
// The payment is re-fetched from Moyasar with the secret key; the query string alone is never trusted.
export async function GET(req: Request) {
  const u = new URL(req.url);
  const orderId = u.searchParams.get("order") || "";
  const payId = u.searchParams.get("id") || "";
  const base = siteUrl();
  const back = (ok: boolean) => NextResponse.redirect(new URL(`/order/${orderId}${ok ? "" : "?pay=failed"}`, base));
  if (!/^[0-9a-f-]{36}$/i.test(orderId) || !payId) return back(false);
  const order = await one<{ id: string; total: number; pay_status: string }>("SELECT id,total,pay_status FROM orders WHERE id=$1", [orderId]);
  if (!order) return back(false);
  if (order.pay_status === "paid") return back(true);
  const key = process.env.MOYASAR_SECRET_KEY;
  if (!key) return back(false);
  const r = await fetch(`https://api.moyasar.com/v1/payments/${encodeURIComponent(payId)}`, {
    headers: { authorization: "Basic " + Buffer.from(key + ":").toString("base64") }, cache: "no-store",
  }).catch(() => null);
  if (!r || !r.ok) return back(false);
  const pay = await r.json();
  const ok = pay.status === "paid" && pay.currency === "SAR" && pay.amount === order.total * 100 && pay.metadata?.order_id === order.id;
  if (ok) await markPaid(order.id, pay.id);
  return back(ok);
}
