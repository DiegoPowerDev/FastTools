import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { url } = await request.json();

    const response = await fetch(url);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${url.split("/").pop()}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
