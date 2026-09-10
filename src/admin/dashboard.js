const keyboards = require('../bot/keyboards');
const users = require('../services/users');
const endpointManager = require('../api/endpoints');
const formatting = require('../utils/formatting');

class AdminDashboard {
    constructor(bot) {
        this.bot = bot;
    }

    async showDashboard(chatId) {
        const stats = users.getStats();

        const dashboardText = `🐕 ENTITY 4.5 — ADMIN

◈ System
Bot: ONLINE
AI API: ONLINE
Mode: ACTIVE

⌘ Statistics
Users: ${formatting.formatNumber(stats.totalUsers)}
Active: ${formatting.formatNumber(stats.activeUsers)}
Requests: ${formatting.formatNumber(stats.totalRequests)}
Today: ${formatting.formatNumber(stats.requestsToday)}
Errors: ${formatting.formatNumber(stats.apiErrors)}
Uptime: ${formatting.formatUptime(stats.uptime / 1000)}`;

        await this.bot.sendMessage(chatId, dashboardText, {
            parse_mode: 'Markdown',
            reply_markup: keyboards.adminMenu()
        });
    }

    async showEndpoints(chatId) {
        const endpoints = endpointManager.getAll();

        let endpointsText = '⌬ Endpoint Manager\n\n';
        endpoints.forEach(e => {
            const status = e.enabled ? '◉ ENABLED' : '○ DISABLED';
            endpointsText += `${status} — ${e.name}
`;
        });

        await this.bot.sendMessage(chatId, endpointsText, {
            parse_mode: 'Markdown',
            reply_markup: keyboards.adminEndpointsMenu(endpoints)
        });
    }

    async showStatistics(chatId) {
        const stats = users.getStats();
        const endpoint = endpointManager.getDefault();

        const statsText = `◈ Statistics

Total Users: ${formatting.formatNumber(stats.totalUsers)}
Active Users (24h): ${formatting.formatNumber(stats.activeUsers)}
Total Requests: ${formatting.formatNumber(stats.totalRequests)}
Requests Today: ${formatting.formatNumber(stats.requestsToday)}
API Errors: ${formatting.formatNumber(stats.apiErrors)}
Uptime: ${formatting.formatUptime(stats.uptime / 1000)}
Default Endpoint: ${endpoint.name}`;

        await this.bot.sendMessage(chatId, statsText, { parse_mode: 'Markdown' });
    }

    async broadcast(chatId, message) {
        const allUsers = users.getAllUsers();
        let sent = 0;
        let failed = 0;

        for (const user of allUsers) {
            try {
                await this.bot.sendMessage(user.id, `📢 Announcement

${message}`, { parse_mode: 'Markdown' });
                sent++;
            } catch (err) {
                failed++;
            }
        }

        await this.bot.sendMessage(chatId, `📢 Broadcast complete

Sent: ${sent}
Failed: ${failed}
Total: ${allUsers.length}`, { parse_mode: 'Markdown' });
    }
}

module.exports = AdminDashboard;
