import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export async function POST(req, { params }) {
  const { uid, taskId, noteId } = await params;
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "No file received" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subida a Cloudinary con nota estructurada
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: `fasttools/${uid}/task${taskId}/note${noteId}`,
          public_id: "image",
        },
        (error, result) => {
          if (error) return reject(error);

          resolve(
            Response.json({
              url: result.secure_url,
              publicId: result.public_id,
            })
          );
        }
      );

      upload.end(buffer);
    });
  } catch (error) {
    console.log(error);
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");
  const taskId = searchParams.get("taskId");
  const noteId = searchParams.get("noteId");

  const publicId = `fasttools/${uid}/task${taskId}/note-${noteId}`;

  try {
    const result = await cloudinary.uploader.destroy(publicId);

    return Response.json(
      { message: "Note image deleted", result },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: "Error deleting note image" },
      { status: 500 }
    );
  }
}
