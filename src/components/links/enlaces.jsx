"use client";
import toast from "react-hot-toast";

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
import { Toaster } from "react-hot-toast";
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
  - uses useSortable
  - detects short press -> click, long press -> activate drag
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
    // after short delay, forward to dnd-kit to start dragging
    clickTimerRef.current = setTimeout(() => {
      if (listeners && typeof listeners.onPointerDown === "function") {
        listeners.onPointerDown(e);
      }
    }, 10); // tweakable
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
    <div
      ref={setNodeRef}
      style={style}
      className="w-full h-12"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      {...attributes}
    >
      <div className="w-full h-12 ">
        <LinkItemInner
          link={link}
          editable={editable}
          theme={theme}
          textTheme={textTheme}
          displayLinks={displayLinks}
        />
      </div>
    </div>
  );
}

/* -----------------------
  StaticItem (used when editable === false)
  - only handles click (no dnd-kit)
------------------------ */
function StaticLinkItem({ link, onClick, theme, textTheme, displayLinks }) {
  return (
    <div className="h-12" onClick={onClick}>
      <LinkItemInner
        link={link}
        displayLinks={displayLinks}
        theme={theme}
        textTheme={textTheme}
      />
    </div>
  );
}

/* -----------------------
  Inner rendering of a link item (visual only)
------------------------ */
function LinkItemInner({ link, theme, textTheme, displayLinks, editable }) {
  const [hover, setHover] = useState(false);
  const borderStyle =
    (hover && link.link) || link.nombre
      ? `2px solid ${theme}`
      : "2px solid transparent";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        color: textTheme,
        border: !editable ? borderStyle : `1px solid ${textTheme}`,
      }}
      className={cn(
        " h-12 flex  items-center gap-2  rounded-xl duration-200 w-full",
        !displayLinks && "justify-center",
        (link.link || editable) && "bg-black  cursor-pointer"
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
  Grid component: conditional DnD when editable === true
  - renders a single flat grid with grid-rows-4 grid-flow-col
  - on drag end computes new array order and writes it back calling setLinks for each index
------------------------ */
function LinksGrid({
  links,
  setLinks, // function signature: setLinks(index, nombre, link, icono)
  editable,
  setEditForm,
  setId,
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

    // build new array
    const newLinks = Array.from(links);
    const [moved] = newLinks.splice(oldIndex, 1);
    newLinks.splice(newIndex, 0, moved);

    // setLinks is used elsewhere as setLinks(id, nombre, link, icono)
    // so we update each index by calling setLinks for each element
    newLinks.forEach((item, idx) => {
      setLinks(idx, item.nombre || "", item.link || "", item.icono || "");
    });
  };

  const handleItemClick = (link) => {
    if (!editable) {
      if (link.link) {
        // open in new tab
        window.open(link.link, "_blank");
      }
    } else {
      setId(link.id - 1);
      setLink(link.link || "");
      setNombre(link.nombre || "");
      setIcono(link.icono || "");
      setEditForm(true);
    }
  };

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
          <div className="grid grid-rows-4 grid-flow-col w-full gap-2 p-4">
            {links.map((l) => (
              <div
                key={l.id}
                className={cn("h-full", displayLinks ? "w-[270px]" : "w-full")}
              >
                <SortableLinkItem
                  displayLinks={displayLinks}
                  link={l}
                  editable={editable}
                  onClick={() => handleItemClick(l)}
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
    <div className="grid grid-rows-4 grid-flow-col w-full gap-2 p-4">
      {links.map((l) => (
        <div
          key={l.id}
          className={cn("h-full", displayLinks ? "w-[270px]" : "w-full")}
        >
          <StaticLinkItem
            displayLinks={displayLinks}
            link={l}
            onClick={() => handleItemClick(l)}
            theme={theme}
            textTheme={textTheme}
          />
        </div>
      ))}
    </div>
  );
}

/* -----------------------
  Main Links component (wrapped and adapted)
------------------------ */
export default function Links({
  links,
  setLinks,
  theme,
  textTheme,
  setDisplayLinks,
  displayLinks,
}) {
  const scrollRef = useRef(null);
  const [editable, setEditable] = useState(false);
  const [editForm, setEditForm] = useState(false);
  const [id, setId] = useState(0);
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
        const scrollSpeed = 3.4;
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
        className={`w-full flex-1 flex items-center overflow-x-auto overflow-y-hidden ${styles.scrollContainer}`}
      >
        <div className="py-4 h-full">
          <LinksGrid
            links={links}
            setLinks={setLinks}
            editable={editable}
            setEditForm={setEditForm}
            setId={setId}
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
                placeholder={links[id]?.link || "URL"}
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
                placeholder={links[id]?.nombre || ""}
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
                  setEditForm(false);
                  // remove: set empty at index
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
                  // save: call setLinks with index and data (matches parent's API)
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
