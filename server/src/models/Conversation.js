import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, index: true },
  messages: { type: [messageSchema], default: [] }
}, { timestamps: true });

export default mongoose.model("Conversation", conversationSchema);
