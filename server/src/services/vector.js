import KnowledgeDocument from "../models/KnowledgeDocument.js";

function tokenize(value = "") {
  return new Set(
    value.toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2)
  );
}

function overlap(query, document) {
  const q = tokenize(query);
  const d = tokenize(document.title + " " + document.content + " " + (document.tags || []).join(" "));
  if (!q.size || !d.size) return 0;
  let matches = 0;
  for (const token of q) if (d.has(token)) matches++;
  return matches / q.size;
}

export async function retrieve(query, limit = 6) {
  const provider = process.env.VECTOR_DB_PROVIDER || "mock";
  const documents = await KnowledgeDocument.find({ status: "ready" })
    .select("title sourceName sourceUrl content tags")
    .limit(300)
    .lean();

  const ranked = documents
    .map((document) => ({ ...document, score: overlap(query, document) }))
    .filter((document) => document.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return { provider, documents: ranked };
}
