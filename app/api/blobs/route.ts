import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({
      mode: "catalog",
      total: 33000,
      note: "Set BLOB_READ_WRITE_TOKEN to list files under meta-image/. The gallery itself is the accession index and does not need the token.",
    });
  }

  const { list } = await import("@vercel/blob");
  const cursor = new URL(request.url).searchParams.get("cursor") ?? undefined;
  const page = await list({ prefix: "meta-image/", limit: 100, cursor, token });

  return NextResponse.json({
    mode: "blob",
    hasMore: page.hasMore,
    cursor: page.cursor,
    blobs: page.blobs.map((blob) => ({ url: blob.url, pathname: blob.pathname })),
  });
}
