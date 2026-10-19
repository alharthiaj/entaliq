import { getSetting, defaultStore, defaultShipping, defaultPayments } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";
import SubmitButton from "@/components/admin/SubmitButton";
import { saveSettings } from "../actions";
import { Flash } from "../ui";

export const dynamic = "force-dynamic";
export default async function Settings({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  await requireAdmin("admin");
  const [st, sh, pay] = await Promise.all([getSetting("store", defaultStore), getSetting("shipping", defaultShipping), getSetting("payments", defaultPayments)]);
  const gateway = !!(process.env.MOYASAR_PUBLISHABLE_KEY && process.env.MOYASAR_SECRET_KEY);
  const F = ({ k, label, ltr, hint }: { k: keyof typeof defaultStore; label: string; ltr?: boolean; hint?: string }) => <label className="a-f">{label}<input name={"store." + k} defaultValue={st[k]} dir={ltr ? "ltr" : undefined} />{hint && <small>{hint}</small>}</label>;
  return (
    <>
      <div className="a-top"><div><h1>الإعدادات</h1><p>بيانات المتجر والشحن والدفع</p></div></div>
      <Flash sp={searchParams} />
      <form action={saveSettings} className="a-grid">
        <div className="a-card a-form"><h2>بيانات المتجر</h2>
          <div className="a-row"><F k="nameAr" label="اسم المتجر بالعربية" /><F k="nameEn" label="اسم المتجر بالإنجليزية" ltr /></div>
          <div className="a-row3"><F k="phone" label="رقم التواصل" ltr /><F k="whatsapp" label="رقم الواتساب" ltr hint="بالصيغة الدولية مثل 9665XXXXXXXX" /><F k="email" label="البريد الإلكتروني" ltr /></div>
          <div className="a-row"><F k="addressAr" label="العنوان بالعربية" /><F k="addressEn" label="العنوان بالإنجليزية" ltr /></div>
          <div className="a-row"><F k="hoursAr" label="ساعات العمل بالعربية" /><F k="hoursEn" label="ساعات العمل بالإنجليزية" ltr /></div>
          <div className="a-row"><F k="cr" label="رقم السجل التجاري" ltr /><F k="vatNo" label="الرقم الضريبي (١٥ رقمًا)" ltr hint="يظهر في الفاتورة الضريبية ورمز QR" /></div>
          <div className="a-row"><F k="x" label="رابط حساب X" ltr /><F k="instagram" label="رابط إنستقرام" ltr /></div>
          <div className="a-row"><F k="snapchat" label="رابط سناب شات" ltr /><F k="tiktok" label="رابط تيك توك" ltr /></div>
        </div>
        <div className="a-grid a-g2">
          <div className="a-card a-form"><h2>الشحن</h2>
            <div className="a-row3">
              <label className="a-f">رسوم الشحن (ر.س)<input name="ship.flat" type="number" min="0" defaultValue={sh.flat} className="n" /></label>
              <label className="a-f">شحن مجاني فوق<input name="ship.freeOver" type="number" min="0" defaultValue={sh.freeOver} className="n" /></label>
              <label className="a-f">رسوم الدفع عند الاستلام<input name="ship.codFee" type="number" min="0" defaultValue={sh.codFee} className="n" /></label>
            </div>
            <label className="a-f">المدن المقترحة في صفحة الطلب<textarea name="ship.cities" rows={6} defaultValue={sh.cities.join("\n")} /><small>مدينة في كل سطر. يستطيع العميل كتابة مدينة أخرى.</small></label>
          </div>
          <div className="a-card a-form"><h2>طرق الدفع</h2>
            <label className="a-check"><input type="checkbox" name="pay.card" defaultChecked={pay.card} /> بطاقة (مدى، فيزا، ماستركارد) عبر ميسّر</label>
            {!gateway && <div className="a-msg bad" style={{ fontSize: 12.5 }}>الدفع بالبطاقة مخفي حتى تضيف مفاتيح ميسّر في إعدادات الاستضافة (MOYASAR_PUBLISHABLE_KEY و MOYASAR_SECRET_KEY).</div>}
            <label className="a-check"><input type="checkbox" name="pay.cod" defaultChecked={pay.cod} /> الدفع عند الاستلام</label>
            <label className="a-check"><input type="checkbox" name="pay.bank" defaultChecked={pay.bank} /> تحويل بنكي</label>
            <div className="a-row"><label className="a-f">اسم البنك<input name="pay.bankName" defaultValue={pay.bankName} /></label><label className="a-f">اسم المستفيد<input name="pay.holder" defaultValue={pay.holder} /></label></div>
            <label className="a-f">رقم الآيبان<input name="pay.iban" defaultValue={pay.iban} dir="ltr" placeholder="SA00 0000 0000 0000 0000 0000" className="n" /></label>
          </div>
        </div>
        <div><SubmitButton>حفظ الإعدادات</SubmitButton></div>
      </form>
    </>
  );
}
