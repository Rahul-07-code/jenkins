import { Router } from "express";
import Scheme from "../models/Scheme.js";
import Service from "../models/Service.js";
import Event from "../models/Event.js";
import { requireAdmin } from "../middleware/admin.js";
import KnowledgeDocument from "../models/KnowledgeDocument.js";
import { extractUploadedFile, ingestUrl } from "../services/knowledge.js";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
router.use(requireAdmin);

const models = { scheme: Scheme, service: Service, event: Event };


router.get("/knowledge", async (_req, res, next) => {
  try {
    const documents = await KnowledgeDocument.find({}, { content: 0 }).sort({ createdAt: -1 }).limit(200).lean();
    res.json(documents);
  } catch (error) { next(error); }
});

router.post("/knowledge/url", async (req, res, next) => {
  try {
    const { title, sourceName, url, tags = [] } = req.body;
    if (!title || !url) return res.status(400).json({ message: "title and url are required" });
    const result = await ingestUrl(url);
    const document = await KnowledgeDocument.create({
      title,
      sourceName,
      sourceUrl: result.sourceUrl,
      sourceType: "url",
      content: result.content,
      status: "ready",
      tags,
      lastIngestedAt: new Date()
    });
    res.status(201).json(document);
  } catch (error) { next(error); }
});

router.post("/knowledge/text", async (req, res, next) => {
  try {
    const { title, sourceName, sourceUrl, content, tags = [] } = req.body;
    if (!title || !content) return res.status(400).json({ message: "title and content are required" });
    const document = await KnowledgeDocument.create({
      title, sourceName, sourceUrl, sourceType: "text", content, status: "ready", tags, lastIngestedAt: new Date()
    });
    res.status(201).json(document);
  } catch (error) { next(error); }
});

router.post("/knowledge/upload", upload.single("file"), async (req, res, next) => {
  try {
    const { title, sourceName, tags = "[]" } = req.body;
    if (!req.file || !title) return res.status(400).json({ message: "title and file are required" });
    const content = await extractUploadedFile(req.file);
    const document = await KnowledgeDocument.create({
      title,
      sourceName,
      sourceType: "upload",
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      content,
      status: "ready",
      tags: typeof tags === "string" ? JSON.parse(tags) : tags,
      lastIngestedAt: new Date()
    });
    res.status(201).json({
      id: document._id,
      title: document.title,
      fileName: document.fileName,
      status: document.status
    });
  } catch (error) { next(error); }
});

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
