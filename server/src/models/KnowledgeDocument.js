import mongoose from "mongoose";

const knowledgeDocumentSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  sourceName: String,
  sourceUrl: String,
  sourceType: { type: String, enum: ["url", "upload", "text"], required: true },
  fileName: String,
  mimeType: String,
  content: { type: String, required: true },
  status: { type: String, enum: ["ready", "pending", "failed"], default: "ready", index: true },
  tags: [String],
  lastIngestedAt: Date
}, { timestamps: true });

knowledgeDocumentSchema.index({ title: "text", content: "text", tags: "text" });

export default mongoose.model("KnowledgeDocument", knowledgeDocumentSchema);
