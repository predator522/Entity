const config = require('../config');

class RateLimitService {
    constructor() {
        this.requests = new Map();
        this.maxRequests = config.rateLimit.maxRequestsPerMinute;
        this.windowMs = 60000; // 1 minute
    }

    isAllowed(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];

        // Filter requests within the time window
        const recentRequests = userRequests.filter(time => now - time < this.windowMs);

        if (recentRequests.length >= this.maxRequests) {
            return false;
        }

        recentRequests.push(now);
        this.requests.set(userId, recentRequests);
        return true;
    }

    getRemaining(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];
        const recentRequests = userRequests.filter(time => now - time < this.windowMs);
        return Math.max(0, this.maxRequests - recentRequests.length);
    }

    getResetTime(userId) {
        const userRequests = this.requests.get(userId) || [];
        if (userRequests.length === 0) return 0;
        const oldestRequest = Math.min(...userRequests);
        return Math.max(0, oldestRequest + this.windowMs - Date.now());
    }

    reset(userId) {
        this.requests.delete(userId);
    }

    resetAll() {
        this.requests.clear();
    }
}

module.exports = new RateLimitService();
