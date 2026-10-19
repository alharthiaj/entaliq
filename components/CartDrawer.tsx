"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useCart, useT } from "./CartProvider";
import { fmt, img, vatOf } from "@/lib/format";

export default function CartDrawer() {
  const { open, setOpen, items, setQty, remove, subtotal, lang, shipping } = useCart();
  const tr = useT();
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k);
  }, [setOpen]);
  const ship = subtotal >= shipping.freeOver || subtotal === 0 ? 0 : shipping.flat;
  const total = subtotal + ship;
  return (
    <>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <aside className={"drawer" + (open ? "" : " off")} aria-hidden={!open} aria-label={tr.cartTitle}>
        <div className="d-head"><h3>{tr.cartTitle}</h3><button className="x" type="button" aria-label="Close" onClick={() => setOpen(false)}>×</button></div>
        <div className="d-body">
          {items.length === 0 ? <div className="empty" style={{ padding: 28 }}>{tr.cartEmpty}</div> : items.map((i) => (
            <div className="line" key={i.id}>
              <div className="ph"><img src={img(i.image)} alt="" /></div>
              <div>
                <h4><Link href={`/product/${i.slug}`} onClick={() => setOpen(false)}>{lang === "ar" ? i.name_ar : i.name_en}</Link></h4>
                <div className="lrow">
                  <div className="qty"><button type="button" aria-label="-" onClick={() => setQty(i.id, i.qty - 1)}>−</button><span className="num">{i.qty}</span><button type="button" aria-label="+" onClick={() => setQty(i.id, i.qty + 1)}>+</button></div>
                  <span className="num">{fmt(i.price * i.qty)} <small>{tr.sar}</small></span>
                </div>
                <button className="rm" type="button" onClick={() => remove(i.id)}>{tr.remove}</button>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="d-foot">
            <div className="ship-bar"><i style={{ width: `${Math.min(100, (subtotal / shipping.freeOver) * 100)}%` }} /></div>
            <div className="ship-note">{subtotal >= shipping.freeOver ? tr.shipOk : tr.shipLeft(fmt(shipping.freeOver - subtotal))}</div>
            <div className="sum"><span>{tr.subtotal}</span><span className="num">{fmt(subtotal)} {tr.sar}</span></div>
            <div className="sum"><span>{tr.shipping}</span><span className="num">{ship ? `${fmt(ship)} ${tr.sar}` : tr.free}</span></div>
            <div className="sum total"><span>{tr.total}</span><span className="num">{fmt(total)} {tr.sar}</span></div>
            <div className="sum" style={{ fontSize: 12.5 }}><span>{tr.vatLine}</span><span className="num">{vatOf(total).toFixed(2)} {tr.sar}</span></div>
            <Link className="checkout" href="/checkout" onClick={() => setOpen(false)} style={{ textAlign: "center" }}>{tr.checkout}</Link>
          </div>
        )}
      </aside>
    </>
  );
}
