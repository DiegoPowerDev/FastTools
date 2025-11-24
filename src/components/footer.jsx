"use client";
import { usePageStore } from "@/store/PageStore";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

export default function Footer() {
  const { tabs, textTheme } = usePageStore();
  return (
    <>
      {tabs.header && (
        <AnimatePresence mode="popLayout">
          <motion.div
            key="footer"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
            }}
            style={{ color: textTheme, background: "black" }}
            className="flex font-bold justify-between items-center pr-20"
          >
            <div className="h-full w-full items-center flex justify-end">
              <a href="https://diegotorres-portfoliodev.vercel.app">
                Designed & developed by Diego Torres
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
