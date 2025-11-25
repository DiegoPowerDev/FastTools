"use client";
import { usePageStore } from "@/store/PageStore";
import { motion } from "framer-motion";

export default function Footer() {
  const { tabs, textTheme } = usePageStore();

  if (!tabs.header) return null;

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
