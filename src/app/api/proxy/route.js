import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { url, method, headers, body } = await request.json();

    const options = {
      method: method || "GET",
      headers: headers || {},
    };

    if (body && method !== "GET" && method !== "HEAD") {
      options.body = JSON.stringify(body);
      if (!options.headers["Content-Type"]) {
        options.headers["Content-Type"] = "application/json";
      }
    }

    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type");

    const data = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      data,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
