import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import content from "@/content/content.json";

const miFuente = localFont({
  src: [
    {
      path: "../../public/fonts/MADETommySoftRegular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/MADETommySoftBold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-pantom",
  display: "swap",
});

export const metadata = {
  title: content.metadata.title,
  description: content.metadata.description,
  authors: content.metadata.authors,
  metadataBase: new URL("https://fasttools.vercel.app"),
  openGraph: content.metadata.openGraph,
  icons: content.metadata.icons,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="abSLIjYehY7UNNtTck9OZ0lKx9FvXoWr4XvLnOBVs1M"
        />
        {/* <link
          rel="preload"
          href="/background.webp"
          as="image"
          fetchPriority="high"
        /> */}
      </head>
      <body
        className={`min-h-screen antialiased relative bg-transparent ${miFuente.variable}`}
      >
        <div className="w-full h-full absolute inset-0 flex justify-center items-center -z-20"></div>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
