import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Scheme from "./models/Scheme.js";
import Service from "./models/Service.js";
import Event from "./models/Event.js";

const schemes = [
  {
    title: "Student Scholarship Discovery",
    description: "Central and Telangana education support programs matched to student eligibility.",
    domain: "student",
    category: "Scholarship",
    officialUrl: "https://telanganaepass.cgg.gov.in/",
    tags: ["scholarship", "education", "student"]
  },
  {
    title: "Farmer Scheme Discovery",
    description: "Discover Telangana and central agricultural welfare programs relevant to farmers.",
    domain: "farmer",
    category: "Agriculture",
    officialUrl: "https://agri.telangana.gov.in/",
    tags: ["farmer", "agriculture", "subsidy"]
  },
  {
    title: "MSME and Business Support",
    description: "Find government support, registrations and enterprise programs for business owners.",
    domain: "business",
    category: "Business Support",
    officialUrl: "https://udyamregistration.gov.in/",
    tags: ["msme", "business", "entrepreneur"]
  },
  {
    title: "Senior Citizen Welfare Discovery",
    description: "Find welfare, pension and social-support information relevant to senior citizens.",
    domain: "senior_citizen",
    category: "Welfare",
    officialUrl: "https://www.tnsocialwelfare.tn.gov.in/",
    tags: ["senior citizen", "welfare", "pension"]
  },
  {
    title: "Employment and Skill Opportunities",
    description: "Discover employment, skill-development and public-service opportunities.",
    domain: "employee",
    category: "Employment",
    tags: ["employment", "skills", "jobs"]
  },
  {
    title: "General Citizen Services",
    description: "Discover common public services and government information.",
    domain: "other",
    category: "Citizen Services",
    officialUrl: "https://www.telangana.gov.in/",
    tags: ["citizen", "services", "telangana"]
  }
];

const services = [
  {
    title: "DigiLocker",
    description: "Access and share verified digital documents.",
    domain: "student",
    department: "Government of India",
    officialUrl: "https://www.digilocker.gov.in/",
    tags: ["documents", "certificates", "digital"]
  },
  {
    title: "Telangana ePASS",
    description: "Official scholarship and fee reimbursement service portal.",
    domain: "student",
    department: "Telangana",
    officialUrl: "https://telanganaepass.cgg.gov.in/",
    tags: ["student", "scholarship"]
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Scheme.deleteMany({});
  await Service.deleteMany({});
  await Event.deleteMany({});
  await Scheme.insertMany(schemes);
  await Service.insertMany(services);
  console.log("Seed completed");
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
