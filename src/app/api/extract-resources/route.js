import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

export async function POST(request) {
  let browser;

  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log("Starting extraction for:", url);

    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
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

    // Bloquear recursos pesados para cargar más rápido
    await page.setRequestInterception(true);

    const images = [];
    const videos = [];
    const fonts = [];

    page.on("request", (request) => {
      const resourceUrl = request.url();
      const resourceType = request.resourceType();

      // Capturar URLs pero no descargar videos/fuentes pesadas
      if (resourceType === "image") {
        images.push({
          type: "image",
          url: resourceUrl,
          filename: resourceUrl.split("/").pop().split("?")[0] || "image.jpg",
        });
        // Bloquear imágenes muy grandes
        if (resourceUrl.includes("4k") || resourceUrl.includes("original")) {
          request.abort();
        } else {
          request.continue();
        }
      } else if (resourceType === "media") {
        if (resourceUrl.match(/\.(mp4|webm|ogg|mov)(\?|$)/i)) {
          videos.push({
            type: "video",
            url: resourceUrl,
            filename: resourceUrl.split("/").pop().split("?")[0] || "video.mp4",
          });
        }
        request.abort(); // No descargar videos
      } else if (resourceType === "font") {
        fonts.push({
          type: "font",
          url: resourceUrl,
          filename: resourceUrl.split("/").pop().split("?")[0] || "font.woff",
        });
        request.continue();
      } else {
        request.continue();
      }
    });

    console.log("Navigating to URL:", url);

    try {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
      });
      console.log("Page loaded");
    } catch (error) {
      if (error.name === "TimeoutError") {
        console.log("Timeout but continuing with partial data...");
        // Continuar aunque haya timeout
      } else {
        throw error;
      }
    }

    // Esperar solo 500ms adicionales
    await page.waitForTimeout(500);

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

    // NO obtener tamaños en producción para ahorrar tiempo
    const resourcesWithSize = uniqueResources.slice(0, 200).map((resource) => ({
      ...resource,
      size: null, // Calcular en el frontend si es necesario
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
