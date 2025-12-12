"use client";

import React, { useState } from "react";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { register } from "../../firebase/auth";
import Image from "next/image";
import toast from "react-hot-toast";
import { usePageStore } from "@/store/PageStore";
import { NotebookPen, NotepadText } from "lucide-react";

export default function Register({ theme, textTheme }) {
  const { setAuthenticate } = usePageStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const reset = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword)
      return toast.error("The passwords do not match");

    await register(email, password, (error) => {
      if (error?.code === "auth/email-already-in-use") {
        return toast.error("The email is already in use");
      }
    });
    toast.success("We send an email to verify your account.");
    setAuthenticate(false);
    reset();
  };

  return (
    <div className="flex w-full h-full">
      <div className="flex flex-col items-center justify-center">
        <Image src="/icono.png" alt="Logo" width={400} height={400} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col items-center justify-center gap-6"
      >
        <div className="w-full">
          <label className="font-bold">EMAIL</label>
          <Input
            required
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>
        <div className="w-full">
          <label className="font-bold">PASSWORD</label>
          <Input
            required
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        <div className="w-full">
          <label className="font-bold">CONFIRM PASSWORD</label>
          <Input
            required
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
          />
        </div>
        <div className="w-full flex justify-center items-center">
          <Button
            style={{
              color: textTheme,
              backgroundColor: theme,
            }}
            className="w-3/4 hover:opacity-60 gap-2"
          >
            REGISTER <NotebookPen />
          </Button>
        </div>
      </form>
    </div>
  );
}
