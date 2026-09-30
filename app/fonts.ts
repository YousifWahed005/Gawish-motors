import localFont from "next/font/local";
export const font = localFont({
  src: [
    { path: "./fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Inter-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});
export const arabicFont = localFont({
  src: [
    {
      path: "./fonts/Cairo-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    { path: "./fonts/Cairo-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-arabic",
  display: "swap",
});
