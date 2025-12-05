import { AnimatePresence, motion } from "framer-motion";
import { useFireStore } from "@/store/fireStore";

import Task from "../task/task";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import CreateTask from "../task/createTask";

export default function ScheduleTable() {
  const { task } = useFireStore();
  const [open, setOpen] = useState(false);
  const { theme, textTheme } = useFireStore();

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
            </AnimatePresence>
          </div>
          <div></div>
        </div>
      </div>
      <CreateTask open={open} setOpen={setOpen} />
    </>
  );
}
