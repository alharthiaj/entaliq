import Link from "next/link";
import ProductCard from "./ProductCard";
import SortSelect from "./SortSelect";
import type { Lang, Product, Sub } from "@/lib/types";
import { t } from "@/lib/dict";

export default function Listing({ lang, title, subtitle, products, base, params, subs }: {
  lang: Lang; title: string; subtitle?: string; products: Product[]; base: string; params: Record<string, string | undefined>; subs?: Sub[];
}) {
  const tr = t(lang);
  const qs = (over: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...params, ...over })) if (v) u.set(k, v);
    const s = u.toString(); return s ? `${base}?${s}` : base;
  };
  return (
    <>
      <div className="crumbs"><Link href="/">{tr.home}</Link><span>/</span><span>{title}</span></div>
      <section className="box">
        <div className="page-head">
          <div><h1>{title}</h1><p>{subtitle ?? tr.found(products.length)}</p></div>
          <SortSelect value={params.sort || "pop"} labels={{ sort: tr.sort, pop: tr.sPop, low: tr.sLow, high: tr.sHigh, off: tr.sOff, new: tr.sNew }} />
        </div>
        {subs && subs.length > 0 && (
          <div className="filters" style={{ marginBottom: 16 }}>
            <Link className={!params.sub ? "on" : ""} href={qs({ sub: undefined })}>{tr.all}</Link>
            {subs.map((s) => <Link key={s.key} className={params.sub === s.key ? "on" : ""} href={qs({ sub: s.key })}>{lang === "ar" ? s.ar : s.en}</Link>)}
          </div>
        )}
        <div className="grid">
          {products.length ? products.map((p) => <ProductCard key={p.id} p={p} lang={lang} />) : <div className="empty">{tr.none}</div>}
        </div>
      </section>
    </>
  );
}
