import "./admin.css";
export const metadata = { title: "لوحة التحكم", robots: { index: false, follow: false } };
export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="adm" dir="rtl" lang="ar">{children}</div>;
}
