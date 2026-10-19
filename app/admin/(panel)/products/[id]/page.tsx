import Link from "next/link";
import { notFound } from "next/navigation";
import { q, one } from "@/lib/db";
import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";
import { saveProduct, deleteProduct } from "../../actions";
import { Flash } from "../../ui";

export const dynamic = "force-dynamic";
export default async function EditProduct({ params, searchParams }: { params: { id: string }; searchParams: Record<string, string | undefined> }) {
  const isNew = params.id === "new";
  const p: any = isNew ? { active: true, stock: 10, images: [], tags: [], features: [] } : await one("SELECT * FROM products WHERE id=$1", [/^[0-9a-f-]{36}$/i.test(params.id) ? params.id : "00000000-0000-0000-0000-000000000000"]);
  if (!p) notFound();
  const cats = await q<{ id: string; name_ar: string; subs: { key: string; ar: string }[] }>("SELECT id,name_ar,subs FROM categories ORDER BY sort");
  const brands = (await q<{ brand: string }>("SELECT DISTINCT brand FROM products ORDER BY brand")).map((r) => r.brand);
  const sold = isNew ? null : await one<{ n: number }>("SELECT COALESCE(SUM(qty),0)::int n FROM order_items WHERE product_id=$1", [p.id]);
  return (
    <>
      <div className="a-top"><div><h1>{isNew ? "منتج جديد" : "تعديل المنتج"}</h1><p>{isNew ? "أضف بيانات المنتج وصوره" : p.name_ar}</p></div>
        <div className="a-actions"><Link className="a-btn" href="/admin/products">← المنتجات</Link>{!isNew && <a className="a-btn" href={`/product/${p.slug}`} target="_blank" rel="noopener">عرض في المتجر</a>}</div></div>
      <Flash sp={searchParams} />
      <form action={saveProduct} className="a-grid a-g-main">
        <input type="hidden" name="id" defaultValue={isNew ? "" : p.id} />
        <div className="a-grid">
          <div className="a-card a-form">
            <h2>المعلومات الأساسية</h2>
            <label className="a-f">اسم المنتج بالعربية *<input name="name_ar" defaultValue={p.name_ar} required /></label>
            <label className="a-f">اسم المنتج بالإنجليزية *<input name="name_en" defaultValue={p.name_en} dir="ltr" required /></label>
            <label className="a-f">الوصف بالعربية<textarea name="desc_ar" defaultValue={p.desc_ar} rows={5} /></label>
            <label className="a-f">الوصف بالإنجليزية<textarea name="desc_en" defaultValue={p.desc_en} rows={4} dir="ltr" /></label>
            <label className="a-f">أبرز المزايا<textarea name="features" defaultValue={(p.features || []).join("\n")} rows={4} /><small>ميزة في كل سطر. تظهر كنقاط في صفحة المنتج.</small></label>
          </div>
          <div className="a-card a-form">
            <h2>الصور</h2>
            <ImageField name="images" initial={p.images || []} />
            <small style={{ color: "var(--a-muted)" }}>الصورة الأولى هي الرئيسية. يُفضّل خلفية بيضاء ومقاس مربع. تُضغط الصور تلقائيًا.</small>
          </div>
        </div>
        <div className="a-grid">
          <div className="a-card a-form">
            <h2>السعر والمخزون</h2>
            <div className="a-row">
              <label className="a-f">السعر (ر.س) *<input name="price" type="number" min="1" defaultValue={p.price} className="n" required /><small>شامل الضريبة</small></label>
              <label className="a-f">السعر قبل الخصم<input name="compare_price" type="number" min="0" defaultValue={p.compare_price ?? ""} className="n" /><small>اتركه فارغًا إن لم يوجد خصم</small></label>
            </div>
            <div className="a-row">
              <label className="a-f">الكمية المتوفرة<input name="stock" type="number" min="0" defaultValue={p.stock} className="n" /></label>
              <label className="a-f">رقم المنتج SKU<input name="sku" defaultValue={p.sku ?? ""} dir="ltr" /></label>
            </div>
            {sold && <small style={{ color: "var(--a-muted)" }}>تم بيع {sold.n} قطعة من هذا المنتج.</small>}
          </div>
          <div className="a-card a-form">
            <h2>التصنيف</h2>
            <label className="a-f">القسم *<select name="category_id" defaultValue={p.category_id} required><option value="">اختر القسم</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}</select></label>
            <label className="a-f">الماركة<input name="brand" defaultValue={p.brand} list="brands" dir="ltr" /><datalist id="brands">{brands.map((b) => <option key={b} value={b} />)}</datalist></label>
            <label className="a-f">التصنيفات الفرعية<input name="tags" defaultValue={(p.tags || []).join(", ")} dir="ltr" /><small>مفاتيح مفصولة بفاصلة. المتاح: {cats.flatMap((c) => c.subs.map((s) => s.key)).filter((v, i, a) => a.indexOf(v) === i).join("، ")}</small></label>
            <label className="a-f">رابط المنتج (slug)<input name="slug" defaultValue={p.slug} dir="ltr" placeholder="يُنشأ تلقائيًا من الاسم الإنجليزي" /></label>
          </div>
          <div className="a-card a-form">
            <h2>الظهور</h2>
            <div className="a-checks" style={{ flexDirection: "column", gap: 10 }}>
              <label className="a-check"><input type="checkbox" name="active" defaultChecked={p.active} /> ظاهر في المتجر</label>
              <label className="a-check"><input type="checkbox" name="deal" defaultChecked={p.deal} /> ضمن صفقة اليوم</label>
              <label className="a-check"><input type="checkbox" name="is_new" defaultChecked={p.is_new} /> وصل حديثًا</label>
              <label className="a-check"><input type="checkbox" name="featured" defaultChecked={p.featured} /> منتج مميز</label>
            </div>
            <SubmitButton>حفظ المنتج</SubmitButton>
          </div>
        </div>
      </form>
      {!isNew && (
        <form action={deleteProduct} style={{ marginTop: 16 }}>
          <input type="hidden" name="id" value={p.id} />
          <SubmitButton className="a-btn bad" confirm="هل تريد حذف هذا المنتج نهائيًا؟ تبقى الطلبات السابقة محفوظة.">حذف المنتج</SubmitButton>
        </form>
      )}
    </>
  );
}
