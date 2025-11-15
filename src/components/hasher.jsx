"use client";
import { useState } from "react";
import JWTGenerator from "./hasher/JWTGenerator";
import JWTVerifier from "./hasher/JWTVerifier";
import { IconHash, IconZoomCode } from "@tabler/icons-react";

export default function Hasher({ theme, textTheme }) {
  const [action, setAction] = useState("hash");

  return (
    <div className="h-full w-full">
      <div
        style={{ border: `2px solid ${theme}`, color: textTheme }}
        className="w-full h-full  rounded-lg border overflow-hidden"
      >
        <div
          style={{
            backgroundColor: theme,
          }}
          className={`relative  h-14 items-center justify-center md:grid grid-cols-6 md:grid-rows-1 flex w-full`}
        >
          <div className="md:col-start-1 md:col-end-4 text-xl  w-full font-bold uppercase flex justify-center items-center">
            HASHER
          </div>
          <div className="md:col-start-4 md:col-end-7 flex justify-center items-center gap-4">
            <div
              style={{
                backgroundColor: action === "hash" && "white",
                boxShadow: action === "hash" && `0px 0px 5px 1px white`,
              }}
              className={`flex p-2 rounded ${
                action != "hash" ? "border-white" : "border-black text-black"
              } border-2 font-bold items-center justify-center gap-2 hover:opacity-70`}
              onClick={() => setAction("hash")}
            >
              <div>HASH</div> <IconHash />
            </div>
            <div
              style={{
                backgroundColor: action === "verify" && "white",
                boxShadow: action === "verify" && `0px 0px 5px 1px white  `,
              }}
              className={`flex p-2 rounded font-bold  ${
                action != "verify" ? "border-white" : "border-black text-black"
              } border-2 items-center justify-center gap-2 hover:opacity-70`}
              onClick={() => setAction("verify")}
            >
              <div>VERIFY </div>
              <IconZoomCode />
            </div>
          </div>
        </div>

        {/* Payload */}
        <div className="p-4">
          {action === "hash" ? (
            <JWTGenerator theme={theme} textTheme={textTheme} />
          ) : (
            <JWTVerifier theme={theme} textTheme={textTheme} />
          )}
        </div>
      </div>
    </div>
  );
}
