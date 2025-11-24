"use client";
import { Suspense, useEffect, useState } from "react";
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

const componentMap = {
  notes: dynamic(() => import("@/components/block/notes"), {
    ssr: false,
  }),
  calculator: dynamic(() => import("@/components/calculator"), {
    ssr: false,
  }),
  recorder: dynamic(() => import("@/components/recorder"), {
    ssr: false,
  }),
  picker: dynamic(() => import("@/components/colorPicker"), {
    ssr: false,
  }),
  conversor: dynamic(() => import("@/components/Conversor"), {
    ssr: false,
  }),
  links: dynamic(() => import("@/components/enlaces"), {
    ssr: false,
  }),
  colors: dynamic(() => import("@/components/colors"), {
    ssr: false,
  }),
  editor: dynamic(() => import("@/components/ImageCropper"), {
    ssr: false,
  }),
  qr: dynamic(() => import("@/components/QRGenerator"), {
    ssr: false,
  }),
  apiTester: dynamic(() => import("@/components/testApi/testApi"), {
    ssr: false,
  }),
  jwt: dynamic(() => import("@/components/hasher"), {
    ssr: false,
  }),
};
const Toolbar = dynamic(() => import("@/components/toolbar"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/footer"), { ssr: false });

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
  const router = useRouter();

  const componentsArray = toolbarArea.map((item) => ({
    id: item.id,
    label: item.label,
    Component: componentMap[item.label],
  }));

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) router.replace("/welcome");
    });
    return () => unsubscribe();
  }, []);
  const [aspectRatio, setAspectRatio] = useState("16/9");

  useEffect(() => {
    // Precarga la imagen para obtener sus dimensiones reales
    const img = new window.Image();
    const isMobile = window.innerWidth <= 767;
    img.src = isMobile ? mobileBackground : background;

    img.onload = () => {
      setAspectRatio(`${img.width}/${img.height}`);
    };
  }, [background, mobileBackground]);
  return (
    <>
      <div
        style={{
          color: textTheme,
        }}
        className={`flex w-full  flex-col min-h-dvh overflow-hidden  ${
          process.env.NODE_ENV === "development" ? "debug-screens" : ""
        }`}
      >
        <Suspense fallback={null}>
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
        </Suspense>
        <div className="relative w-full flex-1 flex flex-col justify-center items-center">
          <picture className="absolute inset-0 -z-10 pointer-events-none select-none">
            <source media="(max-width: 767px)" srcSet={mobileBackground} />
            <source media="(min-width: 768px)" srcSet={background} />

            <img
              src={background}
              alt="Background"
              className="absolute inset-0 w-full h-full object-contain opacity-40 -z-10"
              style={{ aspectRatio }}
              fetchPriority="high"
            />
          </picture>

          <motion.div
            layout
            className="2xl:w-9/12 w-full py-4 overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-y-4 md:gap-5 p-4 "
          >
            <AnimatePresence mode="popLayout">
              <Suspense
                fallback={
                  <>
                    <div
                      style={{
                        boxShadow: `0 0 15px 2px ${textTheme}`,
                      }}
                      className={`rounded-xl overflow-hidden
                   `}
                    >
                      <componentMap.picker
                        theme={theme}
                        setTheme={setTheme}
                        textTheme={textTheme}
                        setTextTheme={setTextTheme}
                      />
                      <componentMap.conversor
                        theme={theme}
                        textTheme={textTheme}
                      />
                    </div>
                  </>
                }
              >
                {componentsArray.map((component, i) => (
                  <motion.div
                    key={component.label}
                    layout
                    style={{
                      boxShadow: `0 0 15px 2px ${textTheme}`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      layout: { type: "spring", stiffness: 300, damping: 25 },
                      duration: 0.4,
                      ease: "easeInOut",
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
              </Suspense>
            </AnimatePresence>
          </motion.div>
        </div>
        <Suspense fallback={null}>
          <Footer
            tabs={tabs}
            textTheme={textTheme}
            theme={theme}
            setBackground={setBackground}
            background={background}
          />
        </Suspense>
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
          // Estilo general
          style: {
            background: "#1e293b", // gris oscuro
            color: "#f8fafc", // blanco
            border: `1px solid ${theme}`,
          },
          // Éxitos
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
          // Errores
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
