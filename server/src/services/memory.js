import Conversation from "../models/Conversation.js";

export async function getMemory(userId, limit = 8) {
  if (!userId) return [];
  const conversation = await Conversation.findOne({ user: userId }).lean();
  return (conversation?.messages || []).slice(-limit);
}

export async function remember(userId, entries) {
  if (!userId || !entries?.length) return;
  await Conversation.findOneAndUpdate(
    { user: userId },
    {
      $push: {
        messages: {
          $each: entries,
          $slice: -30
        }
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export function providerName() {
  return process.env.HINDSIGHT_API_URL ? "hindsight-adapter" : "mongo-memory";
}
