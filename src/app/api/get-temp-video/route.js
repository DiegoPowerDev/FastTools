import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { uid } = await req.json();

    const list = await cloudinary.search
      .expression(`folder:fasttools/${uid}/temp AND resource_type:video`)
      .sort_by("created_at", "desc")
      .max_results(1)
      .execute();

    if (list.resources.length === 0) {
      return Response.json({ exists: false });
    }

    return Response.json({
      exists: true,
      publicId: list.resources[0].public_id,
      url: list.resources[0].secure_url,
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
