import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req, { params }) {
  const { uid, taskId } = await params;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "Missing file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `fasttools/${uid}/task${taskId}`,
          public_id: "image",
          overwrite: true, // Reemplaza siempre
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
    console.error("Error uploading task image:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
export async function DELETE(req, { params }) {
  const { uid, taskId } = await params;

  try {
    const folderPath = `fasttools/${uid}/task${taskId}`; // 1. Borrar todos los archivos dentro de la carpeta

    const deleteResources = await cloudinary.api.delete_resources_by_prefix(
      folderPath
    );

    // 2. Borrar la carpeta vacía
    const deleteFolder = await cloudinary.api.delete_folder(folderPath);

    return Response.json(
      {
        message: "Task folder fully deleted",
        deletedFiles: deleteResources,
        deletedFolder: deleteFolder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting task folder:");
    return Response.json(
      { error: "Failed to delete task folder" },
      { status: 500 }
    );
  }
}
