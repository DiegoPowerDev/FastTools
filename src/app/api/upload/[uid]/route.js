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
    // Buscar imágenes dentro de la carpeta del usuario
    const result = await cloudinary.search
      .expression(`folder:fasttools/${uid}`)
      .sort_by("public_id", "asc")
      .execute();

    // Si no existen imágenes -> carpeta no existe -> crear con placeholder
    if (result.resources.length === 0) {
      const imagePath = path.join(process.cwd(), "public", "icono.png");
      const fileData = fs.readFileSync(imagePath);

      // Creamos 12 uploads en paralelo
      const uploads = Array.from({ length: 12 }, (_, i) => {
        const index = i + 1;

        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: `fasttools/${uid}`,
                public_id: `image${index}`,
              },
              (error, uploadResult) => {
                if (error) {
                  console.error(`Error subiendo image${index}:`, error);
                  reject(error);
                } else {
                  console.log(`image${index} subida:`, uploadResult.secure_url);
                  resolve(uploadResult);
                }
              }
            )
            .end(fileData);
        });
      });

      // Esperar a que terminen TODAS las subidas
      await Promise.all(uploads);

      console.log("Las 12 imágenes placeholder fueron subidas.");

      // AHORA SÍ volver a consultar después de que la subida termine
      const newResult = await cloudinary.search
        .expression(`folder:fasttools/${uid}`)
        .sort_by("public_id", "asc")
        .execute();

      console.log(
        "Imágenes después de crear placeholder:",
        newResult.resources.length
      );
      return Response.json(newResult.resources, { status: 200 });
    }

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
