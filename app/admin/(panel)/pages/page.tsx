import Link from "next/link";
import { q } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Pages() {
  const rows = await q("SELECT slug,title_ar FROM pages ORDER BY title_ar");
  return (
    <>
      <div className="a-top"><div><h1>الصفحات</h1><p>صفحات المعلومات في أسفل الموقع</p></div></div>
      <div className="a-table-wrap"><table className="a-table"><thead><tr><th>الصفحة</th><th>الرابط</th><th></th></tr></thead>
        <tbody>{rows.map((r: any) => <tr key={r.slug}><td><b>{r.title_ar}</b></td><td className="sub" dir="ltr">/page/{r.slug}</td><td><Link className="a-btn sm" href={`/admin/pages/${r.slug}`}>تعديل</Link> <a className="a-btn sm" href={`/page/${r.slug}`} target="_blank" rel="noopener">عرض</a></td></tr>)}</tbody></table></div>
    </>
  );
}
