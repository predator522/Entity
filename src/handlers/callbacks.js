const {
  checkMembership,
  showForceJoin
} = require("../middleware/forceJoin");

const {
  findByTelegramId,
  linkTelegram,
  updateSettings,
  setReasoningLevel
} = require("../services/userService");

const {
  mainMenuKeyboard,
  accountKeyboard,
  settingsKeyboard,
  ownerReasoningKeyboard,
  backKeyboard
} = require("../keyboards/menu");

const {
  getSession,
  setState,
  clearSession
} = require("../services/sessionService");

const { isOwner } = require("../utils/owner");

async function safeEdit(ctx, text, keyboard) {
  try {
    await ctx.editMessageText(text, keyboard);
  } catch (error) {
    if (
      !String(error.message || "")
        .toLowerCase()
        .includes("message is not modified")
    ) {
      throw error;
    }
  }
}

async function callbacks(ctx) {
  const action = ctx.callbackQuery?.data;

  if (!action) return;

  await ctx.answerCbQuery().catch(() => {});

  if (action === "check_join") {
    const joined = await checkMembership(ctx);

    if (!joined) {
      await ctx.reply(
        "❌ You have not joined all three required channels yet.",
        require("../keyboards/menu").joinKeyboard(
          require("../config/channels")
        )
      );

      return;
    }

    await ctx.reply(
      "✅ Membership verified.\n\nOpen /menu to continue."
    );

    return;
  }

  const joined = await checkMembership(ctx);

  if (!joined) {
    await showForceJoin(ctx);
    return;
  }

  if (action === "back_menu") {
    const user = await findByTelegramId(ctx.from.id);

    await safeEdit(
      ctx,
      user
        ? `⚡ ENTITY 4.5\n\nWelcome back, ${user.name}.`
        : `⚡ ENTITY 4.5\n\nCreate an account or login to begin.`,
      mainMenuKeyboard({
        owner: isOwner(ctx.from.id)
      })
    );

    return;
  }

  if (action === "menu_chat") {
    const user = await findByTelegramId(ctx.from.id);

    if (!user) {
      await safeEdit(
        ctx,
        `🔐 ACCOUNT REQUIRED

Create an account or login first.

Your account is what lets Entity 4.5 keep your memory across Telegram accounts.`,
        accountKeyboard()
      );

      return;
    }

    await safeEdit(
      ctx,
      `💬 CHAT MODE

Send me your message now.

🐕 Entity 4.5 is listening.`,
      backKeyboard()
    );

    return;
  }

  if (action === "menu_account") {
    const user = await findByTelegramId(ctx.from.id);

    await safeEdit(
      ctx,
      user
        ? `👤 ENTITY ACCOUNT

Name: ${user.name}
Email: ${user.email}
Phone: ${user.phone}
Reasoning: ${user.settings?.reasoningLevel || "standard"}
Reminders: ${user.settings?.reminders === false ? "OFF" : "ON"}

Your memory belongs to this Entity account.`,
        accountKeyboard()
      );

    return;
  }

  if (action === "account_create") {
    const user = await findByTelegramId(ctx.from.id);

    if (user) {
      await ctx.reply(
        "You are already logged into an Entity account."
      );
      return;
    }

    setState(ctx.from.id, "register_name");

    await ctx.reply(
      "📝 CREATE ENTITY ACCOUNT\n\nSend your name."
    );

    return;
  }

  if (action === "account_login") {
    const user = await findByTelegramId(ctx.from.id);

    if (user) {
      await ctx.reply(
        "You are already logged into an Entity account."
      );
      return;
    }

    setState(ctx.from.id, "login_identifier");

    await ctx.reply(
      "🔐 LOGIN\n\nSend your email address or phone number."
    );

    return;
  }

  if (action === "account_logout") {
    const user = await findByTelegramId(ctx.from.id);

    if (!user) {
      await ctx.reply(
        "You are not logged into an Entity account."
      );
      return;
    }

    const { users } = require("../db");

    await users().updateOne(
      { _id: user._id },
      {
        $pull: {
          telegramIds: Number(ctx.from.id)
        },
        $set: {
          updatedAt: new Date()
        }
      }
    );

    clearSession(ctx.from.id);

    await ctx.reply(
      "🚪 Logged out.\n\nYour Entity account and memory are safe. You can log back in anytime."
    );

    return;
  }

  if (action === "menu_memory") {
    const user = await findByTelegramId(ctx.from.id);

    if (!user) {
      await ctx.reply(
        "🔐 Create an account or login first."
      );
      return;
    }

    const memory = user.memory || [];

    const text = memory.length
      ? `🧠 MEMORY\n\n${memory
          .slice(-20)
          .map(
            (item, index) =>
              `${index + 1}. ${item.text}`
          )
          .join("\n")}`
      : "🧠 MEMORY\n\nEntity 4.5 has not stored any long-term memory for your account yet.";

    await safeEdit(
      ctx,
      text,
      backKeyboard()
    );

    return;
  }

  if (action === "menu_settings") {
    const user = await findByTelegramId(ctx.from.id);

    if (!user) {
      await ctx.reply(
        "🔐 Create an account or login first."
      );
      return;
    }

    await safeEdit(
      ctx,
      `⚙️ SETTINGS\n\nReminder messages are currently ${
        user.settings?.reminders === false
          ? "OFF"
          : "ON"
      }.`,
      settingsKeyboard({
        reminders:
          user.settings?.reminders !== false
      })
    );

    return;
  }

  if (action === "settings_reminders") {
    const user = await findByTelegramId(ctx.from.id);

    if (!user) {
      await ctx.reply(
        "🔐 Create an account or login first."
      );
      return;
    }

    const enabled =
      user.settings?.reminders === false;

    await updateSettings(user._id, {
      reminders: enabled
    });

    await safeEdit(
      ctx,
      `⚙️ SETTINGS\n\nReminder messages are now ${
        enabled ? "ON" : "OFF"
      }.`,
      settingsKeyboard({
        reminders: enabled
      })
    );

    return;
  }

  if (action === "menu_about") {
    const user = await findByTelegramId(ctx.from.id);

    await safeEdit(
      ctx,
      `👤 ABOUT YOU

Telegram ID: ${ctx.from.id}
Username: ${ctx.from.username ? "@" + ctx.from.username : "Not set"}
Telegram Premium: ${ctx.from.is_premium === true ? "YES" : "NO"}

Entity Account: ${
        user ? "CONNECTED" : "NOT CONNECTED"
      }`,
      backKeyboard()
    );

    return;
  }

  if (action === "menu_owners") {
    await safeEdit(
      ctx,
      `👑 ENTITY 4.5

Creators/Owners

Escanor
Metro

The minds behind the dog without limits.`,
      backKeyboard()
    );

    return;
  }

  if (action === "owner_reasoning") {
    if (!isOwner(ctx.from.id)) {
      await ctx.reply("❌ Owner controls only.");
      return;
    }

    await safeEdit(
      ctx,
      `🧠 UPGRADE AI REASONING

Choose the reasoning level for your Entity account.

Standard — faster everyday responses.
Deep — more deliberate reasoning and stronger problem solving.

🔒 This control is owner-only.`,
      ownerReasoningKeyboard()
    );

    return;
  }

  if (
    action === "reasoning_standard" ||
    action === "reasoning_deep"
  ) {
    if (!isOwner(ctx.from.id)) {
      await ctx.reply("❌ Owner controls only.");
      return;
    }

    const user = await findByTelegramId(ctx.from.id);

    if (!user) {
      await ctx.reply(
        "Create or login to an Entity account first."
      );
      return;
    }

    const level =
      action === "reasoning_deep"
        ? "deep"
        : "standard";

    await setReasoningLevel(
      user._id,
      level
    );

    await safeEdit(
      ctx,
      `🧠 AI REASONING UPDATED

Current level: ${level.toUpperCase()}

Entity 4.5 will use this setting for your account.`,
      backKeyboard()
    );

    return;
  }

  if (action === "owner_phase3") {
    if (!isOwner(ctx.from.id)) {
      await ctx.reply("❌ Owner controls only.");
      return;
    }

    await safeEdit(
      ctx,
      `🚀 ENTITY 4.5 — PHASE 3

✓ MongoDB accounts
✓ Persistent account memory
✓ Login across Telegram accounts
✓ Groq primary AI
✓ OpenRouter fallback
✓ Dedicated MagicStudio image engine
✓ Inactivity reminders
✓ Owner reasoning controls

Phase 3 is live.`,
      backKeyboard()
    );

    return;
  }
}

module.exports = callbacks;
