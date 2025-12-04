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
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { IconEraser, IconPencil, IconPlus } from "@tabler/icons-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export default function Task({
  theme,
  textTheme,
  task,
  time,
  deleteTask,
  addNote,
  deleteNote,
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [comment, setComment] = useState("");
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const imageRef = useRef(null);
  function manageDate(value) {
    // Si viene como Timestamp de Firestore (tiene .toDate)
    if (value?.toDate) {
      return value.toDate();
    }

    // Si ya es un Date, te lo devuelvo como buen siervo
    if (value instanceof Date) {
      return value;
    }
  }

  const startDate = task.startDate?.toDate?.() ?? task.startDate;
  const endDate = task.endDate?.toDate?.() ?? task.endDate;

  function middleTime() {
    if (!startDate || !endDate) return null;

    const middleTimestamp = (startDate.getTime() + endDate.getTime()) / 2;

    return new Date(middleTimestamp);
  }
  function format(value) {
    if (value < 10) return `0${value}`;
    else return value;
  }

  const colorCondition = () => {
    if (time >= endDate) {
      return "#E31B1C";
    }
    if (middleTime() < time) {
      return "#CEC102";
    }
    return "#b2dddd";
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
        className="w-48 h-16 rounded-xl p-4"
      >
        <div className="w-full h-full flex justify-center items-center p-2">
          <div style={{ color: textTheme }} className="font-bold uppercase">
            {task.name}
          </div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          style={{ color: textTheme, border: `2px solid ${colorCondition()}` }}
          className={cn(
            task.image ? "max-w-5xl" : "max-w-3xl",
            "border-white border-2 h-5/6 overflow-y-auto flex flex-col gap-1 p-8 bg-black "
          )}
        >
          <DialogHeader className="pb-4">
            <DialogTitle className="font-bold flex items-center justify-center uppercase w-full">
              <span className="text-center">{task.name}</span>
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className={"h-full grid grid-cols-[3fr_2fr] gap-8"}>
            <div
              className={cn(
                task.image ? "grid grid-cols-[2fr_1fr]" : "flex flex-col ",
                "gap-4 w-full h-full"
              )}
            >
              <div className="flex flex-col w-full items-center justify-center">
                {task.image && (
                  <div className="h-full w-full flex items-center justify-center">
                    <img className="max-w-64 max-h-64" src={task.image} />
                  </div>
                )}
                <div className="w-full  flex flex-col gap-2">
                  <span className="font-bold w-full">DESCRIPTION</span>
                  <div
                    style={{ "--theme": textTheme, backgroundColor: theme }}
                    className={cn(
                      styles.scrollContainer,
                      "overflow-y-auto min-h-28 p-2 rounded"
                    )}
                  >
                    {task.descrition}
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-col items-center h-full justify-between gap-4  ">
                <div
                  className={cn(
                    task.image && "flex-col",
                    "w-full flex  gap-4 items-center justify-center"
                  )}
                >
                  <div
                    className={cn(
                      task.image ? "w-full" : "w-1/3",
                      "h-full flex flex-col"
                    )}
                  >
                    <div className="font-bold">STARTED</div>
                    <div
                      style={{
                        border: `2px solid ${textTheme}`,
                        backgroundColor: theme,
                      }}
                      className="rounded-xl w-full text-center p-1"
                    >
                      {format(startDate.getHours())}:
                      {format(startDate.getMinutes())} <br />
                      {format(startDate.getDay())} /
                      {format(startDate.getMonth() + 1)}/
                      {format(startDate.getFullYear())}
                    </div>
                  </div>

                  {endDate && (
                    <div
                      className={cn(
                        task.image ? "w-full" : "w-1/3",
                        "h-full flex flex-col"
                      )}
                    >
                      <div className="font-bold">END</div>
                      <div
                        style={{
                          border: `2px solid ${textTheme}`,
                          backgroundColor: theme,
                        }}
                        className="rounded-xl w-full text-center p-1"
                      >
                        {format(endDate.getHours())}:
                        {format(endDate.getMinutes())}
                        <br />
                        {format(endDate.getDay())} /
                        {format(endDate.getMonth() + 1)}/
                        {format(endDate.getFullYear())}
                      </div>
                    </div>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger className="flex gap-2 w-full justify-center">
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
                        onClick={async () => {
                          await deleteTask(task.id);
                          setOpen(false);
                        }}
                      >
                        DELETE
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="w-full h-full flex flex-col gap-4">
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
                          className="flex w-full justify-between p-2 h-12 hover:opacity-70 rounded "
                        >
                          <div
                            onClick={() => console.log(manageDate(note.date))}
                          >
                            {note.title}
                          </div>
                          <div>
                            {format(
                              manageDate(new Date(note.createdAt)).getDay()
                            )}
                            /
                            {format(
                              manageDate(new Date(note.createdAt)).getMonth()
                            )}
                            /
                            {manageDate(new Date(note.createdAt)).getFullYear()}
                            &nbsp;
                            {format(
                              manageDate(new Date(note.createdAt)).getHours()
                            )}
                            :
                            {format(
                              manageDate(new Date(note.createdAt)).getMinutes()
                            )}
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent
                        style={{ color: textTheme }}
                        className="w-1/2 bg-black border-white border-2 overflow-x-hidden overflow-y-auto flex flex-col"
                      >
                        <DialogHeader className="pb-4">
                          <DialogTitle className="text-center font-bold">
                            {note.title}
                          </DialogTitle>
                        </DialogHeader>

                        <div className="w-full h-full flex items-center justify-center ">
                          {note.imageUrl && (
                            <img
                              className="max-w-64 max-h-48"
                              src={note.imageUrl}
                            />
                          )}
                        </div>
                        <DialogDescription className="text-center">
                          {note.text && note.text}
                        </DialogDescription>
                        <DialogClose
                          style={{ backgroundColor: theme, color: textTheme }}
                          className="font-bold h-12 rounded w-full hover:opacity-70 duration-300"
                        >
                          OK
                        </DialogClose>
                      </DialogContent>
                    </Dialog>
                  ))}
                <div
                  onClick={() => setOpenForm(true)}
                  style={{ border: `1px dotted ${textTheme}` }}
                  className="flex w-full h-12 justify-center items-center p-2 hover:bg-gray-900 rounded "
                >
                  <IconPlus color={textTheme} size={20} />
                </div>
                <Dialog open={openForm} onOpenChange={setOpenForm}>
                  <DialogContent
                    ref={imageRef}
                    style={{ color: textTheme }}
                    className="w-1/2 bg-black border-white border-2 overflow-x-hidden overflow-y-auto flex flex-col"
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
                    <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
                      <label htmlFor="note" className="font-bold">
                        Coment
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
                        className="font-bold"
                        onClick={async () => {
                          console.log(task.id);
                          await addNote(task.id, {
                            text: comment,
                            title,
                            image: newImageFile,
                          });

                          setOpenForm(false);
                        }}
                        style={{ backgroundColor: theme, color: textTheme }}
                      >
                        Create Note
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
