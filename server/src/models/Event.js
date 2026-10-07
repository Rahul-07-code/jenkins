import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  domain: { type: String, enum: ["student", "farmer", "employee", "business", "senior_citizen", "other"], index: true },
  eventType: { type: String, index: true },
  startAt: Date,
  endAt: Date,
  registrationDeadline: Date,
  officialUrl: String,
  organizer: String,
  location: String,
  active: { type: Boolean, default: true, index: true }
}, { timestamps: true });

eventSchema.index({ title: "text", description: "text", organizer: "text" });

export default mongoose.model("Event", eventSchema);
