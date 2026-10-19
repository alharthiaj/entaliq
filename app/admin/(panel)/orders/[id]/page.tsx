import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/orderview";
import { vatOf } from "@/lib/format";
import SubmitButton from "@/components/admin/SubmitButton";
import { updateOrder } from "../../actions";
import { Pill, STATUS, PAY, METHOD, sar, dt, Flash } from "../../ui";

export const dynamic = "force-dynamic";
export default async function OrderDetail({ params, searchParams }: { params: { id: string }; searchParams: Record<string, string | undefined> }) {
  const data = await getOrder(params.id);
  if (!data) notFound();
  const { order: o, items } = data;
  const wa = o.phone.replace(/^0/, "966");
  return (
    <>
      <div className="a-top">
        <div><h1>طلب #{o.number}</h1><p>{dt(o.created_at)} · <Pill map={STATUS} v={o.status} /> <Pill map={PAY} v={o.pay_status} /></p></div>
        <div className="a-actions"><Link className="a-btn" href="/admin/orders">← الطلبات</Link><a className="a-btn" href={`/invoice/${o.id}`} target="_blank" rel="noopener">الفاتورة الضريبية</a><a className="a-btn" href={`https://wa.me/${wa}`} target="_blank" rel="noopener">واتساب العميل</a></div>
      </div>
      <Flash sp={searchParams} />
      <div className="a-grid a-g-main">
        <div className="a-grid">
          <div className="a-card" style={{ padding: 0 }}>
            <div className="a-table-wrap" style={{ border: 0 }}><table className="a-table">
              <thead><tr><th></th><th>المنتج</th><th>السعر</th><th>الكمية</th><th>الإجمالي</th></tr></thead>
              <tbody>{items.map((i) => <tr key={i.id}><td><img className="thumb" src={i.image ? `/api/img/${i.image}` : "/placeholder.svg"} alt="" /></td><td>{i.product_id ? <Link href={`/admin/products/${i.product_id}`} className="name">{i.name_ar}</Link> : <span className="name">{i.name_ar}</span>}</td><td className="n">{sar(i.price)}</td><td className="n">{i.qty}</td><td className="n">{sar(i.price * i.qty)}</td></tr>)}</tbody>
            </table></div>
            <div style={{ padding: 18, display: "grid", gap: 6, maxWidth: 360, marginInlineStart: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>المجموع</span><b className="n">{sar(o.subtotal)}</b></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>الشحن</span><b className="n">{sar(o.shipping)}</b></div>
              {o.cod_fee > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span>رسوم الدفع عند الاستلام</span><b className="n">{sar(o.cod_fee)}</b></div>}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17 }}><span>الإجمالي</span><b className="n">{sar(o.total)} ر.س</b></div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--a-muted)", fontSize: 12.5 }}><span>منها ضريبة ١٥٪</span><span className="n">{vatOf(o.total).toFixed(2)}</span></div>
            </div>
          </div>
          <div className="a-card"><h2>سجل الطلب</h2>
            <ul className="timeline-a">{[...o.history].reverse().map((h, k) => <li key={k}><div><b>{STATUS[h.status]?.[0] || h.status}</b> <small className="n">{dt(h.at)}</small>{h.by && <small> · {h.by}</small>}{h.note && <div><small>{h.note}</small></div>}</div></li>)}</ul>
          </div>
        </div>
        <div className="a-grid">
          <form action={updateOrder} className="a-card a-form">
            <h2>تحديث الحالة</h2>
            <input type="hidden" name="id" value={o.id} />
            <label className="a-f">الحالة<select name="status" defaultValue={o.status}>{Object.entries(STATUS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select></label>
            <label className="a-f">ملاحظة (اختياري)<input name="note" placeholder="مثال: رقم الشحنة SMSA 123456" /></label>
            {o.pay_status !== "paid" && <label className="a-check"><input type="checkbox" name="mark_paid" /> تأكيد استلام المبلغ</label>}
            <small style={{ color: "var(--a-muted)" }}>إلغاء الطلب يعيد الكميات للمخزون تلقائيًا.</small>
            <SubmitButton>حفظ</SubmitButton>
          </form>
          <div className="a-card"><h2>العميل</h2><ul className="list-plain">
            <li><span>الاسم</span><b>{o.name}</b></li>
            <li><span>الجوال</span><b className="n" dir="ltr">{o.phone}</b></li>
            {o.email && <li><span>البريد</span><b dir="ltr" style={{ fontSize: 12.5 }}>{o.email}</b></li>}
            <li><span>المدينة</span><b>{o.city}{o.district ? ` - ${o.district}` : ""}</b></li>
          </ul><p style={{ margin: "10px 0 0", fontSize: 13.5 }}>{o.address}</p>{o.notes && <div className="a-msg" style={{ background: "var(--a-gold-soft)", marginTop: 10 }}>{o.notes}</div>}</div>
          <div className="a-card"><h2>الدفع</h2><ul className="list-plain">
            <li><span>الطريقة</span><b>{METHOD[o.pay_method]}</b></li>
            <li><span>الحالة</span><Pill map={PAY} v={o.pay_status} /></li>
            {o.pay_ref && <li><span>المرجع</span><b className="n" style={{ fontSize: 12 }}>{o.pay_ref}</b></li>}
          </ul></div>
        </div>
      </div>
    </>
  );
}
