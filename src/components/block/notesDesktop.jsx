"use client";
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
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconDeviceFloppy,
  IconDownload,
  IconEraser,
  IconNote,
  IconPencil,
} from "@tabler/icons-react";
import styles from "../style.module.css";
import { useRef, useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { bg } from "date-fns/locale/bg";

/* -----------------------
  SortableNoteItem (usado cuando editable === true)
------------------------ */
function SortableNoteItem({ note, onClick, theme, textTheme, editable }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(note.id) });

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
    <div
      ref={setNodeRef}
      style={style}
      className="w-[290px]"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      {...attributes}
    >
      {(note.title || true) && (
        <NoteItem
          note={note}
          theme={theme}
          textTheme={textTheme}
          editable={editable}
        />
      )}
    </div>
  );
}

/* -----------------------
  StaticNoteItem (usado cuando editable === false)
------------------------ */
function StaticNoteItem({ note, onClick, theme, textTheme, editable }) {
  return (
    <div className="w-[290px]" onClick={onClick}>
      <NoteItem
        note={note}
        theme={theme}
        textTheme={textTheme}
        editable={editable}
      />
    </div>
  );
}

/* -----------------------
  NotesGrid: condicional DnD según editable
------------------------ */
function NotesGrid({
  notes,
  moveNotes,
  editable,
  setEditForm,
  setEditingIndex,
  setTitle,
  setContent,
  setBgColor,
  setTextColor,
  theme,
  textTheme,
}) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = notes.findIndex((n) => String(n.id) === String(active.id));
    const newIndex = notes.findIndex((n) => String(n.id) === String(over.id));

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      if (moveNotes) {
        moveNotes(oldIndex, newIndex);
      }
    }
  };

  // ✅ CAMBIO: Ahora recibimos el índice como parámetro
  const handleItemClick = (note, index) => {
    if (editable || note.title) {
      setEditingIndex(index); // ✅ Guardamos el índice real del array
      setTitle(note.title);
      setContent(note.content);
      setEditForm(true);
      setBgColor(note.color1);
      setTextColor(note.color2);
    }
  };
  const visibleNotes = notes.slice(
    0,
    notes.map((c) => c.title !== "").lastIndexOf(true) + 1
  );
  if (editable) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={notes.map((n) => String(n.id))}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-rows-4 h-full grid-flow-col gap-4 w-full p-4">
            {notes.map((note, index) => (
              <SortableNoteItem
                key={note.id}
                note={note}
                onClick={() => handleItemClick(note, index)}
                theme={theme}
                textTheme={textTheme}
                editable={editable}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <div className="grid grid-rows-4 h-full grid-flow-col gap-4 w-full p-4">
      {visibleNotes.map((note, index) => (
        <div key={note.id}>
          <StaticNoteItem
            note={note}
            onClick={() => handleItemClick(note, index)}
            theme={theme}
            textTheme={textTheme}
            editable={false}
          />
        </div>
      ))}
    </div>
  );
}

export default function NotesDesktop({
  notes,
  setNotes,
  moveNotes,
  theme,
  textTheme,
}) {
  const [bgColor, setBgColor] = useState("");
  const [textColor, setTextColor] = useState("");
  const scrollRef = useRef(null);
  const [editable, setEditable] = useState(false);
  const [editForm, setEditForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const manageFormat = (colorStr) => {
    if (!colorStr) return "";
    if (colorStr[0] === "#") return colorStr.slice(1);
    return colorStr;
  };
  const exportToTextFile = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title === "" ? "untitled" : title}.txt`;
    link.click();
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e) => {
      if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
        e.preventDefault();
        const scrollSpeed = 6.2;
        scrollContainer.scrollLeft += e.deltaY * scrollSpeed;
      }
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });
    return () => scrollContainer.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    if (!editForm) {
      setEditingIndex(null);
      setTitle("");
      setContent("");
      setBgColor("");
      setTextColor("");
    }
  }, [editForm]);

  return (
    <div
      style={{ border: `2px solid ${theme}` }}
      className={`bg-black/30 flex flex-col h-full border- rounded-xl overflow-hidden`}
    >
      <div
        style={{
          backgroundColor: theme,
        }}
        className={`relative flex h-14 items-center justify-center px-2  w-full`}
      >
        <div className="w-12 p-2"></div>
        <div className=" text-xl  w-full font-bold uppercase flex justify-center items-center">
          Notes
        </div>
        <button
          style={{
            boxShadow: editable ? `0px 0px 5px 2px white` : "",
          }}
          onClick={() => setEditable(!editable)}
          className={` bg-white text-black flex justify-center w-12 h-12 p-2 rounded items-center`}
        >
          <IconPencil className={editable && styles.pulse} size={40} />
        </button>
      </div>
      <div
        ref={scrollRef}
        style={{
          "--theme": textTheme,
        }}
        className={`bg-black/50 w-full flex-1 flex items-center overflow-x-auto overflow-y-hidden ${styles.scrollContainer}`}
      >
        <div className="h-full">
          <NotesGrid
            notes={notes}
            moveNotes={moveNotes}
            editable={editable}
            setEditForm={setEditForm}
            setEditingIndex={setEditingIndex}
            setTitle={setTitle}
            setContent={setContent}
            setBgColor={setBgColor}
            setTextColor={setTextColor}
            theme={theme}
            textTheme={textTheme}
          />
        </div>
      </div>

      <Dialog onOpenChange={setEditForm} open={editForm}>
        <DialogContent className="w-full min-h-[70vh] bg-black border-white border-2 overflow-hidden gap-2">
          <DialogTitle
            style={{ color: textTheme }}
            className="flex justify-center items-center font-bold"
          >
            {editable ? "EDIT NOTE" : title.toUpperCase()}
          </DialogTitle>
          <DialogDescription className="hidden">
            Cuadro de notas
          </DialogDescription>
          <div style={{ color: textTheme }} className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-2">
              {editable && (
                <>
                  <label className="font-bold" htmlFor="title">
                    TITLE
                  </label>
                  <Input
                    style={{
                      color: `#${manageFormat(textColor)}`,
                      backgroundColor: `#${manageFormat(bgColor)}`,
                    }}
                    disabled={!editable}
                    id="title"
                    type="text"
                    placeholder={
                      editingIndex !== null ? notes[editingIndex]?.title : ""
                    }
                    className="p-2 rounded placeholder:text-gray-500 placeholder:opacity-40"
                    value={title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setTitle(title);
                    }}
                  />
                </>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="content"
                className={!editable ? "hidden" : "font-bold"}
              >
                CONTENT
              </label>
              <div className="w-full h-full flex">
                <Textarea
                  rows={!editable ? 14 : 8}
                  disabled={!editable}
                  id="content"
                  placeholder={
                    editingIndex !== null ? notes[editingIndex]?.content : ""
                  }
                  style={{
                    "--theme": textTheme,
                    color: textTheme,
                  }}
                  className={`text-white disabled:cursor-text disabled:select-text resize-none p-2 w-full rounded ${styles.scrollContainer} placeholder:opacity-40`}
                  value={content}
                  onChange={(e) => {
                    const content = e.target.value;
                    setContent(content);
                  }}
                />
              </div>
            </div>
            {editable ? (
              <div className="w-full h-full flex flex-col justify-between items-center gap-4">
                <div className="flex items-center flex-col gap-2">
                  <div className="flex gap-2">
                    <div className="flex flex-col">
                      <div>Background</div>
                      <div className="w-full h-full flex items-center gap-2">
                        <div
                          className="w-8 h-8"
                          style={{
                            backgroundColor: `#${manageFormat(bgColor)}`,
                            border: `1px solid ${theme}`,
                          }}
                        ></div>

                        <Input
                          id="color"
                          maxLength={9}
                          className="p-2 w-40 rounded placeholder:opacity-40"
                          type="text"
                          value={bgColor.toUpperCase()}
                          onChange={(e) => {
                            const colorV = e.target.value;
                            setBgColor(colorV);
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div>Text</div>
                      <div className="w-full h-full flex items-center gap-2">
                        <div
                          className="w-8 h-8"
                          style={{
                            backgroundColor: `#${manageFormat(textColor)}`,
                            border: `1px solid ${theme}`,
                          }}
                        ></div>

                        <Input
                          id="color"
                          maxLength={9}
                          className="p-2 w-40 rounded placeholder:opacity-40"
                          type="text"
                          value={textColor.toUpperCase()}
                          onChange={(e) => {
                            const colorV = e.target.value;
                            setTextColor(colorV);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex w-full h-full items-center justify-center gap-4">
                  <AlertDialog>
                    <AlertDialogTrigger className="flex gap-2">
                      <div className="border-2 flex items-center justify-center bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 w-full text-sm p-2 rounded  font-bold duration-200 active:scale-105 active:border-2 active:border-white">
                        DELETE <IconEraser />
                      </div>
                    </AlertDialogTrigger>
                    <AlertDialogContent
                      style={{ color: textTheme }}
                      className="bg-black"
                    >
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="text-black">
                          Cancel
                        </AlertDialogCancel>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            if (editingIndex !== null) {
                              setNotes(editingIndex, "", "", "", "#FAFAFA");
                              setEditForm(false);
                            }
                          }}
                        >
                          DELETE
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <button
                    disabled={!editable}
                    style={{ backgroundColor: theme, color: textTheme }}
                    onClick={() => {
                      if (editingIndex !== null) {
                        setNotes(
                          editingIndex,
                          title,
                          content,
                          manageFormat(bgColor),
                          manageFormat(textColor)
                        );
                        setEditForm(false);
                      }
                    }}
                    className="hover:opacity-60  w-8/12 p-2 rounded  font-bold duration-200 active:scale-105 active:border-2 active:border-white"
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <span>SAVE</span> <IconDeviceFloppy />
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full mt-4 flex justify-center md:justify-end">
                <Button
                  onClick={exportToTextFile}
                  style={{ backgroundColor: theme, color: textTheme }}
                  className="font-bold w-3/4 md:w-4/12 flex justify-center hover:opacity-70"
                >
                  DOWNLOAD <IconDownload />
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -----------------------
  NoteItem visual component
------------------------ */
function NoteItem({ note, textTheme, editable }) {
  const [hover, setHover] = useState(false);

  const borderStyle =
    editable || (hover && note.title)
      ? `1px solid ${textTheme}`
      : "1px solid transparent";
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        color: `#${note.color2}`,
        border: !editable ? borderStyle : `1px solid ${textTheme}`,
        backgroundColor: note.title || editable ? `#${note.color1}` : "",
      }}
      className={cn(
        note.title && "cursor-pointer",
        "w-full hover:opacity-70 p-2 h-12 flex items-center gap-4 rounded-xl duration-200"
      )}
    >
      {note.title && (
        <div className="h-12 gap-2 w-full rounded-l-md flex items-center justify-start">
          <IconNote className="flex-shrink-0 h-8 w-8" />
          <h1 className="truncate select-none">{note.title}</h1>
        </div>
      )}
    </div>
  );
}
