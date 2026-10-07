import { Router } from "express";
import Scheme from "../models/Scheme.js";
import Service from "../models/Service.js";
import Event from "../models/Event.js";
import { requireAdmin } from "../middleware/admin.js";

const router = Router();
router.use(requireAdmin);

const models = { scheme: Scheme, service: Service, event: Event };

router.get("/stats", async (_req, res, next) => {
  try {
    const [schemes, services, events] = await Promise.all([
      Scheme.countDocuments({ active: true }),
      Service.countDocuments({ active: true }),
      Event.countDocuments({ active: true })
    ]);
    res.json({ schemes, services, events });
  } catch (error) { next(error); }
});

for (const [type, Model] of Object.entries(models)) {
  router.post(`/${type}`, async (req, res, next) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (error) { next(error); }
  });

  router.put(`/${type}/:id`, async (req, res, next) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ message: `${type} not found` });
      res.json(item);
    } catch (error) { next(error); }
  });

  router.delete(`/${type}/:id`, async (req, res, next) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
      if (!item) return res.status(404).json({ message: `${type} not found` });
      res.json({ success: true, item });
    } catch (error) { next(error); }
  });
}

export default router;
