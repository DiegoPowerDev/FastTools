"use client";
import { useState } from "react";
import Rest from "./rest";
import Websocket from "./websocket";
import { IconBrandSocketIo } from "@tabler/icons-react";
export default function ApiTester({
  theme,
  textTheme,
  api,
  setApi,
  socketApi,
  setSocketApi,
}) {
  const [modo, setModo] = useState("rest");
  return (
    <div
      style={{
        border: `2px solid ${theme}`,
        color: textTheme,
      }}
      className=" h-full overflow-hidden flex flex-col items-center justify-start w-full rounded-xl shadow-xl"
    >
      <div
        style={{
          backgroundColor: theme,
        }}
        className={`relative min-h-14 items-center justify-center md:grid grid-cols-6 md:grid-rows-1 flex w-full`}
      >
        <div className="md:col-start-1 md:col-end-4 text-xl  w-full font-bold uppercase flex justify-center items-center text-center">
          API TESTER
        </div>
        <div className="md:col-start-4 md:col-end-7 flex justify-center items-center gap-4">
          <button
            style={{
              color: textTheme,
              outline:
                modo === "rest"
                  ? `2px solid ${textTheme}`
                  : `1px solid ${textTheme}40`,
            }}
            className={`flex p-2 rounded font-bold items-center justify-center gap-2 hover:opacity-70`}
            onClick={() => setModo("rest")}
          >
            <div>HTTP</div>
          </button>
          <button
            style={{
              color: textTheme,
              outline:
                modo != "rest"
                  ? `2px solid ${textTheme}`
                  : `1px solid ${textTheme}40`,
            }}
            className={`flex p-2 rounded font-bold  items-center justify-center gap-2 hover:opacity-70`}
            onClick={() => setModo("websocket")}
          >
            <div>WEBSOCKET </div>
            <IconBrandSocketIo />
          </button>
        </div>
      </div>
      {modo === "rest" ? (
        <Rest theme={theme} textTheme={textTheme} api={api} setApi={setApi} />
      ) : (
        <Websocket
          theme={theme}
          textTheme={textTheme}
          socketApi={socketApi}
          setsocketApi={setSocketApi}
        />
      )}
    </div>
  );
}
