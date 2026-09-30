import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { authorized, sameOrigin } from "@/lib/admin";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (!authorized(req) || !sameOrigin(req))
    return NextResponse.json(
      { error: "Please sign in again." },
      { status: 401 },
    );
  if (Number(req.headers.get("content-length")) > 6 * 1024 * 1024)
    return NextResponse.json(
      { error: "Maximum file size is 5 MB." },
      { status: 413 },
    );
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size > 5 * 1024 * 1024 ||
      file.size === 0
    )
      return NextResponse.json(
        { error: "Choose a PNG, JPEG, or WebP up to 5 MB." },
        { status: 400 },
      );
    const b = Buffer.from(await file.arrayBuffer());
    let ext = "";
    if (b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
      ext = "png";
    else if (b[0] === 255 && b[1] === 216 && b[2] === 255) ext = "jpg";
    else if (
      b.toString("ascii", 0, 4) === "RIFF" &&
      b.toString("ascii", 8, 12) === "WEBP"
    )
      ext = "webp";
    if (!ext)
      return NextResponse.json(
        { error: "Unsupported image. Use PNG, JPEG, or WebP." },
        { status: 400 },
      );
    const name = `${randomUUID()}.${ext}`;
    await mkdir(`${process.cwd()}/public/uploads`, { recursive: true });
    await writeFile(`${process.cwd()}/public/uploads/${name}`, b);
    return NextResponse.json({ url: `/api/media/${name}` });
  } catch {
    return NextResponse.json(
      {
        error: "Upload failed. Check the file and server storage permissions.",
      },
      { status: 400 },
    );
  }
}
