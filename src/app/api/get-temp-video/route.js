import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const list = await cloudinary.search
      .expression(`folder:fasttools/${uid}/temp AND resource_type:video`)
      .sort_by("created_at", "desc")
      .max_results(1)
      .execute();

    if (list.resources.length === 0) {
      console.log("No video found for uid:", uid);
      return NextResponse.json({ exists: false });
    }

    console.log("✅ Video found:", list.resources[0].public_id);

    return NextResponse.json({
      exists: true,
      publicId: list.resources[0].public_id,
      url: list.resources[0].secure_url,
    });
  } catch (error) {
    console.error("Error fetching temp video:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
