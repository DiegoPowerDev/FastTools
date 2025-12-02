"use client";

import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useDropzone } from "react-dropzone";
import { ImageUpscale } from "lucide-react";

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === "error"
          ? "bg-red-500 text-white"
          : type === "loading"
          ? "bg-blue-500 text-white"
          : "bg-green-500 text-white"
      }`}
    >
      {message}
    </div>
  );
};

export default function Conversor({ theme, textTheme }) {
  const canvasRef = useRef();
  const [preview, setPreview] = useState(null);
  const [webUrl, setWebpUrl] = useState(null);
  const [filename, setFilename] = useState("");
  const [format, setFormat] = useState("webp");
  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [aspectRatio, setAspectRatio] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const reset = () => {
    setPreview(null);
    setWebpUrl(null);
    setFilename("");
    setFormat("webp");
    setHeight("");
    setWidth("");
    setAspectRatio(null);
    setOriginalImage(null);
  };

  const handleImage = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.name.endsWith(".ico")) {
      showToast("Format ICO can't be converted", "error");
      return;
    }

    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setFilename(nameWithoutExt);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setPreview(img.src);
        setOriginalImage(img);
        setAspectRatio(img.width / img.height);
        setWidth(img.width);
        setHeight(img.height);
      };

      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!originalImage || !canvasRef.current) return;

    const parsedWidth = parseInt(width);
    const parsedHeight = parseInt(height);

    if (isNaN(parsedWidth) || isNaN(parsedHeight)) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = parsedWidth;
    canvas.height = parsedHeight;

    ctx.clearRect(0, 0, parsedWidth, parsedHeight);
    ctx.drawImage(originalImage, 0, 0, parsedWidth, parsedHeight);

    const mimeType = `image/${format}`;
    canvas.toBlob((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      setWebpUrl(blobUrl);
    }, mimeType);
  }, [format, width, height, originalImage]);

  // Configuración de react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        handleImage(acceptedFiles[0]);
      }
    },
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".svg"],
    },
    maxFiles: 1,
    noClick: false,
    noKeyboard: false,
  });

  // Función mejorada para generar ICO válido con múltiples tamaños
  const generateICO = async () => {
    const sizes = [16, 32, 48, 64, 128, 256];
    const images = [];

    for (const size of sizes) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = size;
      canvas.height = size;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(originalImage, 0, 0, size, size);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      const arrayBuffer = await blob.arrayBuffer();
      images.push({ size, data: new Uint8Array(arrayBuffer) });
    }

    // Construir el archivo ICO
    const header = new Uint8Array(6);
    const headerView = new DataView(header.buffer);
    headerView.setUint16(0, 0, true); // Reserved
    headerView.setUint16(2, 1, true); // Type: 1 = ICO
    headerView.setUint16(4, images.length, true); // Number of images

    const entries = [];
    let offset = 6 + images.length * 16;

    for (const img of images) {
      const entry = new Uint8Array(16);
      const entryView = new DataView(entry.buffer);

      entryView.setUint8(0, img.size === 256 ? 0 : img.size); // Width (0 = 256)
      entryView.setUint8(1, img.size === 256 ? 0 : img.size); // Height (0 = 256)
      entryView.setUint8(2, 0); // Color palette
      entryView.setUint8(3, 0); // Reserved
      entryView.setUint16(4, 1, true); // Color planes
      entryView.setUint16(6, 32, true); // Bits per pixel
      entryView.setUint32(8, img.data.length, true); // Image size
      entryView.setUint32(12, offset, true); // Offset to image data

      entries.push(entry);
      offset += img.data.length;
    }

    // Combinar todo
    const totalSize =
      6 +
      images.length * 16 +
      images.reduce((sum, img) => sum + img.data.length, 0);
    const icoData = new Uint8Array(totalSize);
    let position = 0;

    icoData.set(header, position);
    position += 6;

    for (const entry of entries) {
      icoData.set(entry, position);
      position += 16;
    }

    for (const img of images) {
      icoData.set(img.data, position);
      position += img.data.length;
    }

    return new Blob([icoData], { type: "image/x-icon" });
  };

  const descargar = async () => {
    if (
      !width ||
      !height ||
      isNaN(parseInt(width)) ||
      isNaN(parseInt(height))
    ) {
      showToast("Por favor ingresa una resolución válida.", "error");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    if (format === "ico") {
      try {
        showToast("Generando ICO con múltiples tamaños...", "loading");
        const icoBlob = await generateICO();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(icoBlob);
        link.download = `${filename}.ico`;
        link.click();
      } catch (error) {
        showToast("Error al generar el ICO: " + error.message, "error");
      }
      return;
    }

    // Otros formatos normales
    const mimeType = `image/${format}`;
    canvas.toBlob((blob) => {
      if (!blob) {
        showToast(
          `El formato "${format}" no es soportado por tu navegador.`,
          "error"
        );
        return;
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.${format}`;
      link.click();
    }, mimeType);
  };

  return (
    <div
      style={{ border: `2px solid ${theme}` }}
      className="bg-black/30 flex flex-col h-full rounded-xl overflow-hidden"
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div
        style={{
          backgroundColor: theme,
        }}
        className="relative h-14 items-center justify-center grid grid-cols-6 grid-rows-1 w-full"
      >
        <div className="col-start-1 col-end-6 text-xl w-full font-bold uppercase flex justify-center items-center">
          CONVERT IMAGE
        </div>
        <button
          onClick={() => reset()}
          className="active:scale-110 duration-200  md:col-start-6 border-2 border-black bg-white text-black font-bold md:col-end-7 flex justify-center items-center gap-4 p-2 rounded md:m-4 hover:opacity-80 cursor-pointer transition-opacity"
        >
          CLEAR
        </button>
      </div>

      <div
        className={`${
          webUrl
            ? "grid md:grid-cols-[5fr_1fr] grid-cols-1 grid-rows-[auto_auto] md:grid-rows-1"
            : "grid grid-cols-1 grid-rows-[5fr] w-full h-full"
        } justify-center items-center h-full`}
      >
        <label htmlFor="conversorInput" className="w-full h-full">
          <div className="md:col-span-1 h-full w-full flex justify-center items-center cursor-pointer">
            {preview ? (
              // 🖼️ Preview de Imagen Cargada
              <div className="w-full flex justify-center items-center p-4">
                <img
                  style={{ border: `2px solid ${theme}` }}
                  src={preview}
                  alt="Vista previa"
                  className="max-h-48 md:max-h-64 rounded"
                />
              </div>
            ) : (
              // 🖱️ Dropzone / Selector de Archivo
              <div
                {...getRootProps()}
                className="h-full w-full flex flex-col items-center justify-center bg-black/30"
                style={{ color: textTheme }}
              >
                <Input id="conversorInput" {...getInputProps()} />
                {isDragActive ? (
                  <div className="w-28">
                    <ImageUpscale
                      size={48}
                      style={{ color: textTheme }}
                      className="animate-bounce"
                    />
                  </div>
                ) : (
                  <div className="font-bold select-none opacity-60 text-xl">
                    SELECT OR DRAG IMAGE
                  </div>
                )}
              </div>
            )}
          </div>
        </label>

        {webUrl && (
          <div
            style={{
              color: theme,
            }}
            className="md:p-4 flex md:flex-col gap-2 h-full p-4"
          >
            <div
              style={{ color: textTheme }}
              className="flex h-full gap-4 md:flex-col md:py-2"
            >
              <div className="w-full flex flex-col items-center justify-center md:items-start">
                <p className="text-xl font-bold mb-2 hidden md:block">
                  FORMAT:
                </p>
                <Select
                  style={{ color: textTheme }}
                  value={format}
                  onValueChange={setFormat}
                >
                  <SelectTrigger
                    style={{ color: textTheme, border: `1px solid ${theme}` }}
                    className="w-[100px] md:w-[140px]"
                  >
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent
                    style={{ color: textTheme, backgroundColor: "black" }}
                  >
                    <SelectItem value="webp">WEBP</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="ico">ICO</SelectItem>
                    <SelectItem value="avif">AVIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col justify-center md:items-start w-full">
                <p className="text-xl font-bold mb-2 hidden md:block">
                  {format === "ico" ? "MAIN SIZE:" : "RESOLUTION:"}
                </p>

                <div className="flex w-full gap-2 text-center items-center">
                  <Input
                    name="width"
                    type="text"
                    style={{ color: textTheme }}
                    className="w-[70px] md:w-full text-center p-2 rounded"
                    value={width}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9.]/g, "");
                      const val = e.target.value;
                      setWidth(val);
                      if (val && aspectRatio) {
                        setHeight(Math.round(parseInt(val) / aspectRatio));
                      }
                    }}
                  />
                  <div className="text-white font-bold">X</div>
                  <Input
                    name="height"
                    type="text"
                    style={{ color: textTheme }}
                    className="w-[70px] md:w-full text-center p-2 rounded"
                    value={height}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9.]/g, "");
                      const val = e.target.value;
                      setHeight(val);
                      if (val && aspectRatio) {
                        setWidth(Math.round(parseInt(val) * aspectRatio));
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="h-full flex items-center justify-center md:mt-4">
              <button
                style={{
                  backgroundColor: theme,
                  color: textTheme,
                }}
                onClick={() => descargar()}
                className="flex text-center w-full active:scale-95 transition-transform border-white border-2 justify-center items-center font-bold p-3 rounded hover:opacity-80"
              >
                <div className="flex flex-col md:flex-row gap-2 items-center justify-center">
                  <span className="text-lg hidden md:block">DOWNLOAD</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                    <path d="M12 18h.01" />
                    <path d="M10 8v4l2 2 2-2V8" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
