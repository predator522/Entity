const bcrypt = require("bcryptjs");
const { users } = require("../db");

async function findByTelegramId(telegramId) {
  return users().findOne({
    telegramIds: Number(telegramId)
  });
}

async function findByLogin(login) {
  const value = String(login || "").trim().toLowerCase();

  return users().findOne({
    $or: [
      { email: value },
      { phone: value }
    ]
  });
}

async function createAccount({
  name,
  email,
  phone,
  password,
  telegramId
}) {
  const cleanName = String(name).trim();
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPhone = String(phone).trim();

  if (!cleanName || !cleanEmail || !cleanPhone || !password) {
    throw new Error("All account fields are required.");
  }

  const existing = await users().findOne({
    $or: [
      { email: cleanEmail },
      { phone: cleanPhone },
      { telegramIds: Number(telegramId) }
    ]
  });

  if (existing) {
    if (existing.email === cleanEmail) {
      throw new Error("An account already exists with that email.");
    }

    if (existing.phone === cleanPhone) {
      throw new Error("An account already exists with that phone number.");
    }

    throw new Error(
      "This Telegram account is already linked to an Entity account."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const now = new Date();

  const user = {
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    passwordHash,
    telegramIds: [Number(telegramId)],
    memory: [],
    settings: {
      reminders: true,
      reasoningLevel: "standard"
    },
    createdAt: now,
    updatedAt: now,
    lastActiveAt: now,
    lastReminderAt: null
  };

  const result = await users().insertOne(user);

  return {
    ...user,
    _id: result.insertedId
  };
}

async function verifyPassword(user, password) {
  if (!user?.passwordHash) return false;

  return bcrypt.compare(
    String(password),
    user.passwordHash
  );
}

async function linkTelegram(userId, telegramId) {
  await users().updateOne(
    { _id: userId },
    {
      $addToSet: {
        telegramIds: Number(telegramId)
      },
      $set: {
        updatedAt: new Date(),
        lastActiveAt: new Date()
      }
    }
  );
}

async function touchUser(userId) {
  await users().updateOne(
    { _id: userId },
    {
      $set: {
        lastActiveAt: new Date(),
        updatedAt: new Date()
      }
    }
  );
}

async function setReminder(userId, date) {
  await users().updateOne(
    { _id: userId },
    {
      $set: {
        lastReminderAt: date,
        updatedAt: new Date()
      }
    }
  );
}

async function updateSettings(userId, settings) {
  const set = {};

  for (const [key, value] of Object.entries(settings)) {
    set[`settings.${key}`] = value;
  }

  set.updatedAt = new Date();

  await users().updateOne(
    { _id: userId },
    { $set: set }
  );
}

async function setReasoningLevel(userId, level) {
  await updateSettings(userId, {
    reasoningLevel: level
  });
}

async function addMemory(userId, memoryItem) {
  const clean = String(memoryItem || "").trim();

  if (!clean) return;

  await users().updateOne(
    { _id: userId },
    {
      $push: {
        memory: {
          text: clean,
          createdAt: new Date()
        }
      },
      $set: {
        updatedAt: new Date()
      }
    }
  );
}

async function getMemory(userId, limit = 30) {
  const user = await users().findOne(
    { _id: userId },
    { projection: { memory: 1 } }
  );

  return (user?.memory || []).slice(-limit);
}

async function findInactiveUsers(cutoff, reminderCutoff) {
  return users()
    .find({
      "settings.reminders": { $ne: false },
      telegramIds: { $exists: true, $ne: [] },
      lastActiveAt: { $lt: cutoff },
      $or: [
        { lastReminderAt: null },
        { lastReminderAt: { $lt: reminderCutoff } }
      ]
    })
    .project({
      _id: 1,
      telegramIds: 1,
      name: 1
    })
    .toArray();
}

module.exports = {
  findByTelegramId,
  findByLogin,
  createAccount,
  verifyPassword,
  linkTelegram,
  touchUser,
  setReminder,
  updateSettings,
  setReasoningLevel,
  addMemory,
  getMemory,
  findInactiveUsers
};
