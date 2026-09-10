const users = require('../services/users');
const endpointManager = require('../api/endpoints');
const formatting = require('../utils/formatting');

class StatisticsService {
    getFullStats() {
        const stats = users.getStats();
        const endpoints = endpointManager.getAll();

        return {
            users: {
                total: stats.totalUsers,
                active: stats.activeUsers,
                list: users.getAllUsers()
            },
            requests: {
                total: stats.totalRequests,
                today: stats.requestsToday,
                errors: stats.apiErrors
            },
            system: {
                uptime: stats.uptime,
                uptimeFormatted: formatting.formatUptime(stats.uptime / 1000),
                startTime: new Date(stats.startTime).toISOString()
            },
            endpoints: endpoints.map(e => ({
                name: e.name,
                path: e.path,
                enabled: e.enabled,
                isDefault: e.isDefault
            }))
        };
    }

    getHealthStatus() {
        const stats = users.getStats();
        const errorRate = stats.totalRequests > 0 ? (stats.apiErrors / stats.totalRequests) * 100 : 0;

        return {
            healthy: errorRate < 10,
            errorRate: errorRate.toFixed(2) + '%',
            uptime: formatting.formatUptime(stats.uptime / 1000)
        };
    }
}

module.exports = new StatisticsService();
