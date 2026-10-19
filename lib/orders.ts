import { pool, q } from "./db";
import { getPayments, getShipping } from "./data";
import { normPhone } from "./format";

export type CheckoutInput = {
  items: { id: string; qty: number }[];
  name: string; phone: string; email?: string; city: string; district?: string; address: string; notes?: string;
  payMethod: "card" | "cod" | "bank";
};
export class CheckoutError extends Error { constructor(public code: string) { super(code); } }

const clean = (s: unknown, max = 300) => String(s ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);

export async function createOrder(input: CheckoutInput) {
  const name = clean(input.name, 120), city = clean(input.city, 80), address = clean(input.address, 400);
  const phone = normPhone(String(input.phone || ""));
  if (!name || !city || !address) throw new CheckoutError("required");
  if (!phone) throw new CheckoutError("phone");
  const [shipping, payments] = await Promise.all([getShipping(), getPayments()]);
  const method = input.payMethod;
  if (!["card", "cod", "bank"].includes(method) || !payments[method]) throw new CheckoutError("payment");
  const wanted = new Map<string, number>();
  for (const it of input.items || []) {
    const qty = Math.floor(Number(it.qty));
    if (typeof it.id === "string" && /^[0-9a-f-]{36}$/i.test(it.id) && qty > 0) wanted.set(it.id, Math.min(99, (wanted.get(it.id) || 0) + qty));
  }
  if (!wanted.size) throw new CheckoutError("empty");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: prods } = await client.query("SELECT id,name_ar,name_en,price,stock FROM products WHERE id = ANY($1::uuid[]) AND active FOR UPDATE", [[...wanted.keys()]]);
    if (prods.length !== wanted.size) throw new CheckoutError("unavailable");
    for (const p of prods) if (p.stock < wanted.get(p.id)!) throw new CheckoutError("stock:" + p.name_ar);
    const subtotal = prods.reduce((a, p) => a + p.price * wanted.get(p.id)!, 0);
    const ship = subtotal >= shipping.freeOver ? 0 : shipping.flat;
    const codFee = method === "cod" ? shipping.codFee : 0;
    const total = subtotal + ship + codFee;
    const history = [{ at: new Date().toISOString(), status: "pending", note: "order placed" }];
    const { rows: [order] } = await client.query(
      `INSERT INTO orders (pay_method,name,phone,email,city,district,address,notes,subtotal,shipping,cod_fee,total,history)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id, number, total`,
      [method, name, phone, clean(input.email, 160), city, clean(input.district, 120), address, clean(input.notes, 600), subtotal, ship, codFee, total, JSON.stringify(history)]);
    for (const p of prods) {
      await client.query("INSERT INTO order_items (order_id,product_id,name_ar,name_en,price,qty) VALUES ($1,$2,$3,$4,$5,$6)", [order.id, p.id, p.name_ar, p.name_en, p.price, wanted.get(p.id)]);
      await client.query("UPDATE products SET stock = stock - $2, popularity = popularity + $2 WHERE id=$1", [p.id, wanted.get(p.id)]);
    }
    await client.query("COMMIT");
    return order as { id: string; number: number; total: number };
  } catch (e) {
    await client.query("ROLLBACK"); throw e;
  } finally { client.release(); }
}

export async function setOrderStatus(id: string, status: string, note = "", by = "") {
  const valid = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
  if (!valid.includes(status)) return;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: [o] } = await client.query("SELECT status FROM orders WHERE id=$1 FOR UPDATE", [id]);
    if (!o) { await client.query("ROLLBACK"); return; }
    // restock when an order is cancelled, take stock again if it is reopened
    if (status === "cancelled" && o.status !== "cancelled") await client.query("UPDATE products p SET stock = p.stock + i.qty FROM order_items i WHERE i.order_id=$1 AND i.product_id=p.id", [id]);
    if (o.status === "cancelled" && status !== "cancelled") await client.query("UPDATE products p SET stock = GREATEST(0, p.stock - i.qty) FROM order_items i WHERE i.order_id=$1 AND i.product_id=p.id", [id]);
    await client.query(`UPDATE orders SET status=$2, updated_at=now(), history = history || $3::jsonb WHERE id=$1`, [id, status, JSON.stringify([{ at: new Date().toISOString(), status, note, by }])]);
    await client.query("COMMIT");
  } catch (e) { await client.query("ROLLBACK"); throw e; } finally { client.release(); }
}

export async function markPaid(id: string, ref: string) {
  await q(`UPDATE orders SET pay_status='paid', pay_ref=$2, status = CASE WHEN status='pending' THEN 'paid' ELSE status END, updated_at=now(),
           history = history || $3::jsonb WHERE id=$1`, [id, ref, JSON.stringify([{ at: new Date().toISOString(), status: "paid", note: "payment " + ref }])]);
}
