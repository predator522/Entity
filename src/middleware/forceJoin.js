const { config } = require('../config');
const { isOwner, isAdmin } = require('../services/userService');
const { Markup } = require('telegraf');
const { db } = require('../db');
async function channels() { const rows = await db().collection('forceChannels').find({}).toArray(); return [...new Set([...config.forceJoinChannels, ...rows.map(x => x.channel)])]; }
async function checkForceJoin(ctx) { const required = await channels(); if (!required.length || isOwner(ctx.from?.id) || await isAdmin(ctx.from?.id)) return true; const missing=[]; for(const channel of required){ try { const m=await ctx.telegram.getChatMember(channel,ctx.from.id); if(!['member','administrator','creator'].includes(m.status)) missing.push(channel); } catch(e){ console.warn(`Force-join check failed for ${channel}: ${e.message}`); return false; } } if(!missing.length)return true; const buttons=missing.map(c=>[Markup.button.url(`Join ${c}`,`https://t.me/${c.replace(/^@/,'')}`)]); buttons.push([Markup.button.callback('✅ I joined — Check again','force_check')]); await ctx.reply('🔒 <b>Access locked</b>\n\nJoin all required channels, then tap the button below.',{parse_mode:'HTML',...Markup.inlineKeyboard(buttons)}); return false; }
module.exports={checkForceJoin};
