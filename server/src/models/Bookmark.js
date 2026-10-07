import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  resourceType: { type: String, enum: ["scheme", "service", "event"], required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now }
});

bookmarkSchema.index({ user: 1, resourceType: 1, resourceId: 1 }, { unique: true });

export default mongoose.model("Bookmark", bookmarkSchema);
