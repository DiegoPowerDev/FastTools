"use client";
import { Suspense, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
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
import AuthenticateForm from "@/components/authenticateForm";
import dynamic from "next/dynamic";
import Tablero from "@/components/Tablero";
const Toolbar = dynamic(() => import("@/components/toolbar"), { ssr: false });
const Footer = dynamic(() => import("@/components/footer"), { ssr: false });
function PageSkeleton() {
  return (
    <div className="w-full h-56 flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">Loading content…</div>
    </div>
  );
}
export default function Page() {
  const {
    tabs,
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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // small delay ensures initial paint settles (optional)
    const id = setTimeout(() => setHydrated(true), 50);
    return () => clearTimeout(id);
  }, []);
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
          setMobileBackground={setMobileBackground}
          mobileBackground={mobileBackground}
        />
        <div className="relative w-full flex-1 flex flex-col justify-center items-center">
          <div className="w-screen h-screen absolute bg-black inset-0 flex justify-center items-center -z-10">
            <picture className="absolute inset-0 -z-10 pointer-events-none select-none">
              {/* Mobile: se usará cuando el viewport sea <= 767px */}
              <source media="(max-width: 767px)" srcSet={mobileBackground} />

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

          <div className="w-full h-full px-12">
            {/* Before hydration show a tiny skeleton; after hydration load heavy GridAllComponents */}
            {hydrated ? (
              <Suspense fallback={<PageSkeleton />}>
                <Tablero />
              </Suspense>
            ) : (
              <PageSkeleton />
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
