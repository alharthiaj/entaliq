export const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
export const img = (id?: string | null) => (id ? `/api/img/${id}` : "/placeholder.svg");
export const vatOf = (total: number) => Math.round((total * 15) / 115 * 100) / 100;
export const offPct = (price: number, was?: number | null) => (was && was > price ? Math.round((1 - price / was) * 100) : 0);
export const slugify = (s: string) =>
  s.toLowerCase().replace(/["'″”]/g, "").replace(/[^a-z0-9؀-ۿ]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "item";
export const normPhone = (p: string) => {
  const d = p.replace(/[^\d]/g, "").replace(/^00966|^966/, "0");
  return /^05\d{8}$/.test(d) ? d : null;
};
