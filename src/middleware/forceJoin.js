const config = require('../config');
const keyboards = require('../bot/keyboards');

async function checkForceJoin(bot, msg) {
    if (!config.forceJoin.channels.length || config.isAdmin(msg.from.id)) return true;

    const missing = [];

    for (const channel of config.forceJoin.channels) {
        try {
            const member = await bot.getChatMember(channel, msg.from.id);
            const allowed = ['creator', 'administrator', 'member'];
            if (!allowed.includes(member.status)) missing.push(channel);
        } catch (error) {
            console.error(`Force-join check failed for ${channel}:`, error.message);
            missing.push(channel);
        }
    }

    if (!missing.length) return true;

    await bot.sendMessage(
        msg.chat.id,
        '🔐 <b>Access requires channel membership</b>\n\nJoin every required channel below, then tap <b>I’ve Joined — Check</b>.',
        { parse_mode: 'HTML', reply_markup: keyboards.forceJoin(config.forceJoin.channels) }
    );

    return false;
}

module.exports = { checkForceJoin };
