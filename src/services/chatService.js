const { chats } = require("../db");

async function saveChat({
  userId,
  telegramId,
  role,
  text,
  engine
}) {
  await chats().insertOne({
    userId,
    telegramId: Number(telegramId),
    role,
    text: String(text),
    engine: engine || null,
    createdAt: new Date()
  });
}

async function getRecentChats(userId, limit = 12) {
  return chats()
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
    .then(rows => rows.reverse());
}

module.exports = {
  saveChat,
  getRecentChats
};
