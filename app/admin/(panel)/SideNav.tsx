"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const I: Record<string, string> = {
  home: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  orders: "M6 3h12l2 5H4zM4 8h16v12H4zM9 12h6",
  products: "M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8",
  cats: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  slides: "M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6",
  quotes: "M4 5h16v11H8l-4 4z",
  subs: "M4 6h16v12H4zM4 7l8 6 8-6",
  pages: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 15H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1A2 2 0 1 1 6.9 5.4l.1.1A1.6 1.6 0 0 0 9.7 4.4V4a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z",
  users: "M16 11a4 4 0 1 0-8 0M3 21c1-4 5-6 9-6s8 2 9 6",
  store: "M14 3h7v7M10 14L21 3M19 14v6H4V5h6",
};
const Icon = ({ d }: { d: string }) => <svg viewBox="0 0 24 24"><path d={I[d]} /></svg>;

export default function SideNav({ name, role, counts, logout }: { name: string; role: string; counts: { orders: number; quotes: number }; logout: () => void }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const on = (h: string) => (h === "/admin" ? path === h : path.startsWith(h)) ? "on" : "";
  const L = (h: string, i: string, t: string, c?: number) => <Link href={h} className={on(h)}><Icon d={i} />{t}{c ? <span className="cnt">{c}</span> : null}</Link>;
  return (
    <>
      <button className="a-btn a-menu-btn" type="button" onClick={() => setOpen(true)} style={{ position: "fixed", top: 12, insetInlineEnd: 12, zIndex: 40 }}>☰ القائمة</button>
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 45 }} />}
      <aside className={"a-side" + (open ? " open" : "")}>
        <div className="a-brand"><i style={{ overflow: "hidden" }}><img src="/brand-mark.svg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></i><div><b>لوحة التحكم</b><small>ENTALIQ ENERGY</small></div></div>
        <nav className="a-nav" style={{ display: "grid", gap: 2 }}>
          {L("/admin", "home", "الرئيسية")}
          {L("/admin/orders", "orders", "الطلبات", counts.orders)}
          {L("/admin/products", "products", "المنتجات")}
          {L("/admin/categories", "cats", "الأقسام")}
          <div className="a-sep">التسويق والمحتوى</div>
          {L("/admin/slides", "slides", "البانرات والسلايدر")}
          {L("/admin/quotes", "quotes", "طلبات عروض الأسعار", counts.quotes)}
          {L("/admin/subscribers", "subs", "المشتركون")}
          {L("/admin/pages", "pages", "الصفحات")}
          <div className="a-sep">الإدارة</div>
          {role === "admin" && L("/admin/settings", "settings", "الإعدادات")}
          {role === "admin" && L("/admin/users", "users", "المستخدمون")}
          <a href="/" target="_blank" rel="noopener"><Icon d="store" />عرض المتجر</a>
        </nav>
        <div className="a-foot"><span>{name}</span><form action={logout}><button type="submit" style={{ width: "100%" }}>تسجيل الخروج</button></form></div>
      </aside>
    </>
  );
}
