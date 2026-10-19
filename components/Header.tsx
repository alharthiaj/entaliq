"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart, useT } from "./CartProvider";
import { fmt } from "@/lib/format";
import Wordmark from "./Wordmark";
import type { Sub } from "@/lib/types";

type Cat = { slug: string; name_ar: string; name_en: string; subs: Sub[] };
type Feat = Record<string, { slug: string; name: string; image: string; price: number } | undefined>;

export default function Header({ storeName, storeNameEn, cats, feat, freeOver }: { storeName: string; storeNameEn: string; cats: Cat[]; feat: Feat; freeOver: number }) {
  const { lang, count, wish, setOpen } = useCart();
  const tr = useT();
  const router = useRouter();
  const path = usePathname();
  const [mega, setMega] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const navRef = useRef<HTMLDivElement>(null);
  const nm = (c: Cat) => (lang === "ar" ? c.name_ar : c.name_en);

  useEffect(() => setMega(null), [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMega(null);
    const onClick = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node) && !(e.target as HTMLElement).closest("#allcats")) setMega(null); };
    document.addEventListener("keydown", onKey); document.addEventListener("click", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); };
  }, []);
  const hover = () => typeof window !== "undefined" && window.matchMedia("(hover:hover)").matches;
  const active = cats.find((c) => c.slug === mega) || null;
  const f = active ? feat[active.slug] : undefined;

  return (
    <>
      <div className="topbar"><div className="wrap">
        <div className="tb-l">
          <span><svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.6" /><circle cx="17" cy="17.5" r="1.6" /></svg><b>{tr.freeShip(freeOver)}</b></span>
          <span><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg><b>{tr.secure}</b></span>
          <span><svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6z" /></svg><b>{tr.warranty}</b></span>
        </div>
        <div className="tb-r">
          <Link href="/track" style={{ color: "#fff" }}>{tr.track}</Link><span className="sep">|</span>
          <a className="tb-lang" style={{ color: "#fff", border: "1px solid rgba(255,255,255,.28)", borderRadius: 999, padding: "1px 12px" }} href={`/api/lang?to=${lang === "ar" ? "en" : "ar"}&back=${encodeURIComponent(path)}`}>{tr.lang}</a>
        </div>
      </div></div>

      <header className="main">
        <div className="wrap hrow">
          <Link className="logo" href="/" aria-label={storeName}><Wordmark nameEn={storeNameEn} /></Link>
          <button className="allcats" id="allcats" type="button" aria-expanded={!!mega} onClick={() => setMega(mega ? null : cats[0]?.slug ?? null)}>
            <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg><span className="t">{tr.allCats}</span>
          </button>
          <form className="search" role="search" onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`); }}>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr.searchPh} aria-label={tr.search} />
            <button type="submit" aria-label={tr.search}><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg></button>
          </form>
          <div className="icons">
            <Link className="ibtn" href="/wishlist"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>{wish.length > 0 && <span className="badge num">{wish.length}</span>}<span className="lbl"><small>{tr.wishlist}</small><b className="num">{wish.length}</b></span></Link>
            <button className="ibtn" type="button" onClick={() => setOpen(true)}><svg viewBox="0 0 24 24"><path d="M3 4h2l2.4 11h11L21 7H6.2" /><circle cx="9" cy="19.5" r="1.5" /><circle cx="17" cy="19.5" r="1.5" /></svg>{count > 0 && <span className="badge num">{count}</span>}<span className="lbl"><small>{tr.cart}</small><b className="num">{count}</b></span></button>
          </div>
        </div>
        <div className="navrow" ref={navRef} onMouseLeave={() => hover() && setMega(null)}>
          <div className="wrap">
            <Link className="nl" href="/">{tr.home}</Link>
            <Link className="nl hot" href="/search?flag=sale">{tr.deals}</Link>
            <Link className="nl" href="/search?flag=new">{tr.newArr}</Link>
            {cats.map((c) => (
              <Link key={c.slug} className="nl" href={`/category/${c.slug}`} onMouseEnter={() => hover() && setMega(c.slug)}>{nm(c)}</Link>
            ))}
          </div>
          {active && (
            <div className="mega"><div className="wrap">
              <div className="mega-side">
                {cats.map((c) => <button key={c.slug} type="button" className={c.slug === active.slug ? "on" : ""} onClick={() => setMega(c.slug)} onMouseEnter={() => hover() && setMega(c.slug)}>{nm(c)}</button>)}
              </div>
              <div className="mega-main">
                <div><h4>{nm(active)}</h4><ul>
                  <li><Link href={`/category/${active.slug}`}>{tr.all}</Link></li>
                  {active.subs.map((s) => <li key={s.key}><Link href={`/category/${active.slug}?sub=${encodeURIComponent(s.key)}`}>{lang === "ar" ? s.ar : s.en}</Link></li>)}
                </ul></div>
              </div>
              <div className="mega-feat">
                {f && (<>
                  <Link className="ph" href={`/product/${f.slug}`}><img src={f.image} alt="" /></Link>
                  <b>{f.name}</b><span className="num" style={{ color: "var(--sale)", fontWeight: 700 }}>{fmt(f.price)} {tr.sar}</span>
                </>)}
                <Link className="all" href={`/category/${active.slug}`} style={{ textAlign: "center" }}>{tr.viewMore}: {nm(active)}</Link>
              </div>
            </div></div>
          )}
        </div>
      </header>
    </>
  );
}
