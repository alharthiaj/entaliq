import { NextResponse } from "next/server";
import sharp from "sharp";
import { q } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const fd = await req.formData();
  const out: string[] = [];
  for (const f of fd.getAll("files")) {
    if (!(f instanceof File) || f.size === 0) continue;
    if (f.size > 8 * 1024 * 1024) return NextResponse.json({ error: "too_large" }, { status: 400 });
    try {
      const buf = Buffer.from(await f.arrayBuffer());
      const webp = await sharp(buf).rotate().resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      const r = await q<{ id: string }>("INSERT INTO images (mime,data) VALUES ('image/webp',$1) RETURNING id", [webp]);
      out.push(r[0].id);
    } catch {
      return NextResponse.json({ error: "bad_image" }, { status: 400 });
    }
  }
  return NextResponse.json({ ids: out });
}
