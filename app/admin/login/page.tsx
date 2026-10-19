import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { one } from "@/lib/db";
import { createSession, getSession } from "@/lib/auth";

// simple in-memory throttle per email (resets on server restart)
const attempts = new Map<string, { n: number; until: number }>();

async function login(fd: FormData) {
  "use server";
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  const a = attempts.get(email);
  if (a && a.until > Date.now()) redirect("/admin/login?e=locked");
  const u = await one<{ id: string; name: string; email: string; password: string; role: string }>("SELECT * FROM admins WHERE email=$1", [email]);
  if (!u || !(await bcrypt.compare(password, u.password))) {
    const n = (a?.n || 0) + 1;
    attempts.set(email, { n, until: n >= 5 ? Date.now() + 10 * 60_000 : 0 });
    redirect("/admin/login?e=1");
  }
  attempts.delete(email);
  await createSession({ id: u.id, name: u.name, email: u.email, role: u.role });
  redirect("/admin");
}

async function createFirst(fd: FormData) {
  "use server";
  const n = await one<{ n: number }>("SELECT count(*)::int n FROM admins");
  if (n && n.n > 0) redirect("/admin/login");
  const name = String(fd.get("name") || "").trim().slice(0, 120);
  const email = String(fd.get("email") || "").trim().toLowerCase().slice(0, 160);
  const password = String(fd.get("password") || "");
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) redirect("/admin/login?e=first");
  const r = await one<{ id: string }>("INSERT INTO admins (name,email,password,role) VALUES ($1,$2,$3,'admin') RETURNING id", [name, email, await bcrypt.hash(password, 10)]);
  await createSession({ id: r!.id, name, email, role: "admin" });
  redirect("/admin");
}

export default async function Login({ searchParams }: { searchParams: { e?: string } }) {
  if (await getSession()) redirect("/admin");
  const count = await one<{ n: number }>("SELECT count(*)::int n FROM admins");
  if (!count || count.n === 0) return (
    <div className="login">
      <form action={createFirst}>
        <h1>إنشاء حساب المدير</h1>
        <p style={{ margin: 0, color: "var(--a-muted)", fontSize: 13.5 }}>أول تشغيل للمتجر. أنشئ حساب المدير الرئيسي الآن، ولن تظهر هذه الصفحة مرة أخرى.</p>
        {searchParams.e === "first" && <div className="a-msg bad">أدخل الاسم وبريدًا صحيحًا وكلمة مرور من ٨ أحرف على الأقل.</div>}
        <label className="a-f">الاسم<input name="name" required /></label>
        <label className="a-f">البريد الإلكتروني<input name="email" type="email" autoComplete="username" dir="ltr" required /></label>
        <label className="a-f">كلمة المرور<input name="password" type="password" autoComplete="new-password" minLength={8} dir="ltr" required /></label>
        <button className="a-btn pri" type="submit" style={{ justifyContent: "center", padding: 12 }}>إنشاء الحساب والدخول</button>
      </form>
    </div>
  );
  return (
    <div className="login">
      <form action={login}>
        <div className="a-brand" style={{ borderColor: "var(--a-line)", color: "var(--a-ink)" }}><i><img src="/brand-mark.svg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} /></i><div><b style={{ color: "var(--a-ink)" }}>لوحة التحكم</b><small>انطلق للطاقة</small></div></div>
        <h1>تسجيل الدخول</h1>
        {searchParams.e && <div className="a-msg bad">{searchParams.e === "locked" ? "محاولات كثيرة. حاول بعد ١٠ دقائق." : "البريد أو كلمة المرور غير صحيحة."}</div>}
        <label className="a-f">البريد الإلكتروني<input name="email" type="email" autoComplete="username" dir="ltr" required /></label>
        <label className="a-f">كلمة المرور<input name="password" type="password" autoComplete="current-password" dir="ltr" required /></label>
        <button className="a-btn pri" type="submit" style={{ justifyContent: "center", padding: 12 }}>دخول</button>
      </form>
    </div>
  );
}
