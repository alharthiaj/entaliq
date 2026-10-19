import Link from "next/link";
import { q, one } from "@/lib/db";
import { Pill, STATUS, METHOD, sar, dt } from "./ui";

export const dynamic = "force-dynamic";
export default async function Dashboard() {
  const k = await one<{ today: number; d7: number; d30: number; n30: number; open: number; quotes: number; products: number; low: number; subs: number }>(`
    SELECT
      COALESCE(SUM(total) FILTER (WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Riyadh') AT TIME ZONE 'Asia/Riyadh' AND status<>'cancelled'),0)::int today,
      COALESCE(SUM(total) FILTER (WHERE created_at >= now()-interval '7 days' AND status<>'cancelled'),0)::int d7,
      COALESCE(SUM(total) FILTER (WHERE created_at >= now()-interval '30 days' AND status<>'cancelled'),0)::int d30,
      COUNT(*) FILTER (WHERE created_at >= now()-interval '30 days' AND status<>'cancelled')::int n30,
      COUNT(*) FILTER (WHERE status IN ('pending','paid','processing'))::int open,
      (SELECT count(*) FROM quotes WHERE status='new')::int quotes,
      (SELECT count(*) FROM products WHERE active)::int products,
      (SELECT count(*) FROM products WHERE active AND stock<=3)::int low,
      (SELECT count(*) FROM subscribers)::int subs
    FROM orders`);
  const days = await q<{ d: string; total: number; n: number }>(`
    SELECT to_char(g.d,'MM-DD') d, COALESCE(SUM(o.total),0)::int total, COUNT(o.id)::int n
    FROM generate_series((now() AT TIME ZONE 'Asia/Riyadh')::date - 13, (now() AT TIME ZONE 'Asia/Riyadh')::date, '1 day') g(d)
    LEFT JOIN orders o ON (o.created_at AT TIME ZONE 'Asia/Riyadh')::date = g.d AND o.status<>'cancelled'
    GROUP BY g.d ORDER BY g.d`);
  const recent = await q("SELECT id,number,name,total,status,pay_method,created_at FROM orders ORDER BY created_at DESC LIMIT 8");
  const low = await q<{ id: string; name_ar: string; stock: number }>("SELECT id,name_ar,stock FROM products WHERE active AND stock<=3 ORDER BY stock LIMIT 8");
  const top = await q<{ name_ar: string; qty: number; rev: number }>(`SELECT i.name_ar, SUM(i.qty)::int qty, SUM(i.qty*i.price)::int rev FROM order_items i JOIN orders o ON o.id=i.order_id WHERE o.status<>'cancelled' AND o.created_at>=now()-interval '30 days' GROUP BY i.name_ar ORDER BY rev DESC LIMIT 6`);

  const max = Math.max(1, ...days.map((d) => d.total));
  const W = 640, H = 200, pad = 28, left = 52, bw = (W - left - pad) / days.length;
  const avg = k!.n30 ? Math.round(k!.d30 / k!.n30) : 0;
  return (
    <>
      <div className="a-top"><div><h1>نظرة عامة</h1><p>ملخص أداء المتجر</p></div>
        <div className="a-actions"><Link className="a-btn pri" href="/admin/products/new">+ منتج جديد</Link><Link className="a-btn" href="/admin/orders">كل الطلبات</Link></div></div>
      <div className="a-grid a-g4" style={{ marginBottom: 16 }}>
        <div className="a-card a-kpi"><span>مبيعات اليوم</span><b>{sar(k!.today)}</b><small>ر.س شامل الضريبة</small></div>
        <div className="a-card a-kpi"><span>آخر ٧ أيام</span><b>{sar(k!.d7)}</b><small>ر.س</small></div>
        <div className="a-card a-kpi"><span>آخر ٣٠ يومًا</span><b>{sar(k!.d30)}</b><small>{k!.n30} طلب · متوسط الطلب {sar(avg)} ر.س</small></div>
        <div className="a-card a-kpi"><span>طلبات تحتاج متابعة</span><b style={{ color: k!.open ? "var(--a-warn)" : undefined }}>{k!.open}</b><small><Link href="/admin/orders?status=open" style={{ color: "var(--a-gold)" }}>عرض الطلبات ←</Link></small></div>
      </div>
      <div className="a-grid a-g-main">
        <div className="a-grid">
          <div className="a-card">
            <h2>المبيعات اليومية (آخر ١٤ يومًا)</h2>
            <svg className="chart" viewBox={`0 0 ${W} ${H + 24}`} role="img" aria-label="مبيعات آخر ١٤ يومًا">
              {[0, 0.5, 1].map((f) => <g key={f}><line x1={left} x2={W - pad} y1={pad / 2 + (1 - f) * (H - pad)} y2={pad / 2 + (1 - f) * (H - pad)} stroke="var(--a-line)" /><text x={left - 6} y={pad / 2 + (1 - f) * (H - pad) + 4} fontSize="10" textAnchor="end" fill="var(--a-muted)">{sar(max * f)}</text></g>)}
              {days.map((d, i) => { const h = (d.total / max) * (H - pad); const x = left + i * bw + bw * 0.18; const last = i === days.length - 1;
                return <g key={d.d}><rect x={x} y={pad / 2 + (H - pad) - h} width={bw * 0.64} height={Math.max(h, d.total ? 2 : 0)} rx="3" fill={last ? "var(--a-gold)" : "color-mix(in srgb, var(--a-gold) 45%, transparent)"}><title>{`${d.d}: ${sar(d.total)} ر.س · ${d.n} طلب`}</title></rect>
                  {(i % 2 === 0 || last) && <text x={x + bw * 0.32} y={H + 14} fontSize="10" textAnchor="middle" fill="var(--a-muted)">{d.d}</text>}</g>; })}
            </svg>
          </div>
          <div className="a-card" style={{ padding: 0 }}>
            <div style={{ padding: "16px 18px 0", display: "flex", justifyContent: "space-between" }}><h2>أحدث الطلبات</h2><Link href="/admin/orders" style={{ color: "var(--a-gold)", fontWeight: 600, fontSize: 13 }}>الكل ←</Link></div>
            <div className="a-table-wrap" style={{ border: 0 }}>
              <table className="a-table"><thead><tr><th>#</th><th>العميل</th><th>المبلغ</th><th>الدفع</th><th>الحالة</th><th>التاريخ</th></tr></thead>
                <tbody>{recent.length ? recent.map((o: any) => <tr key={o.id}><td><Link className="n" href={`/admin/orders/${o.id}`} style={{ color: "var(--a-gold)", fontWeight: 700 }}>{o.number}</Link></td><td>{o.name}</td><td className="n">{sar(o.total)}</td><td>{METHOD[o.pay_method]}</td><td><Pill map={STATUS} v={o.status} /></td><td className="n sub">{dt(o.created_at)}</td></tr>)
                  : <tr><td colSpan={6} className="empty-a">لا توجد طلبات بعد. ستظهر هنا فور وصول أول طلب.</td></tr>}</tbody></table>
            </div>
          </div>
        </div>
        <div className="a-grid">
          <div className="a-card"><h2>تنبيهات</h2><ul className="list-plain">
            <li><span>طلبات عروض أسعار جديدة</span><Link href="/admin/quotes" className="n" style={{ fontWeight: 700, color: k!.quotes ? "var(--a-warn)" : undefined }}>{k!.quotes}</Link></li>
            <li><span>منتجات قاربت على النفاد</span><b className="n" style={{ color: k!.low ? "var(--a-bad)" : undefined }}>{k!.low}</b></li>
            <li><span>منتجات نشطة</span><b className="n">{k!.products}</b></li>
            <li><span>مشتركو النشرة</span><b className="n">{k!.subs}</b></li>
          </ul></div>
          {low.length > 0 && <div className="a-card"><h2>مخزون منخفض</h2><ul className="list-plain">{low.map((p) => <li key={p.id}><Link href={`/admin/products/${p.id}`} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name_ar}</Link><span className={"pill " + (p.stock === 0 ? "bad" : "warn")}>{p.stock}</span></li>)}</ul></div>}
          <div className="a-card"><h2>الأكثر مبيعًا (٣٠ يومًا)</h2>{top.length ? <ul className="list-plain">{top.map((t) => <li key={t.name_ar}><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name_ar}</span><b className="n">{t.qty}×</b></li>)}</ul> : <p className="empty-a" style={{ padding: 10 }}>لا توجد مبيعات بعد.</p>}</div>
        </div>
      </div>
    </>
  );
}
