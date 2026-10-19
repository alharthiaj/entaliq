"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/dict";

export type CartItem = { id: string; slug: string; name_ar: string; name_en: string; price: number; image: string | null; qty: number; stock: number };
type Ctx = {
  lang: Lang; items: CartItem[]; wish: string[]; count: number; subtotal: number;
  add: (p: Omit<CartItem, "qty">, qty?: number) => void; setQty: (id: string, qty: number) => void; remove: (id: string) => void; clear: () => void;
  toggleWish: (id: string) => void; open: boolean; setOpen: (o: boolean) => void; toast: (m: string) => void;
  shipping: { flat: number; freeOver: number; codFee: number };
};
const CartCtx = createContext<Ctx | null>(null);
export const useCart = () => useContext(CartCtx)!;

export default function CartProvider({ lang, shipping, children }: { lang: Lang; shipping: Ctx["shipping"]; children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wish, setWish] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { const c = JSON.parse(localStorage.getItem("madar_cart") || "[]"); if (Array.isArray(c)) setItems(c); } catch {}
    try { const w = JSON.parse(localStorage.getItem("madar_wish") || "[]"); if (Array.isArray(w)) setWish(w); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem("madar_cart", JSON.stringify(items)); } catch {} }, [items, ready]);
  useEffect(() => { if (ready) try { localStorage.setItem("madar_wish", JSON.stringify(wish)); } catch {} }, [wish, ready]);
  useEffect(() => { if (!msg) return; const id = setTimeout(() => setMsg(null), 2400); return () => clearTimeout(id); }, [msg]);

  const add = useCallback((p: Omit<CartItem, "qty">, qty = 1) => {
    setItems((cur) => {
      const ex = cur.find((i) => i.id === p.id);
      const max = Math.max(1, p.stock);
      if (ex) return cur.map((i) => (i.id === p.id ? { ...i, ...p, qty: Math.min(max, i.qty + qty) } : i));
      return [...cur, { ...p, qty: Math.min(max, qty) }];
    });
  }, []);
  const setQty = useCallback((id: string, qty: number) => setItems((cur) => (qty <= 0 ? cur.filter((i) => i.id !== id) : cur.map((i) => (i.id === id ? { ...i, qty: Math.min(Math.max(1, i.stock), qty) } : i)))), []);
  const remove = useCallback((id: string) => setItems((cur) => cur.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  const toggleWish = useCallback((id: string) => {
    setWish((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      setMsg(lang === "ar" ? "أضيف للمفضلة" : "Added to wishlist");
      return [...cur, id];
    });
  }, [lang]);

  const value = useMemo<Ctx>(() => ({
    lang, items, wish, open, setOpen, shipping,
    count: items.reduce((a, i) => a + i.qty, 0),
    subtotal: items.reduce((a, i) => a + i.qty * i.price, 0),
    add, setQty, remove, clear, toggleWish, toast: setMsg,
  }), [lang, items, wish, open, shipping, add, setQty, remove, clear, toggleWish]);

  return (
    <CartCtx.Provider value={value}>
      {children}
      {msg && <div className="toast" role="status">{msg}</div>}
    </CartCtx.Provider>
  );
}

export function useT() {
  const { lang } = useCart();
  return t(lang);
}
