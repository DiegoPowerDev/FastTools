import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { uid } = await req.json();

    // 1. Construir el Public ID completo
    const specificPublicId = `fasttools/${uid}/video`;

    // 2. Usar la API para obtener los detalles del recurso
    const resource = await cloudinary.api.resource(specificPublicId, {
      // Especificamos el tipo de recurso para mayor precisión y eficiencia
      resource_type: "video",
    });

    // Si el recurso se encuentra, la llamada a la API tiene éxito.
    return Response.json({
      exists: true,
      publicId: resource.public_id,
      url: resource.secure_url,
    });
  } catch (error) {
    // Cloudinary lanza un error (404 Not Found) si el recurso no existe.
    if (error.http_code === 404) {
      return Response.json({ exists: false });
    }

    // Manejar otros errores
    console.error("Cloudinary API error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
