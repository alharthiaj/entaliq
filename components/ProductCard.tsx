import Link from "next/link";
import type { Lang, Product } from "@/lib/types";
import { t } from "@/lib/dict";
import { fmt, img, offPct } from "@/lib/format";
import { AddButton, WishButton } from "./ProductButtons";

export default function ProductCard({ p, lang }: { p: Product; lang: Lang }) {
  const tr = t(lang);
  const off = offPct(p.price, p.compare_price);
  const name = lang === "ar" ? p.name_ar : p.name_en;
  const mini = { id: p.id, slug: p.slug, name_ar: p.name_ar, name_en: p.name_en, price: p.price, image: p.images[0] ?? null, stock: p.stock };
  return (
    <article className="card">
      {off ? <span className="tag-off">-{off}%</span> : p.is_new ? <span className="tag-new">{tr.isNew}</span> : null}
      <Link className="thumb" href={`/product/${p.slug}`} aria-label={name}>
        <img src={img(p.images[0])} alt={name} loading="lazy" decoding="async" />
      </Link>
      <span className="bname">{p.brand.toUpperCase()}</span>
      <h3><Link href={`/product/${p.slug}`}>{name}</Link></h3>
      {p.rating ? (
        <div className="rating"><i>{"★".repeat(Math.round(p.rating))}{"☆".repeat(5 - Math.round(p.rating))}</i><span className="num">{p.rating.toFixed(1)}</span><span>({p.reviews})</span></div>
      ) : null}
      <div className="pr-line">
        <span className={"now num" + (off ? "" : " plain")}>{fmt(p.price)}<small>{tr.sar}</small></span>
        {off ? <span className="old">{tr.regular} <s>{fmt(p.compare_price!)}</s></span> : <span className="old">&nbsp;</span>}
        <span className="vat">{tr.vat}</span>
      </div>
      <div className="c-actions">
        <AddButton p={mini} />
        <WishButton id={p.id} />
      </div>
    </article>
  );
}
