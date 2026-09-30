import { SiteShell, siteMetadata } from "@/components/site-shell";
export const metadata = siteMetadata("ar");
export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="ar">{children}</SiteShell>;
}
