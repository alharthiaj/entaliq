"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { q, one } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { setSetting, getSetting, defaultStore, defaultShipping, defaultPayments, defaultBanners } from "@/lib/data";
import { setOrderStatus, markPaid } from "@/lib/orders";
import { slugify } from "@/lib/format";

const s = (fd: FormData, k: string, max = 2000) => String(fd.get(k) ?? "").trim().slice(0, max);
const n = (fd: FormData, k: string) => { const v = String(fd.get(k) ?? "").replace(/[^\d.-]/g, ""); return v === "" ? null : Math.round(Number(v)); };
const b = (fd: FormData, k: string) => fd.get(k) === "on";
const ids = (fd: FormData, k: string): string[] => { try { const a = JSON.parse(String(fd.get(k) || "[]")); return Array.isArray(a) ? a.filter((x) => /^[0-9a-f-]{36}$/i.test(x)) : []; } catch { return []; } };
const lines = (fd: FormData, k: string) => s(fd, k, 5000).split("\n").map((x) => x.trim()).filter(Boolean);
const refresh = () => revalidatePath("/", "layout");

async function uniqueSlug(table: "products" | "categories", base: string, exceptId?: string) {
  let slug = slugify(base); let i = 1;
  while (await one(`SELECT 1 FROM ${table} WHERE slug=$1 ${exceptId ? "AND id<>$2" : ""}`, exceptId ? [slug, exceptId] : [slug])) slug = `${slugify(base)}-${++i}`;
  return slug;
}

/* products */
export async function saveProduct(fd: FormData) {
  await requireAdmin();
  const id = s(fd, "id");
  const nameAr = s(fd, "name_ar", 300), nameEn = s(fd, "name_en", 300);
  const price = n(fd, "price");
  const categoryId = s(fd, "category_id");
  if (!nameAr || !nameEn || !price || price <= 0 || !categoryId) redirect(`/admin/products/${id || "new"}?e=required`);
  const slugIn = s(fd, "slug", 100);
  const slug = await uniqueSlug("products", slugIn || nameEn, id || undefined);
  const compare = n(fd, "compare_price");
  const vals = [slug, s(fd, "sku", 60) || null, nameAr, nameEn, s(fd, "desc_ar", 8000), s(fd, "desc_en", 8000), s(fd, "brand", 60) || "—", categoryId,
    s(fd, "tags", 500).split(",").map((x) => x.trim()).filter(Boolean), lines(fd, "features"), price, compare && compare > price ? compare : null,
    n(fd, "stock") ?? 0, b(fd, "active"), b(fd, "is_new"), b(fd, "featured"), b(fd, "deal"), ids(fd, "images")];
  let pid = id;
  if (id) {
    await q(`UPDATE products SET slug=$1,sku=$2,name_ar=$3,name_en=$4,desc_ar=$5,desc_en=$6,brand=$7,category_id=$8,tags=$9,features=$10,price=$11,compare_price=$12,stock=$13,active=$14,is_new=$15,featured=$16,deal=$17,images=$18,updated_at=now() WHERE id=$19`, [...vals, id]);
  } else {
    const r = await q<{ id: string }>(`INSERT INTO products (slug,sku,name_ar,name_en,desc_ar,desc_en,brand,category_id,tags,features,price,compare_price,stock,active,is_new,featured,deal,images) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING id`, vals);
    pid = r[0].id;
  }
  refresh();
  redirect(`/admin/products/${pid}?saved=1`);
}
export async function deleteProduct(fd: FormData) {
  await requireAdmin();
  const id = s(fd, "id");
  // keep order history intact: order_items.product_id is set to NULL by the FK
  await q("DELETE FROM products WHERE id=$1", [id]);
  refresh(); redirect("/admin/products?deleted=1");
}
export async function quickProduct(fd: FormData) {
  await requireAdmin();
  const id = s(fd, "id");
  const price = n(fd, "price"), stock = n(fd, "stock");
  if (price && price > 0) await q("UPDATE products SET price=$2, stock=COALESCE($3,stock), active=$4, updated_at=now() WHERE id=$1", [id, price, stock, b(fd, "active")]);
  refresh();
}

