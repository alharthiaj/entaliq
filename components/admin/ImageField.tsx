"use client";
import { useRef, useState } from "react";

export default function ImageField({ name, initial, multiple = true, label }: { name: string; initial: string[]; multiple?: boolean; label?: string }) {
  const [ids, setIds] = useState<string[]>(initial.filter(Boolean));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setErr(null);
    const fd = new FormData();
    for (const f of Array.from(files)) fd.append("files", f);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd }).catch(() => null);
    const d = r ? await r.json().catch(() => null) : null;
    setBusy(false);
    if (!d?.ids) { setErr(d?.error === "too_large" ? "حجم الصورة أكبر من ٨ ميجابايت." : "تعذّر رفع الصورة. جرّب صورة JPG أو PNG أو WebP."); return; }
    setIds((cur) => (multiple ? [...cur, ...d.ids] : d.ids.slice(0, 1)));
    if (ref.current) ref.current.value = "";
  }
  const move = (i: number) => setIds((c) => [c[i], ...c.filter((_, k) => k !== i)]);
  return (
    <div className="a-f">
      {label && <span>{label}</span>}
      <input type="hidden" name={name} value={JSON.stringify(ids)} />
      <div className="imgs"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files); }}>
        {ids.map((id, i) => (
          <div className="it" key={id + i}>
            <img src={`/api/img/${id}`} alt="" />
            {multiple && i === 0 && <span className="main">الرئيسية</span>}
            <div className="tools">
              {multiple && i > 0 ? <button type="button" onClick={() => move(i)} title="اجعلها الرئيسية">★</button> : <span />}
              <button type="button" onClick={() => setIds((c) => c.filter((_, k) => k !== i))} title="حذف">✕</button>
            </div>
          </div>
        ))}
        {(multiple || ids.length === 0) && (
          <label className="add">{busy ? "جارٍ الرفع..." : <>+ رفع صورة<br /><small>أو اسحبها هنا</small></>}
            <input ref={ref} type="file" accept="image/*" multiple={multiple} hidden onChange={(e) => upload(e.target.files)} />
          </label>
        )}
      </div>
      {err && <small style={{ color: "var(--a-bad)" }}>{err}</small>}
    </div>
  );
}
