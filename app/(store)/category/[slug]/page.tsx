import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Listing from "@/components/Listing";
import { getLang } from "@/lib/i18n";
import { getCategory, getProducts } from "@/lib/data";

type P = { params: { slug: string }; searchParams: { sub?: string; sort?: string } };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const c = await getCategory(params.slug); const lang = getLang();
  return { title: c ? (lang === "ar" ? c.name_ar : c.name_en) : undefined };
}
export default async function CategoryPage({ params, searchParams }: P) {
  const lang = getLang();
  const c = await getCategory(params.slug);
  if (!c) notFound();
  const products = await getProducts({ category: c.slug, sub: searchParams.sub, sort: searchParams.sort });
  return <Listing lang={lang} title={lang === "ar" ? c.name_ar : c.name_en} products={products} base={`/category/${c.slug}`} params={{ sub: searchParams.sub, sort: searchParams.sort }} subs={c.subs} />;
}