/* categories */
export async function saveCategory(fd: FormData) {
  await requireAdmin();
  const id = s(fd, "id");
  const nameAr = s(fd, "name_ar", 120), nameEn = s(fd, "name_en", 120);
  if (!nameAr || !nameEn) redirect(`/admin/categories?e=required`);
  const subs = lines(fd, "subs").map((l) => { const [key, ar, en] = l.split("|").map((x) => x.trim()); return { key: key || slugify(en || ar || ""), ar: ar || key, en: en || ar || key }; });
  const img = ids(fd, "image")[0] || null;
  if (id) {
    await q("UPDATE categories SET name_ar=$2,name_en=$3,sort=$4,active=$5,subs=$6,image_id=$7 WHERE id=$1", [id, nameAr, nameEn, n(fd, "sort") ?? 0, b(fd, "active"), JSON.stringify(subs), img]);
  } else {
    const slug = await uniqueSlug("categories", s(fd, "slug", 60) || nameEn);
    await q("INSERT INTO categories (slug,name_ar,name_en,sort,active,subs,image_id) VALUES ($1,$2,$3,$4,$5,$6,$7)", [slug, nameAr, nameEn, n(fd, "sort") ?? 0, b(fd, "active"), JSON.stringify(subs), img]);
  }
  refresh(); redirect("/admin/categories?saved=1");
}
export async function deleteCategory(fd: FormData) {
  await requireAdmin();
  const id = s(fd, "id");
  const c = await one<{ n: number }>("SELECT count(*)::int n FROM products WHERE category_id=$1", [id]);
  if (c && c.n > 0) redirect("/admin/categories?e=hasproducts");
  await q("DELETE FROM categories WHERE id=$1", [id]);
  refresh(); redirect("/admin/categories?deleted=1");
}

/* orders */
export async function updateOrder(fd: FormData) {
  const sess = await requireAdmin();
  const id = s(fd, "id");
  const status = s(fd, "status");
  const note = s(fd, "note", 500);
  if (status) await setOrderStatus(id, status, note, sess.name);
  if (b(fd, "mark_paid")) await markPaid(id, "manual:" + sess.name);
  revalidatePath(`/admin/orders/${id}`);
  redirect(`/admin/orders/${id}?saved=1`);
}

/* slides */
export async function saveSlide(fd: FormData) {
  await requireAdmin();
  const id = s(fd, "id");
  const v = [s(fd, "tag_ar", 60), s(fd, "tag_en", 60), s(fd, "title_ar", 160), s(fd, "title_en", 160), s(fd, "text_ar", 400), s(fd, "text_en", 400), ids(fd, "image")[0] || null,
    s(fd, "link", 300) || "/", s(fd, "bg_from", 20) || "#0a0f1f", s(fd, "bg_to", 20) || "#3a1f6b", s(fd, "glow", 20) || "#7c5cff", n(fd, "price_from"), n(fd, "sort") ?? 0, b(fd, "active")];
  if (!v[2] || !v[3]) redirect(`/admin/slides/${id || "new"}?e=required`);
  if (id) await q("UPDATE slides SET tag_ar=$1,tag_en=$2,title_ar=$3,title_en=$4,text_ar=$5,text_en=$6,image_id=$7,link=$8,bg_from=$9,bg_to=$10,glow=$11,price_from=$12,sort=$13,active=$14 WHERE id=$15", [...v, id]);
  else await q("INSERT INTO slides (tag_ar,tag_en,title_ar,title_en,text_ar,text_en,image_id,link,bg_from,bg_to,glow,price_from,sort,active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)", v);
  refresh(); redirect("/admin/slides?saved=1");
}
export async function deleteSlide(fd: FormData) {
  await requireAdmin(); await q("DELETE FROM slides WHERE id=$1", [s(fd, "id")]); refresh(); redirect("/admin/slides?deleted=1");
}
export async function saveBanners(fd: FormData) {
  await requireAdmin();
  const cur = await getSetting("banners", defaultBanners);
  await setSetting("banners", {
    ...cur, sideA: ids(fd, "sideA")[0] || null, sideB: ids(fd, "sideB")[0] || null,
    sideATitleAr: s(fd, "sideATitleAr", 80), sideATitleEn: s(fd, "sideATitleEn", 80), sideATextAr: s(fd, "sideATextAr", 160), sideATextEn: s(fd, "sideATextEn", 160), sideALink: s(fd, "sideALink", 300) || "/",
    sideBTitleAr: s(fd, "sideBTitleAr", 80), sideBTitleEn: s(fd, "sideBTitleEn", 80), sideBTextAr: s(fd, "sideBTextAr", 160), sideBTextEn: s(fd, "sideBTextEn", 160), sideBLink: s(fd, "sideBLink", 300) || "/",
  });
  refresh(); redirect("/admin/slides?saved=1");
}

