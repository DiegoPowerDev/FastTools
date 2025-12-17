import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request) {
  let browser;

  try {
    const { url } = await request.json();

    // Lanzar navegador headless
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

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
        // Videos
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

    // Ir a la página y esperar a que cargue
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Extraer recursos adicionales del DOM
    const domResources = await page.evaluate(() => {
      const resources = {
        images: [],
        videos: [],
        fonts: [],
      };

      // Imágenes
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

      // Videos
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

      // Background images
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

    // Combinar recursos capturados y extraídos del DOM
    const allResources = [
      ...images,
      ...domResources.images,
      ...videos,
      ...domResources.videos,
      ...fonts,
      ...domResources.fonts,
    ];

    // Eliminar duplicados por URL
    const uniqueResources = Array.from(
      new Map(allResources.map((r) => [r.url, r])).values()
    );

    // Obtener tamaños
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
        // Ignorar errores
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
