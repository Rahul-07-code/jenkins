import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";
import { answerQuestion } from "../services/sathi.js";

const router = Router();

router.post("/chat", requireAuth, async (req, res, next) => {
  try {
    const { question, history = [] } = req.body;
    if (!question?.trim()) return res.status(400).json({ message: "question is required" });

    const user = await User.findById(req.user.sub).select("profile name").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const result = await answerQuestion({
      question: question.trim(),
      profile: user.profile || {},
      history: Array.isArray(history) ? history : []
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
