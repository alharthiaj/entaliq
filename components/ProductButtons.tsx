"use client";
import { useState } from "react";
import { useCart, useT } from "./CartProvider";

export type MiniProduct = { id: string; slug: string; name_ar: string; name_en: string; price: number; image: string | null; stock: number };

export function AddButton({ p, qty = 1, big = false }: { p: MiniProduct; qty?: number; big?: boolean }) {
  const { add, setOpen } = useCart();
  const tr = useT();
  const [done, setDone] = useState(false);
  if (p.stock <= 0) return <button className="add" type="button" disabled style={{ opacity: 0.55 }}>{tr.outOfStock}</button>;
  return (
    <button
      className={"add" + (done ? " done" : "")}
      type="button"
      onClick={() => { add(p, qty); setDone(true); setTimeout(() => setDone(false), 1100); if (big) setOpen(true); }}
    >
      {done ? tr.added : tr.addCart}
    </button>
  );
}

export function WishButton({ id, size }: { id: string; size?: number }) {
  const { wish, toggleWish } = useCart();
  const tr = useT();
  const on = wish.includes(id);
  return (
    <button className={"mini" + (on ? " on" : "")} type="button" aria-pressed={on} aria-label={tr.wishlist} onClick={() => toggleWish(id)} style={size ? { width: size, height: size } : undefined}>
      <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
    </button>
  );
}
