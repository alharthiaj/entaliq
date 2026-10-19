import { Pool, type QueryResultRow } from "pg";

const g = globalThis as unknown as { __pool?: Pool };
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

export const pool =
  g.__pool ??
  new Pool({
    connectionString: url,
    max: 5,
    ssl: /sslmode=require|neon\.tech|supabase|vercel-storage/.test(url) ? { rejectUnauthorized: false } : undefined,
  });
if (process.env.NODE_ENV !== "production") g.__pool = pool;

export async function q<T extends QueryResultRow = any>(text: string, values: unknown[] = []): Promise<T[]> {
  const r = await pool.query<T>(text, values);
  return r.rows;
}
export async function one<T extends QueryResultRow = any>(text: string, values: unknown[] = []): Promise<T | null> {
  const rows = await q<T>(text, values);
  return rows[0] ?? null;
}
