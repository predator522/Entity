const channels = require("../config/channels");
const {
  joinKeyboard,
  mainMenuKeyboard
} = require("../keyboards/menu");
const {
  checkMembership
} = require("../middleware/forceJoin");
const {
  findByTelegramId
} = require("../services/userService");
const { isOwner } = require("../utils/owner");

async function startHandler(ctx) {
  const joined = await checkMembership(ctx);

  if (!joined) {
    await ctx.reply(
      `Welcome to the illustrious realm of Entity 4.5 metros, where they have unveiled their most recent and undoubtedly spectacular invention:

🐕 A dog without limits.

Before you enter, you must join all three required channels.

👇 Join all three channels below, then verify your membership.`,
      joinKeyboard(channels)
    );

    return;
  }

  const user = await findByTelegramId(ctx.from.id);

  if (!user) {
    await ctx.reply(
      `🐕 Welcome to Entity 4.5.

The dog without limits is ready.

Before you start chatting, create an Entity account or log into an existing one.

Your account keeps your memory with Entity 4.5 even if you use another Telegram account.`,
      mainMenuKeyboard({
        owner: isOwner(ctx.from.id)
      })
    );

    return;
  }

  await ctx.reply(
    `🐕 Welcome back, ${user.name}.

Entity 4.5 is ready.

⚡ Access granted.`,
    mainMenuKeyboard({
      owner: isOwner(ctx.from.id)
    })
  );
}

module.exports = startHandler;
