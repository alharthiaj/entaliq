import { cookies } from "next/headers";
import type { Lang } from "./types";

export function getLang(): Lang {
  return cookies().get("lang")?.value === "en" ? "en" : "ar";
}
export { dict, t } from "./dict";
export type { Dict } from "./dict";
