import BackgroundImage from "@/components/backgroundImage";
import AuthDialog from "@/components/authDialog";
import PageStoreProvider from "@/components/PageStoreProvider";
import Footer from "@/components/footer";

export default function Page() {
  return (
    <>
      <div
        className={`flex w-full  flex-col min-h-dvh overflow-hidden  ${
          process.env.NODE_ENV === "development" ? "debug-screens" : ""
        }`}
      >
        {/* <Toolbar /> */}

        <div className="relative w-full flex-1 flex flex-col justify-center items-center">
          <div className="w-screen h-screen absolute bg-black inset-0 flex justify-center items-center -z-10">
            {/* <BackgroundImage /> */}
          </div>
          <div>probando</div>

          {/* <LocalTable /> */}
        </div>

        <Footer />
      </div>

      {/* <Toaster
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
      /> */}
      {/* <AuthDialog /> */}
      {/* <FirebaseAuthWatcher /> */}
    </>
  );
}
