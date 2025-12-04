import { AnimatePresence, motion } from "framer-motion";
import { useFireStore } from "@/store/fireStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Task from "../task/task";
import { IconPlus } from "@tabler/icons-react";
import { TimePicker } from "../ui/timePicker";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { getAuth } from "firebase/auth";
import toast from "react-hot-toast";

const startDate = new Date();
const endDate = new Date();
endDate.setHours(17);
endDate.setMinutes(0);
endDate.setSeconds(0);

const listTask = [
  {
    id: 1,
    name: "primero",
    referenceImage: "/background.webp",
    notes: [
      {
        note: "probando nota1",
        description: "description1",
        date: "12/10/2025",
        image: "/background.webp",
      },
      {
        note: "probando nota2",
        date: "12/10/2025 12:35",
        image: "/background.webp",
      },
      { note: "probando nota3", date: "12/10/2025", image: "  " },
      { note: "probando nota4", date: "12/10/2025", image: "  " },
      { note: "probando nota5", date: "12/10/2025", image: "/background.webp" },
      { note: "probando nota4", date: "12/10/2025", image: "  " },
      { note: "probando nota5", date: "12/10/2025", image: "/background.webp" },
      { note: "probando nota4", date: "12/10/2025", image: "  " },
      { note: "probando nota5", date: "12/10/2025", image: "/background.webp" },
      { note: "probando nota4", date: "12/10/2025", image: "  " },
      { note: "probando nota5", date: "12/10/2025", image: "/background.webp" },
      { note: "probando nota4", date: "12/10/2025", image: "  " },
      { note: "probando nota5", date: "12/10/2025", image: "/background.webp" },
      { note: "probando nota4", date: "12/10/2025", image: "  " },
      { note: "probando nota5", date: "12/10/2025", image: "/background.webp" },
    ],
    taskDescription: "Creación de landing con popup de contacto",
    startDate: startDate,
    endDate: startDate,
  },
];

export default function ScheduleTable({ time }) {
  const { task, newTask, deleteTask, addNote, deleteNote, lastTaskId } =
    useFireStore();
  const [open, setOpen] = useState(false);
  const { theme, textTheme } = useFireStore();
  const [descrition, setDescrition] = useState("");
  const [name, setName] = useState("");
  const [endDate, setEndDate] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [expiration, setExpiration] = useState(false);

  const auth = getAuth();
  const uid = auth.currentUser?.uid;
  const fileRef = useRef(null);

  async function uploadTaskImage(taskId, file) {
    const formData = new FormData();
    formData.append("file", file);

    // Puedes enviar otros datos si los necesitas
    formData.append("taskId", taskId);

    const res = await fetch(`/api/task/${uid}/${taskId}`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    return await res.json(); // ← aquí viene secure_url
  }
  const handleImage = (file) => {
    fileRef.current = file;
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      setNewImage(url);
    };

    img.onerror = () => {
      toast.error("Error loading image");
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };
  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImage(files[0]);
    }
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    setOpen(false);
    if (!expiration) {
      setEndDate("");
    }
    const nextId = lastTaskId + 1;

    let uploadedImageUrl = null;

    // 1. Subir imagen SI EXISTE
    if (newImage && fileRef.current) {
      try {
        const upload = await uploadTaskImage(nextId, fileRef.current);

        uploadedImageUrl = upload.secure_url;
      } catch (err) {
        toast.error("Error uploading image");
        console.error(err);
      }
    }

    // 2. Crear task con url incluida si existe
    const form = {
      id: nextId,
      name,
      descrition,
      startDate: time,
      endDate,
      state: "active",
      notes: [],
      image: uploadedImageUrl ?? "", // 👈 guardar url en el store
    };

    newTask(form);

    // Reset
    setName("");
    setDescrition("");
    setEndDate("");
    setNewImage(null);
  };
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      for (let item of items) {
        if (item.type.includes("image")) {
          const blob = item.getAsFile();
          fileRef.current = blob;
          const img = URL.createObjectURL(blob);
          setNewImage(img);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  useEffect(() => {
    if (!open) {
      setName("");
      setDescrition("");
      setEndDate("");
      setNewImage(null);
    }
  }, [open]);
  return (
    <>
      <div className="w-full h-full flex flex-col items-center gap-4 pt-6">
        <div className=" w-full h-full grid grid-cols-2 gap-2 px-10">
          <div className="grid grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {task &&
                task.map((e, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      layout: { type: "spring", stiffness: 300, damping: 25 },
                      duration: 0.4,
                      ease: "easeInOut",
                    }}
                    className="w-full"
                  >
                    <Task
                      addNote={addNote}
                      deleteNote={deleteNote}
                      key={i}
                      time={time}
                      theme={theme}
                      textTheme={textTheme}
                      task={e}
                      deleteTask={deleteTask}
                    />
                  </motion.div>
                ))}
              <motion.div
                style={{
                  border: `2px dotted ${textTheme}`,
                  backgroundColor: theme,
                }}
                onClick={() => setOpen(true)}
                key="extra-box"
                layout
                className="opacity-70 h-16 w-full rounded-xl p-4 flex justify-center items-center hover:opacity-80 "
              >
                <IconPlus color={textTheme} size={40} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div></div>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          style={{ color: textTheme }}
          className="max-w-2xl  bg-black border-white border-2 overflow-y-auto flex flex-col gap-4 "
        >
          <DialogHeader className="flex flex-col items-center">
            <DialogTitle>Create new task</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit}>
            <div className="w-full h-full">
              <label
                style={{
                  border: `1px ${!newImage ? "dotted" : "solid"} ${textTheme}`,
                }}
                htmlFor="newImage"
                className="items-center flex justify-center"
              >
                {newImage ? (
                  <img className="max-w-xl max-h-48" src={newImage} />
                ) : (
                  <div className="flex items-center justify-center font-bold max-w-xl h-48">
                    Paste an Image
                  </div>
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
            <div className="flex w-full gap-4">
              <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-col w-full">
                  <label className="font-bold">Name</label>
                  <Input
                    placeholder="Name"
                    value={name}
                    required
                    onChange={(e) => setName(e.currentTarget.value)}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label className="font-bold">Task Description</label>
                  <Textarea
                    placeholder="Description"
                    rows={4}
                    required
                    className="resize-none"
                    value={descrition}
                    onChange={(e) => setDescrition(e.currentTarget.value)}
                  />
                </div>
              </div>
              <div className="w-full flex flex-col pt-2 gap-2 ">
                <div className="flex gap-2">
                  <span className="font-bold ">End Date:</span>
                  <input
                    onChange={(e) => setExpiration(e.target.checked)}
                    type="checkbox"
                  />
                </div>
                {expiration && (
                  <div className="flex flex-col">
                    <TimePicker setNewDate={setEndDate} />
                  </div>
                )}
              </div>
            </div>
            <div className="w-full flex justify-center px-4 pt-4">
              <Button
                onClick={() => console.log(endDate)}
                style={{ backgroundColor: theme, color: textTheme }}
                className="w-full font-bold"
              >
                Create Task
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
