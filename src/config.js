const dotenv = require("dotenv");

dotenv.config();

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is missing from .env`);
  }

  return value;
}

const ownerIds = (process.env.OWNER_TELEGRAM_IDS || "")
  .split(",")
  .map(value => value.trim())
  .filter(Boolean)
  .map(value => Number(value))
  .filter(Number.isInteger);

module.exports = {
  botToken: required("BOT_TOKEN"),

  groqApiKey: required("GROQ_API_KEY"),
  groqModel:
    process.env.GROQ_MODEL || "openai/gpt-oss-120b",

  openRouterApiKey: required("OPENROUTER_API_KEY"),
  openRouterModel:
    process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b",

  mongoUri: required("MONGODB_URI"),
  mongoDb:
    process.env.MONGODB_DB || "entity45",

  ownerIds,

  reminderIntervalHours: Number(
    process.env.REMINDER_INTERVAL_HOURS || 4
  ),

  reminderScanMinutes: Number(
    process.env.REMINDER_SCAN_MINUTES || 15
  )
};
