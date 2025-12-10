import React, { useEffect, useRef, useState } from "react";
import styles from "../style.module.css";
import { Button } from "../ui/button";
import { IconPencil } from "@tabler/icons-react";
import { getAuth } from "firebase/auth";
import { useFireStore } from "@/store/fireStore";
import toast from "react-hot-toast";
import ColorGrill from "./colorGrill";
import { cn } from "@/lib/utils";
import ColorGrillMobile from "./colorGrillMobile";
import { Upload } from "lucide-react";

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
    setBackgrounType,
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
                outline: mode === "Theme" && "2px solid white",
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
            <Button
              style={{
                backgroundColor: theme,
                color: textTheme,
                outline: mode != "Theme" && "2px solid white",
              }}
              className={cn(mode === "Theme" && "opacity-50", "font-bold")}
              onClick={() => {
                setMode("Text");
              }}
            >
              TEXT
            </Button>
          </div>
          {mode === "Theme" && (
            <>
              {isDesktop ? (
                <div className=" w-full h-full items-center justify-center border-2 border-white rounded p-2 flex">
                  <ColorGrill
                    colors={colors}
                    theme={theme}
                    setTheme={setTheme}
                    mode={mode}
                  />
                </div>
              ) : (
                <div className="flex w-full h-full items-center justify-center border-2 border-white rounded p-2 ">
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
                <div className=" w-full h-full items-center justify-center border-2 border-white rounded p-2 flex ">
                  <ColorGrill
                    mode={mode}
                    colors={colors}
                    theme={textTheme}
                    setTheme={setTextTheme}
                  />
                </div>
              ) : (
                <div className="flex w-full h-full items-center justify-center border-2 border-white rounded p-2 ">
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
          <div className="flex w-full h-8 gap-2 items-center">
            <Button
              style={{
                backgroundColor: theme,
                color: textTheme,
                outline: !video && "2px solid white",
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
                outline: video && "2px solid white",
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
            <>
              <BackgroundVideo
                setBackgrounType={setBackgrounType}
                theme={theme}
                setBackground={setBackground}
                textTheme={textTheme}
              />
            </>
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
                      setBackgrounType={setBackgrounType}
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
  setBackgrounType,
  setBackground,
}) {
  const auth = getAuth();

  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const uid = auth.currentUser?.uid;
  const [videoUrl, setVideoUrl] = useState(null);
  async function load() {
    try {
      const res = await fetch("/api/get-background-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      const data = await res.json();

      if (data.exists) {
        setVideoUrl(data.url);
      }
    } catch (error) {
      console.error("Error loading video:", error);
    } finally {
      setIsLoading(false);
      console.log(isLoading);
    }
  }
  useEffect(() => {
    load();
  }, []);

  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      alert("Please select a valid video file.");
      return;
    }

    await uploadTemp(file);
  };

  const uploadTemp = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uid", uid);

    try {
      const res = await fetch("/api/upload-background-video", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setVideoUrl(data.secure_url);
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Error uploading video, try again later.");
    }
  };
  if (isLoading) {
    return (
      <div
        style={{ backgroundColor: theme, color: textTheme }}
        className="w-full h-40 flex rounded-xl items-center justify-center "
      >
        <div
          style={{ border: `2px solid ${textTheme}` }}
          className="animate-spin rounded-full h-6 w-6"
        ></div>
      </div>
    );
  }
  return (
    <div className="h-40 bg-black  overflow-hidden shadow-2xl flex items-center justify-center">
      {!videoUrl ? (
        <div className="text-center p-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="video-upload"
          />
          <label
            style={{ backgroundColor: theme, color: textTheme }}
            htmlFor="video-upload"
            className="px-8 py-4 rounded-lg font-semibold hover:opacity-70 select-none active:scale-110 duration-300 flex items-center gap-3 mx-auto cursor-pointer"
          >
            <Upload size={24} />
            Click to upload a video
          </label>
        </div>
      ) : (
        <div
          onClick={() => {
            setBackgrounType("video");
            setBackground(videoUrl);
          }}
          className="w-full h-full flex flex-col items-center justify-center"
        >
          <video
            ref={videoRef}
            src={videoUrl}
            className="max-h-32 md:max-h-[400px] max-w-full rounded"
          />
        </div>
      )}
    </div>
  );
}

function BackgroundImage({
  image,
  modo,
  textTheme,
  setBackground,
  setBackgrounType,
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
                setBackgrounType("image");
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
