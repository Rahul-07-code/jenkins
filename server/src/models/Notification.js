import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["scheme", "deadline", "event", "update", "system"], default: "system" },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: String,
  readAt: Date
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
