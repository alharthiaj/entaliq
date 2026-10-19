import { q, one } from "./db";
import type { Category, Product, Slide, StoreSettings, ShippingSettings, PaymentSettings, BannerSettings } from "./types";

const PRODUCT_COLS = `p.*, c.slug AS category_slug`;

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const r = await one<{ value: T }>("SELECT value FROM settings WHERE key=$1", [key]);
  return r ? { ...fallback, ...(r.value as object) } as T : fallback;
}
export async function setSetting(key: string, value: unknown) {
  await q("INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value", [key, JSON.stringify(value)]);
}

export const defaultStore: StoreSettings = { nameAr: "انطلق للطاقة", nameEn: "Entaliq Energy", phone: "", whatsapp: "", email: "", addressAr: "", addressEn: "", hoursAr: "", hoursEn: "", cr: "", vatNo: "", x: "", instagram: "", snapchat: "", tiktok: "" };
export const defaultShipping: ShippingSettings = { flat: 25, freeOver: 500, codFee: 15, cities: [] };
export const defaultPayments: PaymentSettings = { card: true, cod: true, bank: true, bankName: "", iban: "", holder: "" };
export const defaultBanners: BannerSettings = { sideA: null, sideB: null, sideATitleAr: "", sideATitleEn: "", sideATextAr: "", sideATextEn: "", sideALink: "/", sideBTitleAr: "", sideBTitleEn: "", sideBTextAr: "", sideBTextEn: "", sideBLink: "/" };

export const getStore = () => getSetting("store", defaultStore);
export const getShipping = () => getSetting("shipping", defaultShipping);
export const getPayments = async () => {
  const p = await getSetting("payments", defaultPayments);
  // card payments need gateway keys
  if (!process.env.MOYASAR_PUBLISHABLE_KEY || !process.env.MOYASAR_SECRET_KEY) p.card = false;
  return p;
};
export const getBanners = () => getSetting("banners", defaultBanners);

export const getCategories = (all = false) =>
  q<Category>(`SELECT * FROM categories ${all ? "" : "WHERE active"} ORDER BY sort, name_en`);
export const getCategory = (slug: string) => one<Category>("SELECT * FROM categories WHERE slug=$1 AND active", [slug]);

export async function getProducts(opts: { category?: string; sub?: string; brand?: string; search?: string; flag?: "deal" | "is_new" | "featured" | "sale"; ids?: string[]; sort?: string; limit?: number; includeInactive?: boolean } = {}) {
  const where: string[] = [];
  const vals: unknown[] = [];
  const add = (sql: string, v: unknown) => { vals.push(v); where.push(sql.replace("?", "$" + vals.length)); };
  if (!opts.includeInactive) where.push("p.active AND c.active");
  if (opts.category) add("c.slug = ?", opts.category);
  if (opts.sub) { vals.push(opts.sub); where.push(`($${vals.length} = ANY(p.tags) OR p.brand = $${vals.length})`); }
  if (opts.brand) add("lower(p.brand) = lower(?)", opts.brand);
  if (opts.search) { vals.push("%" + opts.search.toLowerCase() + "%"); const i = vals.length; where.push(`(lower(p.name_ar) LIKE $${i} OR lower(p.name_en) LIKE $${i} OR lower(p.brand) LIKE $${i} OR lower(coalesce(p.sku,'')) LIKE $${i})`); }
  if (opts.flag === "sale") where.push("p.compare_price IS NOT NULL AND p.compare_price > p.price");
  else if (opts.flag) where.push(`p.${opts.flag}`);
  if (opts.ids) add("p.id = ANY(?::uuid[])", opts.ids);
  const order = { low: "p.price ASC", high: "p.price DESC", new: "p.created_at DESC", off: "(coalesce(p.compare_price,p.price)-p.price)::float/coalesce(p.compare_price,p.price) DESC" }[opts.sort || ""] || "p.popularity DESC, p.created_at DESC";
  return q<Product>(`SELECT ${PRODUCT_COLS} FROM products p JOIN categories c ON c.id=p.category_id ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY ${order} ${opts.limit ? "LIMIT " + Math.floor(opts.limit) : ""}`, vals);
}
export const getProduct = (slug: string) => one<Product>(`SELECT ${PRODUCT_COLS} FROM products p JOIN categories c ON c.id=p.category_id WHERE p.slug=$1 AND p.active`, [slug]);
export const getBrands = async () => (await q<{ brand: string; n: number }>("SELECT brand, count(*)::int n FROM products WHERE active AND brand <> '—' AND brand <> '' GROUP BY brand ORDER BY n DESC")).map((r) => r.brand);
export const getSlides = () => q<Slide>("SELECT * FROM slides WHERE active ORDER BY sort");
export const getPage = (slug: string) => one<{ slug: string; title_ar: string; title_en: string; body_ar: string; body_en: string }>("SELECT * FROM pages WHERE slug=$1", [slug]);
