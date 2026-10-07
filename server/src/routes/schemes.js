import { Router } from "express";
import Scheme from "../models/Scheme.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function ageFromDob(dateOfBirth) {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function scoreScheme(scheme, profile) {
  const e = scheme.eligibility || {};
  let score = 0;
  let max = 0;

  const checks = [
    ["occupation", e.occupations?.length ? e.occupations.includes(profile.occupation) : null, 30],
    ["district", e.districts?.length ? e.districts.includes(profile.district) : null, 15],
    ["education", e.education?.length ? e.education.includes(profile.education) : null, 15],
    ["gender", e.genders?.length ? e.genders.includes(profile.gender) : null, 10],
    ["interest", e.interests?.length ? e.interests.some((x) => profile.interests?.includes(x)) : null, 10]
  ];

  for (const [, result, weight] of checks) {
    if (result !== null) {
      max += weight;
      if (result) score += weight;
    }
  }

  const age = ageFromDob(profile.dateOfBirth);
  if (e.minAge != null || e.maxAge != null) {
    max += 10;
    if (age != null && (e.minAge == null || age >= e.minAge) && (e.maxAge == null || age <= e.maxAge)) score += 10;
  }

  if (e.maxIncome != null) {
    max += 10;
    if (profile.income != null && profile.income <= e.maxIncome) score += 10;
  }

  if (e.disabilityOnly === true) {
    max += 10;
    if (profile.disability === true) score += 10;
  }

  return max ? Math.round((score / max) * 100) : 0;
}

router.get("/", async (req, res, next) => {
  try {
    const { domain, district, q, limit = 20 } = req.query;
    const filter = { active: true };
    if (domain) filter.domain = domain;
    if (district) filter["eligibility.districts"] = district;
    if (q) filter.$text = { $search: q };

    const schemes = await Scheme.find(filter).sort({ deadline: 1, createdAt: -1 }).limit(Math.min(Number(limit), 100));
    res.json(schemes);
  } catch (error) {
    next(error);
  }
});

router.get("/personalized", requireAuth, async (req, res, next) => {
  try {
    const user = await (await import("../models/User.js")).default.findById(req.user.sub).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const domain = user.profile?.occupation || "other";
    const candidates = await Scheme.find({
      active: true,
      $or: [{ domain }, { domain: "other" }]
    }).lean();

    const ranked = candidates
      .map((scheme) => ({ ...scheme, relevanceScore: scoreScheme(scheme, user.profile || {}) }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json(ranked);
  } catch (error) {
    next(error);
  }
});

export default router;
