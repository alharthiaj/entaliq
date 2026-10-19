import WishlistView from "@/components/WishlistView";
import { getProducts } from "@/lib/data";
import { getLang } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";

export const metadata = { robots: { index: false } };
export default async function WishlistPage() {
  const lang = getLang();
  const all = await getProducts();
  return <WishlistView cards={Object.fromEntries(all.map((p) => [p.id, <ProductCard key={p.id} p={p} lang={lang} />]))} />;
}
