import { notFound } from "next/navigation";
import Link from "next/link";
import { getLang, t } from "@/lib/i18n";
import { getPage } from "@/lib/data";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await getPage(params.slug); const lang = getLang();
  return { title: p ? (lang === "ar" ? p.title_ar : p.title_en) : undefined };
}
export default async function InfoPage({ params }: { params: { slug: string } }) {
  const lang = getLang(); const tr = t(lang);
  const p = await getPage(params.slug);
  if (!p) notFound();
  const title = lang === "ar" ? p.title_ar : p.title_en;
  return (
    <>
      <div className="crumbs"><Link href="/">{tr.home}</Link><span>/</span><span>{title}</span></div>
      <section className="box" style={{ marginBottom: 30 }}><div className="prose"><h1>{title}</h1>{lang === "ar" ? p.body_ar : p.body_en}</div></section>
    </>
  );
}
