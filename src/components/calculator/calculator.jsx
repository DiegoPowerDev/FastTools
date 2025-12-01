"use client";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { IconBackspace, IconEqual } from "@tabler/icons-react";

const Calculator = ({ theme = "#3b82f6", textTheme = "#ffffff" }) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState(false);

  // Función segura para evaluar expresiones matemáticas
  const safeEval = (expression) => {
    try {
      // Limpieza: solo permitir números, operadores y puntos
      const sanitized = expression.replace(/[^0-9+\-*/.()]/g, "");

      if (!sanitized || sanitized.trim() === "") {
        return "";
      }

      // Prevenir divisiones consecutivas o múltiples operadores
      if (/[\+\-\*\/]{2,}/.test(sanitized)) {
        return "Error";
      }

      // Usar Function constructor (más seguro que eval)
      const result = new Function("return " + sanitized)();

      // Validar resultado
      if (!isFinite(result)) {
        return "Error";
      }

      // Redondear a 8 decimales para evitar errores de punto flotante
      return Math.round(result * 100000000) / 100000000;
    } catch {
      return "Error";
    }
  };

  const handleInput = (value) => {
    setError(false);

    // Prevenir operadores al inicio (excepto - y paréntesis)
    if (input === "" && ["+", "*", "/", "."].includes(value)) {
      return;
    }

    // Prevenir múltiples puntos decimales en un número
    if (value === ".") {
      // Obtener el último número (después del último operador o paréntesis)
      const lastNumber = input.split(/[\+\-\*\/\(\)]/).pop();
      if (lastNumber.includes(".")) {
        return;
      }
    }

    // Prevenir paréntesis de cierre si no hay paréntesis de apertura
    if (value === ")") {
      const openCount = (input.match(/\(/g) || []).length;
      const closeCount = (input.match(/\)/g) || []).length;
      if (closeCount >= openCount) {
        return;
      }
    }

    const newInput = input + value;
    setInput(newInput);

    // Calcular en tiempo real solo si la expresión parece completa
    const evalResult = safeEval(newInput);
    if (evalResult === "Error") {
      setError(true);
      setResult("");
    } else {
      setResult(evalResult.toString());
    }
  };

  const handleBackspace = () => {
    const newInput = input.slice(0, -1);
    setInput(newInput);
    setError(false);

    if (newInput) {
      const evalResult = safeEval(newInput);
      setResult(evalResult === "Error" ? "" : evalResult.toString());
    } else {
      setResult("");
    }
  };

  const clearInput = () => {
    setInput("");
    setResult("");
    setError(false);
  };

  // Formatear número para mejor legibilidad
  const formatDisplay = (value) => {
    if (!value) return "";
    const num = parseFloat(value);
    if (isNaN(num)) return value;

    // Si es muy largo, usar notación científica
    if (
      Math.abs(num) > 999999999999 ||
      (Math.abs(num) < 0.000001 && num !== 0)
    ) {
      return num.toExponential(9);
    }

    return value;
  };
  const handleEquals = () => {
    if (input) {
      const evalResult = safeEval(input);
      if (evalResult === "Error") {
        setError(true);
        setResult("Error");
      } else {
        setResult(evalResult.toString());
        setInput(evalResult.toString());
      }
    }
  };
  return (
    <div
      style={{ border: `2px solid ${theme}`, color: textTheme }}
      className=" h-full rounded-xl overflow-hidden shadow-2xl"
    >
      <div className="h-full  grid grid-cols-1 md:grid-cols-2 grid-rows-[1fr_3fr] md:grid-rows-1">
        <div
          style={{
            backgroundColor: "black",
          }}
          className="  h-full grid grid-rows-[auto,1fr]"
        >
          <div className="flex w-full md:p-4 text-sm md:text-xl items-center justify-center font-semibold tracking-wider">
            RESULT
          </div>
          <div className="flex flex-col items-center justify-center md:pb-12">
            {result ? (
              <div
                style={{ color: error ? "red" : textTheme }}
                className={`font-bold transition-all duration-300 ${
                  result.length > 16
                    ? "text-xl md:text-2xl"
                    : "text-2xl md:text-3xl"
                }`}
              >
                {error ? "⚠ Error" : `= ${formatDisplay(result)}`}
              </div>
            ) : (
              <div className="text-2xl md:text-4xl">0</div>
            )}
          </div>
        </div>

        <div className="grid grid-rows-[auto,1fr,auto]">
          <div
            style={{ borderLeft: `1px solid ${textTheme}` }}
            className="flex items-center"
          >
            <input
              type="text"
              value={input}
              readOnly
              placeholder="0"
              style={{
                color: error ? "red" : textTheme,
              }}
              className="placeholder:text-white w-full p-4 border-none  text-right text-xl md:text-2xl bg-black border-2  transition-colors duration-200"
            />
          </div>

          <div className="h-full w-full grid grid-cols-4">
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
              "(",
              "0",
              ")",
              "+",
            ].map((symbol) => (
              <button
                key={symbol}
                style={{
                  backgroundColor: ["(", "/", "*", "-", "+", ")"].includes(
                    symbol
                  )
                    ? "black"
                    : theme,
                  color: textTheme,
                  borderTop: `1px solid ${textTheme}`,
                  borderLeft: `1px solid ${textTheme}`,
                }}
                onClick={() => handleInput(symbol)}
                className=" active:scale-125 transition-all duration-150 font-semibold  shadow-lg hover:shadow-xl"
              >
                {symbol}
              </button>
            ))}
          </div>

          <div className="h-full grid grid-cols-4 ">
            <button
              onClick={() => handleInput(".")}
              style={{
                borderTop: `1px solid ${textTheme}`,
                borderLeft: `1px solid ${textTheme}`,
                backgroundColor: theme,
                color: textTheme,
              }}
              className="font-bold  active:scale-125 transition-all duration-150 shadow-lg"
            >
              .
            </button>
            <button
              style={{
                backgroundColor: "black",
                color: "white",
                borderTop: `1px solid ${textTheme}`,
                borderLeft: `1px solid ${textTheme}`,
              }}
              onClick={handleEquals}
              className=" active:scale-125 transition-all duration-150 font-bold shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <IconEqual size={30} />
            </button>
            <button
              style={{
                borderTop: `1px solid ${textTheme}`,
                borderLeft: `1px solid ${textTheme}`,
              }}
              onClick={handleBackspace}
              className="p-2 font-bold  active:scale-125 transition-all duration-150 bg-red-600 text-white s hadow-lg flex items-center justify-center"
            >
              <IconBackspace size={30} />
            </button>
            <button
              style={{
                borderTop: `1px solid ${textTheme}`,
                borderLeft: `1px solid ${textTheme}`,
              }}
              onClick={clearInput}
              className="bg-white text-black  font-bold  active:scale-125 transition-all duration-150 shadow-lg"
            >
              CLEAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
