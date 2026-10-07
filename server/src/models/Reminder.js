import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  resourceType: { type: String, enum: ["scheme", "service", "event", "custom"], default: "custom" },
  resourceId: mongoose.Schema.Types.ObjectId,
  remindAt: { type: Date, required: true, index: true },
  completed: { type: Boolean, default: false, index: true }
}, { timestamps: true });

export default mongoose.model("Reminder", reminderSchema);
