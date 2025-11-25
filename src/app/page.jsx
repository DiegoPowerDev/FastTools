import BackgroundImage from "@/components/backgroundImage";
import AuthDialog from "@/components/authDialog";
import Footer from "@/components/footer";
import ToasterClient from "@/components/ToasterClient";
import Toolbar from "@/components/toolbar";
import LocalTable from "@/components/LocalTable";
import FirebaseAuthWatcher from "@/components/FirebaseAuthWatcher";

export default function Page() {
  return (
    <>
      <div
        className={`flex w-full  flex-col min-h-dvh overflow-hidden  ${
          process.env.NODE_ENV === "development" ? "debug-screens" : ""
        }`}
      >
        <Toolbar />

        <div className="relative w-full flex-1 flex flex-col justify-center items-center">
          <div className="w-screen h-screen absolute bg-black inset-0 flex justify-center items-center -z-10">
            <BackgroundImage />
          </div>

          <LocalTable />
        </div>

        <Footer />
      </div>

      <ToasterClient />
      <AuthDialog />
      <FirebaseAuthWatcher />
    </>
  );
}
