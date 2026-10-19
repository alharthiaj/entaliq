import { one } from "@/lib/db";
export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return new Response("not found", { status: 404 });
  const r = await one<{ mime: string; data: Buffer }>("SELECT mime, data FROM images WHERE id=$1", [params.id]);
  if (!r) return new Response("not found", { status: 404 });
  return new Response(new Uint8Array(r.data), { headers: { "content-type": r.mime, "cache-control": "public, max-age=31536000, immutable" } });
}
