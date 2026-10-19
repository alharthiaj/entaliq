import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/orderview";
import { getLang, t } from "@/lib/i18n";
import { getPayments } from "@/lib/data";
import { fmt, vatOf } from "@/lib/format";

export const metadata = { robots: { index: false } };
const STEPS = ["pending", "processing", "shipped", "delivered"];

export default async function OrderPage({ params, searchParams }: { params: { id: string }; searchParams: { new?: string; pay?: string } }) {
  const lang = getLang(); const tr = t(lang);
  const data = await getOrder(params.id);
  if (!data) notFound();
  const { order: o, items } = data;
  const pay = await getPayments();
  const failed = searchParams.pay === "failed" && o.pay_status !== "paid";
  const step = o.status === "paid" ? 0 : STEPS.indexOf(o.status);
  const fresh = searchParams.new || (o.pay_status === "paid" && o.pay_method === "card" && !searchParams.pay);
  return (
    <div className="center-card box" style={{ maxWidth: 720 }}>
      {failed ? <div className="ok-ic bad-ic">!</div> : <div className="ok-ic">✓</div>}
      <h1 style={{ fontSize: 24 }}>{failed ? tr.payFailed : fresh ? tr.thanks : tr.trackTitle}</h1>
      {failed && o.pay_method === "card" && pay.card && <Link className="btn-dark" href={`/order/${o.id}/pay`}>{tr.tryAgain}</Link>}
      <div className="kv">
        <span>{tr.orderNo}</span><b>#{o.number}</b>
        <span>{lang === "ar" ? "الحالة" : "Status"}</span><b style={{ fontFamily: "inherit" }}>{tr.status[o.status]}</b>
        <span>{lang === "ar" ? "الدفع" : "Payment"}</span><b style={{ fontFamily: "inherit" }}>{o.pay_method === "card" ? tr.payCard : o.pay_method === "cod" ? tr.payCod : tr.payBank} · {tr.payStatus[o.pay_status]}</b>
        <span>{tr.total}</span><b>{fmt(o.total)} {tr.sar}</b>
      </div>
      {o.status !== "cancelled" && <div className="timeline" aria-hidden="true">{STEPS.map((s, k) => <span key={s} className={k <= step ? "on" : ""} />)}</div>}
      {fresh && <p style={{ margin: 0, color: "var(--muted)" }}>{tr.orderNote}</p>}
      {o.pay_method === "bank" && o.pay_status !== "paid" && pay.iban && (
        <div className="kv" style={{ background: "var(--gold-soft)" }}>
          <span style={{ gridColumn: "1/-1" }}>{tr.bankNote}</span>
          {pay.bankName && <><span>{tr.bankName}</span><b style={{ fontFamily: "inherit" }}>{pay.bankName}</b></>}
          <span>{tr.iban}</span><b dir="ltr" style={{ textAlign: "start" }}>{pay.iban}</b>
          {pay.holder && <><span>{tr.holder}</span><b style={{ fontFamily: "inherit" }}>{pay.holder}</b></>}
        </div>
      )}
      <div style={{ width: "100%", display: "grid", gap: 8, textAlign: "start" }}>
        {items.map((i) => <div key={i.id} className="sum"><span>{lang === "ar" ? i.name_ar : i.name_en} × <bdi className="num">{i.qty}</bdi></span><span className="num">{fmt(i.price * i.qty)}</span></div>)}
        <div className="sum"><span>{tr.shipping}</span><span className="num">{o.shipping ? fmt(o.shipping) : tr.free}</span></div>
        {o.cod_fee > 0 && <div className="sum"><span>{tr.codFee}</span><span className="num">{fmt(o.cod_fee)}</span></div>}
        <div className="sum total"><span>{tr.total}</span><span className="num">{fmt(o.total)} {tr.sar}</span></div>
        <div className="sum" style={{ fontSize: 12.5 }}><span>{tr.vatLine}</span><span className="num">{vatOf(o.total).toFixed(2)}</span></div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link className="btn-dark" href={`/invoice/${o.id}`} target="_blank">{lang === "ar" ? "الفاتورة الضريبية" : "Tax invoice"}</Link>
        <Link className="btn-dark" href="/" style={{ background: "var(--gold)", color: "#1a1205" }}>{tr.continue}</Link>
      </div>
    </div>
  );
}
