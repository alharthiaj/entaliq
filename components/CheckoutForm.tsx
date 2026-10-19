"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart, useT } from "./CartProvider";
import { fmt, img, vatOf } from "@/lib/format";
import type { Lang } from "@/lib/types";

export default function CheckoutForm({ methods, cities, codFee, lang }: { methods: { card: boolean; cod: boolean; bank: boolean }; cities: string[]; codFee: number; lang: Lang }) {
  const { items, subtotal, shipping, clear } = useCart();
  const tr = useT();
  const router = useRouter();
  const first = methods.card ? "card" : methods.cod ? "cod" : "bank";
  const [pay, setPay] = useState<"card" | "cod" | "bank">(first);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ship = subtotal >= shipping.freeOver ? 0 : shipping.flat;
  const fee = pay === "cod" ? codFee : 0;
  const total = subtotal + ship + fee;

  if (!items.length) return (
    <div className="center-card box"><h1 style={{ fontSize: 22 }}>{tr.cartTitle}</h1><p>{tr.cartEmpty}</p><Link className="btn-dark" href="/">{tr.continue}</Link></div>
  );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(null);
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!fd.name?.trim() || !fd.phone?.trim() || !fd.city?.trim() || !fd.address?.trim()) { setErr(tr.required); return; }
    const phone = fd.phone.replace(/[^\d]/g, "").replace(/^00966|^966/, "0");
    if (!/^05\d{8}$/.test(phone)) { setErr(tr.phoneErr); return; }
    setBusy(true);
    const r = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...fd, payMethod: pay, items: items.map((i) => ({ id: i.id, qty: i.qty })) }) }).catch(() => null);
    const data = r ? await r.json().catch(() => null) : null;
    if (!data?.ok) {
      setBusy(false);
      const code: string = data?.error || "server";
      setErr(code === "phone" ? tr.phoneErr : code === "required" ? tr.required : code.startsWith("stock:")
        ? (lang === "ar" ? `الكمية المطلوبة غير متوفرة: ${code.slice(6)}` : "One of the items no longer has enough stock. Reduce the quantity and try again.")
        : lang === "ar" ? "تعذّر إرسال الطلب. حدّث الصفحة وحاول مرة أخرى." : "We couldn't place the order. Refresh the page and try again.");
      return;
    }
    clear();
    router.push(pay === "card" ? `/order/${data.id}/pay` : `/order/${data.id}?new=1`);
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="crumbs"><Link href="/">{tr.home}</Link><span>/</span><span>{tr.coTitle}</span></div>
      <div className="layout-2">
        <div style={{ display: "grid", gap: 16 }}>
          <section className="box" style={{ margin: 0 }}>
            <div className="sec-head"><h2>{tr.coContact}</h2></div>
            <div className="form-grid">
              <label className="field">{tr.fullName} *<input name="name" autoComplete="name" required /></label>
              <label className="field">{tr.qPhone} *<input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="05XXXXXXXX" dir="ltr" required /></label>
              <label className="field full">{tr.qEmail}<input name="email" type="email" autoComplete="email" dir="ltr" /></label>
            </div>
          </section>
          <section className="box" style={{ margin: 0 }}>
            <div className="sec-head"><h2>{tr.coAddress}</h2></div>
            <div className="form-grid">
              <label className="field">{tr.city} *
                <input name="city" list="cities" autoComplete="address-level2" required />
                <datalist id="cities">{cities.map((c) => <option key={c} value={c} />)}</datalist>
              </label>
              <label className="field">{tr.district}<input name="district" /></label>
              <label className="field full">{tr.address} *<input name="address" autoComplete="street-address" required /></label>
              <label className="field full">{tr.notes}<textarea name="notes" /></label>
            </div>
          </section>
          <section className="box" style={{ margin: 0 }}>
            <div className="sec-head"><h2>{tr.coPay}</h2></div>
            <div className="paycards">
              {methods.card && <label className="paycard"><input type="radio" name="pm" checked={pay === "card"} onChange={() => setPay("card")} /><span><b>{tr.payCard}</b><small>{lang === "ar" ? "دفع آمن عبر بوابة ميسّر المرخّصة" : "Secure payment via Moyasar"}</small></span></label>}
              {methods.cod && <label className="paycard"><input type="radio" name="pm" checked={pay === "cod"} onChange={() => setPay("cod")} /><span><b>{tr.payCod}</b>{codFee > 0 && <small>{tr.codFee}: {fmt(codFee)} {tr.sar}</small>}</span></label>}
              {methods.bank && <label className="paycard"><input type="radio" name="pm" checked={pay === "bank"} onChange={() => setPay("bank")} /><span><b>{tr.payBank}</b><small>{lang === "ar" ? "تظهر بيانات الحساب بعد تأكيد الطلب" : "Account details appear after you place the order"}</small></span></label>}
            </div>
          </section>
        </div>
        <aside className="box sticky" style={{ margin: 0 }}>
          <div className="sec-head"><h2>{tr.coSummary}</h2></div>
          <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
            {items.map((i) => (
              <div className="sumline" key={i.id}>
                <div className="ph"><img src={img(i.image)} alt="" /></div>
                <span>{lang === "ar" ? i.name_ar : i.name_en} <b className="num">× {i.qty}</b></span>
                <b className="num">{fmt(i.price * i.qty)}</b>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <div className="sum"><span>{tr.subtotal}</span><span className="num">{fmt(subtotal)} {tr.sar}</span></div>
            <div className="sum"><span>{tr.shipping}</span><span className="num">{ship ? `${fmt(ship)} ${tr.sar}` : tr.free}</span></div>
            {fee > 0 && <div className="sum"><span>{tr.codFee}</span><span className="num">{fmt(fee)} {tr.sar}</span></div>}
            <div className="sum total"><span>{tr.total}</span><span className="num">{fmt(total)} {tr.sar}</span></div>
            <div className="sum" style={{ fontSize: 12.5 }}><span>{tr.vatLine}</span><span className="num">{vatOf(total).toFixed(2)} {tr.sar}</span></div>
            {err && <div className="msg err" role="alert">{err}</div>}
            <button className="btn-primary" type="submit" disabled={busy}>{busy ? tr.placing : pay === "card" ? tr.payNow : tr.placeOrder}</button>
          </div>
        </aside>
      </div>
    </form>
  );
}
