// components/GridAllComponents.tsx
"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { usePageStore } from "@/store/PageStore";

// Tool skeleton fallback (small)
function ToolSkeleton({ label }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="space-y-2 w-11/12">
        <div className="h-6 w-1/3 bg-gray-700 rounded animate-pulse" />
        <div className="h-40 bg-gray-800 rounded animate-pulse" />
        <div className="flex gap-2 mt-2">
          <div className="h-8 w-16 bg-gray-700 rounded animate-pulse" />
          <div className="h-8 w-16 bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="text-center text-sm text-gray-400">
          Cargando{label ? ` ${label}` : "..."}
        </div>
      </div>
    </div>
  );
}

// dynamic imports for tools (suspense: true)
const componentMap = {
  notes: dynamic(() => import("@/components/block/notes"), {
    ssr: false,
    suspense: true,
  }),
  calculator: dynamic(() => import("@/components/calculator"), {
    ssr: false,
    suspense: true,
  }),
  recorder: dynamic(() => import("@/components/recorder"), {
    ssr: false,
    suspense: true,
  }),
  picker: dynamic(() => import("@/components/colorPicker"), {
    ssr: false,
    suspense: true,
  }),
  conversor: dynamic(() => import("@/components/Conversor"), {
    ssr: false,
    suspense: true,
  }),
  links: dynamic(() => import("@/components/enlaces"), {
    ssr: false,
    suspense: true,
  }),
  colors: dynamic(() => import("@/components/colors"), {
    ssr: false,
    suspense: true,
  }),
  editor: dynamic(() => import("@/components/ImageCropper"), {
    ssr: false,
    suspense: true,
  }),
  qr: dynamic(() => import("@/components/QRGenerator"), {
    ssr: false,
    suspense: true,
  }),
  apiTester: dynamic(() => import("@/components/testApi/testApi"), {
    ssr: false,
    suspense: true,
  }),
  jwt: dynamic(() => import("@/components/hasher"), {
    ssr: false,
    suspense: true,
  }),
};

export default function Tablero() {
  const {
    toolbarArea,
    notes,
    setNotes,
    colors,
    setColors,
    links,
    setLinks,
    api,
    setApi,
    socketApi,
    setSocketApi,
    theme,
    setTheme,
    textTheme,
    setTextTheme,
  } = usePageStore();

  // allow animations only after this component mounted (so LCP not affected)
  const [enableAnimations, setEnableAnimations] = useState(false);
  useEffect(() => {
    // small delay to ensure layout paint finished before anim logic
    const id = setTimeout(() => setEnableAnimations(true), 200);
    return () => clearTimeout(id);
  }, []);

  const componentsArray = toolbarArea.map((item) => ({
    id: item.id,
    label: item.label,
    Component: componentMap[item.label] || null,
  }));

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-5 w-full">
        {componentsArray.map((component) => {
          const Comp = component.Component;
          const cardClass = `rounded-xl overflow-hidden ${
            component.label === "apiTester" || component.label === "jwt"
              ? "h-[500px]"
              : "h-[350px]"
          } ${
            component.label === "recorder" || component.label === "picker"
              ? "hidden md:block"
              : ""
          }`;

          // If animations enabled we can use framer for per-card subtle entrance
          const CardWrapper = ({ children }) =>
            enableAnimations ? (
              <motion.div
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
                className={cardClass}
                style={{ boxShadow: `0 0 15px 2px ${textTheme}` }}
              >
                {children}
              </motion.div>
            ) : (
              <div
                className={cardClass}
                style={{ boxShadow: `0 0 15px 2px ${textTheme}` }}
              >
                {children}
              </div>
            );

          return (
            <CardWrapper key={component.id}>
              {Comp ? (
                <Suspense fallback={<ToolSkeleton label={component.label} />}>
                  <Comp
                    theme={theme}
                    setTheme={setTheme}
                    textTheme={textTheme}
                    setTextTheme={setTextTheme}
                    notes={notes}
                    setNotes={setNotes}
                    colors={colors}
                    setColors={setColors}
                    links={links}
                    setLinks={setLinks}
                    api={api}
                    setApi={setApi}
                    socketApi={socketApi}
                    setSocketApi={setSocketApi}
                  />
                </Suspense>
              ) : (
                <div className="p-4">
                  Componente no encontrado: {component.label}
                </div>
              )}
            </CardWrapper>
          );
        })}
      </div>
    </>
  );
}
