import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from "react-hot-toast";

export default function ColorGrill({ colors, theme, setTheme, mode }) {
  return (
    <div className="grid grid-rows-4 grid-flow-col gap-1">
      {colors.map((e, i) => (
        <Color
          key={i}
          colors={e}
          theme={theme}
          setTheme={setTheme}
          mode={mode}
        />
      ))}
    </div>
  );
}

function Color({ colors, theme, setTheme, mode }) {
  const [open, setOpen] = useState(false);
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip open={open} onOpenChange={(v) => setOpen(v)}>
        <TooltipTrigger asChild>
          <div
            onPointerEnter={() => setOpen(true)}
            onPointerLeave={() => {
              setTimeout(() => setOpen(false), 0);
            }}
            onClick={() => {
              if (colors.color) {
                setTheme(`${colors.color}`);
                toast(() => (
                  <span className="flex items-center justify-center gap-4">
                    Updated {mode} color
                    <div
                      className="h-4 w-4"
                      style={{ backgroundColor: `#${colors.color}` }}
                    ></div>
                  </span>
                ));
              }
            }}
            style={{
              backgroundColor: `#${colors.color}`,
              outline: theme === `#${colors.color}` ? `2px solid white` : "",
              borderRadius: "5px",
            }}
            className="w-8 h-8"
          ></div>
        </TooltipTrigger>
        {colors.nombre && (
          <TooltipContent
            className="select-none"
            onPointerEnter={() => setOpen(false)}
          >
            <p>{colors.nombre}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
