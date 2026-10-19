import { requireAdmin, destroySession } from "@/lib/auth";
import { one } from "@/lib/db";
import { redirect } from "next/navigation";
import SideNav from "./SideNav";

async function logout() { "use server"; destroySession(); redirect("/admin/login"); }

export default async function Panel({ children }: { children: React.ReactNode }) {
  const s = await requireAdmin();
  const c = await one<{ orders: number; quotes: number }>("SELECT (SELECT count(*) FROM orders WHERE status IN ('pending','paid'))::int orders, (SELECT count(*) FROM quotes WHERE status='new')::int quotes");
  return (
    <div className="a-shell">
      <SideNav name={s.name} role={s.role} counts={{ orders: c?.orders || 0, quotes: c?.quotes || 0 }} logout={logout} />
      <main className="a-main">{children}</main>
    </div>
  );
}
