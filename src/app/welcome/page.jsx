"use client";
import { useEffect } from "react";
import { useFireStore } from "@/store/fireStore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import UserFooter from "@/components/footer/UserFooter";
import UserTable from "@/components/tables/UserTable";
import FireToolBar from "@/components/toolbars/fireToolBar";
import UserBackgroundImage from "@/components/background/UserBackground";
import { IconRocket } from "@tabler/icons-react";
import UserToasterClient from "@/components/toast/UserToasterClient";
import ScheduleTable from "@/components/tables/ScheduleTable";

export default function Page() {
  const { loadUserData, uid, setAllImages, mode } = useFireStore();

  const router = useRouter();

  async function loadImages(uid) {
    try {
      const res = await fetch(`/api/upload/${uid}`);
      if (!res.ok) {
        throw new Error(`Error fetching images: ${res.status}`);
      }
      const data = await res.json();
      const newData = data.map((e) => e.secure_url);
      setAllImages(newData);
    } catch (error) {
      console.error("Error loading images", error);
    }
  }

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const unsubFirestore = loadUserData(); // loadUserData ya obtiene el uid internamente
        loadImages(firebaseUser.uid);
        window.__UNSUB_FIRESTORE__ = unsubFirestore;
      } else {
        console.log("No hay usuario autenticado");

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
  }, [router, loadUserData]);

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

            <div className="w-full flex-1 flex flex-col  items-center">
              <div className="w-screen h-screen fixed bg-black inset-0 flex justify-center items-center -z-10">
                <UserBackgroundImage />
              </div>

              <div
                className={`w-full h-full flex items-center justify-center ${
                  mode === "tools" ? "block" : "hidden"
                }`}
              >
                <UserTable />
              </div>
              <div
                className={`w-full  ${
                  mode === "schedule" ? "flex flex-col flex-1" : "hidden"
                }`}
              >
                <ScheduleTable />
              </div>
            </div>
            <UserFooter />
          </>
        )}
      </div>
      <UserToasterClient />
    </>
  );
}
