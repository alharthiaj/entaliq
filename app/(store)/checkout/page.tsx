import CheckoutForm from "@/components/CheckoutForm";
import { getPayments, getShipping } from "@/lib/data";
import { getLang } from "@/lib/i18n";

export const metadata = { title: "Checkout", robots: { index: false } };
export default async function CheckoutPage() {
  const lang = getLang();
  const [pay, ship] = await Promise.all([getPayments(), getShipping()]);
  return <CheckoutForm methods={{ card: pay.card, cod: pay.cod, bank: pay.bank }} cities={ship.cities} codFee={ship.codFee} lang={lang} />;
}
