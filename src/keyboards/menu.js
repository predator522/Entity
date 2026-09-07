const { Markup } = require("telegraf");

function joinKeyboard(channels) {
  const buttons = channels.map(channel =>
    Markup.button.url(
      `📢 ${channel.title}`,
      channel.url
    )
  );

  return Markup.inlineKeyboard([
    ...buttons.map(button => [button]),
    [
      Markup.button.callback(
        "✅ I've Joined — Check",
        "check_join"
      )
    ]
  ]);
}

function mainMenuKeyboard({ owner = false } = {}) {
  const rows = [
    [
      Markup.button.callback("💬 Chat", "menu_chat"),
      Markup.button.callback("🧠 Memory", "menu_memory")
    ],
    [
      Markup.button.callback("👤 Account", "menu_account"),
      Markup.button.callback("⚙️ Settings", "menu_settings")
    ],
    [
      Markup.button.callback("👤 About", "menu_about"),
      Markup.button.callback("👑 Owners", "menu_owners")
    ]
  ];

  if (owner) {
    rows.push([
      Markup.button.callback(
        "🧠 Upgrade AI Reasoning",
        "owner_reasoning"
      )
    ]);

    rows.push([
      Markup.button.callback(
        "🚀 Phase 3 Control",
        "owner_phase3"
      )
    ]);
  }

  return Markup.inlineKeyboard(rows);
}

function accountKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        "📝 Create Account",
        "account_create"
      ),
      Markup.button.callback(
        "🔐 Login",
        "account_login"
      )
    ],
    [
      Markup.button.callback(
        "🚪 Logout",
        "account_logout"
      )
    ],
    [
      Markup.button.callback(
        "⬅️ Back to Menu",
        "back_menu"
      )
    ]
  ]);
}

function settingsKeyboard({ reminders = true } = {}) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        reminders
          ? "🔔 Reminders: ON"
          : "🔕 Reminders: OFF",
        "settings_reminders"
      )
    ],
    [
      Markup.button.callback(
        "⬅️ Back to Menu",
        "back_menu"
      )
    ]
  ]);
}

function ownerReasoningKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        "⚡ Standard",
        "reasoning_standard"
      ),
      Markup.button.callback(
        "🧠 Deep",
        "reasoning_deep"
      )
    ],
    [
      Markup.button.callback(
        "⬅️ Back to Menu",
        "back_menu"
      )
    ]
  ]);
}

function backKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        "⬅️ Back to Menu",
        "back_menu"
      )
    ]
  ]);
}

module.exports = {
  joinKeyboard,
  mainMenuKeyboard,
  accountKeyboard,
  settingsKeyboard,
  ownerReasoningKeyboard,
  backKeyboard
};
