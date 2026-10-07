function stripHtml(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function assertPublicHttpUrl(value) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only HTTP(S) URLs are supported");
  const host = url.hostname.toLowerCase();
  const blocked = ["localhost", "127.0.0.1", "::1", "0.0.0.0"];
  if (blocked.includes(host) || host.endsWith(".local")) throw new Error("Private/local URLs are not allowed");
  return url.toString();
}

export async function ingestUrl(url) {
  const safeUrl = assertPublicHttpUrl(url);
  const response = await fetch(safeUrl, { redirect: "follow", signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Source returned HTTP " + response.status);
  const type = response.headers.get("content-type") || "";
  const raw = await response.text();
  return {
    content: type.includes("text/html") ? stripHtml(raw) : raw.slice(0, 200000),
    sourceUrl: safeUrl
  };
}

export async function extractUploadedFile(file) {
  if (!file) throw new Error("File is required");
  if (file.mimetype === "application/pdf") {
    const module = await import("pdf-parse");
    const parser = module.default || module;
    const parsed = await parser(file.buffer);
    return parsed.text.trim();
  }

  const contentTypes = ["text/plain", "text/markdown", "text/html"];
  if (!contentTypes.includes(file.mimetype) && !file.originalname.match(/\.(txt|md|html?)$/i)) {
    throw new Error("Upload a PDF, TXT, Markdown, or HTML document");
  }

  return file.mimetype === "text/html" || /\.html?$/i.test(file.originalname)
    ? stripHtml(file.buffer.toString("utf8"))
    : file.buffer.toString("utf8");
}
