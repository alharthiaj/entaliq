import Link from "next/link";
export default function NotFound() {
  return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", textAlign: "center", fontFamily: "system-ui", padding: 24 }}>
      <div><h1 style={{ fontSize: 48, margin: 0 }}>404</h1><p>الصفحة غير موجودة · Page not found</p><Link href="/" style={{ color: "#bf8d2e", fontWeight: 700 }}>العودة للرئيسية · Home</Link></div>
    </div>
  );
}
