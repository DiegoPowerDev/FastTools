"use client";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Recorder from "@/components/recorder";
import Calculator from "@/components/calculator";
import Conversor from "@/components/Conversor";
import Links from "@/components/enlaces";
import Colors from "@/components/colors";
import ApiTester from "@/components/testApi/testApi";
import Hasher from "@/components/hasher";
import Image from "next/image";
import AuthenticateForm from "@/components/authenticateForm";
import ImageCropper from "@/components/ImageCropper";
import QRGenerator from "@/components/QRGenerator";
import { usePageStore } from "@/store/PageStore";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ImageColorPicker from "@/components/colorPicker";
import Notes from "@/components/block/notes";
import Toolbar from "@/components/toolbar";
import Footer from "@/components/footer";

const componentMap = {
  notes: Notes,
  calculator: Calculator,
  recorder: Recorder,
  picker: ImageColorPicker,
  conversor: Conversor,
  links: Links,
  colors: Colors,
  editor: ImageCropper,
  qr: QRGenerator,
  apiTester: ApiTester,
  jwt: Hasher,
};

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
        <Toolbar
          setAuthenticate={setAuthenticate}
          theme={theme}
          setTheme={setTheme}
          setTextTheme={setTextTheme}
          setBackground={setBackground}
          background={background}
          textTheme={textTheme}
        />
        <div className="relative w-full flex-1 flex flex-col justify-center items-center">
          <div className="w-screen h-screen absolute bg-black inset-0 flex justify-center items-center -z-10">
            <img
              src={background}
              alt="Background"
              className="absolute inset-0 w-full max-w-screen h-full object-contain opacity-40 -z-10 select-none pointer-events-none"
              fetchPriority="high"
            />
          </div>

          <motion.div
            layout
            className="2xl:w-9/12 w-full py-4 overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-y-4 md:gap-5 p-4 "
          >
            <AnimatePresence mode="popLayout">
              {componentsArray.map((component, i) => (
                <motion.div
                  key={component.label}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    layout: { type: "spring", stiffness: 300, damping: 25 },
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className={`${
                    component.label === "apiTester" || component.label === "jwt"
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
          </motion.div>
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
