"use client";
import { useState } from "react";
export default function CopyEmails({ emails }: { emails: string[] }) {
  const [ok, setOk] = useState(false);
  return <button className="a-btn" type="button" onClick={async () => { try { await navigator.clipboard.writeText(emails.join(", ")); setOk(true); setTimeout(() => setOk(false), 1500); } catch {} }}>{ok ? "تم النسخ ✓" : "نسخ كل البريد"}</button>;
}
