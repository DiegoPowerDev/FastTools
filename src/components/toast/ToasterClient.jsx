"use client";

import { Toaster } from "react-hot-toast";
import { usePageStore } from "@/store/PageStore";

export default function ToasterClient() {
  const { theme, textTheme } = usePageStore();

  return (
    <Toaster
      toastOptions={{
        style: {
          background: "black",
          color: "#fafafa",
          border: `1px solid ${textTheme}`,
          userSelect: "none",
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
