export default function Page() {
  return (
    <>
      <div
        // style={{
        //   color: textTheme,
        // }}
        className={`flex w-full  flex-col min-h-dvh overflow-hidden  ${
          process.env.NODE_ENV === "development" ? "debug-screens" : ""
        }`}
      >
        {/* <Toolbar
          setAuthenticate={setAuthenticate}
          theme={theme}
          setTheme={setTheme}
          setTextTheme={setTextTheme}
          setBackground={setBackground}
          background={background}
          textTheme={textTheme}
          setMobileBackground={setMobileBackground}
          mobileBackground={mobileBackground}
        /> */}
        <div>Probando</div>
        {/* <div className="relative w-full flex-1 flex flex-col justify-center items-center">
          <picture className="absolute inset-0 -z-10 pointer-events-none select-none">
            <img
              src="/background.webp"
              alt=""
              width={1920}
              height={1080}
              fetchPriority="high"
              className="w-full h-full object-contain opacity-40"
              decoding="async"
            />
          </picture>

          <div className="2xl:w-9/12 w-full py-4 overflow-hidden grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-y-4 md:gap-5 p-4 "> */}
        {/* <AnimatePresence mode="popLayout"> */}
        {/* <Suspense fallback={<></>}>
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
              </Suspense> */}
        {/* </AnimatePresence> */}
        {/* </div>
        </div> */}
        {/* <Suspense fallback={null}>
          {tabs.header && (
            <Footer
              tabs={tabs}
              textTheme={textTheme}
              theme={theme}
              setBackground={setBackground}
              background={background}
            />
          )}
        </Suspense> */}
      </div>

      {/* <Dialog onOpenChange={setAuthenticate} open={authenticate}>
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
      /> */}
    </>
  );
}
