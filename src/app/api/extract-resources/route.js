import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function POST(request) {
  let browser;

  try {
    const { url } = await request.json();

    // Detectar entorno
    const isDev = process.env.NODE_ENV === "development";

    let executablePath;
    let launchOptions;

    if (isDev) {
      // En desarrollo local, intenta encontrar Chrome/Chromium
      const possiblePaths = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // Mac
        "/usr/bin/google-chrome", // Linux
        "/usr/bin/chromium-browser", // Linux alternativo
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Windows
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe", // Windows 32bit
      ];

      // Buscar el primer path que exista
      const fs = require("fs");
      executablePath = possiblePaths.find((path) => {
        try {
          return fs.existsSync(path);
        } catch {
          return false;
        }
      });

      // Si no encuentra ninguno, usar puppeteer normal
      if (!executablePath) {
        const puppeteerRegular = require("puppeteer");
        browser = await puppeteerRegular.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
      } else {
        launchOptions = {
          executablePath,
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        };
      }
    } else {
      // En producción (Vercel), usar chromium optimizado
      executablePath = await chromium.executablePath();
      launchOptions = {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath,
        headless: chromium.headless,
      };
    }

    // Lanzar navegador solo si no se lanzó antes
    if (!browser) {
      browser = await puppeteer.launch(launchOptions);
    }

    const page = await browser.newPage();

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

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

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

    const getResourceSize = async (resourceUrl) => {
      try {
        const res = await fetch(resourceUrl, { method: "HEAD" });
        const contentLength = res.headers.get("content-length");
        if (contentLength) {
          const bytes = parseInt(contentLength);
          if (bytes < 1024) return `${bytes} B`;
          if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
          return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        }
      } catch (err) {
        // Ignorar
      }
      return null;
    };

    const resourcesWithSize = await Promise.all(
      uniqueResources.slice(0, 100).map(async (resource) => {
        const size = await getResourceSize(resource.url);
        return { ...resource, size };
      })
    );

    await browser.close();

    return NextResponse.json({ resources: resourcesWithSize });
  } catch (error) {
    if (browser) await browser.close();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
