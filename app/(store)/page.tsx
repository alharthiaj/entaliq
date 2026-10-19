import Link from "next/link";
import Slider from "@/components/Slider";
import ProductCard from "@/components/ProductCard";
import Tabs from "@/components/Tabs";
import { Countdown, QuoteForm } from "@/components/Widgets";
import { getLang, t } from "@/lib/i18n";
import { getBanners, getBrands, getCategories, getProducts, getSlides } from "@/lib/data";
import { img } from "@/lib/format";

const SHELF_BG = ["linear-gradient(160deg,#030b18,#0c272e)", "linear-gradient(160deg,#030b18,#063638)", "linear-gradient(160deg,#061329,#0c272e)", "linear-gradient(160deg,#030b18,#101e2a)", "linear-gradient(160deg,#071b22,#0b4d4c)"];

export default async function Home() {
  const lang = getLang();
  const tr = t(lang);
  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const [slides, banners, cats, all, brands] = await Promise.all([getSlides(), getBanners(), getCategories(), getProducts(), getBrands()]);
  const deals = all.filter((p) => p.deal);
  const shelves = cats.map((c) => ({ c, items: all.filter((p) => p.category_slug === c.slug) })).filter((s) => s.items.length >= 3).slice(0, 5);

  return (
    <>
      <div className="hero">
        <Slider
          slides={slides.map((s) => ({ id: s.id, tag: L(s.tag_ar, s.tag_en), title: L(s.title_ar, s.title_en), text: L(s.text_ar, s.text_en), image: s.image_id ? img(s.image_id) : null, photo: false, link: s.link, bgFrom: s.bg_from, bgTo: s.bg_to, glow: s.glow, priceFrom: s.price_from }))}
          labels={{ from: tr.from, sar: tr.sar, shopNow: tr.shopNow, prev: "Previous", next: "Next", rtl: lang === "ar" }}
        />
        <div className="side-ban">
          <div className="sban" style={{ background: "radial-gradient(circle at 20% 80%,rgba(25,211,197,.22),transparent 55%),linear-gradient(140deg,#030b18,#0c272e)" }}>
            <div><h3>{L(banners.sideATitleAr, banners.sideATitleEn)}</h3><p>{L(banners.sideATextAr, banners.sideATextEn)}</p></div>
            <Link href={banners.sideALink} className="sban-btn">{tr.shopNow}</Link>
            {banners.sideA && <img src={img(banners.sideA)} alt="" />}
          </div>
          <div className="sban" style={{ background: "radial-gradient(circle at 20% 80%,rgba(25,211,197,.18),transparent 55%),linear-gradient(140deg,#061329,#063638)" }}>
            <div><h3>{L(banners.sideBTitleAr, banners.sideBTitleEn)}</h3><p>{L(banners.sideBTextAr, banners.sideBTextEn)}</p></div>
            <Link href={banners.sideBLink} className="sban-btn">{tr.shopNow}</Link>
            {banners.sideB && <img src={img(banners.sideB)} alt="" />}
          </div>
        </div>
      </div>

      {deals.length > 0 && (
        <section className="box">
          <div className="deal-top">
            <div className="sec-head" style={{ margin: 0 }}><h2>{tr.dealTitle}</h2></div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><span className="ends">{tr.endsIn}</span><Countdown /></div>
          </div>
          <div className="row">{deals.map((p) => <ProductCard key={p.id} p={p} lang={lang} />)}</div>
        </section>
      )}

      <section>
        <div className="sec-head"><h2>{tr.byCat}</h2></div>
        <div className="hotcats">
          {cats.map((c) => (
            <Link key={c.id} className="hc" href={`/category/${c.slug}`}><span className="c"><img src={img(c.image_id)} alt="" loading="lazy" /></span>{L(c.name_ar, c.name_en)}</Link>
          ))}
        </div>
      </section>

      <section className="box">
        <div className="sec-head"><h2>{tr.byBrand}</h2></div>
        <div className="brands">
          {brands.slice(0, 8).map((b) => <Link key={b} className="brand-tile" href={`/search?brand=${encodeURIComponent(b)}`}>{b.toUpperCase()}</Link>)}
        </div>
      </section>

      <section className="paybans">
        <div className="pb p1"><span className="ic">mada</span><div><b>{tr.pb1}</b><span>{tr.pb1d}</span></div></div>
        <div className="pb p2"><span className="ic">COD</span><div><b>{tr.pb2}</b><span>{tr.pb2d}</span></div></div>
        <div className="pb p3"><span className="ic">VAT</span><div><b>{tr.pb3}</b><span>{tr.pb3d}</span></div></div>
      </section>

      {shelves.map(({ c, items }, k) => (
        <section className="box" key={c.id}>
          <div className="sec-head"><h2>{L(c.name_ar, c.name_en)}</h2><Link className="more" href={`/category/${c.slug}`}>{tr.viewMore} {lang === "ar" ? "←" : "→"}</Link></div>
          <div className="shelf">
            <div className="shelf-side">
              <ul className="sublist">{c.subs.slice(0, 9).map((s) => <li key={s.key}><Link href={`/category/${c.slug}?sub=${encodeURIComponent(s.key)}`}>{L(s.ar, s.en)}</Link></li>)}</ul>
              <div className="shelf-ban" style={{ background: SHELF_BG[k % SHELF_BG.length] }}>
                <h4>{L(c.name_ar, c.name_en)}</h4>
                <img src={img(items[0].images[0] ?? c.image_id)} alt="" loading="lazy" style={{ background: "#fff", borderRadius: 12, padding: 8 }} />
                <Link className="s-btn" href={`/category/${c.slug}`} style={{ padding: "7px 14px", fontSize: 13, alignSelf: "flex-start" }}>{tr.shopNow}</Link>
              </div>
            </div>
            <div className="shelf-main"><div className="row">{items.slice(0, 12).map((p) => <ProductCard key={p.id} p={p} lang={lang} />)}</div></div>
          </div>
        </section>
      ))}

      <Tabs title={tr.moreToShop} labels={[tr.tNew, tr.tFeat, tr.tBest]} panels={[
        all.filter((p) => p.is_new).slice(0, 12).map((p) => <ProductCard key={p.id} p={p} lang={lang} />),
        all.filter((p) => p.featured).slice(0, 12).map((p) => <ProductCard key={p.id} p={p} lang={lang} />),
        all.slice(0, 12).map((p) => <ProductCard key={p.id} p={p} lang={lang} />),
      ]} />

      <section className="why">
        <div><i><svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg></i><p style={{ margin: 0 }}><b>{tr.w1}</b><span>{tr.w1d}</span></p></div>
        <div><i><svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.6" /><circle cx="17" cy="17.5" r="1.6" /></svg></i><p style={{ margin: 0 }}><b>{tr.w2}</b><span>{tr.w2d}</span></p></div>
        <div><i><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" /></svg></i><p style={{ margin: 0 }}><b>{tr.w3}</b><span>{tr.w3d}</span></p></div>
        <div><i><svg viewBox="0 0 24 24"><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></svg></i><p style={{ margin: 0 }}><b>{tr.w4}</b><span>{tr.w4d}</span></p></div>
      </section>

      <section className="box quote" id="quote">
        <div><h2>{tr.quoteT}</h2><p>{tr.quoteD}</p><ul><li>{tr.q1}</li><li>{tr.q2}</li><li>{tr.q3}</li></ul></div>
        <QuoteForm />
      </section>
    </>
  );
}
