const config = require('../config');

class UserService {
    constructor() {
        this.users = new Map();
        this.stats = { totalUsers: 0, totalRequests: 0, requestsToday: 0, apiErrors: 0, startTime: Date.now() };
        this.lastDay = new Date().toDateString();
    }

    registerUser(userId, userInfo = {}) {
        if (!this.users.has(userId)) {
            this.users.set(userId, {
                id: userId,
                username: userInfo.username || null,
                firstName: userInfo.first_name || null,
                lastName: userInfo.last_name || null,
                joinedAt: Date.now(),
                requestCount: 0,
                lastActivity: Date.now(),
                settings: { endpoint: null, developerMode: false, responseStyle: 'balanced' }
            });
            this.stats.totalUsers++;
        } else {
            const user = this.users.get(userId);
            user.username = userInfo.username || user.username;
            user.firstName = userInfo.first_name || user.firstName;
            user.lastName = userInfo.last_name || user.lastName;
        }
        return this.users.get(userId);
    }

    getUser(userId) { return this.users.get(userId); }

    updateActivity(userId) {
        const user = this.users.get(userId) || this.registerUser(userId);
        user.lastActivity = Date.now();
        user.requestCount++;
        this.checkDayReset();
        this.stats.totalRequests++;
        this.stats.requestsToday++;
    }

    checkDayReset() {
        const today = new Date().toDateString();
        if (today !== this.lastDay) {
            this.stats.requestsToday = 0;
            this.lastDay = today;
        }
    }

    getStats() {
        this.checkDayReset();
        const activeUsers = [...this.users.values()].filter(u => Date.now() - u.lastActivity < 86400000).length;
        return { ...this.stats, activeUsers, uptime: Date.now() - this.stats.startTime };
    }

    incrementApiErrors() { this.stats.apiErrors++; }
    getAllUsers() { return [...this.users.values()]; }
    getActiveUsers() { return this.getAllUsers().filter(u => Date.now() - u.lastActivity < 86400000); }

    updateSettings(userId, settings) {
        const user = this.users.get(userId) || this.registerUser(userId);
        user.settings = { ...user.settings, ...settings };
    }

    getSettings(userId) {
        const user = this.users.get(userId);
        return user ? user.settings : { endpoint: null, developerMode: false, responseStyle: 'balanced' };
    }

    isOwner(userId) { return config.isOwner(userId); }
    isAdmin(userId) { return config.isAdmin(userId); }
}

module.exports = new UserService();
