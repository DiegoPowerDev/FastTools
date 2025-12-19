"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePageStore } from "@/store/PageStore";
import AuthenticateForm from "../authModals/authenticateForm";

export default function AuthDialog() {
  const { authenticate, setAuthenticate, theme, textTheme } = usePageStore();

  return (
    <Dialog onOpenChange={setAuthenticate} open={authenticate}>
      <DialogContent
        style={{
          backgroundColor: theme,
          color: textTheme,
          border: `1px solid ${textTheme}`,
        }}
        className=" flex flex-col h-[450px] w-full items-center"
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
