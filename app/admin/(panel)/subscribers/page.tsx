import { q } from "@/lib/db";
import { deleteSubscriber } from "../actions";
import { dt } from "../ui";
import CopyEmails from "./CopyEmails";

export const dynamic = "force-dynamic";
export default async function Subs() {
  const rows = await q<{ id: string; email: string; created_at: string }>("SELECT * FROM subscribers ORDER BY created_at DESC");
  return (
    <>
      <div className="a-top"><div><h1>مشتركو النشرة البريدية</h1><p>{rows.length} مشترك</p></div><div className="a-actions"><CopyEmails emails={rows.map((r) => r.email)} /><a className="a-btn" href="/api/admin/export/subscribers">تنزيل CSV</a></div></div>
      <div className="a-table-wrap"><table className="a-table"><thead><tr><th>البريد</th><th>تاريخ الاشتراك</th><th></th></tr></thead>
        <tbody>{rows.length ? rows.map((r) => <tr key={r.id}><td dir="ltr" style={{ textAlign: "start" }}>{r.email}</td><td className="n sub">{dt(r.created_at)}</td><td><form action={deleteSubscriber}><input type="hidden" name="id" value={r.id} /><button className="a-btn sm bad" type="submit">حذف</button></form></td></tr>) : <tr><td colSpan={3} className="empty-a">لا يوجد مشتركون بعد.</td></tr>}</tbody></table></div>
    </>
  );
}
