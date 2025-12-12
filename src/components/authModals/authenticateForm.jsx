"use client";

import React, { useState } from "react";
import Login from "./login";
import Register from "./register";
import { Button } from "../ui/button";
import {
  linkGithubAccount,
  loginWithGithub,
  loginWithGoogle,
} from "@/firebase/auth";
import toast from "react-hot-toast";
import { IconBrandGoogle } from "@tabler/icons-react";
import { usePageStore } from "@/store/PageStore";
import { Input } from "../ui/input";

export default function AuthenticateForm() {
  const { theme, textTheme, setAuthenticate } = usePageStore();
  const [modo, setModo] = useState("login");
  const [needLink, setNeedLink] = useState(false);
  const [pendingCred, setPendingCred] = useState(null);
  const [emailToLink, setEmailToLink] = useState("");
  const [passwordToLink, setPasswordToLink] = useState("");

  const handleGoogleLogin = () => {
    loginWithGoogle((res) => {
      if (res.success) {
        toast.success("Sesión iniciada con Google");
        setAuthenticate(false);
      } else {
        console.log(res.error.message);
      }
    });
  };
  const handleGithubLogin = () => {
    loginWithGithub((res) => {
      if (res.success) {
        toast.success("Sesión iniciada con Github");
        setAuthenticate(false);
        return;
      }
      if (res.error === "need-link") {
        setNeedLink(true);
        setAuthenticate(false);
        setPendingCred(res.pendingCred);
        setEmailToLink(res.email);
      }
      console.log(res.error.message);
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
            border: modo === "login" ? "2px solid white" : "",
            backgroundColor: modo === "login" ? theme : `${theme}40`,
          }}
          onClick={() => setModo("login")}
        >
          LOGIN
        </Button>
        <Button
          variant="ghost"
          style={{
            color: modo === "register" ? textTheme : theme,
            border: modo === "register" ? "2px solid white" : "",
            backgroundColor: modo === "register" ? theme : `${theme}40`,
          }}
          className="font-bold p-2 rounded"
          onClick={() => setModo("register")}
        >
          REGISTER
        </Button>
        <Button
          variant="ghost"
          style={{
            color: modo === "google" ? textTheme : theme,
            border: modo === "google" ? "2px solid white" : "",
            backgroundColor: modo === "google" ? theme : `${theme}40`,
          }}
          className="font-bold p-2 rounded flex items-center gap-2"
          onClick={() => setModo("google")}
        >
          Others
        </Button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center ">
        {modo === "login" && <Login theme={theme} textTheme={textTheme} />}
        {modo === "register" && (
          <Register theme={theme} textTheme={textTheme} />
        )}
        {modo === "google" && (
          <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
            <button
              onClick={handleGoogleLogin}
              className="flex w-full items-center gap-2 border p-2 rounded hover:bg-gray-100"
            >
              <img src="/google.svg" className="w-5" />
              Login with Google
            </button>

            {needLink ? (
              <form className="w-full p-4">
                <p className="text-sm mb-2">
                  You already have an account with this email:
                  <b>{emailToLink}</b>. Enter your password to link with your
                  Github account.
                </p>

                <Input
                  type="password"
                  placeholder="Tu contraseña"
                  value={passwordToLink}
                  onChange={(e) => setPasswordToLink(e.target.value)}
                />

                <Button
                  className="mt-3 w-full"
                  onClick={() => {
                    linkGithubAccount(
                      emailToLink,
                      passwordToLink,
                      pendingCred,
                      (res) => {
                        if (res.success) {
                          toast.success("Cuenta vinculada exitosamente");
                          setNeedLink(false);
                        } else {
                          console.log(res.error.message);
                        }
                      }
                    );
                  }}
                >
                  Link account
                </Button>
              </form>
            ) : (
              <button
                onClick={handleGithubLogin}
                className="flex w-full items-center gap-2 border p-2 rounded hover:bg-gray-100"
              >
                <img src="/github.svg" className="w-5" />
                Login with Github
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
