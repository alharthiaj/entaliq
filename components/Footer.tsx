import Link from "next/link";
import type { Lang, StoreSettings } from "@/lib/types";
import { t } from "@/lib/dict";
import { NewsForm } from "./Widgets";
import Wordmark from "./Wordmark";

export default function Footer({ lang, store }: { lang: Lang; store: StoreSettings }) {
  const tr = t(lang);
  const name = lang === "ar" ? store.nameAr : store.nameEn;
  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const social = [["X", store.x], ["IG", store.instagram], ["SC", store.snapchat], ["TT", store.tiktok]].filter(([, u]) => u);
  return (
    <footer>
      <div className="news"><div className="wrap" style={{ position: "relative" }}>
        <h3>{tr.newsT}</h3>
        <NewsForm />
      </div></div>
      <div className="wrap foot">
        <div>
          <Link className="logo" href="/" aria-label={name}><Wordmark nameEn={store.nameEn} /></Link>
          <p>{tr.about}</p>
          <div className="certs">
            {store.cr && <span>{tr.cr}: <bdi className="num">{store.cr}</bdi></span>}
            {store.vatNo && <span>{tr.vatNo}: <bdi className="num">{store.vatNo}</bdi></span>}
          </div>
          {social.length > 0 && <div className="social">{social.map(([k, u]) => <a key={k} href={u} target="_blank" rel="noopener noreferrer"><span>{k}</span></a>)}</div>}
        </div>
        <div><h4>{tr.fInfo}</h4><ul>
          <li><Link href="/page/about">{L("عن المتجر", "About us")}</Link></li>
          <li><Link href="/page/privacy">{L("سياسة الخصوصية", "Privacy policy")}</Link></li>
          <li><Link href="/page/terms">{L("الشروط والأحكام", "Terms & conditions")}</Link></li>
          <li><Link href="/page/payment-methods">{L("طرق الدفع", "Payment methods")}</Link></li>
        </ul></div>
        <div><h4>{tr.fCust}</h4><ul>
          <li><Link href="/track">{tr.track}</Link></li>
          <li><Link href="/page/returns">{L("الاسترجاع والاستبدال", "Returns & exchange")}</Link></li>
          <li><Link href="/page/warranty">{L("الضمان والصيانة", "Warranty & repair")}</Link></li>
          <li><Link href="/page/faq">{L("الأسئلة المتكررة", "FAQ")}</Link></li>
        </ul></div>
        <div><h4>{tr.fContact}</h4><ul>
          <li>{lang === "ar" ? store.addressAr : store.addressEn}</li>
          {store.phone && <li className="num" dir="ltr" style={{ textAlign: "start" }}>{store.phone}</li>}
          {store.whatsapp && <li><a href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>}
          {store.email && <li dir="ltr" style={{ textAlign: "start" }}>{store.email}</li>}
          <li>{lang === "ar" ? store.hoursAr : store.hoursEn}</li>
        </ul></div>
      </div>
      <div className="legal"><div className="wrap"><span>{tr.rights(name)}</span><div className="paym"><span>mada</span><span>VISA</span><span>Mastercard</span><span>Apple Pay</span><span>STC Pay</span></div></div></div>
    </footer>
  );
}
