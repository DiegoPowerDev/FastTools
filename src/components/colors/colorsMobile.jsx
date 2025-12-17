"use client";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import styles from "../style.module.css";
import { useRef, useEffect, useState } from "react";
import { IconBrush, IconDeviceFloppy, IconPencil } from "@tabler/icons-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function ColorsMobile({
  colors,
  setColors,
  theme,
  textTheme,
  setTheme,
  setTextTheme,
}) {
  const scrollRef = useRef(null);
  const [editable, setEditable] = useState(false);
  const [editForm, setEditForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [color, setColor] = useState("");
  const [nombre, setNombre] = useState("");

  const manageFormat = (color) => {
    if (!color) return "";
    if (color[0] === "#") {
      return color.slice(1, color.length);
    }
    return color;
  };

  const handleCopy = (color) => {
    navigator.clipboard.writeText("#" + color.color);
    toast((t) => (
      <span className="flex items-center justify-center gap-4">
        <IconBrush stroke={3} size={20} style={{ color: `#${color.color}` }} />
        Copied <b>#{color.color.toUpperCase()}</b>
        <div
          className="h-4 w-4"
          style={{
            backgroundColor: `#${color.color}`,
            border: `1px solid ${textTheme}`,
          }}
        ></div>
      </span>
    ));
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e) => {
      if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
        e.preventDefault();
        const scrollSpeed = 6;
        scrollContainer.scrollLeft += e.deltaY * scrollSpeed;
      }
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });
    return () => scrollContainer.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    if (!editForm) {
      setEditingIndex(null);
    }
  }, [editForm]);

  return (
    <div
      style={{ border: `2px solid ${theme}` }}
      className={`flex flex-col h-full rounded-xl overflow-hidden`}
    >
      <div
        style={{
          backgroundColor: theme,
        }}
        className={`relative h-14 items-center justify-center grid grid-cols-6 grid-rows-1 w-full`}
      >
        <div className="col-start-1 col-end-6 text-xl  w-full font-bold uppercase flex justify-center items-center">
          Colors
        </div>
        <button
          onClick={() => setEditable(!editable)}
          className={`col-start-6 col-end-7 flex justify-center w-12 h-5/6 rounded items-center absolute`}
        >
          <IconPencil
            color={textTheme}
            className={editable && styles.pulse}
            size={40}
          />
        </button>
      </div>
      <div
        style={{
          "--theme": textTheme,
          backgroundColor: `${theme}90`,
        }}
        className={`w-full flex-1 overflow-x-auto overflow-y-hidden `}
      >
        <div
          ref={scrollRef}
          className={` grid grid-rows-4 h-full grid-flow-col w-full p-4 overflow-x-auto ${styles.scrollContainer}`}
        >
          {colors.map((color, index) => (
            <div
              className="w-[200px]"
              key={color.id}
              onClick={() => {
                if (!editable && color.color) {
                  handleCopy(color);
                }
                if (editable) {
                  setEditingIndex(index);
                  setColor(color.color || "");
                  setNombre(color.nombre || "");
                  setEditForm(true);
                }
              }}
            >
              {(color.color || editable) && (
                <Color
                  color={color}
                  editable={editable}
                  theme={theme}
                  textTheme={textTheme}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <Dialog onOpenChange={setEditForm} open={editForm}>
        <DialogContent
          style={{ color: textTheme, backgroundColor: theme }}
          className="w-full bg-black border-white border-2 overflow-hidden"
        >
          <DialogTitle className="flex justify-center items-center font-bold">
            EDIT COLOR
          </DialogTitle>
          <DialogDescription className="hidden">
            Cuadro de edicion de color
          </DialogDescription>
          <div className="grid grid-cols-1 grid-rows-3 gap-8  p-4 h-full">
            <div className="flex flex-col gap-2">
              <label className="font-bold" htmlFor="nombre">
                NAME
              </label>
              <Input
                id="nombre"
                type="text"
                placeholder={
                  editingIndex !== null ? colors[editingIndex]?.nombre : ""
                }
                className="p-2 rounded placeholder:text-gray-500 placeholder:opacity-40"
                value={nombre}
                onChange={(e) => {
                  const nombre = e.target.value;
                  setNombre(nombre);
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold" htmlFor="color">
                COLOR
              </label>
              <div className="w-full h-full flex items-center gap-4">
                <div
                  className="w-8 h-8"
                  style={{
                    backgroundColor: `#${manageFormat(color)}`,
                    border: `1px solid ${theme}`,
                  }}
                ></div>
                <span className="flex justify-center items-center text-xl font-bold">
                  #
                </span>
                <Input
                  id="color"
                  maxLength={9}
                  className="p-2 w-40 rounded placeholder:opacity-40"
                  type="text"
                  placeholder={
                    editingIndex !== null ? colors[editingIndex]?.color : ""
                  }
                  value={color.toUpperCase()}
                  onChange={(e) => {
                    const color = e.target.value;
                    setColor(color);
                  }}
                />
              </div>
            </div>

            <div className="w-full h-full flex justify-center items-center gap-2">
              <Button
                variant="destructive"
                onClick={() => {
                  if (editingIndex !== null) {
                    setEditForm(false);
                    setColors(editingIndex, "", "");
                    setColor("");
                    setNombre("");
                    setEditingIndex(null);
                  }
                }}
              >
                DELETE
              </Button>
              <button
                style={{ backgroundColor: theme, color: textTheme }}
                onClick={() => {
                  if (editingIndex !== null) {
                    setColors(editingIndex, nombre, manageFormat(color));
                    setEditForm(false);
                  }
                }}
                className="hover:opacity-60 w-full p-2 rounded  font-bold duration-200 active:scale-105 active:border-2 active:border-white"
              >
                <div className="flex gap-2 items-center justify-center">
                  <span>SAVE</span> <IconDeviceFloppy />
                </div>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Color({ color, theme, editable, textTheme }) {
  const [hover, setHover] = useState(false);
  const borderStyle =
    hover && (color.color || editable)
      ? `2px solid ${textTheme}`
      : "2px solid transparent";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: borderStyle,
      }}
      className={`${
        (color.color || editable) && "cursor-pointer"
      } w-full h-12 flex text-white items-center gap-2 px-4 rounded-xl border-2 border-transparent`}
    >
      <div
        style={{
          backgroundColor: color.color && color.nombre ? `#${color.color}` : "",
          border: color.color
            ? `1px solid ${textTheme}`
            : editable
            ? `1px solid ${textTheme}`
            : "none",
        }}
        className="h-8 w-8 rounded flex-shrink-0"
      ></div>

      <h1
        style={{ color: textTheme, textShadow: `0 0 15px ${theme}` }}
        className="truncate select-none"
      >
        {color.nombre}
      </h1>
    </div>
  );
}
