"use client";

import { Toaster } from "react-hot-toast";
import { useFireStore } from "@/store/fireStore";

export default function UserToasterClient() {
  const { textTheme, theme } = useFireStore();

  return (
    <Toaster
      toastOptions={{
        style: {
          background: "black",
          color: "#fafafa",
          border: `1px solid ${textTheme}`,
        },
        success: {
          style: { background: "black", color: "white" },
          iconTheme: { primary: theme, secondary: "#fff" },
        },
        error: {
          style: { background: "black", color: "red" },
          iconTheme: { primary: "#b91c1c", secondary: "white" },
        },
      }}
    />
  );
}
