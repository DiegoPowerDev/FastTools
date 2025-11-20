"use client";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Recorder from "@/components/recorder";
import Calculator from "@/components/calculator";
import Conversor from "@/components/Conversor";
import Links from "@/components/enlaces";
import Colors from "@/components/colors";
import ApiTester from "@/components/testApi/testApi";
import Hasher from "@/components/hasher";
import ImageCropper from "@/components/ImageCropper";
import QRGenerator from "@/components/QRGenerator";
import useUserStore from "@/store/userStore";
import { useFireStore, fireStore } from "@/store/fireStore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import ImageColorPicker from "@/components/colorPicker";
import Notes from "@/components/block/notes";
import FireToolBar from "@/components/fireToolBar";
import Footer from "@/components/footer";
import { cn } from "@/lib/utils";

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
  const { logout, setUser } = useUserStore();
  const {
    tabs,
    colors,
    links,
    api,
    notes,
    setNotes,
    setApi,
    toolbarArea,
    setColors,
    setLinks,
    loadUserData,
    loading,
    theme,
    setTheme,
    textTheme,
    setTextTheme,
    socketApi,
    setSocketApi,
    background,
    mobileBackground,
    setMobileBackground,
    setBackground,
  } = useFireStore();

  const componentsArray = toolbarArea.map((item) => ({
    id: item.id,
    label: item.label,
    Component: componentMap[item.label],
  }));
  const router = useRouter();
  const getOut = () => {
    fireStore.getState().resetStore();
    logout();
    toast.success("Session closed");
    router.push("/");
  };

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log("Usuario autenticado:", firebaseUser.uid);
        setUser(firebaseUser);

        // ✅ Establece UID y carga datos en un solo paso

        const unsubFirestore = loadUserData(firebaseUser.uid);

        window.__UNSUB_FIRESTORE__ = unsubFirestore;
      } else {
        console.log("No hay usuario autenticado");

        // Limpiar todo

        setUser(null);

        if (window.__UNSUB_FIRESTORE__) {
          window.__UNSUB_FIRESTORE__();
          delete window.__UNSUB_FIRESTORE__;
        }

        router.push("/");
      }
    });

    return () => {
      unsubscribe();
      if (window.__UNSUB_FIRESTORE__) {
        window.__UNSUB_FIRESTORE__();
        delete window.__UNSUB_FIRESTORE__;
      }
    };
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
        {loading ? (
          <div className="flex flex-col items-center justify-center h-screen  text-white">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-14 h-14 border-4 border-t-transparent border-white rounded-full"
            />
            <p className="mt-4 text-gray-400 text-lg"></p>
          </div>
        ) : (
          <>
            <div className="relative w-full flex-1 flex flex-col items-center">
              <FireToolBar
                getOut={getOut}
                theme={theme}
                setTheme={setTheme}
                setTextTheme={setTextTheme}
                background={background}
                setBackground={setBackground}
                textTheme={textTheme}
                setMobileBackground={setMobileBackground}
                mobileBackground={mobileBackground}
              />
              <div className="w-screen h-screen absolute bg-black inset-0 flex justify-center items-center -z-10">
                <picture className="absolute inset-0 -z-10 pointer-events-none select-none">
                  {/* Mobile: se usará cuando el viewport sea <= 767px */}
                  <source
                    media="(max-width: 767px)"
                    srcSet={mobileBackground}
                  />

                  {/* Desktop: cuando sea >= 768px */}
                  <source media="(min-width: 768px)" srcSet={background} />

                  {/* Fallback */}
                  <img
                    src={background}
                    alt={background}
                    className="absolute inset-0 w-full max-w-screen h-full object-contain opacity-40 -z-10 select-none pointer-events-none"
                    fetchPriority="high"
                  />
                </picture>
              </div>

              <motion.div
                layout
                className={cn(
                  componentsArray.length === 1
                    ? "grid grid-cols-1 w-fit"
                    : "grid grid-cols-1 md:grid-cols-2 2xl:w-9/12  w-full",
                  "  overflow-hidden  items-center justify-center gap-y-4 md:gap-5 p-4"
                )}
              >
                <AnimatePresence mode="popLayout">
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
                </AnimatePresence>
              </motion.div>
            </div>
            <Footer
              tabs={tabs}
              textTheme={textTheme}
              theme={theme}
              background={background}
              setBackground={setBackground}
            />
          </>
        )}
      </div>

      <Toaster
        toastOptions={{
          style: {
            background: "black",
            color: textTheme,
            boxShadow: `0 0 15px 2px ${textTheme}`,
          },
          // Éxitos
          success: {
            style: {
              fontWeight: "700",
              background: "black",
              color: textTheme,
            },
          },
          // Errores
          error: {
            style: {
              fontWeight: "700",
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
