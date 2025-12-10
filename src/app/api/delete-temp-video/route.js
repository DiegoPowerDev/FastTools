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
      return Response.json({ error: "uid required" }, { status: 400 });
    }

    const publicId = `fasttools/${uid}/temp/video`;

    const results = {};

    // Probar borrar como image, video y raw
    for (const resource_type of ["video", "image", "raw"]) {
      const res = await cloudinary.uploader.destroy(publicId, {
        resource_type,
      });

      results[resource_type] = res;
    }

    return Response.json({
      success: true,
      publicId,
      results,
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
