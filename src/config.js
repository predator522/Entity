require('dotenv').config();

function list(value) {
  return String(value || '').split(',').map(x => x.trim()).filter(Boolean);
}

const config = {
  botToken: process.env.BOT_TOKEN?.trim(),
  groqKey: process.env.GROQ_API_KEY?.trim(),
  groqModel: process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-120b',
  openRouterKey: process.env.OPENROUTER_API_KEY?.trim(),
  openRouterModel: process.env.OPENROUTER_MODEL?.trim() || 'openai/gpt-oss-120b',
  mongoUri: process.env.MONGODB_URI?.trim(),
  mongoDb: process.env.MONGODB_DB?.trim() || 'entity45',
  ownerIds: list(process.env.OWNER_TELEGRAM_IDS).map(Number).filter(Number.isFinite),
  forceJoinChannels: list(process.env.FORCE_JOIN_CHANNELS),
  freeAiRequests: Number(process.env.FREE_AI_REQUESTS || 100),
  freeAiWindowMinutes: Number(process.env.FREE_AI_WINDOW_MINUTES || 120),
  freeImagesPerHour: Number(process.env.FREE_IMAGES_PER_HOUR || 5),
  spamWindowSeconds: Number(process.env.SPAM_WINDOW_SECONDS || 20),
  spamMaxMessages: Number(process.env.SPAM_MAX_MESSAGES || 8),
  spamWarningsToRestrict: Number(process.env.SPAM_WARNINGS_TO_RESTRICT || 3),
  spamRestrictionHours: Number(process.env.SPAM_RESTRICTION_HOURS || 3),
  reminderIntervalHours: Number(process.env.REMINDER_INTERVAL_HOURS || 4),
  reminderScanMinutes: Number(process.env.REMINDER_SCAN_MINUTES || 15)
};

function validateConfig() {
  const missing = [];
  for (const [key, value] of [['BOT_TOKEN', config.botToken], ['MONGODB_URI', config.mongoUri]]) {
    if (!value || value.startsWith('YOUR_')) missing.push(key);
  }
  if (!config.groqKey && !config.openRouterKey) missing.push('GROQ_API_KEY or OPENROUTER_API_KEY');
  if (!config.ownerIds.length) missing.push('OWNER_TELEGRAM_IDS');
  if (missing.length) throw new Error(`Missing configuration: ${missing.join(', ')}`);
}

module.exports = { config, validateConfig };
