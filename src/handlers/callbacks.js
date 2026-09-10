const keyboards = require('../bot/keyboards');
const users = require('../services/users');
const endpointManager = require('../api/endpoints');
const conversation = require('../services/conversation');
const { broadcastPending } = require('../commands/admin');
const apiClient = require('../api/client');
const formatting = require('../utils/formatting');
const config = require('../config');

module.exports = (bot) => {
    bot.on('callback_query', async (query) => {
        const chatId = query.message?.chat?.id;
        const userId = query.from?.id;
        const data = query.data || '';
        if (!chatId || !userId) return;

        try {
            await bot.answerCallbackQuery(query.id).catch(() => {});

            if (data === 'force_check') {
                const { checkForceJoin } = require('../middleware/forceJoin');
                const ok = await checkForceJoin(bot, { chat: { id: chatId }, from: query.from });
                if (ok) {
                    await bot.sendMessage(chatId, '✅ <b>Membership verified.</b>\n\n🐕 Entity 4.5 is ready.', {
                        parse_mode: 'HTML',
                        reply_markup: keyboards.mainMenu(config.isOwner(userId))
                    });
                }
                return;
            }

            if (data === 'menu_home') {
                await bot.sendMessage(chatId, '🐕 <b>ENTITY 4.5</b>\n\nChoose an option.', {
                    parse_mode: 'HTML', reply_markup: keyboards.mainMenu(config.isOwner(userId))
                });
                return;
            }

            if (data === 'menu_chat') {
                await bot.sendMessage(chatId, '💬 <b>Chat</b>\n\nSend any message and Entity 4.5 will respond.', { parse_mode: 'HTML', reply_markup: keyboards.back() });
                return;
            }

            if (data === 'menu_memory') {
                await bot.sendMessage(chatId, '🧠 <b>Memory</b>\n\nThis build keeps your conversation context while the bot is running.\n\nUse /reset to clear it.', { parse_mode: 'HTML', reply_markup: keyboards.back() });
                return;
            }

            if (data === 'menu_account') {
                const user = users.getUser(userId);
                await bot.sendMessage(chatId, `👤 <b>Entity Account</b>\n\nName: ${formatting.escapeHtml(user?.firstName || '—')}\nUsername: ${user?.username ? '@' + formatting.escapeHtml(user.username) : '—'}\nID: <code>${userId}</code>`, { parse_mode: 'HTML', reply_markup: keyboards.back() });
                return;
            }

            if (data === 'menu_usage') {
                const stats = users.getStats();
                const user = users.getUser(userId);
                await bot.sendMessage(chatId, `📊 <b>Your Entity Usage</b>\n\nRequests: ${user?.requestCount || 0}\nGlobal requests: ${stats.totalRequests}\nRate limit: ${config.rateLimit.maxRequestsPerMinute}/minute`, { parse_mode: 'HTML', reply_markup: keyboards.back() });
                return;
            }

            if (data === 'menu_settings') {
                await bot.sendMessage(chatId, '⚙️ <b>Entity Settings</b>\n\nChoose your response preferences.', { parse_mode: 'HTML', reply_markup: keyboards.settingsMenu(users.getSettings(userId)) });
                return;
            }

            if (data === 'menu_owners') {
                await bot.sendMessage(chatId, '👑 <b>CREATORS / OWNERS</b>\n\n👑 Escanor — @Lion_sin_aboveall\n👑 Lucifer — @W0rm_h0le\n\nThe minds behind the dog without limits.', { parse_mode: 'HTML', reply_markup: keyboards.back() });
                return;
            }

            if (data === 'menu_about') {
                await bot.sendMessage(chatId, '🐕 <b>ENTITY 4.5</b>\n\n<b>The dog without limits.</b>\n\nA Telegram AI assistant for coding, reasoning, writing, research and everyday questions.\n\n👑 Escanor — @Lion_sin_aboveall\n👑 Lucifer — @W0rm_h0le', { parse_mode: 'HTML', reply_markup: keyboards.back() });
                return;
            }

            if (data === 'menu_status') {
                const status = await apiClient.checkStatus();
                await bot.sendMessage(chatId, `◉ <b>ENTITY 4.5 STATUS</b>\n\nBot: 🟢 ONLINE\nAI Engine: ${status.online ? '🟢 ONLINE' : '🔴 OFFLINE'}\nEndpoint: ${formatting.escapeHtml(status.endpoint)}`, { parse_mode: 'HTML', reply_markup: keyboards.back() });
                return;
            }

            if (data === 'settings_devmode') {
                const current = users.getSettings(userId).developerMode;
                users.updateSettings(userId, { developerMode: !current });
                await bot.sendMessage(chatId, `⌘ <b>Developer Mode</b>\n\nStatus: ${!current ? '🟢 ON' : '⚪ OFF'}`, { parse_mode: 'HTML', reply_markup: keyboards.back() });
                return;
            }

            if (data === 'settings_style') {
                await bot.sendMessage(chatId, '◈ <b>Response Style</b>\n\nChoose a style.', { parse_mode: 'HTML', reply_markup: keyboards.responseStyleMenu(users.getSettings(userId).responseStyle) });
                return;
            }

            if (data === 'settings_reset') {
                conversation.clearContext(userId);
                await bot.sendMessage(chatId, '↻ <b>Conversation cleared.</b>', { parse_mode: 'HTML', reply_markup: keyboards.back() });
                return;
            }

            if (data === 'settings_back') {
                await bot.sendMessage(chatId, '⚙️ <b>Entity Settings</b>', { parse_mode: 'HTML', reply_markup: keyboards.settingsMenu(users.getSettings(userId)) });
                return;
            }

            if (data.startsWith('style_')) {
                const style = data.slice(6);
                if (!['concise', 'balanced', 'detailed', 'technical'].includes(style)) return;
                users.updateSettings(userId, { responseStyle: style });
                await bot.sendMessage(chatId, `✅ Response style set to <b>${style}</b>.`, { parse_mode: 'HTML', reply_markup: keyboards.back() });
                return;
            }

            if (data.startsWith('dev_')) {
                const tech = data.slice(4);
                await bot.sendMessage(chatId, `⌘ <b>${formatting.escapeHtml(tech[0].toUpperCase() + tech.slice(1))}</b>\n\nSend your ${formatting.escapeHtml(tech)} question now.`, { parse_mode: 'HTML', reply_markup: keyboards.back() });
                return;
            }

            if (data.startsWith('admin_')) {
                if (!users.isAdmin(userId)) {
                    await bot.answerCallbackQuery(query.id, { text: 'Admin access required.', show_alert: true }).catch(() => {});
                    return;
                }

                if (data === 'admin_home') {
                    const stats = users.getStats();
                    await bot.sendMessage(chatId, `🛠 <b>ENTITY 4.5 — ADMIN CENTER</b>\n\nUsers: ${stats.totalUsers}\nRequests: ${stats.totalRequests}\nErrors: ${stats.apiErrors}\nMode: ${config.maintenance.enabled ? 'MAINTENANCE' : 'ACTIVE'}`, { parse_mode: 'HTML', reply_markup: keyboards.adminMenu() });
                    return;
                }

                if (data === 'admin_stats') {
                    const s = users.getStats();
                    await bot.sendMessage(chatId, `◈ <b>Statistics</b>\n\nUsers: ${s.totalUsers}\nActive (24h): ${s.activeUsers}\nRequests: ${s.totalRequests}\nToday: ${s.requestsToday}\nAPI errors: ${s.apiErrors}\nUptime: ${formatting.formatUptime(s.uptime / 1000)}`, { parse_mode: 'HTML', reply_markup: keyboards.back() });
                    return;
                }

                if (data === 'admin_endpoints') {
                    await bot.sendMessage(chatId, '⌬ <b>AI Endpoints</b>\n\nSelect an endpoint to enable/disable.', { parse_mode: 'HTML', reply_markup: keyboards.adminEndpointsMenu(endpointManager.getAll()) });
                    return;
                }

                if (data.startsWith('admin_toggle_')) {
                    const path = data.slice(13);
                    const endpoint = endpointManager.toggleEndpoint(path);
                    if (endpoint) await bot.sendMessage(chatId, `${endpoint.enabled ? '🟢 Enabled' : '⚪ Disabled'} <b>${formatting.escapeHtml(endpoint.name)}</b>`, { parse_mode: 'HTML', reply_markup: keyboards.adminEndpointsMenu(endpointManager.getAll()) });
                    return;
                }

                if (data === 'admin_config') {
                    await bot.sendMessage(chatId, '⚙️ <b>Configuration</b>\n\nUse the .env file for permanent configuration changes.', { parse_mode: 'HTML', reply_markup: keyboards.back() });
                    return;
                }

                if (data === 'admin_maintenance') {
                    config.maintenance.enabled = !config.maintenance.enabled;
                    await bot.sendMessage(chatId, `◇ Maintenance mode: <b>${config.maintenance.enabled ? 'ON' : 'OFF'}</b>`, { parse_mode: 'HTML', reply_markup: keyboards.adminMenu() });
                    return;
                }

                if (data === 'admin_broadcast') {
                    await bot.sendMessage(chatId, '📢 <b>Broadcast</b>\n\nUse /broadcast &lt;message&gt; to prepare an announcement.', { parse_mode: 'HTML', reply_markup: keyboards.back() });
                    return;
                }

                if (data === 'admin_reload') {
                    await bot.sendMessage(chatId, '↻ Runtime settings are already loaded. Restart the bot after editing .env.', { reply_markup: keyboards.back() });
                    return;
                }
            }

            if (data === 'broadcast_confirm' || data === 'broadcast_cancel') {
                if (!users.isAdmin(userId)) return;
                if (data === 'broadcast_cancel') {
                    broadcastPending.delete(userId);
                    await bot.sendMessage(chatId, '❌ Broadcast cancelled.');
                    return;
                }
                const message = broadcastPending.get(userId);
                if (!message) {
                    await bot.sendMessage(chatId, '⚠️ No pending broadcast found.');
                    return;
                }
                let sent = 0, failed = 0;
                for (const user of users.getAllUsers()) {
                    try { await bot.sendMessage(user.id, `📢 <b>Entity Announcement</b>\n\n${formatting.escapeHtml(message)}`, { parse_mode: 'HTML' }); sent++; }
                    catch { failed++; }
                }
                broadcastPending.delete(userId);
                await bot.sendMessage(chatId, `📢 <b>Broadcast complete</b>\n\nSent: ${sent}\nFailed: ${failed}`);
                return;
            }
        } catch (error) {
            console.error('CALLBACK ERROR:', error.message);
            await bot.sendMessage(chatId, '❌ That action could not be completed. Please try again.').catch(() => {});
        }
    });
};
