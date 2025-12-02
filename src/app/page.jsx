import AuthDialog from "@/components/authModals/authDialog";
import BackgroundImage from "@/components/background/backgroundImage";
import FirebaseAuthWatcher from "@/components/FirebaseAuthWatcher";
import Footer from "@/components/footer/footer";
import LocalTable from "@/components/tables/LocalTable";
import ToasterClient from "@/components/toast/ToasterClient";
import Toolbar from "@/components/toolbars/toolbar";

export default function Page() {
  return (
    <>
      <main
        className={`flex w-full  flex-col min-h-dvh overflow-hidden  ${
          process.env.NODE_ENV === "development" ? "debug-screens" : ""
        }`}
      >
        <Toolbar />

        <div className=" w-full flex-1 flex flex-col justify-center items-center">
          <div className="w-screen h-screen fixed bg-black inset-0 flex justify-center items-center -z-10">
            <BackgroundImage />
          </div>

          <LocalTable />
        </div>

        <Footer />
      </main>

      <ToasterClient />
      <AuthDialog />
      <FirebaseAuthWatcher />
    </>
  );
}
