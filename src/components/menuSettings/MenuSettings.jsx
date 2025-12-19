import React, { useEffect, useRef, useState } from "react";
import styles from "../style.module.css";
import { Button } from "../ui/button";
import { IconPencil, IconPlus, IconVideoOff } from "@tabler/icons-react";
import { getAuth } from "firebase/auth";
import { useFireStore } from "@/store/fireStore";
import toast from "react-hot-toast";
import ColorGrill from "./colorGrill";
import { cn } from "@/lib/utils";
import ColorGrillMobile from "./colorGrillMobile";

export default function MenuSettings() {
  const {
    theme,
    setTheme,
    textTheme,
    setTextTheme,
    setBackground,
    setMobileBackground,
    images,
    setImages,
    colors,
    setBackgroundType,
  } = useFireStore();
  const [video, setVideo] = useState(false);
  const [editable, setEditable] = useState(false);
  const [mode, setMode] = useState("Text");
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="flex flex-col w-full h-full items-center justify-center md:pb-8">
      <div className="w-full flex flex-col gap-2 md:gap-4 items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <div className="flex w-full h-full gap-2 items-center">
            <Button
              style={{
                backgroundColor: theme,
                color: textTheme,
                outline:
                  mode != "Theme"
                    ? `2px solid ${textTheme}`
                    : `1px solid ${textTheme}40`,
              }}
              className={cn(mode === "Theme" && "opacity-50", "font-bold")}
              onClick={() => {
                setMode("Text");
              }}
            >
              TEXT
            </Button>
            <Button
              style={{
                backgroundColor: theme,
                color: textTheme,
                outline:
                  mode === "Theme"
                    ? `2px solid ${textTheme}`
                    : `1px solid ${textTheme}40`,
              }}
              className={cn(
                mode != "Theme" && "opacity-50",
                "hover:animate-in font-bold "
              )}
              onClick={() => {
                setMode("Theme");
              }}
            >
              THEME
            </Button>
          </div>
          {mode === "Theme" && (
            <>
              {isDesktop ? (
                <div
                  style={{ border: `1px solid ${textTheme}` }}
                  className=" w-full h-full items-center justify-center  rounded p-2 flex"
                >
                  <ColorGrill
                    colors={colors}
                    theme={theme}
                    setTheme={setTheme}
                    mode={mode}
                  />
                </div>
              ) : (
                <div
                  style={{ border: `1px solid ${textTheme}` }}
                  className="flex w-full h-full items-center justify-center  rounded p-2 "
                >
                  <ColorGrillMobile
                    colors={colors}
                    theme={theme}
                    setTheme={setTheme}
                    mode={mode}
                  />
                </div>
              )}
            </>
          )}
          {mode === "Text" && (
            <>
              {isDesktop ? (
                <div
                  style={{ border: `1px solid ${textTheme}` }}
                  className=" w-full h-full items-center justify-center rounded p-2 flex "
                >
                  <ColorGrill
                    mode={mode}
                    colors={colors}
                    theme={textTheme}
                    setTheme={setTextTheme}
                  />
                </div>
              ) : (
                <div
                  style={{ border: `1px solid ${textTheme}` }}
                  className="flex w-full h-full items-center justify-center rounded p-2 "
                >
                  <ColorGrillMobile
                    mode={mode}
                    colors={colors}
                    theme={textTheme}
                    setTheme={setTextTheme}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <div
            className=" w-full h-8 flex justify-between items-center gap-4"
            style={{ backgroundColor: theme, color: textTheme }}
          >
            <div></div>
            <div className="font-bold">SET BACKGROUND</div>
            <button className="bg-white text-black rounded h-10 w-10 items-center justify-center flex">
              <IconPencil
                onClick={() => setEditable(!editable)}
                className={editable && styles.pulse}
                size={40}
              />
            </button>
          </div>
          <div className="hidden md:flex w-full h-8 gap-2 items-center">
            <Button
              style={{
                backgroundColor: theme,
                color: textTheme,
                outline: !video
                  ? `2px solid ${textTheme}`
                  : `1px solid ${textTheme}40`,
              }}
              className={cn(
                video && "opacity-50",
                "hover:animate-in font-bold "
              )}
              onClick={() => {
                setVideo(false);
              }}
            >
              IMAGE
            </Button>
            <Button
              style={{
                backgroundColor: theme,
                color: textTheme,
                outline: video
                  ? `2px solid ${textTheme}`
                  : `1px solid ${textTheme}40`,
              }}
              className={cn(!video && "opacity-50", "font-bold")}
              onClick={() => {
                setVideo(true);
              }}
            >
              VIDEO
            </Button>
          </div>

          {video ? (
            <BackgroundVideo
              setBackgroundType={setBackgroundType}
              theme={theme}
              editable={editable}
              setBackground={setBackground}
              textTheme={textTheme}
            />
          ) : (
            <div className="w-full h-full grid md:grid-cols-4 md:grid-rows-3 grid-cols-2 place-content-center md:gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((e, i) => (
                <div
                  key={i}
                  className="w-full h-full flex items-center justify-center cursor-pointer"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <BackgroundImage
                      textTheme={textTheme}
                      image={images[e - 1]}
                      setImages={setImages}
                      modo={editable}
                      setBackgroundType={setBackgroundType}
                      slot={e}
                      setBackground={setBackground}
                      setMobileBackground={setMobileBackground}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function BackgroundVideo({
  theme,
  textTheme,
  setBackgroundType,
  setBackground,
  editable,
}) {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;
  const [videoUrl, setVideoUrl] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  async function load() {
    if (!uid) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/get-background-video/${uid}`);

      const data = await res.json();

      const list = Array(6).fill("");
      data.forEach((e) => {
        // extraer número de video desde la URL
        const match = e.secure_url.match(/video(\d)/);
        if (!match) return;

        const index = Number(match[1]) - 1;

        if (index >= 0 && index < 6) {
          list[index] = e.secure_url;
        }
      });
      console.log(data);
      setVideoUrl(list);
    } catch (error) {
      console.error("Error loading video:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [uid]);

  if (isLoading) {
    return (
      <div
        style={{ backgroundColor: theme, color: textTheme }}
        className="w-full h-20 flex rounded-xl items-center justify-center"
      >
        <div
          style={{ border: `2px solid ${textTheme}` }}
          className="animate-spin rounded-full h-6 w-6 border-t-transparent"
        ></div>
      </div>
    );
  }
  return (
    <div className="h-40 w-full bg-black overflow-hidden shadow-2xl flex items-center justify-center">
      <div className="w-full h-full grid grid-cols-3 grid-rows-2 gap-1">
        {[1, 2, 3, 4, 5, 6].map((e) => (
          <SimpleVideo
            uid={uid}
            theme={theme}
            videoUrl={videoUrl}
            isLoading={isLoading}
            textTheme={textTheme}
            setBackgroundType={setBackgroundType}
            setBackground={setBackground}
            editable={editable}
            key={e}
            id={e}
            setVideoUrl={setVideoUrl}
          />
        ))}
      </div>
    </div>
  );
}

function SimpleVideo({
  id,
  uid,
  theme,
  textTheme,
  setBackgroundType,
  setBackground,
  editable,
  videoUrl,
  setVideoUrl,
}) {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const uploadTemp = async (file) => {
    setLoading(true);
    try {
      // 1. Obtener firma del servidor
      const sigResponse = await fetch("/api/get-background-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, id }),
      });

      if (!sigResponse.ok) {
        throw new Error("Failed to get upload signature");
      }

      const {
        signature,
        timestamp,
        cloudName,
        apiKey,
        folder,
        publicId,
        eager,
        eager_async,
      } = await sigResponse.json();

      // 2. Subir directamente a Cloudinary CON optimizaciones
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("api_key", apiKey);
      formData.append("folder", folder);
      formData.append("public_id", publicId);
      formData.append("eager", eager); // 🚀 Transformaciones
      formData.append("eager_async", eager_async); // 🚀 Async processing

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      console.log("no error");
      if (!uploadResponse.ok) {
        console.log("error");
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const data = await uploadResponse.json();

      console.log("Upload response:", data);
      if (data.secure_url || data.url) {
        const url = data.secure_url || data.url;

        setVideoUrl((prev) => {
          const next = [...prev];
          next[id - 1] = url + `?t=${Date.now()}`; // 👈 cache-busting
          return next;
        });
      }
      if (data.secure_url || data.url) {
        toast.success("Background video uploaded and optimized!");
      } else {
        throw new Error("No URL returned from Cloudinary");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error(error.message || "Error uploading video, try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file.");
      return;
    }

    await uploadTemp(file);
    e.target.value = null; // Limpiar input
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: theme,
          color: textTheme,
          border: `1px solid ${textTheme}`,
        }}
        className="w-full h-20 flex rounded-xl items-center justify-center"
      >
        <div
          style={{ border: `2px solid ${textTheme}` }}
          className="animate-spin rounded-full h-6 w-6 border-t-transparent"
        ></div>
      </div>
    );
  }
  return (
    <>
      <div
        style={{ border: `1px solid ${textTheme}` }}
        onClick={() => {
          if (!editable && videoUrl[id - 1]) {
            setBackgroundType("video");
            setBackground(videoUrl[id - 1]);
            toast.success("Background video set!");
          }
        }}
        className={`border-2 border-white w-full h-full flex items-center justify-center ${
          !editable ? "cursor-pointer hover:opacity-80 transition-opacity" : ""
        }`}
      >
        <label
          htmlFor={editable ? `video-upload-${id}` : undefined}
          className="w-full h-full flex items-center justify-center"
        >
          {videoUrl[id - 1] ? (
            <video
              ref={videoRef}
              src={videoUrl[id - 1]}
              autoPlay
              loop
              muted
              playsInline
              crossOrigin="anonymous"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-xs opacity-50 select-none">
              {editable ? <IconPlus /> : <IconVideoOff />}
            </div>
          )}
        </label>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
        id={`video-upload-${id}`}
      />
    </>
  );
}

function BackgroundImage({
  image,
  modo,
  textTheme,
  setBackground,
  setBackgroundType,
  setMobileBackground,
  setImages,
  slot,
}) {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;
  const [localImage, setLocalImage] = useState(image);
  const [uploading, setUploading] = useState(false);

  async function replaceImage(file) {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("slot", slot);

      const res = await fetch(`/api/upload/${uid}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const data = await res.json();
      console.log("✅ Imagen reemplazada:", data);
      const localUrl = URL.createObjectURL(file);
      setImages(slot, localUrl);
      return data;
    } catch (error) {
      console.error("❌ Error replacing image:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  }

  const handleImage = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    // Preview inmediato
    const localUrl = URL.createObjectURL(file);
    setLocalImage(localUrl);

    try {
      const cloud = await replaceImage(file);

      // Después de Cloudinary, mostrar imagen final y actualizar el STORE
      if (cloud.secure_url) {
        setLocalImage(cloud.secure_url);
        setImages(slot, cloud.secure_url); // ← IMPORTANTE
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
    }
  };

  return (
    <>
      <div
        onClick={
          !modo
            ? () => {
                setBackgroundType("image");
                setBackground(localImage);
                toast((t) => (
                  <span className="flex items-center justify-center gap-4">
                    Updated background
                    <img className="h-8" src={localImage} />
                  </span>
                ));
              }
            : undefined
        }
        className="w-full h-full items-center justify-center relative hidden md:flex "
      >
        {modo && (
          <input
            type="file"
            id={`image${slot}`}
            className="hidden"
            onChange={handleImage}
            accept="image/png, image/jpeg"
            disabled={uploading}
          />
        )}

        <label
          htmlFor={modo ? `image${slot}` : undefined}
          className={`w-full h-12 flex items-center justify-center ${
            modo ? "cursor-pointer" : ""
          }`}
        >
          <img
            style={{
              border: modo && `1px solid ${textTheme}`,
              boxShadow: `0px 0px 1px ${textTheme}`,
              opacity: uploading ? 0.5 : 1,
            }}
            src={localImage || "icono.png"}
            alt={`Image ${slot}`}
            className="object-contain h-full w-full cursor-pointer"
          />

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </label>
      </div>
      <div
        onClick={
          !modo
            ? () => {
                setMobileBackground(localImage);
                toast((t) => (
                  <span className="flex items-center justify-center gap-4">
                    Updated background
                    <img className="h-8" src={localImage} />
                  </span>
                ));
              }
            : undefined
        }
        className="w-full h-full  items-center justify-center relative flex md:hidden"
      >
        {modo && (
          <input
            type="file"
            id={`image${slot}`}
            className="hidden"
            onChange={handleImage}
            accept="image/png, image/jpeg"
            disabled={uploading}
          />
        )}

        <label
          htmlFor={modo ? `image${slot}` : undefined}
          className={`w-full h-12 flex items-center justify-center ${
            modo ? "cursor-pointer" : ""
          }`}
        >
          {localImage && (
            <img
              style={{
                border: `${!modo ? "1" : "2"}px solid ${textTheme}`,

                opacity: uploading ? 0.5 : 1,
              }}
              src={localImage}
              alt={`Image ${slot}`}
              className="object-contain h-full w-full"
            />
          )}

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </label>
      </div>
    </>
  );
}
