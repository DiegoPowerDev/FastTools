"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { fireStore, useFireStore } from "@/store/fireStore";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  rectIntersection,
  pointerWithin,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconLayoutNavbar,
  IconCalculator,
  IconVideoPlus,
  IconNote,
  IconPhotoEdit,
  IconLink,
  IconBrush,
  IconApi,
  IconHash,
  IconCrop,
  IconQrcode,
  IconColorPicker,
  IconRocket,
  IconDoor,
  IconSettings,
  IconClock,
  IconTools,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import MenuSettings from "../menuSettings/MenuSettings";
import { logout } from "@/firebase/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useClock } from "@/hooks/useClock";
import { cn } from "@/lib/utils";

// === Icon Map ===
const iconMap = {
  header: IconLayoutNavbar,
  calculator: IconCalculator,
  recorder: IconVideoPlus,
  notes: IconNote,
  conversor: IconPhotoEdit,
  links: IconLink,
  colors: IconBrush,
  apiTester: IconApi,
  jwt: IconHash,
  editor: IconCrop,
  qr: IconQrcode,
  picker: IconColorPicker,
};

// === Sortable Button ===
function SortableButton({ id, label, theme, textTheme }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const Icon = iconMap[label];
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: `0 0 15px 2px ${textTheme}`,
    color: textTheme,
    backgroundColor: theme,
    color: textTheme,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      aria-label={label}
      {...listeners}
      {...attributes}
      className={`relative h-14 w-14 p-2  rounded flex justify-center items-center cursor-grab active:cursor-grabbing touch-none ${
        label === "recorder" || label === "picker" ? "sm:block hidden" : ""
      }`}
    >
      <Icon size={40} />
    </div>
  );
}

// === Button Overlay (para DragOverlay) ===
function ButtonOverlay({ label, theme, textTheme }) {
  const Icon = iconMap[label];
  return (
    <div
      style={{
        boxShadow: `0 0 15px 2px ${textTheme}`,
        color: textTheme,
        backgroundColor: theme,
      }}
      className="relative h-14 w-14 rounded flex justify-center items-center cursor-grabbing"
    >
      <Icon size={40} />
    </div>
  );
}

// === Droppable Area ===
function DroppableArea({ id, items, theme, textTheme }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "container",
      containerId: id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-wrap gap-2 justify-center items-center min-h-[60px] transition-colors px-4 py-2"
      style={{
        borderRadius: "8px",
        width: "100%",
        backgroundColor: isOver
          ? id != "headerArea"
            ? `${theme}40`
            : `${textTheme}40`
          : "transparent",
      }}
    >
      <SortableContext
        id={id}
        items={items.map((i) => i.id)}
        strategy={horizontalListSortingStrategy}
      >
        {items.map((t) => (
          <SortableButton
            key={t.id}
            {...t}
            theme={theme}
            textTheme={textTheme}
          />
        ))}
      </SortableContext>
    </div>
  );
}

