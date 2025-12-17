"use client";
import { useState } from "react";
import JWTGenerator from "./JWTGenerator";
import JWTVerifier from "./JWTVerifier";
import { IconHash, IconZoomCode } from "@tabler/icons-react";

export default function Hasher({ theme, textTheme }) {
  const [action, setAction] = useState("hash");

  return (
    <div
      style={{ border: `2px solid ${theme}`, color: textTheme }}
      className="flex flex-col h-full rounded-xl overflow-hidden"
    >
      <div
        style={{
          backgroundColor: theme,
        }}
        className={`relative  h-14 items-center justify-center md:grid grid-cols-6 md:grid-rows-1 flex w-full`}
      >
        <div className="md:col-start-1 md:col-end-4 text-xl  w-full font-bold uppercase flex justify-center items-center">
          JWT
        </div>
        <div className=" md:col-start-4 md:col-end-7 flex justify-center items-center gap-4">
          <button
            style={{
              color: textTheme,
              outline:
                action === "hash"
                  ? `2px solid ${textTheme}`
                  : `1px solid ${textTheme}40`,
            }}
            className={`flex p-2 rounded   font-bold items-center justify-center gap-2 hover:opacity-70`}
            onClick={() => setAction("hash")}
          >
            <div>ENCODE</div> <IconHash />
          </button>
          <button
            style={{
              color: textTheme,
              outline:
                action != "hash"
                  ? `2px solid ${textTheme}`
                  : `1px solid ${textTheme}40`,
            }}
            className={`flex p-2 rounded font-bold   items-center justify-center gap-2 hover:opacity-70`}
            onClick={() => setAction("verify")}
          >
            <div>DECODE </div>
            <IconZoomCode />
          </button>
        </div>
      </div>

      {/* Payload */}
      <div
        style={{ backgroundColor: `${theme}90` }}
        className="p-4 flex-1 flex flex-col"
      >
        {action === "hash" ? (
          <JWTGenerator theme={theme} textTheme={textTheme} />
        ) : (
          <JWTVerifier theme={theme} textTheme={textTheme} />
        )}
      </div>
    </div>
  );
}
