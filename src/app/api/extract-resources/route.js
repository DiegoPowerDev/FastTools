import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

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

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    console.log("Starting extraction for:", url);

    let allResources = [];

    allResources = await extractWithCheerio(url);
    console.log(`Found ${allResources.length} resources with Cheerio`);

    const uniqueResources = Array.from(
      new Map(allResources.map((r) => [r.url, r])).values()
    );

    const resourcesWithSize = uniqueResources.slice(0, 200).map((resource) => ({
      ...resource,
      size: null,
    }));

    return NextResponse.json({
      resources: resourcesWithSize,
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
