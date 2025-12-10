import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const uid = form.get("uid");

    if (!file || !uid) {
      return Response.json({ error: "Missing parameters" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 🚨 CAMBIO CLAVE AQUÍ 🚨
    const publicIdToDelete = `fasttools/${uid}/video`;

    await cloudinary.uploader.destroy(publicIdToDelete, {
      resource_type: "video",
    });

    const upload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `fasttools/${uid}`,
          public_id: "video",
          resource_type: "video",
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    return Response.json({
      success: true,
      publicId: upload.public_id,
      url: upload.secure_url,
    });
  } catch (error) {
    console.error("Cloudinary operation error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
