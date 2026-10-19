import Link from "next/link";
import { q } from "@/lib/db";
import { Flash, sar } from "../ui";

export const dynamic = "force-dynamic";
type SP = { q?: string; cat?: string; st?: string; saved?: string; deleted?: string; e?: string };
export default async function Products({ searchParams: sp }: { searchParams: SP }) {
  const cats = await q<{ id: string; name_ar: string }>("SELECT id,name_ar FROM categories ORDER BY sort");
  const where: string[] = []; const v: unknown[] = [];
  if (sp.q) { v.push("%" + sp.q.toLowerCase() + "%"); where.push(`(lower(p.name_ar) LIKE $${v.length} OR lower(p.name_en) LIKE $${v.length} OR lower(p.brand) LIKE $${v.length} OR lower(coalesce(p.sku,'')) LIKE $${v.length})`); }
  if (sp.cat) { v.push(sp.cat); where.push(`p.category_id=$${v.length}`); }
  if (sp.st === "low") where.push("p.stock<=3"); if (sp.st === "off") where.push("NOT p.active"); if (sp.st === "sale") where.push("p.compare_price>p.price");
  const rows = await q(`SELECT p.id,p.slug,p.name_ar,p.brand,p.sku,p.price,p.compare_price,p.stock,p.active,p.images[1] img,c.name_ar cat FROM products p JOIN categories c ON c.id=p.category_id ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY p.updated_at DESC LIMIT 300`, v);
  return (
    <>
      <div className="a-top"><div><h1>المنتجات</h1><p>{rows.length} منتج</p></div><div className="a-actions"><Link className="a-btn pri" href="/admin/products/new">+ إضافة منتج</Link></div></div>
      <Flash sp={sp} />
      <form className="a-filters">
        <input name="q" defaultValue={sp.q} placeholder="بحث بالاسم أو الماركة أو رقم المنتج" style={{ minWidth: 240 }} />
        <select name="cat" defaultValue={sp.cat || ""}><option value="">كل الأقسام</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}</select>
        <select name="st" defaultValue={sp.st || ""}><option value="">كل الحالات</option><option value="low">مخزون منخفض</option><option value="sale">عليه خصم</option><option value="off">مخفي</option></select>
        <button className="a-btn dark" type="submit">تصفية</button>
        {(sp.q || sp.cat || sp.st) && <Link href="/admin/products" className="a-btn">مسح</Link>}
      </form>
      <div className="a-table-wrap"><table className="a-table">
        <thead><tr><th></th><th>المنتج</th><th>القسم</th><th>السعر</th><th>المخزون</th><th>الحالة</th><th></th></tr></thead>
        <tbody>{rows.length ? rows.map((p: any) => (
          <tr key={p.id}>
            <td><img className="thumb" src={p.img ? `/api/img/${p.img}` : "/placeholder.svg"} alt="" /></td>
            <td><Link href={`/admin/products/${p.id}`} className="name">{p.name_ar}</Link><div className="sub">{p.brand}{p.sku ? ` · ${p.sku}` : ""}</div></td>
            <td className="sub">{p.cat}</td>
            <td className="n">{sar(p.price)}{p.compare_price ? <div className="sub" style={{ textDecoration: "line-through" }}>{sar(p.compare_price)}</div> : null}</td>
            <td><span className={"pill " + (p.stock === 0 ? "bad" : p.stock <= 3 ? "warn" : "ok")}>{p.stock}</span></td>
            <td>{p.active ? <span className="pill ok">ظاهر</span> : <span className="pill mute">مخفي</span>}</td>
            <td style={{ whiteSpace: "nowrap" }}><Link className="a-btn sm" href={`/admin/products/${p.id}`}>تعديل</Link> <a className="a-btn sm" href={`/product/${p.slug}`} target="_blank" rel="noopener">عرض</a></td>
          </tr>)) : <tr><td colSpan={7} className="empty-a">لا توجد منتجات مطابقة.</td></tr>}</tbody>
      </table></div>
    </>
  );
}
