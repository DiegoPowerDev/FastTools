"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "react-hot-toast";
import { IconDeviceFloppy, IconPencil } from "@tabler/icons-react";
import styles from "../style.module.css";
import { useRef, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function LinksMobile({ links, setLinks, theme, textTheme }) {
  const scrollRef = useRef(null);
  const [editable, setEditable] = useState(false);
  const [editForm, setEditForm] = useState(false);
  const [id, setId] = useState(0);
  const [link, setLink] = useState("");
  const [nombre, setNombre] = useState("");
  const [icono, setIcono] = useState("");
  const [isValid, setIsValid] = useState(true);
  const groups = [];
  for (let i = 0; i < links.length; i += 8) {
    groups.push(links.slice(i, i + 8));
  }
  const groupsMobile = [];
  for (let i = 0; i < links.length; i += 4) {
    groupsMobile.push(links.slice(i, i + 4));
  }
  useEffect(() => {
    setIsValid(true);
  }, [icono]);
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e) => {
      if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
        e.preventDefault();
        const scrollSpeed = 5.5;
        scrollContainer.scrollLeft += e.deltaY * scrollSpeed;
      }
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });
    return () => scrollContainer.removeEventListener("wheel", handleWheel);
  }, []);
  useEffect(() => {
    if (!editForm) {
      setId(0);
    }
  }, [editForm]);
  return (
    <div
      style={{ border: `2px solid ${theme}` }}
      className={`flex flex-col h-full border- rounded-xl overflow-hidden`}
    >
      <div
        style={{
          backgroundColor: theme,
        }}
        className={`relative  h-14 items-center justify-center grid grid-cols-6 grid-rows-1 w-full`}
      >
        <div className="col-start-1 col-end-6 text-xl  w-full font-bold uppercase flex justify-center items-center">
          LINKS
        </div>
        <button
          style={{
            boxShadow: editable ? `0px 0px 5px 2px white` : "",
          }}
          onClick={() => setEditable(!editable)}
          className={`col-start-6 col-end-7 bg-white text-black flex justify-center w-12 h-5/6 rounded items-center absolute`}
        >
          <IconPencil className={editable && styles.pulse} size={40} />
        </button>
      </div>

      <div
        style={{
          "--theme": textTheme,
        }}
        className={`bg-black/30 w-full flex-1 overflow-x-auto overflow-y-hidden flex  justify-center items-center`}
      >
        <div
          ref={scrollRef}
          className={` grid grid-rows-4 h-full grid-flow-col w-full gap-x-2 p-4 overflow-x-auto ${styles.scrollContainer}`}
        >
          {links.map((link, e) => (
            <div className="w-[280px]" key={e}>
              {(link.link || editable) && (
                <a
                  className={editable ? "cursor-pointer" : "cursor-pointer"}
                  target="_blank"
                  {...(!editable && { href: link.link })}
                  onClick={() => {
                    if (editable) {
                      setId(link.id - 1);
                      setLink(link.link);
                      setNombre(link.nombre);
                      setEditForm(true);
                      setIcono(link.icono);
                    }
                  }}
                >
                  <LinkItem
                    link={link}
                    theme={theme}
                    editable={editable}
                    textTheme={textTheme}
                  />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
      <Dialog onOpenChange={setEditForm} open={editForm}>
        <DialogContent
          style={{ color: textTheme }}
          className="w-full h-fit bg-black border-white border-2 text-white overflow-hidden "
        >
          <DialogTitle className="font-bold flex justify-center items-center pt-2">
            EDIT LINKS
          </DialogTitle>
          <DialogDescription className="hidden">
            Cuadro de edicion de Links
          </DialogDescription>
          <div className="flex flex-col gap-4  p-4 h-full">
            <div className="flex w-full h-full items-center gap-4">
              <label className="font-bold" htmlFor="color">
                URL
              </label>

              <Input
                id="link"
                className="p-2 w-full rounded placeholder:opacity-40"
                type="text"
                placeholder={links[id].link || "URL"}
                value={link}
                onChange={(e) => {
                  const link = e.target.value;
                  setLink(link);
                }}
              />
            </div>
            <div className="flex w-full h-full items-center gap-4">
              <label className="font-bold" htmlFor="nombre">
                NAME
              </label>
              <Input
                id="nombre"
                type="text"
                placeholder={links[id].nombre || ""}
                className="p-2 rounded placeholder:text-gray-500 placeholder:opacity-40 "
                value={nombre}
                onChange={(e) => {
                  const nombre = e.target.value;
                  setNombre(nombre);
                }}
              />
            </div>
            <div className="flex flex-col gap-2 items-center justify-center">
              <div className="w-full h-full flex flex-col justify-center gap-4">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="h-16 w-16 flex items-center justify-center">
                    {icono && isValid && (
                      <img
                        src={icono}
                        alt="nuevo icono"
                        className="h-10 w-10"
                        onError={() => setIsValid(false)} // si falla → no mostrar
                        onLoad={() => setIsValid(true)} // si carga → mostrar
                      />
                    )}
                  </div>
                </div>
                <div className="flex w-full h-full items-center gap-4">
                  <label className="font-bold" htmlFor="icono">
                    ICON
                  </label>
                  <Input
                    id="icono"
                    type="text"
                    className="p-2 rounded placeholder:text-gray-500  placeholder:opacity-40"
                    placeholder="ICON URL"
                    value={icono}
                    onChange={(e) => {
                      const icono = e.target.value;
                      setIcono(icono);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="w-full h-full flex justify-center items-center pt-4 gap-4">
              <Button
                variant="destructive"
                onClick={() => {
                  setEditForm(false);
                  setLinks(id, "", "", "");
                  setId(0);
                  setNombre("");
                  setLink("");
                  setIcono("");
                }}
              >
                DELETE
              </Button>
              <button
                style={{ backgroundColor: theme, color: textTheme }}
                onClick={() => {
                  setLinks(id, nombre, link, icono);
                  setEditForm(false);
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
      <Toaster />
    </div>
  );
}

function LinkItem({ link, textTheme, editable }) {
  const [hover, setHover] = useState(false);
  const borderStyle =
    editable || (hover && link.link)
      ? `2px solid ${textTheme}`
      : "2px solid transparent";
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ color: textTheme, border: borderStyle }}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full h-12 flex px-2 bg-black items-center gap-2 rounded-xl duration-200"
    >
      <div className="h-12 w-12 rounded-l-md flex items-center justify-center flex-shrink-0">
        {link.icono && (
          <img
            className="flex items-center rounded-xl p-2 justify-center"
            src={link.icono}
            alt=""
          />
        )}
      </div>
      <h1 className="truncate select-none">{link.nombre}</h1>
    </div>
  );
}
