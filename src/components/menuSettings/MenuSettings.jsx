import React, { useEffect, useRef, useState } from "react";
import styles from "../style.module.css";
import { Button } from "../ui/button";
import { IconColorSwatch, IconPencil } from "@tabler/icons-react";
import { Input } from "../ui/input";
import { getAuth } from "firebase/auth";
import { useFireStore } from "@/store/fireStore";

export default function MenuSettings() {
  const {
    theme,
    setTheme,
    textTheme,
    setTextTheme,
    setBackground,
    background,
    mobileBackground,
    setMobileBackground,
    images,
    loadingBackground,
    setImages,
  } = useFireStore();

  const [newTheme, setNewTheme] = useState("");
  const [newTextTheme, setNewTextTheme] = useState("");
  const [editable, setEditable] = useState(false);
  const [newBackground, setNewBackground] = useState("/icono.png");
  const [newMobileBackground, setNewMobileBackground] = useState("/icono.png");

  const manageFormat = (color) => {
    if (color[0] === "#") {
      return color.slice(1, color.length);
    }
    return color;
  };

  useEffect(() => {
    setNewTheme(theme);
    setNewTextTheme(textTheme);
    setNewBackground(background);
    setNewMobileBackground(mobileBackground);
  }, []);

  return (
    <div className="flex flex-col w-full h-full items-center justify-center pb-8">
      <div className="w-full flex flex-col gap-8 items-center justify-center">
        <div className="w-full h-full flex items-center justify-center gap-2">
          <div
            style={{
              backgroundColor: `#${manageFormat(newTheme)}`,
            }}
            className="h-16 w-16 rounded "
          ></div>
          <div className="w-6/12">
            <Input
              value={newTheme}
              onChange={(e) => setNewTheme(e.target.value)}
            />
            <Button
              style={{ backgroundColor: theme, color: textTheme }}
              className="text-white w-full bg-black border-2 border-white"
              onClick={() => {
                if (newTheme === "") {
                  setTheme(manageFormat("#b91c1c"));
                } else {
                  setTheme(manageFormat(newTheme));
                }
              }}
            >
              <IconColorSwatch />
              SET THEME COLOR
            </Button>
          </div>
        </div>

        <div className="w-full h-full flex items-center justify-center gap-2">
          <div
            style={{
              backgroundColor: `#${manageFormat(newTextTheme)}`,
            }}
            className="h-16 w-16 rounded "
          ></div>
          <div className="w-6/12">
            <Input
              value={newTextTheme}
              onChange={(e) => setNewTextTheme(e.target.value)}
            />
            <Button
              style={{ backgroundColor: theme, color: textTheme }}
              className="text-white w-full bg-black border-2 border-white"
              onClick={() => {
                if (newTextTheme === "") {
                  setTextTheme(manageFormat("#fafafa"));
                } else {
                  setTextTheme(manageFormat(newTextTheme));
                }
              }}
            >
              <IconColorSwatch />
              SET TEXT COLOR
            </Button>
          </div>
        </div>

        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <div
            className=" w-full h-full flex justify-between items-center gap-4"
            style={{ backgroundColor: theme, color: textTheme }}
          >
            <div></div>
            <div>SET BACKGROUND</div>
            <button className="bg-white text-black rounded h-10 w-10 items-center justify-center flex">
              <IconPencil
                onClick={() => setEditable(!editable)}
                className={editable && styles.pulse}
                size={40}
              />
            </button>
          </div>
          {loadingBackground ? (
            <div>loadingBackground</div>
          ) : (
            <div className="w-full h-full grid grid-cols-4 grid-rows-3 place-content-center gap-2">
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

function BackgroundImage({
  image,
  modo,
  textTheme,
  setBackground,
  setMobileBackground,
  setImages,
  slot,
}) {
  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  const [localImage, setLocalImage] = useState(image); // 👈 importante
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
    setLocalImage(localUrl); // 👈 ESTO SÍ re-renderiza

    try {
      const cloud = await replaceImage(file);

      // Después de Cloudinary, mostrar la imagen definitiva
      if (cloud.secure_url) {
        setLocalImage(cloud.secure_url);
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
    }
  };

  return (
    <div
      onClick={
        !modo
          ? () => {
              setBackground(localImage);
              setMobileBackground(localImage);
            }
          : undefined
      }
      className="w-full h-full flex items-center justify-center relative"
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
              border: modo && `1px solid ${textTheme}`,
              boxShadow: `0px 0px 1px ${textTheme}`,
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
  );
}
