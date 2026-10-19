// Creates tables and seeds the store. Safe to re-run: existing data is kept.
// Usage: node db/setup.mjs   (reads DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD from the environment or .env)
import pg from "pg";
import sharp from "sharp";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
// minimal .env loader
const envFile = path.join(here, "..", ".env");
if (fs.existsSync(envFile)) for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  if (process.argv.includes("--if-db")) { console.log("No database configured yet, skipping setup"); process.exit(0); }
  console.error("DATABASE_URL is not set"); process.exit(1);
}
const db = new pg.Client({ connectionString: url, ssl: /sslmode=require|neon\.tech|supabase|vercel-storage/.test(url) ? { rejectUnauthorized: false } : undefined });
const q = (t, v) => db.query(t, v);

const data = JSON.parse(fs.readFileSync(path.join(here, "seed-data.json"), "utf8"));
const seedUrls = JSON.parse(fs.readFileSync(path.join(here, "seed-image-urls.json"), "utf8"));
const UA = { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36", accept: "image/avif,image/webp,image/png,image/*,*/*" };

// Downloads an official product photo and normalises it: square white tile, trimmed hero cut-out, or wide banner.
async function fetchImage(key) {
  const src = seedUrls[key];
  if (!src) return null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(src.url, { headers: UA, signal: AbortSignal.timeout(20000) });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      if (src.kind === "hero") {
        return await sharp(buf).trim({ threshold: 10 }).resize({ width: 620, height: 620, fit: "inside" }).webp({ quality: 80 }).toBuffer();
      }
      if (src.kind === "wide") {
        return await sharp(buf).resize({ width: 960, height: 600, fit: "cover" }).webp({ quality: 76 }).toBuffer();
      }
      const flat = await sharp(buf).flatten({ background: "#ffffff" }).toBuffer();
      const { data } = await sharp(flat).extract({ left: 1, top: 1, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
      const bg = { r: data[0], g: data[1], b: data[2] };
      const trimmed = await sharp(flat).trim({ background: bg, threshold: 14 }).toBuffer({ resolveWithObject: true });
      const { width, height } = trimmed.info;
      const side = Math.round(Math.max(width, height) * 1.12);
      return await sharp(trimmed.data)
        .extend({ top: Math.floor((side - height) / 2), bottom: Math.ceil((side - height) / 2), left: Math.floor((side - width) / 2), right: Math.ceil((side - width) / 2), background: bg })
        .png().toBuffer()
        .then((sq) => sharp(sq).resize(420, 420).webp({ quality: 76 }).toBuffer());
    } catch (e) {
      if (attempt === 2) { console.log(`  image ${key} skipped (${e.message})`); return null; }
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  return null;
}
const slugify = (s) => s.toLowerCase().replace(/["'″”]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
const cache = {};
const imgDir = path.join(here, "seed-images");
async function image(key) {
  if (cache[key]) return cache[key];
  const local = path.join(imgDir, key + ".webp");
  const data = fs.existsSync(local) ? fs.readFileSync(local) : await fetchImage(key);
  if (!data) return null;
  const r = await q("INSERT INTO images (mime, data) VALUES ('image/webp', $1) RETURNING id", [data]);
  return (cache[key] = r.rows[0].id);
}

await db.connect();
await q(fs.readFileSync(path.join(here, "schema.sql"), "utf8"));
// Palette migration: move sample slides still on an older theme to the cheerful palette.
await q(`UPDATE slides s SET bg_from=v.a, bg_to=v.b, glow=v.g FROM (VALUES
  (0,'#0a8a4a','#16c172','#ffc61a'),(1,'#5b2bd6','#c04bd6','#ffc61a'),(2,'#1a73e8','#3fb4f5','#ffffff'),
  (3,'#0d9488','#2dd4bf','#ffc61a'),(4,'#d6336c','#ff6b8b','#ffe27a')) v(i,a,b,g)
  WHERE s.sort=v.i AND lower(s.glow) IN ('#19d3c5','#d4af37')`);
console.log("Tables ready");

const email = (process.env.ADMIN_EMAIL || "admin@entaliq.com.sa").toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!password) console.log("ADMIN_PASSWORD not set: create the first admin from /admin/login");
else if (!(await q("SELECT 1 FROM admins WHERE email=$1", [email])).rowCount) {
  await q("INSERT INTO admins (name,email,password,role) VALUES ($1,$2,$3,'admin')", ["مدير المتجر", email, await bcrypt.hash(password, 10)]);
  console.log(`Admin created: ${email} / ${password}  -> change the password after first login`);
}

if (process.argv.includes("--no-samples")) { console.log("Skipping sample catalog"); }
else if (!(await q("SELECT 1 FROM categories LIMIT 1")).rowCount) {
  const catIds = {};
  for (const [i, c] of data.CATS.entries()) {
    const subs = c.groups.flatMap((g) => g.subs.map(([key, ar, en]) => ({ key, ar, en })));
    const r = await q("INSERT INTO categories (slug,name_ar,name_en,sort,subs,image_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id", [c.id, c.ar, c.en, i, JSON.stringify(subs), await image(c.img)]);
    catIds[c.id] = r.rows[0].id;
  }
  for (const p of data.P) {
    const img = await image(p.id);
    await q(`INSERT INTO products (slug,sku,name_ar,name_en,desc_ar,desc_en,brand,category_id,tags,features,price,compare_price,stock,is_new,featured,deal,popularity,rating,reviews,images)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,12,$13,$14,$15,$16,$17,$18,$19)`,
      [slugify(p.en), p.id.toUpperCase(), p.ar, p.en,
       p.ar + ". منتج أصلي بضمان الوكيل المعتمد في المملكة العربية السعودية.", p.en + ". Genuine product with official Saudi agent warranty.",
       p.brand, catIds[p.cat], p.sub || [], p.f || [], p.price, p.was || null, !!p.isNew, !!p.feat, !!p.deal, p.pop || 0,
       p.rev ? p.rev[0] : null, p.rev ? p.rev[1] : 0, img ? [img] : []]);
  }
  const S = [
    ["h_legion", "/category/laptops?sub=legion", "#0a8a4a", "#16c172", "#ffc61a", 7599],
    ["h_aurora", "/category/gaming", "#5b2bd6", "#c04bd6", "#ffc61a", 12999],
    ["w_pro", "/category/apple", "#1a73e8", "#3fb4f5", "#ffffff", 9499],
    ["h_xps", "/category/laptops?sub=xps", "#0d9488", "#2dd4bf", "#ffc61a", 6999],
    ["h_aw34", "/category/gmonitors", "#d6336c", "#ff6b8b", "#ffe27a", 3999],
  ];
  for (const [i, [img, link, a, b, glow, price]] of S.entries()) {
    const ar = data.slidesAr[i], en = data.slidesEn[i];
    await q("INSERT INTO slides (tag_ar,tag_en,title_ar,title_en,text_ar,text_en,image_id,link,bg_from,bg_to,glow,price_from,sort) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)",
      [ar.tag, en.tag, ar.h, en.h, ar.p, en.p, await image(img), link, a, b, glow, price, i]);
  }
  console.log(`Seeded ${data.P.length} sample products`);
}

const defaults = {
  store: { nameAr: "انطلق للطاقة", nameEn: "Entaliq Energy", phone: "+966 5X XXX XXXX", whatsapp: "", email: "info@entaliq.com.sa", addressAr: "الرياض، المملكة العربية السعودية", addressEn: "Riyadh, Saudi Arabia", hoursAr: "السبت – الخميس: ٩ ص – ١٠ م · الجمعة: مغلق", hoursEn: "Sat – Thu: 9am – 10pm · Friday: closed", cr: "", vatNo: "", x: "", instagram: "", snapchat: "", tiktok: "" },
  shipping: { flat: 25, freeOver: 500, codFee: 15, cities: ["الرياض","جدة","مكة المكرمة","المدينة المنورة","الدمام","الخبر","الظهران","الطائف","تبوك","بريدة","أبها","خميس مشيط","حائل","جازان","نجران","الجبيل","ينبع","الأحساء"] },
  payments: { card: true, cod: true, bank: true, bankName: "", iban: "", holder: "" },
  banners: { sideA: await image("h_ltower"), sideB: await image("h_pro16"), sideATitleAr: "أجهزة الألعاب", sideATitleEn: "Gaming rigs", sideATextAr: "Legion و Alienware و OMEN", sideATextEn: "Legion, Alienware and OMEN", sideALink: "/category/gaming", sideBTitleAr: "لابتوبات الأعمال", sideBTitleEn: "Business laptops", sideBTextAr: "ThinkPad و EliteBook و Dell Pro", sideBTextEn: "ThinkPad, EliteBook and Dell Pro", sideBLink: "/category/laptops?sub=business" },
};
for (const [k, v] of Object.entries(defaults)) await q("INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING", [k, JSON.stringify(v)]);

const pages = JSON.parse(fs.readFileSync(path.join(here, "pages.json"), "utf8"));
for (const p of pages) await q("INSERT INTO pages (slug,title_ar,title_en,body_ar,body_en) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (slug) DO NOTHING", p);

await db.end();
console.log("Setup complete");
