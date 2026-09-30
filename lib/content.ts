import content from "@/data/content.json";
export type Locale = "en" | "ar";
export type Content = typeof content.en;
export function getContent(locale: Locale = "en"): Content {
  return content[locale];
}
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
