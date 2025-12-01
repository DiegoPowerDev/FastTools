import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import content from "@/content/content.json";

const panton = localFont({
  src: [
    { path: "../../public/fonts/PantonRegular.woff", weight: "400" },
    { path: "../../public/fonts/PantonBold.woff", weight: "700" },
  ],
  variable: "--font-panton",
  display: "swap",
});

const tommy = localFont({
  src: [
    { path: "../../public/fonts/MADETommySoftRegular.woff2", weight: "400" },
    { path: "../../public/fonts/MADETommySoftBold.woff2", weight: "700" },
  ],
  variable: "--font-tommy",
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
    <html lang="en" className={`${panton.variable} ${tommy.variable}`}>
      <head>
        <meta
          name="google-site-verification"
          content="abSLIjYehY7UNNtTck9OZ0lKx9FvXoWr4XvLnOBVs1M"
        />
      </head>
      <body
        className={`min-h-screen antialiased relative bg-transparent font-tommy`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
