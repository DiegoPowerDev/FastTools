import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { IconColorSwatch } from "@tabler/icons-react";
import { Input } from "../ui/input";
import ColorGrillMobile from "./colorGrillMobile";
import { cn } from "@/lib/utils";
import ColorGrill from "./colorGrill";

export default function MenuSettingsBasic({
  colors,
  theme,
  setTheme,
  textTheme,
  setTextTheme,
  setBackground,
  background,
  mobileBackground,
  setMobileBackground,
}) {
  const [newBackground, setNewBackground] = useState("/background.webp");
  const [newMobileBackground, setNewMobileBackground] =
    useState("/background.webp");
  const [mode, setMode] = useState("Theme");
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setNewBackground(background);
  }, []);

  return (
    <div className="flex flex-col w-full h-full items-center justify-center">
      <div className="w-full flex flex-col gap-8 items-center justify-center">
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
        {isDesktop ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <img
              src={background}
              alt={"New Background"}
              className="max-h-40 max-w-64 rounded "
              fetchPriority="high"
            />

            <div className="w-5/6">
              <Input
                value={newBackground}
                onChange={(e) => setNewBackground(e.target.value)}
              />
              <Button
                style={{ backgroundColor: theme, color: textTheme }}
                className="text-white w-full bg-black border-2 border-white flex  items-center justify-center gap-2"
                onClick={() => {
                  if (newBackground === "") {
                    setBackground("/icono.png");
                  } else {
                    setBackground(newBackground);
                  }
                }}
              >
                <IconColorSwatch />
                SET WALLPAPER
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            {mobileBackground && (
              <img
                src={mobileBackground}
                alt={"New Background"}
                className="max-h-40 max-w-64 rounded "
                fetchPriority="high"
              />
            )}

            <div className="w-5/6">
              <Input
                value={newMobileBackground}
                onChange={(e) => setNewMobileBackground(e.target.value)}
              />
              <Button
                style={{ backgroundColor: theme, color: textTheme }}
                className="text-white w-full bg-black border-2 border-white flex  items-center justify-center gap-2"
                onClick={() => {
                  if (newBackground === "") {
                    setMobileBackground("/icono.png");
                  } else {
                    setMobileBackground(newMobileBackground);
                  }
                }}
              >
                <IconColorSwatch />
                SET WALLPAPER
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
