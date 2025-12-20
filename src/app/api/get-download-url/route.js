import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función para esperar a que Cloudinary termine de procesar
async function waitForCloudinaryProcessing(url, maxAttempts = 15) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url, { method: "HEAD" });

      if (response.status === 200) {
        console.log(`✅ Video ready after ${i + 1} attempt(s)`);
        return true;
      }

      if (response.status === 423) {
        console.log(
          `⏳ Video still processing (attempt ${i + 1}/${maxAttempts})...`
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
        continue;
      }

      if (response.status === 404) {
        if (i === 0) {
          throw new Error("VIDEO_NOT_FOUND");
        }
        console.log(
          `⏳ 404 detected, video might be processing (attempt ${i + 1})...`
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
        continue;
      }

      if (response.status === 400) {
        throw new Error("INVALID_TRANSFORMATION");
      }

      console.error(`❌ Unexpected status: ${response.status}`);
      throw new Error(`Unexpected status: ${response.status}`);
    } catch (error) {
      if (
        error.message === "VIDEO_NOT_FOUND" ||
        error.message === "INVALID_TRANSFORMATION"
      ) {
        throw error;
      }
      if (i === maxAttempts - 1) {
        console.error("❌ Max attempts reached");
        throw error;
      }
      console.log(`⚠️ Attempt ${i + 1} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  throw new Error("Timeout waiting for video processing");
}

export async function POST(req) {
  try {
    const { uid, cutStart, cutEnd, format, fileName } = await req.json();

    if (!uid || cutStart === undefined || cutEnd === undefined || !format) {
      return NextResponse.json(
        { error: "Missing required parameters: uid, cutStart, cutEnd, format" },
        { status: 400 }
      );
    }

    const publicId = `fasttools/${uid}/temp/video`;

    console.log("Processing video download:", {
      publicId,
      cutStart,
      cutEnd,
      format,
    });

    // Verificar que el video existe y obtener info
    let videoInfo;
    try {
      videoInfo = await cloudinary.api.resource(publicId, {
        resource_type: "video",
      });
      console.log("✅ Video exists:", {
        public_id: videoInfo.public_id,
        format: videoInfo.format,
        duration: videoInfo.duration,
      });
    } catch (error) {
      console.error("❌ Video not found in Cloudinary:", publicId);
      return NextResponse.json(
        {
          error: "Video not found. Please upload a video first.",
          publicId,
        },
        { status: 404 }
      );
    }

    // Validar que cutStart y cutEnd están dentro de la duración
    const videoDuration = videoInfo.duration;
    const start = parseFloat(cutStart);
    const end = parseFloat(cutEnd);

    if (start >= videoDuration || end > videoDuration || start >= end) {
      return NextResponse.json(
        {
          error: `Invalid time range. Video duration is ${videoDuration.toFixed(
            2
          )}s`,
        },
        { status: 400 }
      );
    }

    // Configuración simplificada por formato
    const formatConfig = {
      mp4: {
        format: "mp4",
        quality: "auto",
      },
      webm: {
        format: "webm",
        quality: "auto",
      },
      gif: {
        format: "gif",
        width: 480,
        fps: 15,
      },
    };

    const config = formatConfig[format] || formatConfig.mp4;

    // Construir transformaciones de manera más simple
    const transformationArray = [
      {
        start_offset: start.toFixed(2),
        end_offset: end.toFixed(2),
        ...config,
      },
    ];

    console.log("Transformation config:", transformationArray[0]);

    // Generar URL sin firma primero para probar
    const downloadUrl = cloudinary.url(publicId, {
      resource_type: "video",
      type: "upload",
      transformation: transformationArray,
      secure: true,
    });

    console.log("Generated download URL:", downloadUrl);

    // Esperar a que Cloudinary termine de procesar
    try {
      await waitForCloudinaryProcessing(downloadUrl);
    } catch (error) {
      if (error.message === "VIDEO_NOT_FOUND") {
        return NextResponse.json(
          {
            error: "Video not found. The video might have been deleted.",
            publicId,
          },
          { status: 404 }
        );
      }

      if (error.message === "INVALID_TRANSFORMATION") {
        return NextResponse.json(
          {
            error:
              "Invalid video transformation. The video format might not support this operation.",
            suggestion: "Try with MP4 format or different time range.",
          },
          { status: 400 }
        );
      }

      console.error("⏰ Processing timeout:", error);
      return NextResponse.json(
        {
          error:
            "Video is still processing. Please try again in a few seconds.",
          code: "PROCESSING_TIMEOUT",
        },
        { status: 423 }
      );
    }

    console.log("✅ Video ready for download");

    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName: fileName || `video_trimmed_${Date.now()}.${format}`,
    });
  } catch (error) {
    console.error("❌ Error generating download URL:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to generate download URL",
        details:
          process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
