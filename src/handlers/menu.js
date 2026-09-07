const {
  mainMenuKeyboard
} = require("../keyboards/menu");
const {
  findByTelegramId
} = require("../services/userService");
const { isOwner } = require("../utils/owner");

async function menuHandler(ctx) {
  const user = await findByTelegramId(ctx.from.id);

  if (!user) {
    await ctx.reply(
      `⚡ ENTITY 4.5

You have joined the required channels.

Now choose:

📝 Create Account — make a new Entity account.
🔐 Login — access an existing Entity account and its memory.

Your Entity account is separate from your Telegram account.`,
      mainMenuKeyboard({
        owner: isOwner(ctx.from.id)
      })
    );

    return;
  }

  await ctx.reply(
    `⚡ ENTITY 4.5

╭────────────────────╮
│  🐕 THE UNLIMITED AI
│
│  Account: ${user.name}
│  Reasoning: ${user.settings?.reasoningLevel || "standard"}
╰────────────────────╯

Choose an option below.`,
    mainMenuKeyboard({
      owner: isOwner(ctx.from.id)
    })
  );
}

module.exports = menuHandler;
