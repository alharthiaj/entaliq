import nodemailer from "nodemailer";
import { getSetting } from "./data";
import { authKey } from "./env";

// Store notifications (quote requests). Configured from Dashboard → Settings → Email,
// or by hosting env vars (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS, MAIL_TO), which take priority.
// The SMTP password is stored encrypted (AES-256-GCM) and is never sent back to the browser.

export type MailSettings = { to: string; host: string; port: number; user: string; passEnc: string; quotes: boolean };
export const defaultMail: MailSettings = { to: "info@entaliq-store.com", host: "smtp.hostinger.com", port: 465, user: "info@entaliq-store.com", passEnc: "", quotes: true };

async function aesKey() {
  return crypto.subtle.importKey("raw", (await authKey()).slice(0, 32), "AES-GCM", false, ["encrypt", "decrypt"]);
}
export async function encryptSecret(plain: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(), new TextEncoder().encode(plain)));
  return Buffer.from(iv).toString("base64") + "." + Buffer.from(ct).toString("base64");
}
async function decryptSecret(enc: string) {
  const [iv, ct] = enc.split(".");
  if (!iv || !ct) return "";
  try {
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: Buffer.from(iv, "base64") }, await aesKey(), Buffer.from(ct, "base64"));
    return new TextDecoder().decode(pt);
  } catch { return ""; }
}

export async function getMailSettings() {
  return { ...defaultMail, ...(await getSetting("mail", defaultMail)) };
}

async function resolve() {
  const m = await getMailSettings();
  const env = process.env;
  const host = env.SMTP_HOST || m.host;
  const port = Number(env.SMTP_PORT || m.port || 465);
  const user = env.SMTP_USER || m.user;
  const pass = env.SMTP_PASS || (m.passEnc ? await decryptSecret(m.passEnc) : "");
  return { to: env.MAIL_TO || m.to || defaultMail.to, host, port, user, pass, quotes: m.quotes !== false };
}

export async function mailStatus() {
  const r = await resolve();
  return { ready: Boolean(r.host && r.user && r.pass), to: r.to };
}

export async function sendMail(m: { subject: string; html: string; text: string; replyTo?: string }, opts: { kind?: "quote" | "test" } = {}) {
  const c = await resolve();
  if (opts.kind === "quote" && !c.quotes) return false;
  if (!(c.host && c.user && c.pass)) return false;
  const t = nodemailer.createTransport({ host: c.host, port: c.port, secure: c.port === 465, auth: { user: c.user, pass: c.pass }, connectionTimeout: 12000, greetingTimeout: 12000, socketTimeout: 15000 });
  await t.sendMail({ from: process.env.MAIL_FROM || `"متجر انطلق" <${c.user}>`, to: c.to, subject: m.subject, html: m.html, text: m.text, replyTo: m.replyTo });
  return true;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!));

export function quoteEmail(qd: { name: string; company: string; phone: string; email: string; note: string }, adminUrl: string) {
  const rows: [string, string][] = [["الاسم", qd.name], ["المنشأة", qd.company], ["الجوال", qd.phone], ["البريد", qd.email], ["الطلب", qd.note]];
  const filled = rows.filter(([, v]) => v);
  const wa = qd.phone.replace(/\D/g, "").replace(/^(966|0)/, "");
  const html = `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:auto;color:#1d1d1f">
  <h2 style="margin:0 0 4px">طلب عرض سعر جديد</h2>
  <p style="margin:0 0 16px;color:#6e6e73">وصل من نموذج "اطلب عرض سعر" في المتجر.</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">${filled.map(([k, v]) =>
    `<tr><td style="padding:10px;border-bottom:1px solid #e8e8ed;color:#6e6e73;width:90px;vertical-align:top">${k}</td><td style="padding:10px;border-bottom:1px solid #e8e8ed;white-space:pre-line">${esc(v)}</td></tr>`).join("")}</table>
  <p style="margin-top:18px"><a href="${adminUrl}" style="background:#0071e3;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;display:inline-block">فتح في لوحة التحكم</a>
  ${wa ? ` &nbsp; <a href="https://wa.me/966${wa}" style="color:#0071e3">مراسلة واتساب</a>` : ""}</p></div>`;
  const text = filled.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\n${adminUrl}`;
  return { subject: `طلب عرض سعر جديد — ${qd.company || qd.name}`, html, text, replyTo: qd.email || undefined };
}

export function testEmail(adminUrl: string) {
  return {
    subject: "رسالة تجريبية من متجر انطلق",
    html: `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;color:#1d1d1f"><h2>البريد يعمل ✓</h2><p>هذه رسالة تجريبية من لوحة تحكم المتجر. ستصلك طلبات عروض الأسعار على هذا البريد.</p><p><a href="${adminUrl}" style="color:#0071e3">لوحة التحكم</a></p></div>`,
    text: `البريد يعمل. ستصلك طلبات عروض الأسعار على هذا البريد.\n${adminUrl}`,
  };
}
