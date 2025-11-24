"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePageStore } from "@/store/PageStore";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import dynamic from "next/dynamic";
import AuthenticateForm from "@/components/authenticateForm";
import Image from "next/image";

// Skeleton minimalista y rápido
function QuickSkeleton({ height }) {
  return <div style={{ height }} className="rounded-xl bg-gray-900/10" />;
}

// Carga ultra lazy de componentes - solo cuando sean visibles
const componentMap = {
  notes: dynamic(() => import("@/components/block/notes"), {
    ssr: false,
    loading: () => <QuickSkeleton height="350px" />,
  }),
  calculator: dynamic(() => import("@/components/calculator"), {
    ssr: false,
    loading: () => <QuickSkeleton height="350px" />,
  }),
  recorder: dynamic(() => import("@/components/recorder"), {
    ssr: false,
    loading: () => <QuickSkeleton height="350px" />,
  }),
  picker: dynamic(() => import("@/components/colorPicker"), {
    ssr: false,
    loading: () => <QuickSkeleton height="350px" />,
  }),
  conversor: dynamic(() => import("@/components/Conversor"), {
    ssr: false,
    loading: () => <QuickSkeleton height="350px" />,
  }),
  links: dynamic(() => import("@/components/enlaces"), {
    ssr: false,
    loading: () => <QuickSkeleton height="350px" />,
  }),
  colors: dynamic(() => import("@/components/colors"), {
    ssr: false,
    loading: () => <QuickSkeleton height="350px" />,
  }),
  editor: dynamic(() => import("@/components/ImageCropper"), {
    ssr: false,
    loading: () => <QuickSkeleton height="350px" />,
  }),
  qr: dynamic(() => import("@/components/QRGenerator"), {
    ssr: false,
    loading: () => <QuickSkeleton height="350px" />,
  }),
  apiTester: dynamic(() => import("@/components/testApi/testApi"), {
    ssr: false,
    loading: () => <QuickSkeleton height="500px" />,
  }),
  jwt: dynamic(() => import("@/components/hasher"), {
    ssr: false,
    loading: () => <QuickSkeleton height="500px" />,
  }),
};

// Toolbar y Footer con mayor prioridad
const Toolbar = dynamic(() => import("@/components/toolbar"), {
  ssr: false,
  loading: () => <div style={{ height: "64px" }} />,
});

const Footer = dynamic(() => import("@/components/footer"), {
  ssr: false,
  loading: () => <div style={{ height: "80px" }} />,
});

export default function Page() {
  const {
    tabs,
    colors,
    links,
    api,
    toolbarArea,
    setApi,
    socketApi,
    setSocketApi,
    setColors,
    setLinks,
    notes,
    setNotes,
    theme,
    setTheme,
    setTextTheme,
    textTheme,
    background,
    setBackground,
    mobileBackground,
    setMobileBackground,
  } = usePageStore();

  const [authenticate, setAuthenticate] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Memoizar array de componentes
  const componentsArray = useMemo(
    () =>
      toolbarArea.map((item) => ({
        id: item.id,
        label: item.label,
        Component: componentMap[item.label],
      })),
    [toolbarArea]
  );

  useEffect(() => {
    setMounted(true);
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) router.replace("/welcome");
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <>
      <div
        style={{ color: textTheme }}
        className={`flex w-full flex-col min-h-dvh overflow-hidden ${
          process.env.NODE_ENV === "development" ? "debug-screens" : ""
        }`}
      >
        <Toolbar
          setAuthenticate={setAuthenticate}
          theme={theme}
          setTheme={setTheme}
          setTextTheme={setTextTheme}
          setBackground={setBackground}
          background={background}
          textTheme={textTheme}
          setMobileBackground={setMobileBackground}
          mobileBackground={mobileBackground}
        />

        <div className="relative w-full flex-1 flex flex-col justify-center items-center">
          {/* Fondo usando Next/Image para optimización automática */}
          <div className="fixed inset-0 bg-black -z-10">
            <Image
              src={background}
              alt="Background"
              fill
              priority={false}
              className="object-contain opacity-40"
              sizes="100vw"
            />
          </div>

          {/* Grid de componentes */}
          <div
            className="2xl:w-9/12 w-full py-4 overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-y-4 md:gap-5 p-4"
            style={{ minHeight: "400px" }}
          >
            {mounted && (
              <AnimatePresence mode="popLayout">
                {componentsArray.map((component) => (
                  <motion.div
                    key={component.label}
                    layout
                    style={{ boxShadow: `0 0 15px 2px ${textTheme}` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      layout: { type: "spring", stiffness: 300, damping: 25 },
                      duration: 0.15,
                      ease: "easeOut",
                    }}
                    className={`rounded-xl overflow-hidden ${
                      component.label === "apiTester" ||
                      component.label === "jwt"
                        ? "h-[500px]"
                        : "h-[350px]"
                    } ${
                      component.label === "recorder" ||
                      component.label === "picker"
                        ? "hidden md:block"
                        : ""
                    }`}
                  >
                    <component.Component
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
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        <Footer
          tabs={tabs}
          textTheme={textTheme}
          theme={theme}
          setBackground={setBackground}
          background={background}
        />
      </div>

      <Dialog onOpenChange={setAuthenticate} open={authenticate}>
        <DialogContent
          style={{ color: theme, border: `1px solid ${theme}` }}
          className="bg-black flex flex-col h-[450px] w-full items-center"
        >
          <DialogHeader>
            <DialogTitle className="text-center"></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <AuthenticateForm theme={theme} textTheme={textTheme} />
        </DialogContent>
      </Dialog>

      <Toaster
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#f8fafc",
            border: `1px solid ${theme}`,
          },
          success: {
            style: {
              background: "black",
              color: "white",
            },
            iconTheme: {
              primary: theme,
              secondary: "#fff",
            },
          },
          error: {
            style: {
              background: "black",
              color: "red",
            },
            iconTheme: {
              primary: "#b91c1c",
              secondary: "white",
            },
          },
        }}
      />
    </>
  );
}
