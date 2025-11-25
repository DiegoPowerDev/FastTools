"use client";
import { useEffect, useState } from "react";
import { useFireStore } from "@/store/fireStore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/userStore";
import UserFooter from "@/components/footer/UserFooter";
import UserTable from "@/components/tables/UserTable";
import FireToolBar from "@/components/toolbars/fireToolBar";
import ToasterClient from "@/components/toast/ToasterClient";
import UserBackgroundImage from "@/components/background/UserBackground";
import { IconRocket } from "@tabler/icons-react";

export default function Page() {
  const { setUser } = useUserStore();
  const { loadUserData, uid } = useFireStore();

  const router = useRouter();

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
        className={`flex w-full flex-col min-h-dvh overflow-hidden ${
          process.env.NODE_ENV === "development" ? "debug-screens" : ""
        }`}
      >
        {!uid ? (
          <div className="h-screen w-full flex items-center justify-center bg-black">
            <div className="w-40 h-40 border-8 border-red-800/20 border-t-red-800 rounded-full animate-spin">
              <IconRocket color="red" size={80} />
            </div>
          </div>
        ) : (
          <>
            <FireToolBar />

            <div className="relative w-full flex-1 flex flex-col justify-center items-center">
              <div className="w-screen h-screen absolute bg-black inset-0 flex justify-center items-center -z-10">
                <UserBackgroundImage />
              </div>

              <UserTable />
            </div>
            <UserFooter />
          </>
        )}
      </div>
      <ToasterClient />
    </>
  );
}
