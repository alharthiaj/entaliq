import { one, q } from "./db";
export type OrderRow = { id: string; number: number; status: string; pay_status: string; pay_method: string; pay_ref: string | null; name: string; phone: string; email: string; city: string; district: string; address: string; notes: string; subtotal: number; shipping: number; cod_fee: number; total: number; history: { at: string; status: string; note?: string; by?: string }[]; created_at: string };
export type ItemRow = { id: string; product_id: string | null; name_ar: string; name_en: string; price: number; qty: number; slug?: string; image?: string | null };
export async function getOrder(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const o = await one<OrderRow>("SELECT * FROM orders WHERE id=$1", [id]);
  if (!o) return null;
  const items = await q<ItemRow>("SELECT i.*, p.slug, p.images[1] AS image FROM order_items i LEFT JOIN products p ON p.id=i.product_id WHERE i.order_id=$1", [id]);
  return { order: o, items };
}
