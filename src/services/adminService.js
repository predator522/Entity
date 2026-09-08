const { db } = require('../db');
const { isOwner, isAdmin } = require('./userService');
async function activity(actorId, action, targetId = null, details = '') { await db().collection('activity').insertOne({ actorId, action, targetId, details, createdAt: new Date() }); }
async function notifyAdmins(bot, text) { const admins = await db().collection('admins').find({}).toArray(); const ids = new Set(admins.map(x => x.userId)); for (const id of require('../config').config.ownerIds) ids.add(id); for (const id of ids) { try { await bot.telegram.sendMessage(id, text); } catch {} } }
async function resolveTarget(raw) {
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return db().collection('users').findOne({ telegramIds: Number(raw) });
  return db().collection('users').findOne({ username: raw.replace(/^@/, '').toLowerCase() });
}
async function setPremium(target, days) { const until = new Date(Date.now() + days * 86400000); await db().collection('users').updateOne({ _id: target._id }, { $set: { role: 'premium', premiumUntil: until, updatedAt: new Date() } }); return until; }
async function removePremium(target) { await db().collection('users').updateOne({ _id: target._id }, { $set: { role: 'user', premiumUntil: null, updatedAt: new Date() } }); }
async function setRestriction(target, until, reason) { await db().collection('users').updateOne({ _id: target._id }, { $set: { restrictedUntil: until, restrictionReason: reason, updatedAt: new Date() } }); }
async function clearRestriction(target) { await db().collection('users').updateOne({ _id: target._id }, { $set: { restrictedUntil: null, restrictionReason: null, spamWarnings: 0, updatedAt: new Date() } }); }
async function setBan(target, banned) { await db().collection('users').updateOne({ _id: target._id }, { $set: { role: banned ? 'banned' : 'user', restrictedUntil: null, updatedAt: new Date() } }); }
module.exports = { activity, notifyAdmins, resolveTarget, setPremium, removePremium, setRestriction, clearRestriction, setBan, isOwner, isAdmin };
