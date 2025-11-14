"use client";
import React, { useState } from "react";
import { Input } from "./ui/input";

const Calculator = ({ theme, textTheme }) => {
  const [input, setInput] = useState(""); // Estado para el input del usuario
  const [result, setResult] = useState("");
  const [hover, setHover] = useState(false);

  // Manejar la entrada del usuario
  const handleInput = (value) => {
    const newInput = input + value;
    setInput(newInput);

    // Calcular automáticamente
    try {
      const evalResult = eval(newInput); // Evalúa la expresión
      setResult(evalResult.toString());
    } catch {
      setResult(""); // Si hay un error (expresión inválida), limpiar resultado
    }
  };

  // Limpiar la entrada
  const clearInput = () => {
    setInput("");
    setResult("");
  };

  return (
    <div
      style={{ border: `2px solid ${theme}` }}
      className={`h-full border- rounded-xl overflow-hidden`}
    >
      <div className="h-full  p-5 md:px-10 grid grid-cols-2">
        <div className="h-full  grid grid-row-[1fr,2fr] ">
          <div className="flex w-full p-2  text-xl text-white items-center justify-center ">
            EQUAL TO =
          </div>
          {result && `= ${result}` ? (
            <div
              className={`grid h-full p-2  text-white items-start justify-center  ${
                result.length > 10 ? "text-sm" : "text-3xl"
              }`}
            >
              {result}
            </div>
          ) : (
            <div className="w-full p-2 text-right text-black h-5"></div>
          )}
        </div>

        <div className="  grid grid-cols-1  align-middle">
          <div className="p-2 flex items-center">
            <Input
              style={{ color: textTheme }}
              type="text"
              value={input}
              readOnly
              className="w-full p-2 text-right text-xl border border-gray-300 rounded-md"
            />
          </div>
          <div className="p-2 grid grid-cols-4 gap-2">
            {[
              "7",
              "8",
              "9",
              "/",
              "4",
              "5",
              "6",
              "*",
              "1",
              "2",
              "3",
              "-",
              "0",
              ".",
              "+",
            ].map((symbol) => (
              <button
                key={symbol}
                style={{ backgroundColor: theme, color: textTheme }}
                onClick={() => handleInput(symbol)}
                className="p-2 rounded hover:opacity-70 "
              >
                {symbol}
              </button>
            ))}
          </div>
          <button
            style={{
              backgroundColor: theme,
              color: textTheme,
            }}
            onClick={clearInput}
            className="m-2 p-2 text-white rounded font-bold hover:opacity-70"
          >
            CLEAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