export default function FireToolBar() {
  const {
    theme,
    textTheme,
    headerArea,
    toolbarArea,
    moveButton,
    tabs,
    setTabs,
    setHeaderArea,
    setToolbarArea,
    setTheme,
    setTextTheme,
    setBackground,
    background,
    mobileBackground,
    setMobileBackground,
    images,
    setImages,
    setMode,
    mode,
    task,
  } = useFireStore();
  const time = useClock();
  const router = useRouter();
  const getOut = () => {
    fireStore.getState().resetStore();
    logout();
    toast.success("Session closed");
    router.push("/");
  };
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState(null);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const activeItem = activeId
    ? [...headerArea, ...toolbarArea].find((item) => item.id === activeId)
    : null;

  // Estrategia de detección de colisión personalizada
  const customCollisionDetection = (args) => {
    // Primero intenta detectar colisiones con elementos dentro de las áreas (más preciso)
    const pointerCollisions = pointerWithin(args);

    if (pointerCollisions.length > 0) {
      // Filtra solo las colisiones con botones o contenedores
      const validCollisions = pointerCollisions.filter((collision) => {
        const id = collision.id;
        return (
          id === "headerArea" ||
          id === "toolbarArea" ||
          headerArea.some((item) => item.id === id) ||
          toolbarArea.some((item) => item.id === id)
        );
      });

      if (validCollisions.length > 0) {
        return validCollisions;
      }
    }

    // Si no hay colisión directa, usa intersección de rectángulos
    const intersectionCollisions = rectIntersection(args);

    if (intersectionCollisions.length > 0) {
      // Filtra solo colisiones válidas
      const validCollisions = intersectionCollisions.filter((collision) => {
        const id = collision.id;
        return (
          id === "headerArea" ||
          id === "toolbarArea" ||
          headerArea.some((item) => item.id === id) ||
          toolbarArea.some((item) => item.id === id)
        );
      });

      return validCollisions;
    }

    return [];
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Determinar área de origen
    const isFromHeader = headerArea.some((b) => b.id === activeId);
    const from = isFromHeader ? "headerArea" : "toolbarArea";

    // Determinar área de destino
    let to = null;

    // Si overId es el ID de un área droppable
    if (overId === "headerArea" || overId === "toolbarArea") {
      to = overId;
    }
    // Si overId es el ID de un botón
    else if (toolbarArea.some((b) => b.id === overId)) {
      to = "toolbarArea";
    } else if (headerArea.some((b) => b.id === overId)) {
      to = "headerArea";
    }

    if (!to) return;

    // Mismo contenedor: reordenar
    if (from === to && activeId !== overId) {
      const sourceItems = from === "headerArea" ? headerArea : toolbarArea;
      const setter = from === "headerArea" ? setHeaderArea : setToolbarArea;

      const oldIndex = sourceItems.findIndex((item) => item.id === activeId);
      const newIndex = sourceItems.findIndex((item) => item.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        setter(arrayMove(sourceItems, oldIndex, newIndex));
      }
    }
    // Diferente contenedor: mover
    else if (from !== to) {
      moveButton(activeId, from, to);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };
  function format(value) {
    if (value < 10) return `0${value}`;
    else return value;
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      sensors={sensors}
      collisionDetection={customCollisionDetection}
    >
      {/* HEADER AREA */}
      {tabs.header && (
        <div
          style={{
            backgroundColor: theme,
            color: textTheme,
          }}
          className="w-screen flex h-full items-center justify-center "
        >
          <div
            className="w-full h-full flex items-center justify-between"
            key="headerBar"
          >
            <div className="w-24 flex h-full items-center justify-center p-2">
              <Dialog>
                <DialogTrigger aria-label="Abrir menú">
                  <motion.div
                    whileHover={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "linear",
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                  >
                    <IconSettings size={60} />
                  </motion.div>
                </DialogTrigger>
                <DialogContent
                  style={{ color: textTheme }}
                  className="w-full bg-black border-white border-2 overflow-hidden"
                >
                  <DialogHeader>
                    <DialogTitle className="flex justify-center items-center font-bold">
                      SETTINGS
                    </DialogTitle>
                    <DialogDescription></DialogDescription>
                  </DialogHeader>
                  <MenuSettings
                    setBackground={setBackground}
                    background={background}
                    textTheme={textTheme}
                    theme={theme}
                    setTheme={setTheme}
                    setTextTheme={setTextTheme}
                    mobileBackground={mobileBackground}
                    setMobileBackground={setMobileBackground}
                    images={images}
                    setImages={setImages}
                  />
                </DialogContent>
              </Dialog>
            </div>
            <div
              initial={{ opacity: 0, scale: 0.9 }}
              className="w-full flex flex-col items-center justify-center "
            >
              <span
                style={{ textShadow: `0 0 20px ${textTheme}` }}
                className="text-5xl font-bold text-center"
              >
                FAST TOOLS
              </span>
              {mode === "tools" && (
                <DroppableArea
                  id="headerArea"
                  items={headerArea}
                  theme={theme}
                  textTheme={textTheme}
                />
              )}
            </div>

            <div
              className=" flex items-center justify-center h-full hover:scale-125 duration-300 p-8"
              onClick={() => {
                getOut();
              }}
            >
              <IconDoor color={textTheme} size={40} />
            </div>
          </div>
        </div>
      )}

      {/* TOOLBAR AREA */}
      <div className=" w-screen flex justify-between items-center gap-2 h-20 px-8">
        <motion.div
          animate={{
            x: [1, -1, 1, -1, 1, 0],
            y: [0, -1, 1, -1, 1, 0],
          }}
          transition={{
            duration: 0.1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            boxShadow: `0 0 15px 5px ${textTheme}`,
            backgroundColor: theme,
            color: textTheme,
          }}
          onClick={() => {
            setTabs("header");
          }}
          className={`h-14 w-14 p-2 rounded flex-shrink-0 ${
            tabs.header ? "opacity-70" : ""
          }`}
        >
          <IconRocket size={40} />
        </motion.div>

        <div className="flex-1">
          {mode === "tools" ? (
            <DroppableArea
              id="toolbarArea"
              items={toolbarArea}
              theme={theme}
              textTheme={textTheme}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div
                style={{
                  color: textTheme,
                  backgroundColor: theme,
                  textShadow: `0 0 15px ${textTheme}`,
                }}
                onClick={() => console.log(task)}
                className=" w-56 rounded text-center font-bolt text-5xl py-2"
              >
                {format(time.getHours())}:{format(time.getMinutes())}:
                {format(time.getSeconds())}
              </div>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex flex-col md:flex-row justify-end cursor-pointer gap-4"
          )}
        >
          <div
            onClick={() => setMode("tools")}
            style={{
              boxShadow: mode === "tools" && `0 0 5px 2px ${textTheme}`,
              backgroundColor: theme,
              color: textTheme,
            }}
            className={`h-14 w-14 p-2 rounded flex-shrink-0}`}
          >
            <IconTools color={textTheme} size={40} />
          </div>
          <div
            onClick={() => setMode("schedule")}
            style={{
              boxShadow: mode === "schedule" && `0 0 5px 2px ${textTheme}`,
              backgroundColor: theme,
              color: textTheme,
            }}
            className={`h-14 w-14 p-2 rounded flex-shrink-0}`}
          >
            <IconClock color={textTheme} size={40} />
          </div>
        </div>
      </div>

      {/* DragOverlay para mostrar el botón mientras se arrastra */}
      <DragOverlay>
        {activeItem ? (
          <ButtonOverlay
            label={activeItem.label}
            theme={theme}
            textTheme={textTheme}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
