"use client";
import { usePageStore } from "@/store/PageStore";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

export default function Footer() {
  const showFooter = usePageStore((s) => s.tabs.header);
  const textTheme = usePageStore((s) => s.textTheme);

  if (!showFooter) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ color: textTheme, background: "black" }}
      className="flex font-bold justify-between items-center pr-20"
    >
      <div className="h-full w-full items-center flex justify-end">
        <a href="https://diegotorres-portfoliodev.vercel.app">
          Designed & developed by Diego Torres
        </a>
      </div>
    </motion.div>
  );
}
