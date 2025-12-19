import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req, { params }) {
  const { uid } = await params;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const slot = formData.get("slot");

    if (!file) {
      return Response.json({ error: "File missing" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `fasttools/${uid}`,
          public_id: `image${slot}`,
          overwrite: true,
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );

      stream.end(buffer);
    });

    return Response.json(uploadResult, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Error replacing image" }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const { uid } = await params;

    const result = await cloudinary.search
      .expression(`folder:fasttools/${uid}`)
      .sort_by("public_id", "asc")
      .execute();

    // Si ya hay imágenes, retornarlas
    console.log("Imágenes encontradas:", result.resources.length);
    result.resources.sort((a, b) => {
      const getNumber = (id) => {
        const match = id.match(/image(\d+)$/); // ⬅️ SOLO busca "imageN" al FINAL
        return match ? Number(match[1]) : 999;
      };

      return getNumber(a.public_id) - getNumber(b.public_id);
    });
    return Response.json(result.resources, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/upload:", error);
    return Response.json({ error: "Error fetching images" }, { status: 500 });
  }
}
