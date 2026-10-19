"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "./CartProvider";
export default function TrackForm() {
  const tr = useT(); const router = useRouter();
  const [err, setErr] = useState(false); const [busy, setBusy] = useState(false);
  return (
    <form className="center-card box" style={{ maxWidth: 480 }} onSubmit={async (e) => {
      e.preventDefault(); setErr(false); setBusy(true);
      const fd = Object.fromEntries(new FormData(e.currentTarget));
      const r = await fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(fd) }).catch(() => null);
      const d = r && r.ok ? await r.json() : null; setBusy(false);
      if (d?.id) router.push(`/order/${d.id}`); else setErr(true);
    }}>
      <h1 style={{ fontSize: 22 }}>{tr.trackTitle}</h1>
      <p style={{ margin: 0, color: "var(--muted)" }}>{tr.trackHint}</p>
      <label className="field" style={{ width: "100%" }}>{tr.orderNo}<input name="number" inputMode="numeric" dir="ltr" required /></label>
      <label className="field" style={{ width: "100%" }}>{tr.qPhone}<input name="phone" type="tel" inputMode="tel" dir="ltr" placeholder="05XXXXXXXX" required /></label>
      {err && <div className="msg err" style={{ width: "100%" }}>{tr.trackNone}</div>}
      <button className="btn-primary" type="submit" disabled={busy}>{tr.trackBtn}</button>
    </form>
  );
}
