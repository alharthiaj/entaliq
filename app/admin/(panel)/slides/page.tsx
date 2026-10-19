import Link from "next/link";
import { q } from "@/lib/db";
import { getBanners } from "@/lib/data";
import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";
import { saveBanners } from "../actions";
import { Flash } from "../ui";

export const dynamic = "force-dynamic";
export default async function Slides({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const slides = await q("SELECT * FROM slides ORDER BY sort");
  const b = await getBanners();
  return (
    <>
      <div className="a-top"><div><h1>البانرات والسلايدر</h1><p>واجهة الصفحة الرئيسية</p></div><div className="a-actions"><Link className="a-btn pri" href="/admin/slides/new">+ شريحة جديدة</Link></div></div>
      <Flash sp={searchParams} />
      <div className="a-card" style={{ marginBottom: 16 }}><h2>شرائح السلايدر</h2>
        <div className="a-table-wrap"><table className="a-table"><thead><tr><th></th><th>العنوان</th><th>الرابط</th><th>الترتيب</th><th>الحالة</th><th></th></tr></thead>
          <tbody>{slides.map((s: any) => <tr key={s.id}>
            <td><div style={{ width: 90, height: 50, borderRadius: 8, background: `linear-gradient(115deg,${s.bg_from},${s.bg_to})`, display: "grid", placeItems: "center" }}>{s.image_id && <img src={`/api/img/${s.image_id}`} alt="" style={{ maxWidth: 70, maxHeight: 42, objectFit: "contain" }} />}</div></td>
            <td><b>{s.title_ar}</b><div className="sub">{s.tag_ar}</div></td><td className="sub" dir="ltr">{s.link}</td><td className="n">{s.sort}</td>
            <td>{s.active ? <span className="pill ok">ظاهرة</span> : <span className="pill mute">مخفية</span>}</td>
            <td><Link className="a-btn sm" href={`/admin/slides/${s.id}`}>تعديل</Link></td></tr>)}</tbody></table></div>
      </div>
      <form action={saveBanners} className="a-card a-form">
        <h2>البانران الجانبيان</h2>
        <div className="a-grid a-g2">
          {(["A", "B"] as const).map((k) => (
            <div key={k} className="a-form" style={{ border: "1px solid var(--a-line)", borderRadius: 12, padding: 14 }}>
              <b>{k === "A" ? "البانر الأول" : "البانر الثاني"}</b>
              <div className="a-row"><label className="a-f">العنوان بالعربية<input name={`side${k}TitleAr`} defaultValue={(b as any)[`side${k}TitleAr`]} /></label><label className="a-f">العنوان بالإنجليزية<input name={`side${k}TitleEn`} defaultValue={(b as any)[`side${k}TitleEn`]} dir="ltr" /></label></div>
              <div className="a-row"><label className="a-f">النص بالعربية<input name={`side${k}TextAr`} defaultValue={(b as any)[`side${k}TextAr`]} /></label><label className="a-f">النص بالإنجليزية<input name={`side${k}TextEn`} defaultValue={(b as any)[`side${k}TextEn`]} dir="ltr" /></label></div>
              <label className="a-f">الرابط<input name={`side${k}Link`} defaultValue={(b as any)[`side${k}Link`]} dir="ltr" /></label>
              <ImageField name={`side${k}`} initial={(b as any)[`side${k}`] ? [(b as any)[`side${k}`]] : []} multiple={false} label="الصورة (يُفضّل PNG بخلفية شفافة)" />
            </div>
          ))}
        </div>
        <SubmitButton>حفظ البانرات</SubmitButton>
      </form>
    </>
  );
}
