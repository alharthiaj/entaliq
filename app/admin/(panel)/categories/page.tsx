import { q } from "@/lib/db";
import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";
import { saveCategory, deleteCategory } from "../actions";
import { Flash } from "../ui";

export const dynamic = "force-dynamic";
function CatForm({ c }: { c?: any }) {
  return (
    <form action={saveCategory} className="a-form">
      <input type="hidden" name="id" value={c?.id || ""} />
      <div className="a-row3">
        <label className="a-f">الاسم بالعربية *<input name="name_ar" defaultValue={c?.name_ar} required /></label>
        <label className="a-f">الاسم بالإنجليزية *<input name="name_en" defaultValue={c?.name_en} dir="ltr" required /></label>
        <label className="a-f">الترتيب<input name="sort" type="number" defaultValue={c?.sort ?? 0} className="n" /></label>
      </div>
      {!c && <label className="a-f">الرابط (slug)<input name="slug" dir="ltr" placeholder="مثال: laptops" /></label>}
      <label className="a-f">التصنيفات الفرعية<textarea name="subs" rows={4} dir="ltr" defaultValue={(c?.subs || []).map((s: any) => `${s.key} | ${s.ar} | ${s.en}`).join("\n")} />
        <small>سطر لكل تصنيف بالشكل: المفتاح | الاسم العربي | الاسم الإنجليزي. مثال: gaming | فئة الألعاب | Gaming. اكتب نفس المفتاح في حقل "التصنيفات الفرعية" للمنتج.</small></label>
      <ImageField name="image" initial={c?.image_id ? [c.image_id] : []} multiple={false} label="صورة القسم" />
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <label className="a-check"><input type="checkbox" name="active" defaultChecked={c ? c.active : true} /> ظاهر</label>
        <SubmitButton>{c ? "حفظ" : "إضافة القسم"}</SubmitButton>
      </div>
    </form>
  );
}
export default async function Categories({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const cats = await q("SELECT c.*, (SELECT count(*) FROM products WHERE category_id=c.id)::int n FROM categories c ORDER BY sort");
  return (
    <>
      <div className="a-top"><div><h1>الأقسام</h1><p>{cats.length} قسم</p></div></div>
      <Flash sp={searchParams} />
      <div className="a-grid">
        <details className="a-card"><summary style={{ cursor: "pointer", fontWeight: 700 }}>+ إضافة قسم جديد</summary><div style={{ marginTop: 14 }}><CatForm /></div></details>
        {cats.map((c: any) => (
          <details key={c.id} className="a-card">
            <summary style={{ cursor: "pointer", display: "flex", gap: 12, alignItems: "center" }}>
              <img src={c.image_id ? `/api/img/${c.image_id}` : "/placeholder.svg"} alt="" style={{ width: 44, height: 44, objectFit: "contain", background: "#fff", borderRadius: 8, border: "1px solid var(--a-line)" }} />
              <b>{c.name_ar}</b><span className="sub" style={{ color: "var(--a-muted)" }}>{c.name_en} · {c.n} منتج</span>
              {!c.active && <span className="pill mute">مخفي</span>}
            </summary>
            <div style={{ marginTop: 14 }}><CatForm c={c} /></div>
            <form action={deleteCategory} style={{ marginTop: 10 }}><input type="hidden" name="id" value={c.id} /><SubmitButton className="a-btn bad sm" confirm="حذف هذا القسم؟">حذف القسم</SubmitButton></form>
          </details>
        ))}
      </div>
    </>
  );
}
