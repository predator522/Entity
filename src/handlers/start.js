const { Markup } = require('telegraf');
const { ensureUser,isOwner } = require('../services/userService');
const { checkForceJoin } = require('../middleware/forceJoin');
const { mainKeyboard } = require('../keyboards/menu');
async function start(ctx){ const user=await ensureUser(ctx.from); if(!(await checkForceJoin(ctx)))return; await ctx.reply('🐕 <b>ENTITY 4.5</b>\n\nWelcome to the illustrious realm of Entity 4.5 metros, where they have unveiled their most recent and undoubtedly spectacular invention: a dog without limits.\n\nCreators/Owners\n\nEscanor\nMetro\n\nUse the buttons below or /help.',{parse_mode:'HTML',...mainKeyboard(isOwner(ctx.from.id))}); }
module.exports={start};
