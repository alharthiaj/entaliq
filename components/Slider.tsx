"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fmt } from "@/lib/format";

export type SlideView = { id: string; tag: string; title: string; text: string; image: string | null; photo: boolean; link: string; bgFrom: string; bgTo: string; glow: string; priceFrom: number | null };

export default function Slider({ slides, labels }: { slides: SlideView[]; labels: { from: string; sar: string; shopNow: string; prev: string; next: string; rtl: boolean } }) {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto || slides.length < 2) return;
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 6500);
    return () => clearInterval(id);
  }, [auto, slides.length]);
  if (!slides.length) return null;
  const go = (n: number) => { setAuto(false); setI((n + slides.length) % slides.length); };
  return (
    <div className="slider" aria-roledescription="carousel">
      {slides.map((s, k) => (
        <div key={s.id} className={"slide" + (k === i ? " on" : "")} aria-hidden={k !== i}
          style={{ background: `linear-gradient(115deg, ${s.bgFrom} 0%, ${s.bgTo} 100%)`, ["--glow" as string]: s.glow }}>
          <div>
            {s.tag && <span className="tag">{s.tag}</span>}
            <h2>{s.title.split("|")[0]}{s.title.includes("|") && <span className="hl">{s.title.split("|").slice(1).join(" ")}</span>}</h2>
            {s.text && <p>{s.text}</p>}
            {s.priceFrom ? <div className="pr"><span className="from">{labels.from}</span><b>{fmt(s.priceFrom)}</b><span>{labels.sar}</span></div> : null}
            <Link className="s-btn" href={s.link} tabIndex={k === i ? 0 : -1} style={{ display: "inline-block" }}>{labels.shopNow}</Link>
          </div>
          <div className={"art" + (s.photo ? " photo" : "")}>{s.image && <img src={s.image} alt="" decoding="async" />}</div>
        </div>
      ))}
      {slides.length > 1 && (<>
        <button className="arr prev" type="button" aria-label={labels.prev} onClick={() => go(i - 1)}>{labels.rtl ? "›" : "‹"}</button>
        <button className="arr next" type="button" aria-label={labels.next} onClick={() => go(i + 1)}>{labels.rtl ? "‹" : "›"}</button>
        <div className="dots">{slides.map((_, k) => <button key={k} type="button" className={k === i ? "on" : ""} aria-label={`${k + 1}`} onClick={() => go(k)} />)}</div>
      </>)}
    </div>
  );
}
