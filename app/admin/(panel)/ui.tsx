export const STATUS: Record<string, [string, string]> = {
  pending: ["بانتظار التأكيد", "warn"], paid: ["مدفوع", "info"], processing: ["قيد التجهيز", "info"],
  shipped: ["تم الشحن", "info"], delivered: ["تم التوصيل", "ok"], cancelled: ["ملغي", "bad"],
};
export const PAY: Record<string, [string, string]> = { unpaid: ["غير مدفوع", "warn"], paid: ["مدفوع", "ok"], failed: ["فشل", "bad"], refunded: ["مسترد", "mute"] };
export const METHOD: Record<string, string> = { card: "بطاقة", cod: "عند الاستلام", bank: "تحويل بنكي" };
export const Pill = ({ map, v }: { map: Record<string, [string, string]>; v: string }) => { const [l, c] = map[v] || [v, "mute"]; return <span className={"pill " + c}>{l}</span>; };
export const sar = (n: number) => Math.round(n).toLocaleString("en-US");
export const dt = (d: string | Date) => new Date(d).toLocaleString("en-GB", { timeZone: "Asia/Riyadh", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
export function Flash({ sp }: { sp: Record<string, string | undefined> }) {
  const E: Record<string, string> = { required: "أكمل الحقول المطلوبة.", hasproducts: "لا يمكن حذف قسم فيه منتجات. انقل المنتجات أولًا.", exists: "هذا البريد مسجّل مسبقًا.", self: "لا يمكنك حذف حسابك.", wrongpw: "كلمة المرور الحالية غير صحيحة.", short: "كلمة المرور يجب أن تكون ٨ أحرف على الأقل." };
  if (sp.e) return <div className="a-msg bad" style={{ marginBottom: 14 }}>{E[sp.e] || "حدث خطأ."}</div>;
  if (sp.saved) return <div className="a-msg ok" style={{ marginBottom: 14 }}>تم الحفظ.</div>;
  if (sp.deleted) return <div className="a-msg ok" style={{ marginBottom: 14 }}>تم الحذف.</div>;
  if (sp.pw) return <div className="a-msg ok" style={{ marginBottom: 14 }}>تم تغيير كلمة المرور.</div>;
  return null;
}
