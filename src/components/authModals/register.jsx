"use client";

import React, { useState } from "react";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { register } from "../../firebase/auth";
import Image from "next/image";
import toast from "react-hot-toast";
import { usePageStore } from "@/store/PageStore";
import { NotebookPen, NotepadText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Register({ theme, textTheme }) {
  const { setAuthenticate } = usePageStore();
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    if (password !== confirmPassword) {
      toast.error("The passwords do not match");
      return setLoading(false);
    }

    const result = await register(email, password);
    if (!result.success) {
      if (result.error.code === "auth/email-already-in-use") {
        setLoading(false);
        return toast.error("The email is already in use");
      }
    }

    setAuthenticate(false);
    reset();
    toast.success("We send an email to verify your account.");
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
            style={{ border: `1px solid ${textTheme}` }}
            required
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>
        <div className="w-full">
          <label className="font-bold">PASSWORD</label>
          <Input
            style={{ border: `1px solid ${textTheme}` }}
            required
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        <div className="w-full">
          <label className="font-bold">CONFIRM PASSWORD</label>
          <Input
            style={{ border: `1px solid ${textTheme}` }}
            required
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
          />
        </div>
        <div className="w-full flex justify-center items-center">
          <Button
            disabled={loading}
            style={{
              color: theme,
              backgroundColor: textTheme,
            }}
            className=" font-bold w-3/4 hover:opacity-60 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
            ) : (
              <span className="flex items-center justify-center gap-2">
                REGISTER <NotebookPen />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
