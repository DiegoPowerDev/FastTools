import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  console.log("hola");
  try {
    const { uid, id, file } = await req.json();

    if (!uid || !id || !file) {
      return Response.json(
        { error: "uid, id and file are required" },
        { status: 400 }
      );
    }
    const publicId = `fasttools/${uid}/video${id}`;

    const uploadResult = await cloudinary.uploader.upload(file, {
      resource_type: "video",
      public_id: publicId,
      overwrite: true, // 🔁 reemplazo explícito
      invalidate: true, // ♻️ limpia CDN
    });

    return Response.json(
      {
        success: true,
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading video:", error);
    return Response.json({ error: "Error uploading video" }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const { uid } = await params;
    // Buscar imágenes dentro de la carpeta del usuario
    const result = await cloudinary.search
      .expression(`folder:fasttools/${uid} AND resource_type:video`)
      .sort_by("public_id", "asc")
      .max_results(6)
      .execute();

    result.resources.sort((a, b) => {
      const getNumber = (id) => {
        const match = id.match(/video(\d+)$/); // ⬅️ SOLO busca "imageN" al FINAL
        return match ? Number(match[1]) : 6;
      };

      return getNumber(a.public_id) - getNumber(b.public_id);
    });
    return Response.json(result.resources, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/upload:", error);
    return Response.json({ error: "Error fetching images" }, { status: 500 });
  }
}
