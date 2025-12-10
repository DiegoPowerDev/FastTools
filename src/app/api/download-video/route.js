import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { uid, cutStart, cutEnd, format, fileName } = await request.json();

    const cloudinaryTransformations = `so_${cutStart},eo_${cutEnd},f_${format}`;
    const url = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/${cloudinaryTransformations}/fasttools/${uid}/temp/video.${format}`;

    // Descargar el video desde Cloudinary
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch video from Cloudinary");
    }

    const videoBuffer = await response.arrayBuffer();

    // Retornar el video con headers apropiados
    return new NextResponse(videoBuffer, {
      headers: {
        "Content-Type": `video/${format}`,
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading video:", error);
    return NextResponse.json(
      { error: "Failed to download video" },
      { status: 500 }
    );
  }
}
