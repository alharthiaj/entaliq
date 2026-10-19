"use client";
import { useState } from "react";
import { AddButton, WishButton, type MiniProduct } from "./ProductButtons";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  return (
    <div className="gallery">
      <div className="main"><img src={images[i]} alt={alt} /></div>
      {images.length > 1 && <div className="thumbs">{images.map((s, k) => <button key={k} type="button" className={k === i ? "on" : ""} onClick={() => setI(k)} aria-label={`${k + 1}`}><img src={s} alt="" /></button>)}</div>}
    </div>
  );
}

export function BuyBox({ p }: { p: MiniProduct }) {
  const [qty, setQty] = useState(1);
  const max = Math.max(1, p.stock);
  return (
    <div className="buybar">
      {p.stock > 0 && (
        <div className="stepper">
          <button type="button" aria-label="-" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <span className="num">{qty}</span>
          <button type="button" aria-label="+" onClick={() => setQty((q) => Math.min(max, q + 1))}>+</button>
        </div>
      )}
      <AddButton p={p} qty={qty} big />
      <WishButton id={p.id} size={48} />
    </div>
  );
}