/* quotes, subscribers */
export async function setQuoteStatus(fd: FormData) {
  await requireAdmin(); await q("UPDATE quotes SET status=$2 WHERE id=$1", [s(fd, "id"), s(fd, "status")]); revalidatePath("/admin/quotes");
}
export async function deleteSubscriber(fd: FormData) {
  await requireAdmin(); await q("DELETE FROM subscribers WHERE id=$1", [s(fd, "id")]); revalidatePath("/admin/subscribers");
}

/* pages */
export async function savePage(fd: FormData) {
  await requireAdmin();
  const slug = s(fd, "slug", 60);
  await q("UPDATE pages SET title_ar=$2,title_en=$3,body_ar=$4,body_en=$5 WHERE slug=$1", [slug, s(fd, "title_ar", 160), s(fd, "title_en", 160), s(fd, "body_ar", 20000), s(fd, "body_en", 20000)]);
  refresh(); redirect(`/admin/pages/${slug}?saved=1`);
}

/* settings */
export async function saveSettings(fd: FormData) {
  await requireAdmin("admin");
  const store = { ...defaultStore };
  for (const k of Object.keys(defaultStore) as (keyof typeof defaultStore)[]) store[k] = s(fd, "store." + k, 400);
  await setSetting("store", store);
  await setSetting("shipping", { ...defaultShipping, flat: n(fd, "ship.flat") ?? 0, freeOver: n(fd, "ship.freeOver") ?? 0, codFee: n(fd, "ship.codFee") ?? 0, cities: lines(fd, "ship.cities") });
  await setSetting("payments", { ...defaultPayments, card: b(fd, "pay.card"), cod: b(fd, "pay.cod"), bank: b(fd, "pay.bank"), bankName: s(fd, "pay.bankName", 120), iban: s(fd, "pay.iban", 40).replace(/\s/g, "").toUpperCase(), holder: s(fd, "pay.holder", 160) });
  refresh(); redirect("/admin/settings?saved=1");
}

/* admin users */
export async function saveUser(fd: FormData) {
  await requireAdmin("admin");
  const email = s(fd, "email", 160).toLowerCase(), name = s(fd, "name", 120), pw = String(fd.get("password") || ""), role = s(fd, "role") === "staff" ? "staff" : "admin";
  if (!email || !name || pw.length < 8) redirect("/admin/users?e=required");
  if (await one("SELECT 1 FROM admins WHERE email=$1", [email])) redirect("/admin/users?e=exists");
  await q("INSERT INTO admins (name,email,password,role) VALUES ($1,$2,$3,$4)", [name, email, await bcrypt.hash(pw, 10), role]);
  redirect("/admin/users?saved=1");
}
export async function deleteUser(fd: FormData) {
  const me = await requireAdmin("admin");
  const id = s(fd, "id");
  if (id === me.id) redirect("/admin/users?e=self");
  await q("DELETE FROM admins WHERE id=$1", [id]); redirect("/admin/users?deleted=1");
}
export async function changePassword(fd: FormData) {
  const me = await requireAdmin();
  const cur = String(fd.get("current") || ""), pw = String(fd.get("password") || "");
  const u = await one<{ password: string }>("SELECT password FROM admins WHERE id=$1", [me.id]);
  if (!u || !(await bcrypt.compare(cur, u.password))) redirect("/admin/users?e=wrongpw");
  if (pw.length < 8) redirect("/admin/users?e=short");
  await q("UPDATE admins SET password=$2 WHERE id=$1", [me.id, await bcrypt.hash(pw, 10)]);
  redirect("/admin/users?pw=1");
}
