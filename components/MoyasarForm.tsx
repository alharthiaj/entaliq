"use client";
import { useEffect } from "react";

declare global { interface Window { Moyasar?: { init: (o: unknown) => void } } }
const VER = "1.14.0";

export default function MoyasarForm(p: { amount: number; orderId: string; description: string; publishableKey: string; callbackUrl: string; lang: "ar" | "en"; applePay: boolean; storeName: string }) {
  useEffect(() => {
    const css = document.createElement("link"); css.rel = "stylesheet"; css.href = `https://cdn.moyasar.com/mpf/${VER}/moyasar.css`; document.head.appendChild(css);
    const s = document.createElement("script"); s.src = `https://cdn.moyasar.com/mpf/${VER}/moyasar.js`;
    s.onload = () => window.Moyasar?.init({
      element: ".mysr-form", amount: p.amount, currency: "SAR", description: p.description, publishable_api_key: p.publishableKey,
      callback_url: p.callbackUrl, language: p.lang, metadata: { order_id: p.orderId },
      methods: p.applePay ? ["creditcard", "applepay"] : ["creditcard"],
      supported_networks: ["mada", "visa", "mastercard"],
      ...(p.applePay ? { apple_pay: { country: "SA", label: p.storeName, validate_merchant_url: "https://api.moyasar.com/v1/applepay/initiate" } } : {}),
    });
    document.body.appendChild(s);
    return () => { s.remove(); css.remove(); };
  }, [p]);
  return <div className="mysr-form" style={{ width: "100%", textAlign: "start" }} />;
}
