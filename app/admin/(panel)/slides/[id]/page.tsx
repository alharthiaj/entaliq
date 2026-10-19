import Link from "next/link";
import { notFound } from "next/navigation";
import { one } from "@/lib/db";
import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";
import { saveSlide, deleteSlide } from "../../actions";
import { Flash } from "../../ui";

export const dynamic = "force-dynamic";
export default async function EditSlide({ params, searchParams }: { params: { id: string }; searchParams: Record<string, string | undefined> }) {
  const isNew = params.id === "new";
  const s: any = isNew ? { active: true, link: "/", bg_from: "#04140f", bg_to: "#0e2b22", glow: "#d4af37", sort: 0 } : await one("SELECT * FROM slides WHERE id=$1", [/^[0-9a-f-]{36}$/i.test(params.id) ? params.id : "00000000-0000-0000-0000-000000000000"]);
  if (!s) notFound();
  return (
    <>
      <div className="a-top"><div><h1>{isNew ? "شريحة جديدة" : "تعديل الشريحة"}</h1></div><Link className="a-btn" href="/admin/slides">← البانرات</Link></div>
      <Flash sp={searchParams} />
      <form action={saveSlide} className="a-card a-form" style={{ maxWidth: 900 }}>
        <input type="hidden" name="id" value={isNew ? "" : s.id} />
        <div className="a-row"><label className="a-f">الوسم بالعربية<input name="tag_ar" defaultValue={s.tag_ar} placeholder="مثال: عروض الأسبوع" /></label><label className="a-f">الوسم بالإنجليزية<input name="tag_en" defaultValue={s.tag_en} dir="ltr" /></label></div>
        <div className="a-row"><label className="a-f">العنوان بالعربية * <small>(استخدم | لجعل الجزء الثاني بلون مميز في سطر جديد)</small><input name="title_ar" defaultValue={s.title_ar} required /></label><label className="a-f">العنوان بالإنجليزية *<input name="title_en" defaultValue={s.title_en} dir="ltr" required /></label></div>
        <div className="a-row"><label className="a-f">النص بالعربية<textarea name="text_ar" defaultValue={s.text_ar} rows={2} /></label><label className="a-f">النص بالإنجليزية<textarea name="text_en" defaultValue={s.text_en} rows={2} dir="ltr" /></label></div>
        <div className="a-row"><label className="a-f">رابط الزر<input name="link" defaultValue={s.link} dir="ltr" placeholder="/category/laptops" /></label><label className="a-f">السعر "يبدأ من" (اختياري)<input name="price_from" type="number" defaultValue={s.price_from ?? ""} className="n" /></label></div>
        <div className="a-row3"><label className="a-f">لون الخلفية ١<input name="bg_from" type="color" defaultValue={s.bg_from} /></label><label className="a-f">لون الخلفية ٢<input name="bg_to" type="color" defaultValue={s.bg_to} /></label><label className="a-f">لون التوهج<input name="glow" type="color" defaultValue={s.glow} /></label></div>
        <ImageField name="image" initial={s.image_id ? [s.image_id] : []} multiple={false} label="صورة المنتج (PNG بخلفية شفافة تعطي أفضل نتيجة)" />
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <label className="a-f" style={{ width: 120 }}>الترتيب<input name="sort" type="number" defaultValue={s.sort} className="n" /></label>
          <label className="a-check"><input type="checkbox" name="active" defaultChecked={s.active} /> ظاهرة</label>
          <SubmitButton>حفظ</SubmitButton>
        </div>
      </form>
      {!isNew && <form action={deleteSlide} style={{ marginTop: 12 }}><input type="hidden" name="id" value={s.id} /><SubmitButton className="a-btn bad" confirm="حذف هذه الشريحة؟">حذف الشريحة</SubmitButton></form>}
    </>
  );
}
