"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconDeviceFloppy,
  IconEye,
  IconEyeClosed,
  IconPencil,
} from "@tabler/icons-react";
import styles from "../style.module.css";
import { useRef, useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

/* -----------------------
  SortableItem (used when editable === true)
------------------------ */
function SortableLinkItem({
  link,
  onClick,
  theme,
  textTheme,
  displayLinks,
  editable,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(link.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const clickTimerRef = useRef(null);
  const moved = useRef(false);

  const handlePointerDown = (e) => {
    moved.current = false;
    clickTimerRef.current = setTimeout(() => {
      if (listeners && typeof listeners.onPointerDown === "function") {
        listeners.onPointerDown(e);
      }
    }, 10);
  };

  const handlePointerMove = () => {
    moved.current = true;
    clearTimeout(clickTimerRef.current);
  };

  const handlePointerUp = (e) => {
    clearTimeout(clickTimerRef.current);
    if (!moved.current) {
      onClick();
    }
  };

  return (
    <>
      {!displayLinks && link.nombre ? (
        <TooltipProvider delayDuration={1}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                ref={setNodeRef}
                style={style}
                className={cn(!displayLinks ? "w-full" : "w-[290px]")}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                {...attributes}
              >
                <LinkItemInner
                  link={link}
                  editable={editable}
                  theme={theme}
                  textTheme={textTheme}
                  displayLinks={displayLinks}
                />
              </div>
            </TooltipTrigger>

            <TooltipContent>
              <p>{link.nombre}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div
          ref={setNodeRef}
          style={style}
          className={cn(!displayLinks ? "w-full" : "w-[290px]")}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          {...attributes}
        >
          <LinkItemInner
            link={link}
            editable={editable}
            theme={theme}
            textTheme={textTheme}
            displayLinks={displayLinks}
          />
        </div>
      )}
    </>
  );
}

/* -----------------------
  StaticItem (used when editable === false)
------------------------ */
function StaticLinkItem({ link, onClick, theme, textTheme, displayLinks }) {
  return (
    <>
      {!displayLinks && link.nombre ? (
        <TooltipProvider delayDuration={1}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(!displayLinks ? "w-full" : "w-[290px]")}
                onClick={onClick}
              >
                <LinkItemInner
                  link={link}
                  displayLinks={displayLinks}
                  theme={theme}
                  textTheme={textTheme}
                />
              </div>
            </TooltipTrigger>

            <TooltipContent>
              <p>{link.nombre}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div
          className={cn(!displayLinks ? "w-full" : "w-[290px]")}
          onClick={onClick}
        >
          <LinkItemInner
            link={link}
            displayLinks={displayLinks}
            theme={theme}
            textTheme={textTheme}
          />
        </div>
      )}
    </>
  );
}

/* -----------------------
  Inner rendering of a link item
------------------------ */
function LinkItemInner({ link, textTheme, displayLinks, editable }) {
  const [hover, setHover] = useState(false);
  const borderStyle =
    editable || (hover && link.link && link.nombre)
      ? `1px solid ${textTheme}`
      : "";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        color: textTheme,
        outline: editable ? borderStyle : hover ? borderStyle : "",
      }}
      className={cn(
        " h-12 flex  items-center gap-2  rounded-xl duration-200 w-full",
        (link.link || editable) && "bg-black  cursor-pointer",
        displayLinks && "px-2"
      )}
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
      {displayLinks && <h1 className="font-medium truncate">{link.nombre}</h1>}
    </div>
  );
}

