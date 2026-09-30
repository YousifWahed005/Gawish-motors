import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
export { validateContent } from "@/lib/validation";
export const contentPath = `${process.cwd()}/data/content.json`;
export function configured() {
  return (
    !!process.env.ADMIN_PASSWORD &&
    (process.env.ADMIN_SESSION_SECRET?.length || 0) >= 32
  );
}
function sign(value: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "")
    .update(value)
    .digest("hex");
}
export function equal(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function token() {
  const expiry = String(Date.now() + 8 * 60 * 60 * 1000);
  return `${expiry}.${sign(expiry)}`;
}
export function authorized(req: NextRequest) {
  if (!configured()) return false;
  const [expiry, signature] = (
    req.cookies.get("gawish-admin")?.value || ""
  ).split(".");
  return (
    !!expiry &&
    !!signature &&
    Number(expiry) > Date.now() &&
    equal(signature, sign(expiry))
  );
}
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  if (origin === req.nextUrl.origin) return true;
  try {
    return origin === new URL(process.env.NEXT_PUBLIC_SITE_URL || "").origin;
  } catch {
    return false;
  }
}
