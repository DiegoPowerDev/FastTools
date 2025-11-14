"use client";

import React, { useState } from "react";
import Login from "./login";
import Register from "./register";
import { Button } from "./ui/button";
import { loginWithGoogle } from "@/firebase/auth";
import toast from "react-hot-toast";

export default function AuthenticateForm({ theme, textTheme }) {
  const [modo, setModo] = useState("login");

  const handleGoogleLogin = () => {
    loginWithGoogle((res) => {
      if (res.success) {
        toast.success("Sesión iniciada con Google");
      } else {
        toast.error(res.error.message);
      }
    });
  };

  return (
    <>
      <div className="w-full items-center justify-center flex gap-2">
        <Button
          variant="ghost"
          className="font-bold p-2 rounded"
          style={{
            color: modo === "login" ? textTheme : theme,
            border: modo === "login" ? "2px solid white" : "2px solid black",
            backgroundColor: modo === "login" && theme,
          }}
          onClick={() => setModo("login")}
        >
          Login
        </Button>
        <Button
          variant="ghost"
          style={{
            color: modo === "register" ? textTheme : theme,
            border: modo === "register" ? "2px solid white" : "2px solid black",
            backgroundColor: modo === "register" && theme,
          }}
          className="font-bold p-2 rounded"
          onClick={() => setModo("register")}
        >
          Register
        </Button>
        <Button
          variant="ghost"
          style={{
            color: modo === "google" ? textTheme : theme,
            border: modo === "google" ? "2px solid white" : "2px solid black",
            backgroundColor: modo === "google" && theme,
          }}
          className="font-bold p-2 rounded"
          onClick={() => setModo("google")}
        >
          Google
        </Button>
      </div>
      <div>
        {modo === "login" && (
          <div>
            <Login theme={theme} textTheme={textTheme} />
          </div>
        )}
        {modo === "register" && (
          <div>
            <Register theme={theme} textTheme={textTheme} />
          </div>
        )}
        {modo === "google" && (
          <div>
            <button
              onClick={handleGoogleLogin}
              className="flex items-center gap-2 border p-2 rounded hover:bg-gray-100"
            >
              <img src="/google.svg" className="w-5" />
              Continuar con Google
            </button>
          </div>
        )}
      </div>
    </>
  );
}
