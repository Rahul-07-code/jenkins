import mongoose from "mongoose";

const eligibilitySchema = new mongoose.Schema({
  occupations: [String],
  minAge: Number,
  maxAge: Number,
  districts: [String],
  education: [String],
  genders: [String],
  maxIncome: Number,
  disabilityOnly: Boolean,
  interests: [String]
}, { _id: false });

const schemeSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  domain: {
    type: String,
    enum: ["student", "farmer", "employee", "business", "senior_citizen", "other"],
    index: true
  },
  category: { type: String, index: true },
  state: { type: String, default: "Telangana", index: true },
  sourceName: String,
  officialUrl: String,
  applicationUrl: String,
  deadline: Date,
  tags: [String],
  eligibility: { type: eligibilitySchema, default: () => ({}) },
  active: { type: Boolean, default: true, index: true }
}, { timestamps: true });

export default mongoose.model("Scheme", schemeSchema);
