import { useEffect, useRef, useState } from "react";
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
import styles from "../style.module.css";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { IconEraser, IconPlus } from "@tabler/icons-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useFireStore } from "@/store/fireStore";
import { useClock } from "@/hooks/useClock";
import { X } from "lucide-react";

export default function Task({ task }) {
  const { theme, textTheme, deleteTask, addNote, completeTask, restoreTask } =
    useFireStore();
  const time = useClock();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [comment, setComment] = useState("");
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [movilSeccion, setMovilSeccion] = useState("description");
  const containerRef = useRef(null);
  const startDate = task.startDate?.toDate?.() ?? task.startDate;
  const endDate = task.endDate?.toDate?.() ?? task.endDate;

  function middleTime() {
    if (!startDate || !endDate) return null;

    const middleTimestamp = (startDate.getTime() + endDate.getTime()) / 2;

    return new Date(middleTimestamp);
  }

  const colorCondition = () => {
    if (task.state === "completed" || time < middleTime()) {
      return "#b2dddd";
    }
    if (task.state != "completed" && time >= endDate) {
      return "#E31B1C";
    }
    if (task.state != "completed" && middleTime() < time) {
      return "#CEC102";
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setNewImagePreview(url);
    setNewImageFile(file);
  };
  useEffect(() => {
    const handlePaste = (e) => {
      if (!containerRef.current?.contains(e.target)) return;
      const items = e.clipboardData.items;
      for (let item of items) {
        if (item.type.includes("image")) {
          const file = item.getAsFile();
          const url = URL.createObjectURL(file);

          setNewImagePreview(url);
          setNewImageFile(file);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  useEffect(() => {
    if (!openForm) {
      setTitle("");
      setComment("");
      setNewImagePreview(null);
      setNewImageFile(null);
    }
  }, [openForm]);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{
          boxShadow: `0 0 5px 1px ${colorCondition()}`,
          background: theme,

          color: textTheme,
        }}
        className="w-full h-16 rounded-xl p-4 cursor-pointer select-none"
      >
        <div className="w-full h-full flex justify-center items-center p-2">
          <div
            style={{ color: textTheme }}
            className="font-bold uppercase text-sm text-wrap text-center truncate"
          >
            {task.name}
          </div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          style={{
            color: textTheme,
            backgroundColor: theme,
            border: `2px solid ${colorCondition()}`,
          }}
          className={cn(
            "animate-none",
            "max-w-3xl border-white border-2 overflow-y-auto flex flex-col gap-1 p-4 bg-black "
          )}
        >
          <DialogHeader className="pb-4">
            <DialogTitle className="font-bold flex flex-col items-center gap-2 justify-center uppercase w-full">
              <span className="text-center">{task.name}</span>
              {task.state === "completed" && (
                <span className="text-2xl">(COMPLETED)</span>
              )}
            </DialogTitle>
            <DialogDescription></DialogDescription>
            <div className="flex w-full gap-2 md:hidden items-center justify-center">
              <Button
                style={{
                  border: movilSeccion === "description" && "1px solid white",
                }}
                onClick={() => setMovilSeccion("description")}
              >
                DESCRIPTION
              </Button>{" "}
              <Button
                style={{
                  border: movilSeccion === "notes" && "1px solid white",
                }}
                onClick={() => setMovilSeccion("notes")}
              >
                NOTES
              </Button>
            </div>
          </DialogHeader>
          <div
            className={
              "h-full flex flex-col md:grid md:grid-cols-[2fr_2fr] gap-8"
            }
          >
            <div
              className={cn(
                movilSeccion === "description" ? "flex flex-col" : "hidden",
                "gap-4 w-full h-full"
              )}
            >
              <div className="flex flex-col w-full items-center justify-center">
                <div
                  className={
                    task.image && "w-full h-48 overflow-hidden rounded-lg" // altura para tasks con imagen
                  }
                >
                  {task.image ? (
                    <>
                      <Dialog>
                        <DialogOverlay className="hidden"></DialogOverlay>
                        <DialogTitle></DialogTitle>
                        <DialogDescription></DialogDescription>
                        <DialogTrigger asChild>
                          <img
                            src={task.image}
                            alt={task.name}
                            className="w-full h-full object-cover cursor-pointer"
                          />
                        </DialogTrigger>

                        <DialogContent
                          style={{ border: `1px solid ${textTheme}` }}
                          className="max-w-[100vw] md:max-w-[70vw] max-h-[90vh] p-0 border-none bg-black/80 flex items-center justify-center"
                        >
                          <DialogHeader className="absolute top-2 right-2">
                            <DialogClose className="text-red-800 font-bold hover:text-red-400 transition text-3xl">
                              <X size={28} />
                            </DialogClose>
                          </DialogHeader>
                          <div className="w-full h-full flex items-center justify-center p-4">
                            <img
                              src={task.image}
                              alt={task.name}
                              className="max-w-[65vw] max-h-[85vh] w-auto h-auto object-contain rounded-lg"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center"></div>
                  )}
                </div>
                <div className="w-full  flex flex-col gap-2">
                  <span className="font-bold w-full">DESCRIPTION</span>
                  <div
                    style={{
                      "--theme": textTheme,
                      backgroundColor: theme,
                      border: `2px solid ${textTheme}`,
                    }}
                    className={cn(
                      styles.scrollContainer,
                      "overflow-y-auto min-h-16 p-2 text-sm rounded border-2"
                    )}
                  >
                    {task.descrition}
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-col items-center h-full justify-between gap-2  ">
                <div
                  className={cn(
                    "w-full flex text-sm gap-4 items-center justify-center"
                  )}
                >
                  <div
                    className={cn(
                      task.image ? "w-full" : "w-1/3",
                      "h-full flex flex-col"
                    )}
                  >
                    <div className="font-bold text-center">STARTED</div>
                    <div
                      style={{
                        border: `2px solid ${textTheme}`,
                        backgroundColor: theme,
                      }}
                      className="rounded w-full text-center p-1"
                    >
                      {startDate.toLocaleString("en-GB")}
                    </div>
                  </div>

                  {endDate && (
                    <div
                      className={cn(
                        task.image ? "w-full" : "w-1/3",
                        "h-full flex flex-col"
                      )}
                    >
                      <div className="font-bold text-center">END</div>
                      <div
                        style={{
                          border: `2px solid ${textTheme}`,
                          backgroundColor: theme,
                        }}
                        className="rounded w-full text-center p-1"
                      >
                        {endDate.toLocaleString("en-GB")}
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-full flex uppercase gap-2 items-center justify-center">
                  <span className="text-xl font-bold">Frequency:</span>
                  <span>{task.frequency != "none" && task.frequency}</span>
                  {task.state === "completed" ? (
                    <Button
                      onClick={() => {
                        restoreTask(task.id);
                        setOpen(false);
                      }}
                      className="bg-black select-none border-2 flex items-center justify-center text-destructive-foreground shadow-sm  w-full text-sm p-2 rounded  font-bold duration-200 active:scale-105 active:border-2 active:border-white"
                    >
                      RESTORE <IconEraser />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        completeTask(task.id);
                        setOpen(false);
                      }}
                      className="bg-black select-none border-2 flex items-center justify-center text-destructive-foreground shadow-sm  w-full text-sm p-2 rounded  font-bold duration-200 active:scale-105 active:border-2 active:border-white"
                    >
                      COMPLETE <IconEraser />
                    </Button>
                  )}
                </div>
                <div></div>
                <AlertDialog>
                  <AlertDialogTrigger className="flex gap-2 w-full justify-center">
                    <div className=" border-2 flex items-center justify-center bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 w-full text-sm p-2 rounded  font-bold duration-200 active:scale-105 active:border-2 active:border-white">
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
                      <AlertDialogCancel className="text-black font-bold">
                        CANCEL
                      </AlertDialogCancel>
                      <Button
                        className="font-bold"
                        variant="destructive"
                        onClick={async () => {
                          setOpen(false);
                          await deleteTask(task.id);
                        }}
                      >
                        DELETE
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div
              className={cn(
                movilSeccion === "notes"
                  ? "flex flex-col h-96"
                  : "hidden md:flex md:flex-col md:h-full",
                "w-full  gap-4"
              )}
            >
              <div className="font-bold w-full text-center">NOTES</div>
              <div
                style={{
                  "--theme": textTheme,
                  border: `1px solid ${textTheme}`,
                }}
                className={cn(
                  styles.scrollContainer,
                  "w-full bg-black h-full flex flex-col overflow-y-auto gap-2 p-2"
                )}
              >
                {task.notes &&
                  task.notes.map((note, i) => (
                    <Dialog key={i}>
                      <DialogTrigger>
                        <div
                          style={{
                            border: `1px solid ${textTheme}`,
                            backgroundColor: theme,
                          }}
                          className="w-full flex flex-col justify-center text-sm gap-2 h-16 items-center p-2  hover:opacity-70 rounded "
                        >
                          {new Date(note.createdAt).toLocaleString("en-GB")}

                          <div className="truncate ">{note.title}</div>
                        </div>
                      </DialogTrigger>
                      <DialogContent
                        style={{
                          color: textTheme,
                          backgroundColor: theme,
                          border: `1px solid ${textTheme}`,
                        }}
                        className="w-full md:w-1/2   border-2 overflow-x-hidden overflow-y-auto flex flex-col"
                      >
                        <DialogHeader className="pb-4">
                          <DialogTitle className="text-center font-bold uppercase">
                            {note.title}
                          </DialogTitle>
                        </DialogHeader>

                        <div
                          className={
                            note.imageUrl &&
                            "w-full h-48 overflow-hidden rounded-lg" // altura para tasks con imagen
                          }
                        >
                          {note.imageUrl ? (
                            <Dialog>
                              <DialogOverlay className="hidden"></DialogOverlay>
                              <DialogTitle></DialogTitle>
                              <DialogDescription></DialogDescription>
                              <DialogTrigger asChild>
                                <img
                                  src={note.imageUrl}
                                  alt={note.title}
                                  className="w-full h-full object-cover cursor-pointer"
                                />
                              </DialogTrigger>

                              <DialogContent
                                style={{ border: `1px solid ${textTheme}` }}
                                className="max-w-[100vw] md:max-w-[70vw] max-h-[90vh] p-0 border-none bg-black/80 flex items-center justify-center"
                              >
                                <DialogHeader className="absolute top-2 right-2">
                                  <DialogClose className="text-red-800 font-bold hover:text-red-400 transition text-3xl">
                                    <X size={28} />
                                  </DialogClose>
                                </DialogHeader>
                                <div className="w-full h-full flex items-center justify-center p-4">
                                  <img
                                    src={note.imageUrl}
                                    alt={note.title}
                                    className="max-w-[65vw] max-h-[85vh] w-auto h-auto object-contain rounded-lg"
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <div className="w-full h-full bg-neutral-900 flex items-center justify-center"></div>
                          )}
                        </div>

                        <DialogDescription></DialogDescription>
                        <div
                          style={{
                            "--theme": textTheme,
                            backgroundColor: theme,
                            border: `2px solid ${textTheme}`,
                            whiteSpace: "pre-wrap",
                            overflowX: "hidden",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                          className={cn(
                            styles.scrollContainer,
                            "overflow-y-auto min-h-16 max-h-40 p-2 text-sm  rounded border-2"
                          )}
                        >
                          {note.text && note.text}
                        </div>
                        <DialogClose className="w-full h-12 font-bold bg-black text-white hover:bg-white hover:text-black active:opacity-50 duration-300 rounded">
                          OK
                        </DialogClose>
                      </DialogContent>
                    </Dialog>
                  ))}
                <div
                  onClick={() => setOpenForm(true)}
                  style={{
                    border: `1px dotted ${textTheme}`,
                    backgroundColor: theme,
                  }}
                  className="flex w-full h-12 justify-center items-center p-2 hover:opacity-70 rounded "
                >
                  <IconPlus color={textTheme} size={20} />
                </div>
                <Dialog open={openForm} onOpenChange={setOpenForm}>
                  <DialogContent
                    ref={containerRef}
                    style={{
                      color: textTheme,
                      backgroundColor: theme,
                      border: `1px solid ${textTheme}`,
                    }}
                    className="w-full md:w-1/2 bg-black  overflow-x-hidden overflow-y-auto flex flex-col"
                  >
                    <DialogHeader>
                      <DialogTitle className="text-center font-bold">
                        NEW NOTE
                      </DialogTitle>
                      <DialogDescription className=""></DialogDescription>
                    </DialogHeader>
                    <div className="w-full h-full flex gap-2 items-center justify-center">
                      <label htmlFor="note" className="font-bold">
                        TITLE
                      </label>
                      <Input
                        id="note"
                        value={title}
                        onChange={(e) => setTitle(e.currentTarget.value)}
                      />
                    </div>
                    <div className="w-full h-full">
                      <label
                        htmlFor="newImage"
                        style={{ border: `1px dotted ${textTheme}` }}
                        className=" min-h-32 rounded items-center flex justify-center"
                      >
                        {newImagePreview ? (
                          <img
                            className="max-w-96 max-h-64"
                            src={newImagePreview}
                          />
                        ) : (
                          "Click here  or Paste an Image"
                        )}
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileInput}
                        id="newImage"
                      />
                    </div>
                    <div className="w-full h-full flex flex-col gap-2 justify-center">
                      <label htmlFor="note" className="font-bold">
                        COMMENT
                      </label>
                      <Textarea
                        style={{ "--theme": textTheme }}
                        id="note"
                        rows={4}
                        value={comment}
                        className={cn(styles.scrollContainer, "resize-none")}
                        onChange={(e) => setComment(e.currentTarget.value)}
                      />
                    </div>
                    <div className="w-full h-full flex justify-center">
                      <Button
                        className="w-full h-12 font-bold bg-black text-white hover:bg-white hover:text-black active:opacity-50 duration-300 rounded"
                        onClick={async () => {
                          console.log(task.id);
                          await addNote(task.id, {
                            text: comment,
                            title,
                            image: newImageFile,
                          });

                          setOpenForm(false);
                        }}
                      >
                        CREATE NOTE
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
