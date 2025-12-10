"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { BrushCleaningIcon, ImageUpscale } from "lucide-react";
import { IconDeviceFloppy } from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function ImageCropper({ theme, textTheme }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageName, setImageName] = useState("image");
  const [format, setFormat] = useState("png");
  const [imageReady, setImageReady] = useState(false);
  const [crop, setCrop] = useState({
    unit: "%",
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });

  const imgRef = useRef(null);
  const prevObjectUrl = useRef(null);

  // cleanup previous object URL when new file loaded or component unmounts
  useEffect(() => {
    return () => {
      if (prevObjectUrl.current) URL.revokeObjectURL(prevObjectUrl.current);
    };
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles?.[0];
    if (!file) return;
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setImageName(nameWithoutExt);
    const ext = file.type.split("/")[1] || "png";
    setFormat(ext.toLowerCase());
    // revoke previous
    if (prevObjectUrl.current) URL.revokeObjectURL(prevObjectUrl.current);

    const url = URL.createObjectURL(file);
    prevObjectUrl.current = url;
    setImageUrl(url);

    // reset states
    setImageReady(false);
    // keep default crop, but ensure x/y exist
    setCrop((c) => ({
      unit: c.unit || "%",
      x: c.x ?? 25,
      y: c.y ?? 25,
      width: c.width ?? 50,
      height: c.height ?? 50,
    }));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  // Called when <img> finishes loading in the DOM
  const onImgLoad = (e) => {
    const img = e.currentTarget;
    imgRef.current = img;
    setImageReady(true);

    // If crop lacks x/y (shouldn't), set sane defaults centered
    setCrop((prev) => ({
      unit: prev.unit || "%",
      x: prev.x ?? 25,
      y: prev.y ?? 25,
      width: prev.width ?? 50,
      height: prev.height ?? 50,
    }));
  };

  // convert the current crop to pixel coordinates relative to natural image size
  const getPixelCrop = (cropObj, image) => {
    if (!image || !cropObj) return null;

    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    let x, y, widthPx, heightPx;

    if (cropObj.unit === "%") {
      x = (cropObj.x / 100) * naturalWidth;
      y = (cropObj.y / 100) * naturalHeight;
      widthPx = (cropObj.width / 100) * naturalWidth;
      heightPx = (cropObj.height / 100) * naturalHeight;
    } else {
      // assume px units
      // If crop coordinates are relative to rendered image, scale them to natural
      const displayedWidth = image.width || image.naturalWidth;
      const displayedHeight = image.height || image.naturalHeight;
      const scaleX = naturalWidth / displayedWidth;
      const scaleY = naturalHeight / displayedHeight;
      x = (cropObj.x || 0) * scaleX;
      y = (cropObj.y || 0) * scaleY;
      widthPx = (cropObj.width || 0) * scaleX;
      heightPx = (cropObj.height || 0) * scaleY;
    }

    // clamp to image bounds
    x = Math.max(0, Math.min(x, naturalWidth));
    y = Math.max(0, Math.min(y, naturalHeight));
    widthPx = Math.max(1, Math.min(widthPx, naturalWidth - x));
    heightPx = Math.max(1, Math.min(heightPx, naturalHeight - y));

    return {
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(widthPx),
      height: Math.round(heightPx),
    };
  };

  const canvasToBlob = (canvas, mime, quality) =>
    new Promise((resolve) => {
      if (canvas.toBlob) {
        canvas.toBlob((b) => resolve(b), mime, quality);
      } else {
        // fallback
        const dataUrl = canvas.toDataURL(mime, quality);
        const byteString = atob(dataUrl.split(",")[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++)
          ia[i] = byteString.charCodeAt(i);
        resolve(new Blob([ab], { type: mime }));
      }
    });

  const downloadCroppedImage = async (alsoReturnBase64 = false) => {
    if (!imgRef.current || !crop.width || !crop.height || !imageReady) return;

    const pixelCrop = getPixelCrop(crop, imgRef.current);
    if (!pixelCrop) return;

    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    const ctx = canvas.getContext("2d");
    // draw the portion from the natural image
    ctx.drawImage(
      imgRef.current,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    const mime = `image/${format}`;
    const blob = await canvasToBlob(canvas, mime, 1);
    if (alsoReturnBase64) {
      return canvas.toDataURL(mime);
    }
    // download
    const link = document.createElement("a");
    link.download = `${imageName}.${format}`;
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    link.remove();

    // optionally return base64
  };

  const reset = () => {
    if (prevObjectUrl.current) {
      URL.revokeObjectURL(prevObjectUrl.current);
      prevObjectUrl.current = null;
    }
    setImageUrl(null);
    setImageName("image");
    setImageReady(false);
    setCrop({ unit: "%", x: 25, y: 25, width: 50, height: 50 });
    imgRef.current = null;
  };

  return (
    <div
      style={{ border: `2px solid ${theme}` }}
      className="flex flex-col h-full rounded-xl overflow-hidden"
    >
      <div
        style={{
          backgroundColor: theme,
        }}
        className={`relative  h-14 items-center justify-center flex px-2  w-full`}
      >
        <div className="w-12 p-2"></div>
        <div className="text-xl  w-full font-bold uppercase flex justify-center items-center">
          IMAGE CROPPER
        </div>
        <button
          aria-label="clean"
          onClick={() => reset()}
          className="active:scale-110 duration-200  border-2 bg-white text-black border-black font-bold  flex justify-center items-center gap-4 p-2 rounded hover:opacity-80"
        >
          <BrushCleaningIcon size={30} />
        </button>
      </div>
      <label htmlFor="ImageToCrop">
        <input {...getInputProps()} id="ImageToCrop" className="hidden" />
      </label>
      {!imageUrl ? (
        <div
          {...getRootProps()}
          className="h-full bg-black/30 cursor-pointer w-full flex gap-4 items-center justify-center"
        >
          <div className="h-full w-full flex flex-col items-center justify-center font-bold">
            {isDragActive ? (
              <div className="w-28">
                <ImageUpscale
                  size={48}
                  style={{ color: textTheme }}
                  className="animate-bounce"
                />
              </div>
            ) : (
              <div
                style={{ color: textTheme }}
                className="font-bold select-none opacity-60 text-xl"
              >
                SELECT OR DRAG IMAGE
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-black/20 h-full grid md:grid-cols-4 grid-cols-1 grid-rows-[auto_auto] md:grid-rows-1 justify-center items-center gap-4 p-4">
          <div className="md:col-span-3 w-full flex justify-center items-start h-full">
            <div className="w-full max-w-full flex items-center justify-center h-full">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCrop(c)}
                keepSelection={true}
                className="max-h-64 object-contain border rounded"
              >
                <img
                  src={imageUrl}
                  alt="to crop"
                  ref={imgRef}
                  onLoad={onImgLoad}
                  className="h-full w-full "
                />
              </ReactCrop>
            </div>
          </div>

          <div
            style={{ color: textTheme }}
            className="md:col-span-1 flex md:flex-col gap-4 items-center"
          >
            <div className="w-full flex flex-col gap-2">
              <Button
                style={{ backgroundColor: theme, color: textTheme }}
                disabled={!imageReady}
                onClick={async () => {
                  const base64 = await downloadCroppedImage(true);
                  if (!base64) return;

                  try {
                    await navigator.clipboard.writeText(base64);
                    toast("Base64 copied!");
                  } catch {
                    console.log("Could not copy. Base64 generated.");
                  }
                }}
              >
                COPY BASE64
              </Button>
              <Button
                disabled={!imageReady}
                onClick={() => downloadCroppedImage(false)}
                style={{ backgroundColor: theme, color: textTheme }}
                className="hover:opacity-80 w-full"
              >
                <div className="flex gap-2 items-center justify-center">
                  <span className="">DOWNLOAD</span>
                  <IconDeviceFloppy size={18} />
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
