import type { Metadata } from "next";
import { font, arabicFont } from "@/app/fonts";
import { getContent, siteUrl, type Locale } from "@/lib/content";
import "@/app/globals.css";
import "@/app/enhancements.css";
export function siteMetadata(locale: Locale): Metadata {
  const c = getContent(locale);
  return {
    metadataBase: new URL(siteUrl),
    title: c.seo.title,
    description: c.seo.description,
    alternates: {
      canonical: locale === "ar" ? "/ar" : "/",
      languages: { en: "/", ar: "/ar", "x-default": "/" },
    },
    openGraph: {
      title: c.seo.title,
      description: c.seo.description,
      type: "website",
      locale: locale === "ar" ? "ar_EG" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_EG",
      images: [
        { url: "/images/og.png", width: 1200, height: 630, alt: c.brand.name },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: c.seo.title,
      images: ["/images/og.png"],
    },
    robots: { index: true, follow: true },
  };
}
export function SiteShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-theme="dark"
      suppressHydrationWarning
      className={`${font.variable} ${arabicFont.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('gawish-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}",
          }}
        />
      </head>
      <body>
        <a className="skip" href="#main">
          {getContent(locale).ui.skip}
        </a>
        {children}
      </body>
    </html>
  );
}
