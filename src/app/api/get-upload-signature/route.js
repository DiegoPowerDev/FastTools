import { NextResponse } from "next/server";
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
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    // Primero, eliminar videos previos
    try {
      await cloudinary.api.delete_resources_by_prefix(`fasttools/${uid}/temp`, {
        resource_type: "video",
      });
      console.log("✅ Previous videos deleted");
    } catch (deleteError) {
      console.log("No previous files to delete or error:", deleteError.message);
    }

    // Generar timestamp y firma
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `fasttools/${uid}/temp`;
    const publicId = "video"; // 🔥 Sin _temp

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        public_id: publicId,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    console.log("Generated signature for:", `${folder}/${publicId}`);

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      publicId,
    });
  } catch (error) {
    console.error("Signature generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
