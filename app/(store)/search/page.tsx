import Listing from "@/components/Listing";
import { getLang, t } from "@/lib/i18n";
import { getProducts } from "@/lib/data";

type SP = { q?: string; brand?: string; flag?: string; sort?: string };
export const metadata = { robots: { index: false } };
export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const lang = getLang(); const tr = t(lang);
  const flag = searchParams.flag === "sale" ? "sale" : searchParams.flag === "new" ? "is_new" : searchParams.flag === "featured" ? "featured" : undefined;
  const products = await getProducts({ search: searchParams.q?.slice(0, 80), brand: searchParams.brand, flag, sort: searchParams.sort });
  const title = searchParams.q ? tr.searchFor(searchParams.q) : searchParams.brand ? searchParams.brand.toUpperCase() : flag === "sale" ? tr.deals : flag === "is_new" ? tr.newArr : tr.all;
  return <Listing lang={lang} title={title} products={products} base="/search" params={{ q: searchParams.q, brand: searchParams.brand, flag: searchParams.flag, sort: searchParams.sort }} />;
}
