"use client";
import { useEffect, useState } from "react";
import { useT } from "./CartProvider";

export function Countdown() {
  const tr = useT();
  const [d, setD] = useState<number | null>(null);
  useEffect(() => {
    const calc = () => { const now = new Date(); const end = new Date(now); end.setHours(24, 0, 0, 0); setD(Math.max(0, Math.floor((+end - +now) / 1000))); };
    calc(); const id = setInterval(calc, 1000); return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  const v = d ?? 0;
  const u: [number, string][] = [[Math.floor(v / 3600), tr.h], [Math.floor((v % 3600) / 60), tr.m], [v % 60, tr.s]];
  return (
    <div className="clock">{u.map(([n, l], k) => (
      <span key={k} style={{ display: "contents" }}><div className="u"><b>{d === null ? "--" : pad(n)}</b><span>{l}</span></div>{k < 2 && <span className="c">:</span>}</span>
    ))}</div>
  );
}

export function QuoteForm() {
  const tr = useT();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form noValidate onSubmit={async (e) => {
      e.preventDefault();
      const f = e.currentTarget; const fd = Object.fromEntries(new FormData(f));
      if (!String(fd.name || "").trim() || !String(fd.phone || "").trim()) { setMsg({ ok: false, text: tr.qErr }); return; }
      setBusy(true);
      const r = await fetch("/api/quote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(fd) }).catch(() => null);
      setBusy(false);
      if (r && r.ok) { setMsg({ ok: true, text: tr.qOk }); f.reset(); } else setMsg({ ok: false, text: tr.qErr });
    }}>
      <input name="name" placeholder={tr.qName} aria-label={tr.qName} />
      <input name="company" placeholder={tr.qCo} aria-label={tr.qCo} />
      <input name="phone" type="tel" inputMode="tel" placeholder={tr.qPhone} aria-label={tr.qPhone} dir="ltr" />
      <input name="email" type="email" placeholder={tr.qEmail} aria-label={tr.qEmail} dir="ltr" />
      <textarea name="note" placeholder={tr.qNote} aria-label={tr.qNote} />
      <button className="send" type="submit" disabled={busy}>{tr.send}</button>
      {msg && <div className={"msg " + (msg.ok ? "ok" : "err")}>{msg.text}</div>}
    </form>
  );
}

export function NewsForm() {
  const tr = useT();
  const [state, setState] = useState<string | null>(null);
  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      const input = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
      const v = input.value.trim();
      if (!/^\S+@\S+\.\S+$/.test(v)) { setState(tr.newsErr); return; }
      const r = await fetch("/api/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: v }) }).catch(() => null);
      setState(r && r.ok ? tr.newsOk : tr.newsErr); if (r && r.ok) input.value = "";
    }}>
      <input name="email" type="email" placeholder={tr.newsPh} aria-label={tr.newsPh} dir="ltr" />
      <button type="submit">{tr.subscribe}</button>
      {state && <span role="status" style={{ position: "absolute", marginTop: 48, fontSize: 13, color: "#fff" }}>{state}</span>}
    </form>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => { const f = () => setShow(window.scrollY > 600); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  if (!show) return null;
  return <button className="totop" type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>;
}
