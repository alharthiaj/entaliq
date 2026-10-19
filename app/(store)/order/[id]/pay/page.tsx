import { notFound, redirect } from "next/navigation";
import { siteUrl } from "@/lib/env";
import MoyasarForm from "@/components/MoyasarForm";
import { getOrder } from "@/lib/orderview";
import { getLang, t } from "@/lib/i18n";
import { getStore } from "@/lib/data";
import { fmt } from "@/lib/format";

export const metadata = { robots: { index: false } };
export default async function PayPage({ params }: { params: { id: string } }) {
  const lang = getLang(); const tr = t(lang);
  const data = await getOrder(params.id);
  if (!data) notFound();
  const o = data.order;
  if (o.pay_status === "paid") redirect(`/order/${o.id}`);
  const key = process.env.MOYASAR_PUBLISHABLE_KEY;
  if (!key) redirect(`/order/${o.id}`);
  const store = await getStore();
  const site = siteUrl();
  return (
    <div className="center-card box" style={{ maxWidth: 520 }}>
      <h1 style={{ fontSize: 22 }}>{tr.payNow}</h1>
      <div className="kv"><span>{tr.orderNo}</span><b>#{o.number}</b><span>{tr.total}</span><b>{fmt(o.total)} {tr.sar}</b></div>
      <MoyasarForm amount={o.total * 100} orderId={o.id} description={`${store.nameEn} order #${o.number}`} publishableKey={key} callbackUrl={`${site}/api/moyasar/callback?order=${o.id}`} lang={lang} applePay={process.env.MOYASAR_APPLE_PAY === "1"} storeName={store.nameEn} />
    </div>
  );
}
