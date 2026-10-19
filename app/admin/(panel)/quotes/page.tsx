import { q } from "@/lib/db";
import { setQuoteStatus } from "../actions";
import { dt } from "../ui";

export const dynamic = "force-dynamic";
const ST: Record<string, [string, string]> = { new: ["جديد", "warn"], contacted: ["تم التواصل", "info"], closed: ["مغلق", "ok"] };
export default async function Quotes() {
  const rows = await q("SELECT * FROM quotes ORDER BY created_at DESC LIMIT 300");
  return (
    <>
      <div className="a-top"><div><h1>طلبات عروض الأسعار</h1><p>طلبات الشركات والكميات من الصفحة الرئيسية</p></div></div>
      <div className="a-table-wrap"><table className="a-table">
        <thead><tr><th>العميل</th><th>التواصل</th><th>الطلب</th><th>التاريخ</th><th>الحالة</th></tr></thead>
        <tbody>{rows.length ? rows.map((r: any) => (
          <tr key={r.id}>
            <td><b>{r.name}</b>{r.company && <div className="sub">{r.company}</div>}</td>
            <td><a className="n" dir="ltr" href={`https://wa.me/${r.phone.replace(/\D/g, "").replace(/^0/, "966")}`} target="_blank" rel="noopener" style={{ color: "var(--a-gold)" }}>{r.phone}</a>{r.email && <div className="sub" dir="ltr">{r.email}</div>}</td>
            <td style={{ maxWidth: 380, whiteSpace: "pre-line" }}>{r.note || "—"}</td>
            <td className="n sub">{dt(r.created_at)}</td>
            <td><form action={setQuoteStatus} style={{ display: "flex", gap: 6 }}><input type="hidden" name="id" value={r.id} />
              <select name="status" defaultValue={r.status} className="a-btn sm">{Object.entries(ST).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select>
              <button className="a-btn sm" type="submit">حفظ</button></form><span className={"pill " + ST[r.status]?.[1]} style={{ marginTop: 6 }}>{ST[r.status]?.[0]}</span></td>
          </tr>)) : <tr><td colSpan={5} className="empty-a">لا توجد طلبات بعد. تصل هنا من نموذج "اطلب عرض سعر" في الصفحة الرئيسية.</td></tr>}</tbody>
      </table></div>
    </>
  );
}
