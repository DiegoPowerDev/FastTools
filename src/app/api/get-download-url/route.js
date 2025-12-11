// /api/get-download-url.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { uid, cutStart, cutEnd, format, fileName } = await req.json();

    if (!uid || cutStart === undefined || cutEnd === undefined || !format) {
      return Response.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Construir las transformaciones como objeto (no string)
    const transformation = {
      start_offset: parseFloat(cutStart).toFixed(2),
      end_offset: parseFloat(cutEnd).toFixed(2),
      format: format,
    };

    // Public ID del video
    const publicId = `fasttools/${uid}/temp/video`;

    // Generar URL firmada con transformaciones
    const downloadUrl = cloudinary.url(publicId, {
      resource_type: "video",
      type: "upload",
      transformation: transformation,
      flags: "attachment", // Fuerza la descarga
      sign_url: true, // Firma la URL
      secure: true, // Usa HTTPS
    });

    return Response.json({
      success: true,
      downloadUrl,
      fileName: fileName || `video_trimmed_${Date.now()}.${format}`,
    });
  } catch (error) {
    console.error("Error generating download URL:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
