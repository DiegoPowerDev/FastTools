import React from "react";
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
        <TooltipProvider key={i} delayDuration={1}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                onClick={() => {
                  if (e.color) {
                    setTheme(`${e.color}`);
                    toast(() => (
                      <span className="flex items-center justify-center gap-4">
                        Updated {mode} color
                        <div
                          className="h-4 w-4"
                          style={{ backgroundColor: `#${e.color}` }}
                        ></div>
                      </span>
                    ));
                  }
                }}
                style={{
                  backgroundColor: `#${e.color}`,
                  outline: theme === `#${e.color}` ? `2px solid white` : "",
                  borderRadius: "5px",
                }}
                className="w-8 h-8"
              ></div>
            </TooltipTrigger>
            {e.nombre && (
              <TooltipContent>
                <p>{e.nombre}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}
