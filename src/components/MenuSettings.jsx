import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { IconColorSwatch, IconPhoto, IconTextColor } from "@tabler/icons-react";
import { Input } from "./ui/input";

export default function MenuSettings({
  theme,
  setTheme,
  textTheme,
  setTextTheme,
  setBackground,
  background,
  mobileBackground,
  setMobileBackground,
}) {
  const [newTheme, setNewTheme] = useState("");
  const [newTextTheme, setNewTextTheme] = useState("");
  const [newBackground, setNewBackground] = useState("/icono.png");
  const [newMobileBackground, setNewMobileBackground] = useState("/icono.png");
  const manageFormat = (color) => {
    if (color[0] === "#") {
      console.log(color.slice(1, color.length));
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
    <div className="flex flex-col w-full h-full items-center justify-center">
      <div className="w-10/12 flex flex-col gap-8 items-center justify-center">
        <div className="w-full h-full flex items-center justify-center gap-2">
          <div
            style={{
              backgroundColor: `#${manageFormat(newTheme)}`,
            }}
            className="h-16 w-16 rounded "
          ></div>
          <div className="w-full">
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
          <div className="w-full">
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
        <div className="w-full h-full flex items-center justify-center gap-2">
          <picture className="max-h-32 max-w-32 rounded ">
            <source media="(max-width: 767px)" srcSet={newMobileBackground} />

            <source media="(min-width: 768px)" srcSet={newBackground} />

            {/* Fallback */}
            <img
              src={background}
              alt={"New Background"}
              className="max-h-32 max-w-32 rounded "
              fetchPriority="high"
            />
          </picture>

          <div className="w-full">
            <Input
              value={newBackground}
              onChange={(e) => setNewBackground(e.target.value)}
              className="md:block hidden"
            />
            <Button
              style={{ backgroundColor: theme, color: textTheme }}
              className="text-white w-full bg-black border-2 border-white md:flex hidden items-center justify-center gap-2"
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
            <Input
              value={newMobileBackground}
              onChange={(e) => setNewMobileBackground(e.target.value)}
              className="block md:hidden"
            />
            <Button
              style={{ backgroundColor: theme, color: textTheme }}
              className="text-white w-full bg-black border-2 border-white flex items-center justify-center gap-2 md:hidden"
              onClick={() => {
                if (newMobileBackground === "") {
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
      </div>
    </div>
  );
}
