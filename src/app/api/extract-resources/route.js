import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export const maxDuration = 60; // Requiere plan Pro, sino elimina esta línea

export async function POST(request) {
  let browser;

  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log("Starting extraction for:", url);

    // Detectar entorno
    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      // En desarrollo local, usar puppeteer normal
      try {
        const puppeteerRegular = require("puppeteer");
        browser = await puppeteerRegular.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        console.log("Browser launched (development mode)");
      } catch (error) {
        console.error("Failed to launch browser in dev:", error);
        return NextResponse.json(
          {
            error:
              "Please install puppeteer for local development: npm install puppeteer --save-dev",
          },
          { status: 500 }
        );
      }
    } else {
      // En producción (Vercel)
      try {
        console.log("Getting executable path...");
        const executablePath = await chromium.executablePath(
          "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
        );

        console.log("Launching browser...");
        browser = await puppeteer.launch({
          args: [
            ...chromium.args,
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            "--no-first-run",
            "--no-sandbox",
            "--no-zygote",
            "--single-process",
          ],
          defaultViewport: chromium.defaultViewport,
          executablePath: executablePath,
          headless: chromium.headless,
        });
        console.log("Browser launched successfully");
      } catch (error) {
        console.error("Failed to launch browser:", error);
        return NextResponse.json(
          {
            error: "Failed to launch browser: " + error.message,
          },
          { status: 500 }
        );
      }
    }

    const page = await browser.newPage();
    console.log("New page created");

    // Arrays para capturar recursos
    const images = [];
    const videos = [];
    const fonts = [];

    // Interceptar requests de recursos
    page.on("request", (request) => {
      const resourceUrl = request.url();
      const resourceType = request.resourceType();

      if (resourceType === "image") {
        images.push({
          type: "image",
          url: resourceUrl,
          filename: resourceUrl.split("/").pop().split("?")[0] || "image.jpg",
        });
      } else if (resourceType === "media") {
        if (resourceUrl.match(/\.(mp4|webm|ogg|mov)(\?|$)/i)) {
          videos.push({
            type: "video",
            url: resourceUrl,
            filename: resourceUrl.split("/").pop().split("?")[0] || "video.mp4",
          });
        }
      } else if (resourceType === "font") {
        fonts.push({
          type: "font",
          url: resourceUrl,
          filename: resourceUrl.split("/").pop().split("?")[0] || "font.woff",
        });
      }
    });

    console.log("Navigating to URL:", url);
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: isDev ? 30000 : 8000,
    });
    console.log("Page loaded");

    const domResources = await page.evaluate(() => {
      const resources = {
        images: [],
        videos: [],
        fonts: [],
      };

      document.querySelectorAll("img").forEach((img) => {
        if (img.src) {
          resources.images.push({
            type: "image",
            url: img.src,
            filename: img.src.split("/").pop().split("?")[0] || "image.jpg",
          });
        }
        if (img.srcset) {
          const srcsetUrls = img.srcset
            .split(",")
            .map((s) => s.trim().split(" ")[0]);
          srcsetUrls.forEach((url) => {
            resources.images.push({
              type: "image",
              url: url,
              filename: url.split("/").pop().split("?")[0] || "image.jpg",
            });
          });
        }
      });

      document.querySelectorAll("video source, video").forEach((el) => {
        const src = el.src || el.currentSrc;
        if (src) {
          resources.videos.push({
            type: "video",
            url: src,
            filename: src.split("/").pop().split("?")[0] || "video.mp4",
          });
        }
      });

      document.querySelectorAll("*").forEach((el) => {
        const style = window.getComputedStyle(el);
        const bgImage = style.backgroundImage;
        if (bgImage && bgImage !== "none") {
          const matches = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (matches && matches[1]) {
            resources.images.push({
              type: "image",
              url: matches[1],
              filename:
                matches[1].split("/").pop().split("?")[0] || "bg-image.jpg",
            });
          }
        }
      });

      return resources;
    });

    console.log("Resources extracted from DOM");

    const allResources = [
      ...images,
      ...domResources.images,
      ...videos,
      ...domResources.videos,
      ...fonts,
      ...domResources.fonts,
    ];

    const uniqueResources = Array.from(
      new Map(allResources.map((r) => [r.url, r])).values()
    );

    console.log("Total unique resources:", uniqueResources.length);

    // Simplificar: no obtener tamaños si hay muchos recursos
    const resourcesWithSize = uniqueResources.slice(0, 50).map((resource) => ({
      ...resource,
      size: null,
    }));

    await browser.close();
    console.log("Browser closed");

    return NextResponse.json({ resources: resourcesWithSize });
  } catch (error) {
    console.error("Error in extract-resources:", error);
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error("Error closing browser:", e);
      }
    }
    return NextResponse.json(
      {
        error: error.message || "Unknown error occurred",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
