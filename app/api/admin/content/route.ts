import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, rename } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import {
  authorized,
  sameOrigin,
  validateContent,
  contentPath,
} from "@/lib/admin";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  if (!authorized(req))
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  return NextResponse.json(JSON.parse(await readFile(contentPath, "utf8")), {
    headers: { "Cache-Control": "no-store" },
  });
}
export async function PUT(req: NextRequest) {
  if (!authorized(req) || !sameOrigin(req))
    return NextResponse.json(
      { error: "Please sign in again." },
      { status: 401 },
    );
  if (Number(req.headers.get("content-length")) > 200000)
    return NextResponse.json(
      { error: "Content is too large." },
      { status: 413 },
    );
  let data;
  try {
    const raw = await req.text();
    if (raw.length > 200000) throw new Error();
    data = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid content." }, { status: 400 });
  }
  if (!validateContent(data))
    return NextResponse.json(
      {
        error:
          "Every field must contain valid content. Image paths must come from uploads, and links must use HTTPS. Lists require 1–30 entries.",
      },
      { status: 400 },
    );
  try {
    const temp = `${contentPath}.${randomUUID()}.tmp`;
    await writeFile(temp, JSON.stringify(data, null, 2));
    await rename(temp, contentPath);
    return NextResponse.json({
      ok: true,
      message:
        "Saved on the server. Rebuild and restart to publish changes on the static homepage.",
    });
  } catch {
    return NextResponse.json(
      { error: "Could not save. Check that data/ is writable." },
      { status: 500 },
    );
  }
}
