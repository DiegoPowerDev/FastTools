"use client";

import { useFireStore } from "@/store/fireStore";

export default function UserBackgroundImage() {
  const { background } = useFireStore();
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
