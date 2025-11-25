import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { IconColorSwatch } from "@tabler/icons-react";
import { Input } from "../ui/input";

export default function MenuSettingsBasic({
  theme,
  setTheme,
  textTheme,
  setTextTheme,
  setBackground,
  background,
}) {
  const [newTheme, setNewTheme] = useState("");
  const [newTextTheme, setNewTextTheme] = useState("");
  const [newBackground, setNewBackground] = useState("/background.webp");
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
  }, []);

  return (
    <div className="flex flex-col w-full h-full items-center justify-center">
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
      </div>
    </div>
  );
}
