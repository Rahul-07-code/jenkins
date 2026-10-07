import { Router } from "express";
import User from "../models/User.js";
import Bookmark from "../models/Bookmark.js";
import Reminder from "../models/Reminder.js";
import Notification from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/me", async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) { next(error); }
});

router.patch("/me", async (req, res, next) => {
  try {
    const allowed = ["name", "profile"];
    const update = {};
    for (const key of allowed) if (req.body[key] !== undefined) update[key] = req.body[key];
    const user = await User.findByIdAndUpdate(req.user.sub, update, { new: true, runValidators: true }).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) { next(error); }
});

router.get("/bookmarks", async (req, res, next) => {
  try {
    res.json(await Bookmark.find({ user: req.user.sub }).sort({ createdAt: -1 }).lean());
  } catch (error) { next(error); }
});

router.post("/bookmarks", async (req, res, next) => {
  try {
    const { resourceType, resourceId } = req.body;
    const bookmark = await Bookmark.create({ user: req.user.sub, resourceType, resourceId });
    res.status(201).json(bookmark);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Already bookmarked" });
    next(error);
  }
});

router.delete("/bookmarks/:id", async (req, res, next) => {
  try {
    const result = await Bookmark.deleteOne({ _id: req.params.id, user: req.user.sub });
    res.json({ success: result.deletedCount > 0 });
  } catch (error) { next(error); }
});

router.get("/reminders", async (req, res, next) => {
  try {
    res.json(await Reminder.find({ user: req.user.sub }).sort({ remindAt: 1 }).lean());
  } catch (error) { next(error); }
});

router.post("/reminders", async (req, res, next) => {
  try {
    const { title, resourceType, resourceId, remindAt } = req.body;
    if (!title || !remindAt) return res.status(400).json({ message: "title and remindAt are required" });
    const reminder = await Reminder.create({
      user: req.user.sub, title, resourceType, resourceId, remindAt
    });
    res.status(201).json(reminder);
  } catch (error) { next(error); }
});

router.patch("/reminders/:id", async (req, res, next) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user.sub },
      { completed: Boolean(req.body.completed) },
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json(reminder);
  } catch (error) { next(error); }
});

router.get("/notifications", async (req, res, next) => {
  try {
    res.json(await Notification.find({ user: req.user.sub }).sort({ createdAt: -1 }).limit(100).lean());
  } catch (error) { next(error); }
});

router.patch("/notifications/:id/read", async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.sub },
      { readAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json(notification);
  } catch (error) { next(error); }
});

export default router;
