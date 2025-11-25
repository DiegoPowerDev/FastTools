"use client";

import { usePageStore } from "@/store/PageStore";

export default function BackgroundImage() {
  const { background } = usePageStore();
  return (
    <img
      src={background}
      alt={background}
      className="absolute inset-0 w-full max-w-screen h-full object-contain opacity-40 -z-10 select-none pointer-events-none"
      fetchPriority="high"
      style={{ aspectRatio: "16/9" }}
    />
  );
}
