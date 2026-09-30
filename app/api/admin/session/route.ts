import { NextRequest, NextResponse } from "next/server";
import { configured, equal, token, authorized, sameOrigin } from "@/lib/admin";
export const runtime = "nodejs";
const attempts = new Map<string, { count: number; until: number }>();
export async function GET(req: NextRequest) {
  return NextResponse.json(
    { authenticated: authorized(req), configured: configured() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  if (!configured())
    return NextResponse.json(
      {
        error:
          "Set ADMIN_PASSWORD and a 32-character ADMIN_SESSION_SECRET in .env.local, then restart the server.",
      },
      { status: 503 },
    );
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const now = Date.now();
  const previous = attempts.get(ip);
  const record =
    previous && previous.until > now
      ? previous
      : { count: 0, until: now + 900000 };
  if (record.count >= 8)
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  if (attempts.size > 1000)
    for (const [key, v] of attempts) if (v.until < now) attempts.delete(key);
  record.count++;
  attempts.set(ip, record);
  let data;
  try {
    const body = await req.text();
    if (body.length > 4096) throw new Error();
    data = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (
    typeof data?.password !== "string" ||
    !equal(data.password, process.env.ADMIN_PASSWORD!)
  )
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  attempts.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("gawish-admin", token(), {
    httpOnly: true,
    sameSite: "strict",
    secure:
      req.nextUrl.protocol === "https:" ||
      process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://"),
    path: "/",
    maxAge: 28800,
  });
  return res;
}
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("gawish-admin");
  return res;
}
