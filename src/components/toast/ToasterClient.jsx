"use client";

import { Toaster } from "react-hot-toast";
import { usePageStore } from "@/store/PageStore";

export default function ToasterClient() {
  const { theme } = usePageStore();

  return (
    <Toaster
      toastOptions={{
        style: {
          background: "#1e293b",
          color: "#f8fafc",
          border: `1px solid ${theme}`,
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
