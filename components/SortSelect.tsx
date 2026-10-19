"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SortSelect({ value, labels }: { value: string; labels: Record<"sort" | "pop" | "low" | "high" | "off" | "new", string> }) {
  const router = useRouter(); const path = usePathname(); const sp = useSearchParams();
  return (
    <div className="filters">
      <label htmlFor="sort" style={{ fontSize: 13, color: "var(--muted)" }}>{labels.sort}</label>
      <select id="sort" value={value} onChange={(e) => { const u = new URLSearchParams(sp.toString()); u.set("sort", e.target.value); router.push(`${path}?${u}`); }}>
        <option value="pop">{labels.pop}</option><option value="low">{labels.low}</option><option value="high">{labels.high}</option><option value="off">{labels.off}</option><option value="new">{labels.new}</option>
      </select>
    </div>
  );
}
