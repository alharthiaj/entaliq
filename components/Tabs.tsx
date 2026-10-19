"use client";
import { useState } from "react";

export default function Tabs({ title, labels, panels }: { title: string; labels: string[]; panels: React.ReactNode[] }) {
  const [i, setI] = useState(0);
  return (
    <section className="box">
      <div className="sec-head"><h2>{title}</h2>
        <div className="tabs" role="tablist">{labels.map((l, k) => <button key={k} role="tab" aria-selected={i === k} className={"tab" + (i === k ? " on" : "")} type="button" onClick={() => setI(k)}>{l}</button>)}</div>
      </div>
      <div className="row">{panels[i]}</div>
    </section>
  );
}
