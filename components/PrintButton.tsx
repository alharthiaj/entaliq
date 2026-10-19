"use client";
export default function PrintButton({ label = "طباعة / حفظ PDF" }: { label?: string }) {
  return <button type="button" onClick={() => window.print()} style={{ border: 0, background: "#0a1428", color: "#fff", borderRadius: 10, padding: "10px 22px", fontWeight: 700, cursor: "pointer" }}>{label}</button>;
}
