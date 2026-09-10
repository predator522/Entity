const apiClient = require('../api/client');
const users = require('../services/users');
const conversation = require('../services/conversation');
const rateLimit = require('../services/rateLimit');
const formatting = require('../utils/formatting');
const { errorHandler } = require('../utils/errors');
const config = require('../config');
const { checkForceJoin } = require('../middleware/forceJoin');

module.exports = (bot) => {
    bot.on('message', async (msg) => {
        if (!msg.text || msg.text.startsWith('/')) return;

        const chatId = msg.chat.id;
        const userId = msg.from.id;
        users.registerUser(userId, msg.from);

        if (!(await checkForceJoin(bot, msg))) return;

        if (config.maintenance.enabled && !config.isAdmin(userId)) {
            await bot.sendMessage(chatId, '🛠 <b>Entity is currently under maintenance.</b>\n\nPlease try again shortly.', { parse_mode: 'HTML' });
            return;
        }

        if (!rateLimit.isAllowed(userId)) {
            await bot.sendMessage(chatId, '⏳ Slow down a little. You have reached the current request limit.');
            return;
        }

        bot.sendChatAction(chatId, 'typing').catch(() => {});

        const settings = users.getSettings(userId);
        let query = msg.text;
        if (settings.developerMode) query = `[Developer mode: prioritize implementation, correctness, debugging, architecture and security.]\n\n${query}`;
        if (settings.responseStyle && settings.responseStyle !== 'balanced') {
            const hints = {
                concise: 'Be concise and direct.',
                detailed: 'Give a thorough explanation with useful examples.',
                technical: 'Use deep technical detail and implementation guidance.'
            };
            query = `[${hints[settings.responseStyle] || hints.balanced || 'Be helpful.'}]\n\n${query}`;
        }

        try {
            users.updateActivity(userId);
            const context = conversation.getFormattedContext(userId);
            const result = await apiClient.request(query, settings.endpoint, context);
            conversation.addMessage(userId, 'user', msg.text);
            conversation.addMessage(userId, 'assistant', result.response);

            const parts = formatting.splitMessage(result.response);
            for (let i = 0; i < parts.length; i++) {
                const prefix = parts.length > 1 ? `🐕 <b>ENTITY 4.5 — ${i + 1}/${parts.length}</b>\n\n` : '';
                await bot.sendMessage(chatId, prefix + formatting.escapeHtml(parts[i]), {
                    parse_mode: 'HTML',
                    disable_web_page_preview: true
                });
            }
        } catch (error) {
            errorHandler.handle(error, { bot, chatId, userId });
        }
    });
};
