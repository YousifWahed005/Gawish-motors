import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
export const runtime = "nodejs";
export async function GET(
  _: Request,
  { params }: { params: { name: string } },
) {
  if (!/^[a-f0-9-]+\.(png|jpg|webp)$/.test(params.name))
    return new NextResponse(null, { status: 404 });
  try {
    const file = await readFile(
      `${process.cwd()}/public/uploads/${params.name}`,
    );
    const type = params.name.endsWith("png")
      ? "image/png"
      : params.name.endsWith("webp")
        ? "image/webp"
        : "image/jpeg";
    return new NextResponse(file, {
      headers: {
        "Content-Type": type,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
