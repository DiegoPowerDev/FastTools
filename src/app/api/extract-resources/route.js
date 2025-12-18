import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Función rápida con Cheerio (sin JavaScript)
async function extractWithCheerio(url) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const baseUrl = new URL(url);
  const resources = [];

  const resolveUrl = (href) => {
    try {
      return new URL(href, baseUrl).href;
    } catch {
      return null;
    }
  };

  // Imágenes
  $("img").each((i, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src");
    if (src) {
      const fullUrl = resolveUrl(src);
      if (fullUrl) {
        resources.push({
          type: "image",
          url: fullUrl,
          filename: fullUrl.split("/").pop().split("?")[0] || `image-${i}.jpg`,
        });
      }
    }
  });

  // Videos
  $("video source, video").each((i, el) => {
    const src = $(el).attr("src");
    if (src) {
      const fullUrl = resolveUrl(src);
      if (fullUrl) {
        resources.push({
          type: "video",
          url: fullUrl,
          filename: fullUrl.split("/").pop().split("?")[0] || `video-${i}.mp4`,
        });
      }
    }
  });

  // Fuentes en CSS
  $("link[rel='stylesheet'], style").each((i, el) => {
    const href = $(el).attr("href");
    if (href) {
      const fullUrl = resolveUrl(href);
      if (
        fullUrl &&
        (fullUrl.includes(".woff") ||
          fullUrl.includes(".ttf") ||
          fullUrl.includes(".otf"))
      ) {
        resources.push({
          type: "font",
          url: fullUrl,
          filename: fullUrl.split("/").pop().split("?")[0],
        });
      }
    }

    const content = $(el).html();
    if (content) {
      const fontRegex = /url\(['"]?([^'"]+\.(?:woff2?|ttf|otf|eot))['"]?\)/gi;
      let match;
      while ((match = fontRegex.exec(content)) !== null) {
        const fullUrl = resolveUrl(match[1]);
        if (fullUrl) {
          resources.push({
            type: "font",
            url: fullUrl,
            filename: fullUrl.split("/").pop().split("?")[0],
          });
        }
      }
    }
  });

  return resources;
}

// Función con Puppeteer (para SPAs)
async function extractWithPuppeteer(url) {
  const puppeteer = await import("puppeteer-core");
  const chromium = await import("@sparticuz/chromium-min");

  const executablePath = await chromium.default.executablePath(
    "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
  );

  const browser = await puppeteer.default.launch({
    args: [
      ...chromium.default.args,
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-first-run",
      "--no-sandbox",
      "--no-zygote",
      "--single-process",
    ],
    defaultViewport: chromium.default.defaultViewport,
    executablePath: executablePath,
    headless: chromium.default.headless,
  });

  const page = await browser.newPage();

  await page.setRequestInterception(true);

  const images = [];
  const videos = [];
  const fonts = [];

  page.on("request", (request) => {
    const resourceUrl = request.url();
    const resourceType = request.resourceType();

    if (resourceType === "image") {
      images.push({
        type: "image",
        url: resourceUrl,
        filename: resourceUrl.split("/").pop().split("?")[0] || "image.jpg",
      });
      request.continue();
    } else if (resourceType === "media") {
      if (resourceUrl.match(/\.(mp4|webm|ogg|mov)(\?|$)/i)) {
        videos.push({
          type: "video",
          url: resourceUrl,
          filename: resourceUrl.split("/").pop().split("?")[0] || "video.mp4",
        });
      }
      request.abort();
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

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });

  const domResources = await page.evaluate(() => {
    const resources = { images: [], videos: [], fonts: [] };

    document.querySelectorAll("img").forEach((img) => {
      if (img.src) {
        resources.images.push({
          type: "image",
          url: img.src,
          filename: img.src.split("/").pop().split("?")[0] || "image.jpg",
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

    return resources;
  });

  await browser.close();

  return [
    ...images,
    ...domResources.images,
    ...videos,
    ...domResources.videos,
    ...fonts,
  ];
}

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log("Starting extraction for:", url);

    let allResources = [];
    let method = "cheerio";

    // Primero intentar con Cheerio (rápido)
    try {
      console.log("Trying with Cheerio...");
      allResources = await extractWithCheerio(url);
      console.log(`Found ${allResources.length} resources with Cheerio`);

      // Si no encontró recursos, probablemente es una SPA
      if (allResources.length < 3) {
        console.log("Few resources found, trying with Puppeteer...");
        method = "puppeteer";
        allResources = await extractWithPuppeteer(url);
        console.log(`Found ${allResources.length} resources with Puppeteer`);
      }
    } catch (error) {
      console.error(`Error with ${method}:`, error);

      // Si Cheerio falló, intentar Puppeteer
      if (method === "cheerio") {
        try {
          console.log("Cheerio failed, trying Puppeteer...");
          allResources = await extractWithPuppeteer(url);
        } catch (puppeteerError) {
          console.error("Puppeteer also failed:", puppeteerError);
          throw puppeteerError;
        }
      } else {
        throw error;
      }
    }

    const uniqueResources = Array.from(
      new Map(allResources.map((r) => [r.url, r])).values()
    );

    const resourcesWithSize = uniqueResources.slice(0, 200).map((resource) => ({
      ...resource,
      size: null,
    }));

    return NextResponse.json({
      resources: resourcesWithSize,
      method: method, // Para debug
    });
  } catch (error) {
    console.error("Error in extract-resources:", error);
    return NextResponse.json(
      {
        error: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
