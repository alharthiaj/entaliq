"use client";
import { useFormStatus } from "react-dom";
export default function SubmitButton({ children, className = "a-btn pri", confirm: msg }: { children: React.ReactNode; className?: string; confirm?: string }) {
  const { pending } = useFormStatus();
  return <button className={className} type="submit" disabled={pending} onClick={(e) => { if (msg && !window.confirm(msg)) e.preventDefault(); }}>{pending ? "جارٍ الحفظ..." : children}</button>;
}
