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

    // Eliminar el archivo previo (si existe)
    await cloudinary.api.delete_resources_by_prefix(`fasttools/${uid}/temp`);

    // Subir el nuevo video
    const upload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `fasttools/${uid}/temp`,
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
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
