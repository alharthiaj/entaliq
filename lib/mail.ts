import nodemailer from "nodemailer";

// Store notifications. Works with either:
//   - SMTP of the store mailbox: SMTP_HOST, SMTP_PORT (465), SMTP_USER, SMTP_PASS
//   - Resend: RESEND_API_KEY (+ MAIL_FROM on a verified domain)
// MAIL_TO overrides the recipient (default info@entaliq-store.com).
// If nothing is configured, mail is skipped and the request is still saved in the dashboard.

export const MAIL_TO = () => process.env.MAIL_TO || "info@entaliq-store.com";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export function mailConfigured() {
  return Boolean((process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) || process.env.RESEND_API_KEY);
}

export async function sendMail(m: { subject: string; html: string; text: string; replyTo?: string }) {
  const to = MAIL_TO();
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT || 465);
    const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    await t.sendMail({ from: process.env.MAIL_FROM || `"متجر انطلق" <${process.env.SMTP_USER}>`, to, subject: m.subject, html: m.html, text: m.text, replyTo: m.replyTo });
    return true;
  }
  if (process.env.RESEND_API_KEY) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.MAIL_FROM || "Entaliq Store <onboarding@resend.dev>", to: [to], subject: m.subject, html: m.html, text: m.text, reply_to: m.replyTo }),
    });
    if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
    return true;
  }
  return false;
}

export function quoteEmail(qd: { name: string; company: string; phone: string; email: string; note: string }, adminUrl: string) {
  const rows: [string, string][] = [["الاسم", qd.name], ["المنشأة", qd.company], ["الجوال", qd.phone], ["البريد", qd.email], ["الطلب", qd.note]];
  const html = `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:auto;color:#1d1d1f">
  <h2 style="margin:0 0 4px">طلب عرض سعر جديد</h2>
  <p style="margin:0 0 16px;color:#6e6e73">وصل من نموذج "اطلب عرض سعر" في المتجر.</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">${rows.filter(([, v]) => v).map(([k, v]) =>
    `<tr><td style="padding:10px;border-bottom:1px solid #e8e8ed;color:#6e6e73;width:90px;vertical-align:top">${k}</td><td style="padding:10px;border-bottom:1px solid #e8e8ed;white-space:pre-line">${esc(v)}</td></tr>`).join("")}</table>
  <p style="margin-top:18px"><a href="${adminUrl}" style="background:#0071e3;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;display:inline-block">فتح في لوحة التحكم</a>
  ${qd.phone ? ` &nbsp; <a href="https://wa.me/966${qd.phone.replace(/\D/g, "").replace(/^(966|0)/, "")}" style="color:#0071e3">مراسلة واتساب</a>` : ""}</p></div>`;
  const text = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\n${adminUrl}`;
  return { subject: `طلب عرض سعر جديد — ${qd.company || qd.name}`, html, text, replyTo: qd.email || undefined };
}
