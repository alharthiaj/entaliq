import { notFound } from "next/navigation";
import { getOrder } from "@/lib/orderview";
import { getStore } from "@/lib/data";
import { fmt, vatOf } from "@/lib/format";
import { zatcaQr } from "@/lib/zatca";
import PrintButton from "@/components/PrintButton";

export const metadata = { robots: { index: false }, title: "فاتورة ضريبية مبسطة" };
export default async function Invoice({ params }: { params: { id: string } }) {
  const data = await getOrder(params.id);
  if (!data) notFound();
  const { order: o, items } = data;
  const store = await getStore();
  const vat = vatOf(o.total);
  const qr = await zatcaQr(store.nameAr, store.vatNo, new Date(o.created_at), o.total, vat);
  const lines = [...items.map((i) => ({ n: i.name_ar, q: i.qty, u: i.price })), ...(o.shipping ? [{ n: "رسوم الشحن", q: 1, u: o.shipping }] : []), ...(o.cod_fee ? [{ n: "رسوم الدفع عند الاستلام", q: 1, u: o.cod_fee }] : [])];
  const ex = (n: number) => (n / 1.15).toFixed(2);
  return (
    <div dir="rtl" style={{ fontFamily: "'IBM Plex Sans Arabic',Tahoma,sans-serif", background: "#fff", color: "#111", minHeight: "100vh", padding: "24px 16px" }}>
      <style dangerouslySetInnerHTML={{ __html: `@media print{.noprint{display:none}} table{width:100%;border-collapse:collapse;font-size:13.5px} th,td{border:1px solid #ddd;padding:8px;text-align:start} th{background:#f4f5f7} .n{font-family:'IBM Plex Mono',monospace;font-variant-numeric:tabular-nums}` }} />
      <div style={{ maxWidth: 820, margin: "0 auto", display: "grid", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22 }}>فاتورة ضريبية مبسطة</h1>
            <div style={{ color: "#555", fontSize: 13 }}>Simplified Tax Invoice</div>
            <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.8 }}>
              <b>{store.nameAr}</b><br />{store.addressAr}<br />
              {store.vatNo && <>الرقم الضريبي: <span className="n">{store.vatNo}</span><br /></>}
              {store.cr && <>السجل التجاري: <span className="n">{store.cr}</span></>}
            </div>
          </div>
          <img src={qr} alt="ZATCA QR" width={140} height={140} />
        </div>
        <table><tbody>
          <tr><th>رقم الفاتورة</th><td className="n">INV-{o.number}</td><th>التاريخ</th><td className="n">{new Date(o.created_at).toLocaleString("en-GB", { timeZone: "Asia/Riyadh" })}</td></tr>
          <tr><th>العميل</th><td>{o.name}</td><th>الجوال</th><td className="n">{o.phone}</td></tr>
          <tr><th>العنوان</th><td colSpan={3}>{o.city}{o.district ? ` - ${o.district}` : ""} - {o.address}</td></tr>
        </tbody></table>
        <table>
          <thead><tr><th>المنتج</th><th>الكمية</th><th>سعر الوحدة (شامل)</th><th>الإجمالي قبل الضريبة</th><th>الإجمالي شامل الضريبة</th></tr></thead>
          <tbody>{lines.map((l, k) => <tr key={k}><td>{l.n}</td><td className="n">{l.q}</td><td className="n">{fmt(l.u)}</td><td className="n">{ex(l.u * l.q)}</td><td className="n">{fmt(l.u * l.q)}</td></tr>)}</tbody>
        </table>
        <table style={{ maxWidth: 380, marginInlineStart: "auto" }}><tbody>
          <tr><th>الإجمالي قبل الضريبة</th><td className="n">{(o.total - vat).toFixed(2)} ر.س</td></tr>
          <tr><th>ضريبة القيمة المضافة ١٥٪</th><td className="n">{vat.toFixed(2)} ر.س</td></tr>
          <tr><th>الإجمالي شامل الضريبة</th><td className="n"><b>{o.total.toFixed(2)} ر.س</b></td></tr>
        </tbody></table>
        <div className="noprint" style={{ textAlign: "center" }}><PrintButton /></div>
      </div>
    </div>
  );
}
