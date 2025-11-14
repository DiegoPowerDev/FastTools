"use client";

import React, { useState } from "react";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { login, register } from "../firebase/auth";
import { div } from "framer-motion/client";
import Image from "next/image";

export default function Register({ theme, textTheme }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    register(email, password);
  };

  return (
    <div className="flex w-full h-full">
      <div>
        <Image src="/icono.png" alt="Logo" width={400} height={400} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center justify-center gap-6"
      >
        <div className="w-full">
          <label>EMAIL</label>
          <Input
            type="text"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>
        <div className="w-full">
          <label>PASSWORD</label>
          <Input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        <div className="w-full flex justify-center items-center">
          <Button
            style={{
              color: textTheme,
              backgroundColor: theme,
            }}
            className="w-3/4 hover:opacity-60"
          >
            REGISTER
          </Button>
        </div>
      </form>
    </div>
  );
}
