#!/usr/bin/env node

// 🐕 ENTITY 4.5 — The dog without limits for Telegram
// Version: 1.0.0

const { createBot } = require('./src/bot/bot');
const config = require('./src/config');

// Command modules
const startCommand = require('./src/commands/start');
const helpCommand = require('./src/commands/help');
const aboutCommand = require('./src/commands/about');
const statusCommand = require('./src/commands/status');
const settingsCommand = require('./src/commands/settings');
const aiCommand = require('./src/commands/ai');
const devmodeCommand = require('./src/commands/devmode');
const adminCommand = require('./src/commands/admin');
const ownersCommand = require('./src/commands/owners');

// Handlers
const messageHandler = require('./src/handlers/messages');
const callbackHandler = require('./src/handlers/callbacks');

// Features
const aiFeature = require('./src/features/ai');
const developerFeature = require('./src/features/developer');
const endpointsFeature = require('./src/features/endpoints');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🐕 ENTITY 4.5');
console.log('✦ The dog without limits');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('⚡ Initializing...');

const bot = createBot();

// Register commands
console.log('⌘ Registering commands...');
startCommand(bot);
helpCommand(bot);
aboutCommand(bot);
statusCommand(bot);
settingsCommand(bot);
aiCommand(bot);
devmodeCommand(bot);
adminCommand(bot);
ownersCommand(bot);

// Register handlers
console.log('⌘ Registering handlers...');
messageHandler(bot);
callbackHandler(bot);

// Register features
console.log('⌘ Registering features...');
aiFeature.register(bot);
developerFeature.register(bot);
endpointsFeature.register(bot);

console.log('');
console.log('✦ Bot is running!');
console.log(`◈ Name: ${config.bot.name}`);
console.log(`◈ Mode: ${config.maintenance.enabled ? 'MAINTENANCE' : 'ACTIVE'}`);
console.log(`◈ Default Endpoint: ${config.api.defaultEndpoint}`);
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('');
    console.log('◇ Shutting down Entity 4.5...');
    bot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('');
    console.log('◇ Shutting down Entity 4.5...');
    bot.stopPolling();
    process.exit(0);
});
