// Environment helpers so the store runs on Vercel with only a database attached.
export const dbUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

export const siteUrl = () => {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const v = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return v ? `https://${v}` : "http://localhost:3000";
};

// AUTH_SECRET if set; otherwise a key derived from the (secret) database URL. Works in Node and Edge.
let cached: Uint8Array | null = null;
export async function authKey(): Promise<Uint8Array> {
  if (cached) return cached;
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 32) return (cached = new TextEncoder().encode(s));
  const base = dbUrl();
  if (!base) throw new Error("Set AUTH_SECRET or DATABASE_URL");
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("entaliq-admin-session:" + base));
  return (cached = new Uint8Array(h));
}
