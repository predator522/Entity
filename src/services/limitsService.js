const { db } = require('../db');
const { config } = require('../config');
const { isPremium } = require('./userService');
async function consume(user, kind) {
  if (await isPremium(user)) return { allowed: true, remaining: Infinity };
  const field = kind === 'image' ? 'imageUsage' : 'aiUsage';
  const windowMs = kind === 'image' ? 3600000 : config.freeAiWindowMinutes * 60000;
  const max = kind === 'image' ? config.freeImagesPerHour : config.freeAiRequests;
  const current = user[field]?.startedAt ? new Date(user[field].startedAt) : null;
  let count = user[field]?.count || 0;
  const now = new Date();
  if (!current || now - current >= windowMs) { count = 0; user[field] = { startedAt: now, count: 0 }; }
  if (count >= max) return { allowed: false, remaining: 0, resetSeconds: Math.max(1, Math.ceil((windowMs - (now - new Date(user[field].startedAt))) / 1000)) };
  count += 1;
  await db().collection('users').updateOne({ _id: user._id }, { $set: { [`${field}.startedAt`]: new Date(user[field].startedAt), [`${field}.count`]: count } });
  return { allowed: true, remaining: max - count };
}
function usage(user) { const premium = user.role === 'premium'; return `📊 ENTITY USAGE\n\nRole: ${premium ? 'Premium' : user.role || 'User'}\nAI requests: ${premium ? '∞' : Math.max(0, config.freeAiRequests - (user.aiUsage?.count || 0))}\nImages this hour: ${premium ? '∞' : `${Math.max(0, config.freeImagesPerHour - (user.imageUsage?.count || 0))}/${config.freeImagesPerHour}`}`; }
module.exports = { consume, usage };
