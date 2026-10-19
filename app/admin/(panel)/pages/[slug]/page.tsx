import Link from "next/link";
import { notFound } from "next/navigation";
import { one } from "@/lib/db";
import SubmitButton from "@/components/admin/SubmitButton";
import { savePage } from "../../actions";
import { Flash } from "../../ui";
export const dynamic = "force-dynamic";
export default async function EditPage({ params, searchParams }: { params: { slug: string }; searchParams: Record<string, string | undefined> }) {
  const p: any = await one("SELECT * FROM pages WHERE slug=$1", [params.slug]);
  if (!p) notFound();
  return (
    <>
      <div className="a-top"><div><h1>{p.title_ar}</h1></div><Link className="a-btn" href="/admin/pages">← الصفحات</Link></div>
      <Flash sp={searchParams} />
      <form action={savePage} className="a-card a-form">
        <input type="hidden" name="slug" value={p.slug} />
        <div className="a-row"><label className="a-f">العنوان بالعربية<input name="title_ar" defaultValue={p.title_ar} /></label><label className="a-f">العنوان بالإنجليزية<input name="title_en" defaultValue={p.title_en} dir="ltr" /></label></div>
        <label className="a-f">المحتوى بالعربية<textarea name="body_ar" defaultValue={p.body_ar} rows={14} /><small>اترك سطرًا فارغًا بين الفقرات.</small></label>
        <label className="a-f">المحتوى بالإنجليزية<textarea name="body_en" defaultValue={p.body_en} rows={10} dir="ltr" /></label>
        <div><SubmitButton>حفظ الصفحة</SubmitButton></div>
      </form>
    </>
  );
}
