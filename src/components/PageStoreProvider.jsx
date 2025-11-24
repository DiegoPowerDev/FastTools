"use client";
import { usePageStore } from "@/store/PageStore";

export default function PageStoreProvider({ children }) {
  usePageStore(); // solo inicializa
  return children;
}
