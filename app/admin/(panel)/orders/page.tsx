import Link from "next/link";
import { q } from "@/lib/db";
import { Pill, STATUS, PAY, METHOD, sar, dt } from "../ui";

export const dynamic = "force-dynamic";
const TABS: [string, string][] = [["", "الكل"], ["open", "تحتاج متابعة"], ["pending", "بانتظار التأكيد"], ["processing", "قيد التجهيز"], ["shipped", "تم الشحن"], ["delivered", "تم التوصيل"], ["cancelled", "ملغية"]];
export default async function Orders({ searchParams: sp }: { searchParams: { status?: string; q?: string } }) {
  const where: string[] = []; const v: unknown[] = [];
  if (sp.status === "open") where.push("status IN ('pending','paid','processing')");
  else if (sp.status) { v.push(sp.status); where.push(`status=$${v.length}`); }
  if (sp.q) { v.push("%" + sp.q + "%"); where.push(`(name ILIKE $${v.length} OR phone LIKE $${v.length} OR number::text LIKE $${v.length})`); }
  const rows = await q(`SELECT o.*, (SELECT SUM(qty) FROM order_items WHERE order_id=o.id)::int items FROM orders o ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC LIMIT 300`, v);
  const qs = (st: string) => { const u = new URLSearchParams(); if (st) u.set("status", st); if (sp.q) u.set("q", sp.q); const s = u.toString(); return "/admin/orders" + (s ? "?" + s : ""); };
  return (
    <>
      <div className="a-top"><div><h1>الطلبات</h1><p>{rows.length} طلب</p></div><a className="a-btn" href="/api/admin/export/orders">تنزيل CSV</a></div>
      <div className="a-filters">{TABS.map(([k, l]) => <Link key={k} href={qs(k)} className={(sp.status || "") === k ? "on" : ""}>{l}</Link>)}</div>
      <form className="a-filters">{sp.status && <input type="hidden" name="status" value={sp.status} />}<input name="q" defaultValue={sp.q} placeholder="رقم الطلب أو اسم العميل أو الجوال" style={{ minWidth: 260 }} /><button className="a-btn dark" type="submit">بحث</button></form>
      <div className="a-table-wrap"><table className="a-table">
        <thead><tr><th>#</th><th>العميل</th><th>المدينة</th><th>القطع</th><th>الإجمالي</th><th>طريقة الدفع</th><th>الدفع</th><th>الحالة</th><th>التاريخ</th></tr></thead>
        <tbody>{rows.length ? rows.map((o: any) => (
          <tr key={o.id}>
            <td><Link className="n" href={`/admin/orders/${o.id}`} style={{ color: "var(--a-gold)", fontWeight: 700 }}>{o.number}</Link></td>
            <td><Link href={`/admin/orders/${o.id}`} style={{ fontWeight: 600 }}>{o.name}</Link><div className="sub n" dir="ltr" style={{ textAlign: "start" }}>{o.phone}</div></td>
            <td>{o.city}</td><td className="n">{o.items}</td><td className="n">{sar(o.total)}</td><td>{METHOD[o.pay_method]}</td>
            <td><Pill map={PAY} v={o.pay_status} /></td><td><Pill map={STATUS} v={o.status} /></td><td className="n sub">{dt(o.created_at)}</td>
          </tr>)) : <tr><td colSpan={9} className="empty-a">لا توجد طلبات هنا.</td></tr>}</tbody>
      </table></div>
    </>
  );
}
