import QRCode from "qrcode";
// ZATCA simplified tax invoice QR (TLV, base64): seller, VAT no, timestamp, total, VAT amount.
function tlv(tag: number, value: string) {
  const v = Buffer.from(value, "utf8");
  return Buffer.concat([Buffer.from([tag, v.length]), v]);
}
export async function zatcaQr(seller: string, vatNo: string, at: Date, total: number, vat: number) {
  const b64 = Buffer.concat([tlv(1, seller), tlv(2, vatNo || "000000000000000"), tlv(3, at.toISOString()), tlv(4, total.toFixed(2)), tlv(5, vat.toFixed(2))]).toString("base64");
  return QRCode.toDataURL(b64, { margin: 1, width: 180 });
}