/* -----------------------
  Grid component - FIXED VERSION
------------------------ */
function LinksGrid({
  links,
  moveLink,
  editable,
  setEditForm,
  setEditingIndex,
  setLink,
  setNombre,
  setIcono,
  theme,
  textTheme,
  displayLinks,
}) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => String(l.id) === String(active.id));
    const newIndex = links.findIndex((l) => String(l.id) === String(over.id));

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    // ✅ Usa moveLink para reordenar
    if (moveLink) {
      moveLink(oldIndex, newIndex);
    }
  };

  const handleItemClick = (link, index) => {
    if (!editable) {
      if (link.link) {
        window.open(link.link, "_blank");
      }
    } else {
      // ✅ CAMBIO CLAVE: Guardamos el índice real del array, no el ID
      setEditingIndex(index);
      setLink(link.link || "");
      setNombre(link.nombre || "");
      setIcono(link.icono || "");
      setEditForm(true);
    }
  };
  const visibleLinks = links.slice(
    0,
    links.map((c) => (c.link || c.nombre) !== "").lastIndexOf(true) + 1
  );
  if (editable) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={links.map((l) => String(l.id))}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid h-full grid-rows-4 grid-flow-col w-full gap-4 p-2 ">
            {links.map((l, index) => (
              <div key={l.id} className={cn("h-full w-full")}>
                <SortableLinkItem
                  displayLinks={displayLinks}
                  link={l}
                  editable={editable}
                  onClick={() => handleItemClick(l, index)}
                  theme={theme}
                  textTheme={textTheme}
                />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <div className="grid grid-rows-4 grid-flow-col h-full w-full gap-4 p-2 ">
      {visibleLinks.map((l, index) => (
        <div key={l.id} className={cn("h-full w-full")}>
          <StaticLinkItem
            displayLinks={displayLinks}
            link={l}
            onClick={() => handleItemClick(l, index)}
            theme={theme}
            textTheme={textTheme}
          />
        </div>
      ))}
    </div>
  );
}

/* -----------------------
  Main Links component
------------------------ */
export default function Links({
  links,
  setLinks,
  moveLink,
  theme,
  textTheme,
  setDisplayLinks,
  displayLinks,
}) {
  const scrollRef = useRef(null);
  const [editable, setEditable] = useState(false);
  const [editForm, setEditForm] = useState(false);
  // ✅ CAMBIO: Ahora guardamos el índice del array, no el ID
  const [editingIndex, setEditingIndex] = useState(null);
  const [link, setLink] = useState("");
  const [nombre, setNombre] = useState("");
  const [icono, setIcono] = useState("");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setIsValid(true);
  }, [icono]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e) => {
      if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
        e.preventDefault();
        const scrollSpeed = 3.1;
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
      className={`flex flex-col h-full w-full border- rounded-xl overflow-clip`}
    >
      <div
        style={{
          backgroundColor: theme,
        }}
        className={`relative  h-14 items-center flex justify-between w-full px-4`}
      >
        <div
          className=" h-full cursor-pointer flex items-center justify-center"
          onClick={() => setDisplayLinks()}
        >
          {!displayLinks ? <IconEyeClosed size={40} /> : <IconEye size={40} />}
        </div>
        <div className=" text-xl  w-full font-bold uppercase flex justify-center items-center">
          Links
        </div>
        <button
          style={{
            boxShadow: editable ? `0px 0px 5px 2px white` : "",
          }}
          onClick={() => setEditable(!editable)}
          className={` bg-white text-black flex justify-center w-12 h-12 rounded items-center`}
        >
          <IconPencil className={editable && styles.pulse} size={40} />
        </button>
      </div>

      <div
        ref={scrollRef}
        style={{
          "--theme": textTheme,
        }}
        className={cn(
          `bg-black/50 w-full flex-1 flex items-center overflow-x-auto  overflow-y-hidden ${styles.scrollContainer}`,
          !displayLinks && "px-12"
        )}
      >
        <div className="h-full">
          <LinksGrid
            links={links}
            moveLink={moveLink}
            editable={editable}
            setEditForm={setEditForm}
            setEditingIndex={setEditingIndex}
            setLink={setLink}
            setNombre={setNombre}
            setIcono={setIcono}
            theme={theme}
            textTheme={textTheme}
            displayLinks={displayLinks}
          />
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

          <div className="flex flex-col gap-4 p-4 h-full">
            <div className="flex w-full h-full items-center gap-4">
              <label className="font-bold" htmlFor="color">
                URL
              </label>

              <Input
                id="link"
                className="p-2 w-full rounded placeholder:opacity-40"
                type="text"
                placeholder={
                  editingIndex !== null ? links[editingIndex]?.link : "URL"
                }
                value={link}
                onChange={(e) => {
                  const v = e.target.value;
                  setLink(v);
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
                placeholder={
                  editingIndex !== null ? links[editingIndex]?.nombre : ""
                }
                className="p-2 rounded placeholder:text-gray-500 placeholder:opacity-40 "
                value={nombre}
                onChange={(e) => {
                  const v = e.target.value;
                  setNombre(v);
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
                        onError={() => setIsValid(false)}
                        onLoad={() => setIsValid(true)}
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
                      const v = e.target.value;
                      setIcono(v);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="w-full h-full flex justify-center items-center pt-4 gap-4">
              <Button
                variant="destructive"
                onClick={() => {
                  if (editingIndex !== null) {
                    setEditForm(false);
                    setLinks(editingIndex, "", "", "");
                    setEditingIndex(null);
                    setNombre("");
                    setLink("");
                    setIcono("");
                  }
                }}
              >
                DELETE
              </Button>
              <button
                style={{ backgroundColor: theme, color: textTheme }}
                onClick={() => {
                  if (editingIndex !== null) {
                    // ✅ Usa el índice actual para editar
                    setLinks(editingIndex, nombre, link, icono);
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
