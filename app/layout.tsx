import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/env";
import { getLang } from "@/lib/i18n";
import { getStore } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = getLang();
  const store = await getStore().catch(() => null);
  const name = store ? (lang === "ar" ? store.nameAr : store.nameEn) : "Entaliq Energy";
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: lang === "ar" ? `${name} | لابتوب وكمبيوتر وألعاب وشاشات` : `${name} | Laptops, PCs, Gaming & Monitors`, template: `%s | ${name}` },
    description: lang === "ar" ? "متجر سعودي لأجهزة اللابتوب والكمبيوتر والألعاب والشاشات والطابعات، منتجات أصلية بضمان الوكيل وأسعار شاملة الضريبة." : "Saudi store for laptops, PCs, gaming, monitors and printers. Genuine products, agent warranty, VAT-inclusive prices.",
    icons: { icon: "/icon.svg", apple: "/brand-mark.svg" }, openGraph: { images: ["/brand-mark.svg"] },
  };
}
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#030b18" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getLang();
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
