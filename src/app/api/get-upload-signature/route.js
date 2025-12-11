// /api/get-upload-signature.js
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return Response.json({ error: "Missing uid" }, { status: 400 });
    }

    // Primero, eliminar videos previos
    try {
      await cloudinary.api.delete_resources_by_prefix(`fasttools/${uid}/temp`);
    } catch (deleteError) {
      console.log("No previous files to delete or error:", deleteError);
    }

    // Generar timestamp y firma
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `fasttools/${uid}/temp`;
    const publicId = "video";

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        public_id: publicId,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    return Response.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      publicId,
    });
  } catch (error) {
    console.error("Signature generation error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
