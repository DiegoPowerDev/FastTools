import { AnimatePresence, motion } from "framer-motion";
import { useFireStore } from "@/store/fireStore";

import Task from "../task/task";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import CreateTask from "../task/createTask";
import { useClock } from "@/hooks/useClock";

export default function ScheduleTable() {
  const { task, updateExpiredTasks, period, completed } = useFireStore();
  const time = useClock();
  const [open, setOpen] = useState(false);
  const { theme, textTheme } = useFireStore();
  useEffect(() => {
    updateExpiredTasks();
    const interval = setInterval(() => {
      updateExpiredTasks();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [updateExpiredTasks]);

  const taskList = () => {
    if (period === "all") {
      if (completed) {
        return task.filter((e) => e.state != "completed");
      }
      return task;
    }
    if (period === "daily") {
      const taskList = task.filter((e) => e.frequency === "daily");
      if (completed) {
        return taskList.filter((e) => e.state != "completed");
      }
      return taskList;
    }
    if (period === "special") {
      const taskList = task.filter((e) => e.frequency === "special");
      if (completed) {
        return taskList.filter((e) => e.state != "completed");
      }
      return taskList;
    }
    if (period === "weekly") {
      const taskList = task.filter((e) => e.frequency === "weekly");
      if (completed) {
        return taskList.filter((e) => e.state != "completed");
      }
      return taskList;
    }
    if (period === "monthly") {
      const taskList = task.filter((e) => e.frequency === "monthly");
      if (completed) {
        return taskList.filter((e) => e.state != "completed");
      }
      return taskList;
    }
  };

  const expiredMiddleTasks = () => {
    const now = time; // tu variable de tiempo actual

    return (
      task
        .map((t) => {
          const start = t.startDate?.toDate?.() ?? new Date(t.startDate);
          const end = t.endDate?.toDate?.() ?? new Date(t.endDate);

          if (!start || !end) return null;

          // 🔥 calcular primer tercio del tiempo
          const total = end.getTime() - start.getTime();
          const firstThird = start.getTime() + total / 3;

          return {
            ...t,
            isExpired: now > end, // vencidas
            isMiddleExpired: now.getTime() > firstThird, // pasaron el primer tercio
          };
        })
        // ⬆ Solo las que ya pasaron el primer tercio
        .filter((t) => t && t.isMiddleExpired)
        .filter((t) => t.state !== "completed")
        .sort((a, b) => {
          // Primero las que YA vencieron
          if (a.isExpired && !b.isExpired) return -1;
          if (!a.isExpired && b.isExpired) return 1;
          return 0;
        })
    );
  };

  return (
    <>
      <div className="w-full flex-1 flex justify-center md:px-4">
        <div className="w-full h-full flex md:grid md:grid-cols-2 gap-4 md:px-12 justify-center">
          <div className="w-full h-full flex flex-col">
            <div className="w-full ">
              <AnimatePresence mode="popLayout">
                <div className="w-full grid grid-cols-3 auto-cols-fr grid-flow-row gap-4 p-4">
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
            <div className="w-full grid grid-cols-3 auto-cols-fr grid-flow-row gap-4 p-4 ">
              <div></div>

              <div className="w-full h-full flex flex-col gap-4">
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

              <div></div>
            </div>
          </div>
        </div>
      </div>
      <CreateTask open={open} setOpen={setOpen} />
    </>
  );
}
