import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  occupation: {
    type: String,
    enum: ["student", "farmer", "employee", "business", "senior_citizen", "other"],
    default: "other"
  },
  dateOfBirth: Date,
  gender: String,
  state: { type: String, default: "Telangana" },
  district: String,
  mandal: String,
  education: String,
  income: Number,
  disability: { type: Boolean, default: false },
  interests: [String],
  crops: [String],
  landSize: Number,
  businessType: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["citizen", "admin"], default: "citizen", index: true },
  profile: { type: profileSchema, default: () => ({}) }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
