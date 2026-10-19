import { q } from "@/lib/db";
import { getSession } from "@/lib/auth";
import SubmitButton from "@/components/admin/SubmitButton";
import { saveUser, deleteUser, changePassword } from "../actions";
import { Flash, dt } from "../ui";

export const dynamic = "force-dynamic";
export default async function Users({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const me = (await getSession())!;
  const rows = me.role === "admin" ? await q("SELECT id,name,email,role,created_at FROM admins ORDER BY created_at") : [];
  return (
    <>
      <div className="a-top"><div><h1>المستخدمون</h1><p>من يستطيع الدخول إلى لوحة التحكم</p></div></div>
      <Flash sp={searchParams} />
      <div className="a-grid a-g-main">
        {me.role === "admin" ? (
          <div className="a-table-wrap"><table className="a-table"><thead><tr><th>الاسم</th><th>البريد</th><th>الصلاحية</th><th>منذ</th><th></th></tr></thead>
            <tbody>{rows.map((u: any) => <tr key={u.id}><td><b>{u.name}</b></td><td dir="ltr" style={{ textAlign: "start" }}>{u.email}</td><td>{u.role === "admin" ? <span className="pill info">مدير</span> : <span className="pill mute">موظف</span>}</td><td className="n sub">{dt(u.created_at)}</td>
              <td>{u.id !== me.id && <form action={deleteUser}><input type="hidden" name="id" value={u.id} /><SubmitButton className="a-btn sm bad" confirm="حذف هذا المستخدم؟">حذف</SubmitButton></form>}</td></tr>)}</tbody></table></div>
        ) : <div className="a-card">صلاحيتك: موظف. يمكنك تغيير كلمة مرورك فقط.</div>}
        <div className="a-grid">
          {me.role === "admin" && <form action={saveUser} className="a-card a-form"><h2>إضافة مستخدم</h2>
            <label className="a-f">الاسم<input name="name" required /></label>
            <label className="a-f">البريد الإلكتروني<input name="email" type="email" dir="ltr" required /></label>
            <label className="a-f">كلمة المرور<input name="password" type="password" minLength={8} dir="ltr" required /><small>٨ أحرف على الأقل</small></label>
            <label className="a-f">الصلاحية<select name="role"><option value="staff">موظف (طلبات ومنتجات)</option><option value="admin">مدير (كل الصلاحيات)</option></select></label>
            <SubmitButton>إضافة</SubmitButton></form>}
          <form action={changePassword} className="a-card a-form"><h2>تغيير كلمة مروري</h2>
            <label className="a-f">كلمة المرور الحالية<input name="current" type="password" dir="ltr" required /></label>
            <label className="a-f">كلمة المرور الجديدة<input name="password" type="password" minLength={8} dir="ltr" required /></label>
            <SubmitButton>تغيير</SubmitButton></form>
        </div>
      </div>
    </>
  );
}
