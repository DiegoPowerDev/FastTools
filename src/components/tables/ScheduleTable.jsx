import { AnimatePresence, motion } from "framer-motion";
import { useFireStore } from "@/store/fireStore";

import Task from "../task/task";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import CreateTask from "../task/createTask";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useClock } from "@/hooks/useClock";

export default function ScheduleTable() {
  const { task, updateExpiredTasks } = useFireStore();
  const time = useClock();
  const [open, setOpen] = useState(false);
  const { theme, textTheme } = useFireStore();
  const [mode, setMode] = useState("all");
  useEffect(() => {
    const interval = setInterval(() => {
      updateExpiredTasks();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
  const expiredMiddleTasks = () => {
    return task.filter((t) => {
      const start = t.startDate?.toDate?.() ?? t.startDate;
      const end = t.endDate?.toDate?.() ?? t.endDate;

      if (!start || !end) return false;

      const middle = new Date((start.getTime() + end.getTime()) / 2);

      return time > middle;
    });
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
                }}
                onClick={() => setMode("all")}
                className={cn("font-bold text-xl")}
              >
                ALL
              </Button>
              <Button
                style={{
                  backgroundColor: mode != "daily" ? theme : "black",
                  color: mode !== "daily" ? textTheme : "white",
                }}
                onClick={() => setMode("daily")}
                className={cn("font-bold text-xl")}
              >
                DAILY
              </Button>
              <Button
                onClick={() => setMode("weekly")}
                style={{
                  backgroundColor: mode != "weekly" ? theme : "black",
                  color: mode !== "weekly" ? textTheme : "white",
                }}
                className={cn("font-bold text-xl")}
              >
                WEEKLY
              </Button>
              <Button
                onClick={() => setMode("monthly")}
                style={{
                  backgroundColor: mode != "monthly" ? theme : "black",
                  color: mode !== "monthly" ? textTheme : "white",
                }}
                className={cn("font-bold text-xl")}
              >
                MONTHLY
              </Button>
              <Button
                onClick={() => setMode("special")}
                style={{
                  backgroundColor: mode != "special" ? theme : "black",
                  color: mode !== "special" ? textTheme : "white",
                }}
                className={cn("font-bold text-xl")}
              >
                SPECIAL
              </Button>
            </div>
            <div className="w-full ">
              <div className="w-full grid grid-cols-[auto_auto_auto]">
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
                      className="opacity-70 h-16 w-full rounded-xl p-4 flex justify-center items-center hover:opacity-80 "
                    >
                      <IconPlus color={textTheme} size={40} />
                    </motion.div>
                  </div>
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="hidden w-full h-full md:flex flex-col  items-center ">
            <div className="w-full h-20 flex items-center justify-center gap-2 p-4">
              <h2
                style={{ backgroundColor: theme, color: textTheme }}
                className=" px-4 py-2 text-2xl font-bold rounded-xl flex items-center justify-center"
              >
                ATTENTION
              </h2>
            </div>
            <div className="w-full h-full grid grid-rows-4 grid-flow-col place-content-center gap-4">
              {expiredMiddleTasks().map((e, i) => (
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
      <CreateTask mode={mode} open={open} setOpen={setOpen} />
    </>
  );
}
