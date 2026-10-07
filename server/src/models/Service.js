import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  domain: { type: String, enum: ["student", "farmer", "employee", "business", "senior_citizen", "other"], index: true },
  department: String,
  officialUrl: String,
  applicationUrl: String,
  tags: [String],
  active: { type: Boolean, default: true, index: true }
}, { timestamps: true });

serviceSchema.index({ title: "text", description: "text", tags: "text" });

export default mongoose.model("Service", serviceSchema);
