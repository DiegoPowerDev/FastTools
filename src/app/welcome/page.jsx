"use client";
import toast, { Toaster } from "react-hot-toast";
import { Suspense, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFireStore, fireStore } from "@/store/fireStore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import useUserStore from "@/store/userStore";

// Skeleton component
function ComponentSkeleton({ height }) {
  return (
    <div
      style={{ height }}
      className="rounded-xl overflow-hidden bg-gray-900/20 animate-pulse"
    />
  );
}

const componentMap = {
  notes: dynamic(() => import("@/components/block/notes"), {
    ssr: false,
    loading: () => <ComponentSkeleton height="350px" />,
  }),
  calculator: dynamic(() => import("@/components/calculator"), {
    ssr: false,
    loading: () => <ComponentSkeleton height="350px" />,
  }),
  recorder: dynamic(() => import("@/components/recorder"), {
    ssr: false,
    loading: () => <ComponentSkeleton height="350px" />,
  }),
  picker: dynamic(() => import("@/components/colorPicker"), {
    ssr: false,
    loading: () => <ComponentSkeleton height="350px" />,
  }),
  conversor: dynamic(() => import("@/components/Conversor"), {
    ssr: false,
    loading: () => <ComponentSkeleton height="350px" />,
  }),
  links: dynamic(() => import("@/components/enlaces"), {
    ssr: false,
    loading: () => <ComponentSkeleton height="350px" />,
  }),
  colors: dynamic(() => import("@/components/colors"), {
    ssr: false,
    loading: () => <ComponentSkeleton height="350px" />,
  }),
  editor: dynamic(() => import("@/components/ImageCropper"), {
    ssr: false,
    loading: () => <ComponentSkeleton height="350px" />,
  }),
  qr: dynamic(() => import("@/components/QRGenerator"), {
    ssr: false,
    loading: () => <ComponentSkeleton height="350px" />,
  }),
  apiTester: dynamic(() => import("@/components/testApi/testApi"), {
    ssr: false,
    loading: () => <ComponentSkeleton height="500px" />,
  }),
  jwt: dynamic(() => import("@/components/hasher"), {
    ssr: false,
    loading: () => <ComponentSkeleton height="500px" />,
  }),
};

const FireToolBar = dynamic(() => import("@/components/fireToolBar"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/footer"), { ssr: false });

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

  const componentsArray = useMemo(
    () =>
      toolbarArea.map((item) => ({
        id: item.id,
        label: item.label,
        Component: componentMap[item.label],
      })),
    [toolbarArea]
  );

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
        setUser(firebaseUser);
        const unsubFirestore = loadUserData(firebaseUser.uid);
        window.__UNSUB_FIRESTORE__ = unsubFirestore;
      } else {
        console.log("No hay usuario autenticado");
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
  }, [router, setUser, loadUserData]);

  return (
    <>
      <div
        style={{
          color: textTheme,
        }}
        className={`flex w-full flex-col min-h-dvh overflow-hidden ${
          process.env.NODE_ENV === "development" ? "debug-screens" : ""
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-screen text-white">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-14 h-14 border-4 border-t-transparent border-white rounded-full"
            />
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

              {/* Fondo optimizado */}
              <div className="w-screen h-screen fixed bg-black inset-0 -z-10">
                <picture className="absolute inset-0 -z-10 pointer-events-none select-none">
                  <source
                    media="(max-width: 767px)"
                    srcSet={mobileBackground}
                  />
                  <source media="(min-width: 768px)" srcSet={background} />

                  <img
                    src={background}
                    alt="Background"
                    width="1920"
                    height="1080"
                    className="absolute inset-0 w-full h-full object-contain opacity-40 -z-10 select-none pointer-events-none"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>

              <motion.div
                layout
                className={cn(
                  componentsArray.length === 1
                    ? "grid grid-cols-1 w-fit"
                    : "grid grid-cols-1 md:grid-cols-2 2xl:w-9/12 w-full",
                  "overflow-hidden items-center justify-center gap-y-4 md:gap-5 p-4"
                )}
                style={{ minHeight: "400px" }}
              >
                <AnimatePresence mode="popLayout">
                  {componentsArray.map((component) => (
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
                        layout: {
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        },
                        duration: 0.2,
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
          success: {
            style: {
              fontWeight: "700",
              background: "black",
              color: textTheme,
            },
          },
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
