import { AnimatePresence, motion } from "framer-motion";
import { useFireStore } from "@/store/fireStore";

import Task from "../task/task";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import CreateTask from "../task/createTask";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useClock } from "@/hooks/useClock";
import { set } from "date-fns/set";

export default function ScheduleTable() {
  const { task, updateExpiredTasks } = useFireStore();
  const time = useClock();
  const [open, setOpen] = useState(false);
  const { theme, textTheme } = useFireStore();
  const [mode, setMode] = useState("daily");
  const [section, setSection] = useState("attention");
  useEffect(() => {
    updateExpiredTasks();
    const interval = setInterval(() => {
      updateExpiredTasks();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [updateExpiredTasks]);

  const taskList = () => {
    if (mode === "all") {
      return task;
    }
    if (mode === "daily") {
      return task.filter((e) => e.frequency === "daily");
    }
    if (mode === "special") {
      return task.filter((e) => e.frequency === "special");
    }
    if (mode === "weekly") {
      return task.filter((e) => e.frequency === "weekly");
    }
    if (mode === "monthly") {
      return task.filter((e) => e.frequency === "monthly");
    }
  };

  const completedTaskList = () => {
    return task.filter((e) => e.state === "completed");
  };
  const expiredMiddleTasks = () => {
    const now = time; // tu variable de tiempo actual

    return (
      task
        .map((t) => {
          const start = t.startDate?.toDate?.() ?? new Date(t.startDate);
          const end = t.endDate?.toDate?.() ?? new Date(t.endDate);

          if (!start || !end) return null;

          const middle = new Date((start.getTime() + end.getTime()) / 2);

          return {
            ...t,
            isExpired: now > end,
            isMiddleExpired: now > middle,
          };
        })
        .filter((t) => t && t.isMiddleExpired)
        .filter((t) => t.state != "completed")
        // ⬆ Solo las que TRASPASARON middleTime
        .sort((a, b) => {
          // Primero las que excedieron endTime
          if (a.isExpired && !b.isExpired) return -1;
          if (!a.isExpired && b.isExpired) return 1;

          return 0; // si ambas están en el mismo grupo, mantener orden
        })
    );
  };

  return (
    <>
      <div className="w-full h-full flex justify-center items-center md:p-4">
        <div className="w-full h-full flex md:grid md:grid-cols-2 gap-4 p-2 md:px-12 justify-center">
          <div className="w-full h-full flex flex-col  items-center ">
            <div className="w-full h-full md:h-16 p-4 grid grid-cols-2 md:flex items-center justify-center gap-2 ">
              <Button
                style={{
                  backgroundColor: mode != "all" ? theme : "black",
                  color: mode !== "all" ? textTheme : "white",
                  border: mode == "all" && "1px solid white",
                }}
                onClick={() => setMode("all")}
                className={cn("font-bold text-xl rounded")}
              >
                ALL
              </Button>
              <Button
                style={{
                  backgroundColor: mode != "daily" ? theme : "black",
                  color: mode !== "daily" ? textTheme : "white",
                  border: mode == "daily" && "1px solid white",
                }}
                onClick={() => setMode("daily")}
                className={cn("font-bold text-xl rounded")}
              >
                DAILY
              </Button>
              <Button
                onClick={() => setMode("weekly")}
                style={{
                  backgroundColor: mode != "weekly" ? theme : "black",
                  color: mode !== "weekly" ? textTheme : "white",
                  border: mode == "weekly" && "1px solid white",
                }}
                className={cn("font-bold text-xl rounded ")}
              >
                WEEKLY
              </Button>
              <Button
                onClick={() => setMode("monthly")}
                style={{
                  backgroundColor: mode != "monthly" ? theme : "black",
                  color: mode !== "monthly" ? textTheme : "white",
                  border: mode == "monthly" && "1px solid white",
                }}
                className={cn("font-bold text-xl rounded")}
              >
                MONTHLY
              </Button>
              <Button
                onClick={() => setMode("special")}
                style={{
                  backgroundColor: mode != "special" ? theme : "black",
                  color: mode != "special" ? textTheme : "white",
                  border: mode == "special" && "1px solid white",
                }}
                className={cn("font-bold text-xl rounded")}
              >
                SPECIAL
              </Button>
            </div>
            <div className="w-full ">
              <AnimatePresence mode="popLayout">
                <div className="w-full grid grid-cols-3 auto-cols-fr grid-flow-row gap-4">
                  {taskList() &&
                    taskList().map((e, i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          layout: {
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          },
                          duration: 0.4,
                          ease: "easeInOut",
                        }}
                        className="w-full"
                      >
                        <Task task={e} />
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
                    className="opacity-80 h-16 w-full rounded-xl p-4 flex justify-center items-center hover:opacity-100 "
                  >
                    <IconPlus color={textTheme} size={40} />
                  </motion.div>
                </div>
              </AnimatePresence>
            </div>
          </div>
          <div className="hidden w-full h-full md:flex justify-center">
            <div className="hidden w-2/3 h-full md:flex flex-col  items-center ">
              <div className="w-full h-16 flex items-center justify-center gap-2 p-4">
                <Button
                  onClick={() => setSection("attention")}
                  style={{
                    backgroundColor: section != "attention" ? theme : "black",
                    color: section !== "attention" ? textTheme : "white",
                    border: section == "attention" && "1px solid white",
                  }}
                  className=" px-4 py-2 text-2xl font-bold rounded flex items-center justify-center"
                >
                  ATTENTION
                </Button>
                <Button
                  onClick={() => setSection("completed")}
                  style={{
                    backgroundColor: section != "completed" ? theme : "black",
                    color: section !== "completed" ? textTheme : "white",
                    border: section == "completed" && "1px solid white",
                  }}
                  className=" px-4 py-2 text-2xl font-bold rounded flex items-center justify-center"
                >
                  COMPLETED
                </Button>
              </div>
              <div className="w-full h-full grid grid-flow-rows grid-cols-2 place-content-center gap-4">
                {section === "attention"
                  ? expiredMiddleTasks().map((e, i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full"
                      >
                        <Task task={e} />
                      </motion.div>
                    ))
                  : completedTaskList().map((e, i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full"
                      >
                        <Task task={e} />
                      </motion.div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <CreateTask mode={mode} open={open} setOpen={setOpen} />
    </>
  );
}
