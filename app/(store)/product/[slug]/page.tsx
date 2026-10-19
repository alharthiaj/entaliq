import { notFound } from "next/navigation";
import { siteUrl } from "@/lib/env";
import Link from "next/link";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { BuyBox, Gallery } from "@/components/BuyBox";
import { getLang, t } from "@/lib/i18n";
import { getCategories, getProduct, getProducts, getStore } from "@/lib/data";
import { fmt, img, offPct } from "@/lib/format";

type P = { params: { slug: string } };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = await getProduct(params.slug); const lang = getLang();
  if (!p) return {};
  const name = lang === "ar" ? p.name_ar : p.name_en;
  return { title: name, description: (lang === "ar" ? p.desc_ar : p.desc_en).slice(0, 160), openGraph: { title: name, images: p.images[0] ? [img(p.images[0])] : [] } };
}

export default async function ProductPage({ params }: P) {
  const lang = getLang(); const tr = t(lang);
  const p = await getProduct(params.slug);
  if (!p) notFound();
  const [cats, related, store] = await Promise.all([getCategories(), getProducts({ category: p.category_slug, limit: 11 }), getStore()]);
  const cat = cats.find((c) => c.id === p.category_id);
  const name = lang === "ar" ? p.name_ar : p.name_en;
  const off = offPct(p.price, p.compare_price);
  const images = (p.images.length ? p.images : [null]).map((i) => img(i));
  const ld = {
    "@context": "https://schema.org", "@type": "Product", name, brand: { "@type": "Brand", name: p.brand }, sku: p.sku || p.id,
    image: images.map((i) => siteUrl() + i), description: lang === "ar" ? p.desc_ar : p.desc_en,
    offers: { "@type": "Offer", priceCurrency: "SAR", price: p.price, availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", seller: { "@type": "Organization", name: store.nameEn } },
    ...(p.rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews || 1 } } : {}),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="crumbs"><Link href="/">{tr.home}</Link><span>/</span>{cat && <><Link href={`/category/${cat.slug}`}>{lang === "ar" ? cat.name_ar : cat.name_en}</Link><span>/</span></>}<span>{p.brand}</span></div>
      <section className="box pdp">
        <Gallery images={images} alt={name} />
        <div className="pinfo">
          <span className="bname">{p.brand.toUpperCase()}</span>
          <h1>{name}</h1>
          {p.rating ? <div className="rating"><i>{"★".repeat(Math.round(p.rating))}{"☆".repeat(5 - Math.round(p.rating))}</i><span className="num">{p.rating.toFixed(1)}</span><span>({p.reviews})</span></div> : null}
          <div className="bigp">
            <b className={off ? "" : "plain"}>{fmt(p.price)} {tr.sar}</b>
            {off ? <><s className="num" style={{ color: "var(--muted)" }}>{fmt(p.compare_price!)}</s><span className="tag-off" style={{ position: "static" }}>-{off}%</span></> : null}
          </div>
          <span className="vat">{tr.vat}{off ? <> · <b style={{ color: "var(--ok)" }}>{tr.save(fmt(p.compare_price! - p.price))}</b></> : null}</span>
          <div className="inst">{tr.inst(fmt(p.price / 4))}</div>
          <span className={"stock" + (p.stock > 0 ? "" : " out")}>● {p.stock <= 0 ? tr.outOfStock : p.stock <= 3 ? tr.lowStock(p.stock) : tr.inStock}</span>
          <BuyBox p={{ id: p.id, slug: p.slug, name_ar: p.name_ar, name_en: p.name_en, price: p.price, image: p.images[0] ?? null, stock: p.stock }} />
          {p.features.length > 0 && <><b style={{ fontSize: 15 }}>{tr.feat}</b><ul>{p.features.map((f, k) => <li key={k}>{f}</li>)}</ul></>}
          <div className="meta">
            <span>{tr.brand}</span><b>{p.brand}</b>
            {p.sku && <><span>{tr.sku}</span><b className="num">{p.sku}</b></>}
            {cat && <><span>{tr.category}</span><b>{lang === "ar" ? cat.name_ar : cat.name_en}</b></>}
          </div>
        </div>
      </section>
      {(lang === "ar" ? p.desc_ar : p.desc_en) && <section className="box"><div className="sec-head"><h2>{tr.desc}</h2></div><p className="desc" style={{ margin: 0 }}>{lang === "ar" ? p.desc_ar : p.desc_en}</p></section>}
      {related.filter((r) => r.id !== p.id).length > 0 && (
        <section className="box"><div className="sec-head"><h2>{tr.related}</h2></div>
          <div className="row">{related.filter((r) => r.id !== p.id).slice(0, 10).map((r) => <ProductCard key={r.id} p={r} lang={lang} />)}</div>
        </section>
      )}
    </>
  );
}
