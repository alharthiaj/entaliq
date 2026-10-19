"use client";
import { useCart, useT } from "./CartProvider";

export default function WishlistView({ cards }: { cards: Record<string, React.ReactNode> }) {
  const { wish } = useCart(); const tr = useT();
  const list = wish.filter((id) => cards[id]);
  return (
    <section className="box" style={{ marginTop: 16 }}>
      <div className="page-head"><div><h1>{tr.wishTitle}</h1><p>{tr.found(list.length)}</p></div></div>
      <div className="grid">{list.length ? list.map((id) => <div key={id} style={{ display: "contents" }}>{cards[id]}</div>) : <div className="empty">{tr.wishEmpty}</div>}</div>
    </section>
  );
}
