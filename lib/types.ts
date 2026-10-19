export type Sub = { key: string; ar: string; en: string };
export type Category = { id: string; slug: string; name_ar: string; name_en: string; image_id: string | null; sort: number; active: boolean; subs: Sub[] };
export type Product = {
  id: string; slug: string; sku: string | null; name_ar: string; name_en: string; desc_ar: string; desc_en: string;
  brand: string; category_id: string; tags: string[]; features: string[]; price: number; compare_price: number | null;
  stock: number; active: boolean; is_new: boolean; featured: boolean; deal: boolean; popularity: number;
  rating: number | null; reviews: number; images: string[]; created_at: string; category_slug?: string;
};
export type Slide = { id: string; tag_ar: string; tag_en: string; title_ar: string; title_en: string; text_ar: string; text_en: string; image_id: string | null; link: string; bg_from: string; bg_to: string; glow: string; price_from: number | null; sort: number; active: boolean };
export type StoreSettings = { nameAr: string; nameEn: string; phone: string; whatsapp: string; email: string; addressAr: string; addressEn: string; hoursAr: string; hoursEn: string; cr: string; vatNo: string; x: string; instagram: string; snapchat: string; tiktok: string };
export type ShippingSettings = { flat: number; freeOver: number; codFee: number; cities: string[] };
export type PaymentSettings = { card: boolean; cod: boolean; bank: boolean; bankName: string; iban: string; holder: string };
export type BannerSettings = { sideA: string | null; sideB: string | null; sideATitleAr: string; sideATitleEn: string; sideATextAr: string; sideATextEn: string; sideALink: string; sideBTitleAr: string; sideBTitleEn: string; sideBTextAr: string; sideBTextEn: string; sideBLink: string };
export type Lang = "ar" | "en";
