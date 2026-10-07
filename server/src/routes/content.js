import { Router } from "express";
import Scheme from "../models/Scheme.js";
import Service from "../models/Service.js";
import Event from "../models/Event.js";

const router = Router();

router.get("/services", async (req, res, next) => {
  try {
    const filter = { active: true };
    if (req.query.domain) filter.domain = req.query.domain;
    if (req.query.q) filter.$text = { $search: req.query.q };
    res.json(await Service.find(filter).sort({ createdAt: -1 }).limit(100));
  } catch (error) { next(error); }
});

router.get("/events", async (req, res, next) => {
  try {
    const filter = { active: true };
    if (req.query.domain) filter.domain = req.query.domain;
    if (req.query.eventType) filter.eventType = req.query.eventType;
    if (req.query.upcoming === "true") filter.startAt = { $gte: new Date() };
    res.json(await Event.find(filter).sort({ startAt: 1 }).limit(100));
  } catch (error) { next(error); }
});

router.get("/summary", async (_req, res, next) => {
  try {
    const [schemes, services, events] = await Promise.all([
      Scheme.find({ active: true }).limit(100),
      Service.find({ active: true }).limit(100),
      Event.find({ active: true }).sort({ startAt: 1 }).limit(100)
    ]);
    res.json({ schemes, services, events });
  } catch (error) { next(error); }
});

export default router;
