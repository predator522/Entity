require('dotenv').config();

function list(value) {
    return String(value || '').split(',').map(v => v.trim()).filter(Boolean);
}

const config = {
    bot: {
        token: process.env.TELEGRAM_BOT_TOKEN?.trim(),
        name: 'Entity 4.5',
        tagline: 'the dog without limits'
    },
    owners: {
        ids: list(process.env.OWNER_IDS),
        usernames: ['@Lion_sin_aboveall', '@W0rm_h0le']
    },
    admin: {
        ids: list(process.env.ADMIN_IDS)
    },
    forceJoin: {
        channels: list(process.env.FORCE_JOIN_CHANNELS)
    },
    api: {
        baseUrl: (process.env.API_BASE_URL || 'https://api-rebix.zone.id/api/').replace(/\/+$/, '') + '/',
        defaultEndpoint: process.env.DEFAULT_ENDPOINT || 'deepseek-v3'
    },
    rateLimit: {
        maxRequestsPerMinute: Number(process.env.MAX_REQUESTS_PER_MINUTE || 10)
    },
    maintenance: {
        enabled: process.env.MAINTENANCE_MODE === 'true'
    }
};

function isOwner(userId) {
    return config.owners.ids.includes(String(userId));
}

function isAdmin(userId) {
    return isOwner(userId) || config.admin.ids.includes(String(userId));
}

module.exports = config;
module.exports.isOwner = isOwner;
module.exports.isAdmin = isAdmin;
