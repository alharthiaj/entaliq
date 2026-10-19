import "../store.css";
import CartProvider from "@/components/CartProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { BackToTop } from "@/components/Widgets";
import { getLang } from "@/lib/i18n";
import { getCategories, getProducts, getShipping, getStore } from "@/lib/data";
import { img } from "@/lib/format";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const lang = getLang();
  const [store, shipping, cats, top] = await Promise.all([getStore(), getShipping(), getCategories(), getProducts({ sort: "pop" })]);
  const feat: Record<string, { slug: string; name: string; image: string; price: number } | undefined> = {};
  for (const p of top) if (p.category_slug && !feat[p.category_slug]) feat[p.category_slug] = { slug: p.slug, name: lang === "ar" ? p.name_ar : p.name_en, image: img(p.images[0]), price: p.price };
  return (
    <CartProvider lang={lang} shipping={{ flat: shipping.flat, freeOver: shipping.freeOver, codFee: shipping.codFee }}>
      <Header storeName={lang === "ar" ? store.nameAr : store.nameEn} storeNameEn={store.nameEn} freeOver={shipping.freeOver}
        cats={cats.map((c) => ({ slug: c.slug, name_ar: c.name_ar, name_en: c.name_en, subs: c.subs }))} feat={feat} />
      <main className="wrap" id="top">{children}</main>
      <Footer lang={lang} store={store} />
      <CartDrawer />
      <BackToTop />
    </CartProvider>
  );
}
