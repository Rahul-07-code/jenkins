import Scheme from "../models/Scheme.js";
import Service from "../models/Service.js";
import Event from "../models/Event.js";
import KnowledgeDocument from "../models/KnowledgeDocument.js";

function compact(items) {
  return items.map((item) => ({
    title: item.title,
    description: item.description,
    domain: item.domain,
    officialUrl: item.officialUrl || item.applicationUrl || null,
    deadline: item.deadline || item.registrationDeadline || null
  }));
}

async function retrieveContext(profile = {}, question = "") {
  const domain = profile.occupation || "other";
  const terms = question.trim().split(/\s+/).filter(Boolean).slice(0, 6);
  const text = terms.join(" ");
  const textFilter = text ? { $text: { $search: text } } : {};

  const [schemes, services, events, documents] = await Promise.all([
    Scheme.find({
      active: true,
      $or: [{ domain }, { domain: "other" }],
      ...(text ? textFilter : {})
    }).limit(8).lean(),
    Service.find({
      active: true,
      $or: [{ domain }, { domain: "other" }],
      ...(text ? textFilter : {})
    }).limit(5).lean(),
    Event.find({ active: true, ...(text ? textFilter : {}) }).sort({ startAt: 1 }).limit(5).lean(),
    KnowledgeDocument.find({ status: "ready", ...(text ? textFilter : {}) })
      .select("title sourceName sourceUrl content")
      .limit(5)
      .lean()
  ]);

  return { schemes: compact(schemes), services: compact(services), events: compact(events), documents };
}

async function askGroq(question, profile, context, history = []) {
  if (!process.env.GROQ_API_KEY) return null;

  const baseUrl = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const system = [
    "You are Sathi AI, a multilingual citizen-information assistant for Praja Sathi.",
    "Answer only from the provided retrieved government-source context and the citizen profile.",
    "Do not invent scheme eligibility, amounts, dates, or application steps.",
    "When context is insufficient, say that official verification is required and provide the relevant official source.",
    "Keep answers clear and practical. Answer in the same language as the user when possible.",
    "Citizen profile: " + JSON.stringify(profile),
    "Retrieved context: " + JSON.stringify(context)
  ].join("\n\n");

  const messages = [
    { role: "system", content: system },
    ...history.slice(-6).map((item) => ({ role: item.role, content: item.content })),
    { role: "user", content: question }
  ];

  const response = await fetch(baseUrl + "/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.GROQ_API_KEY
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      max_completion_tokens: 700
    })
  });

  if (!response.ok) throw new Error("Groq request failed with status " + response.status);
  const payload = await response.json();
  return payload.choices?.[0]?.message?.content?.trim() || null;
}

export async function answerQuestion({ question, profile, history }) {
  const context = await retrieveContext(profile, question);
  let answer = null;

  if (process.env.GROQ_API_KEY) {
    try {
      answer = await askGroq(question, profile, context, history);
    } catch (error) {
      console.warn("Groq unavailable; using grounded mock response:", error.message);
    }
  }

  if (!answer) {
    const firstScheme = context.schemes[0];
    answer = firstScheme
      ? "I found \"" + firstScheme.title + "\" as a relevant item. " + firstScheme.description + " Check the official source before applying."
      : "I could not find a matching item in the current verified knowledge base. Please try a more specific question.";
  }

  const sources = [
    ...context.schemes.map((item) => ({ title: item.title, officialUrl: item.officialUrl })),
    ...context.services.map((item) => ({ title: item.title, officialUrl: item.officialUrl })),
    ...context.events.map((item) => ({ title: item.title, officialUrl: item.officialUrl })),
    ...context.documents.map((item) => ({ title: item.title, officialUrl: item.sourceUrl }))
  ].filter((item) => item.officialUrl);

  return { answer, sources, context };
}
