import { NextResponse } from "next/server";
import { createOrder, CheckoutError } from "@/lib/orders";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const order = await createOrder(body);
    return NextResponse.json({ ok: true, id: order.id, number: order.number });
  } catch (e) {
    if (e instanceof CheckoutError) return NextResponse.json({ ok: false, error: e.code }, { status: 400 });
    console.error(e);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}
