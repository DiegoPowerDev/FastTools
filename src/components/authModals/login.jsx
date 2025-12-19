"use client";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { login, resendEmailVerification } from "../../firebase/auth";
import Image from "next/image";
import toast from "react-hot-toast";
import { usePageStore } from "@/store/PageStore";
import { useRouter } from "next/navigation";
import { DoorOpen, Mails } from "lucide-react";

export default function Login({ theme, textTheme }) {
  const { setAuthenticate, handleLoginSuccess } = usePageStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [verify, setVerify] = useState(false);
  const [password, setPassword] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    login(email, password, async (res, msg) => {
      if (res.error?.code === "auth/invalid-credential") {
        toast.error("Email or password invalid");
        setLoading(false);
        return;
      }
      if (res.error?.code === "email-not-verified") {
        toast.error("Please verify your email before logging in.");
        setVerify(true);
        setLoading(false);
        return;
      }
      if (res.success) {
        setAuthenticate(false);
        toast.success("Login successful");
        router.replace("/welcome");
      }
    });
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
        <div className="flex flex-col gap-2 w-full justify-center items-center">
          <div className="w-full flex justify-center items-center">
            <Button
              disabled={loading}
              style={{
                color: theme,
                backgroundColor: textTheme,
              }}
              className=" font-bold w-3/4 hover:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  LOGIN <DoorOpen />
                </span>
              )}
            </Button>
          </div>
          <div
            className="cursor-pointer"
            onClick={() => {
              setAuthenticate(false);
              router.replace("/forgotpassword");
            }}
          >
            Forgot your password?
          </div>
        </div>
        {verify && (
          <div className="w-full flex justify-center items-center">
            <Button
              onClick={() => {
                setVerify(false);
                resendEmailVerification((e) => console.log(e));
              }}
              type="button"
              style={{
                color: theme,
                backgroundColor: textTheme,
              }}
              className="w-3/4 hover:opacity-60 font-bold"
            >
              Re-send <Mails />
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
