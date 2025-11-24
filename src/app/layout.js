import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import content from "@/content/content.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased relative bg-transparent `}
      >
        <div className="w-full h-full absolute inset-0 flex justify-center items-center -z-20"></div>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
