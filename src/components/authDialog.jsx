"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePageStore } from "@/store/PageStore";
import AuthenticateForm from "./authenticateForm";

export default function AuthDialog() {
  const { authenticate, setAuthenticate, theme, textTheme } = usePageStore();

  return (
    <Dialog onOpenChange={setAuthenticate} open={authenticate}>
      <DialogContent
        style={{ color: theme, border: `1px solid ${theme}` }}
        className="bg-black flex flex-col h-[450px] w-full items-center"
      >
        <DialogHeader>
          <DialogTitle className="text-center"></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <AuthenticateForm theme={theme} textTheme={textTheme} />
      </DialogContent>
    </Dialog>
  );
}
