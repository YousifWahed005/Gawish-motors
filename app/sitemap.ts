import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/ar"].map((path) => ({
    url: siteUrl + path,
    changeFrequency: "weekly",
    priority: 1,
    alternates: { languages: { en: siteUrl, ar: `${siteUrl}/ar` } },
  }));
}
