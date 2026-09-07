const channels = require("../config/channels");
const { joinKeyboard } = require("../keyboards/menu");

async function checkMembership(ctx) {
  const userId = ctx.from?.id;

  if (!userId) return false;

  for (const channel of channels) {
    try {
      const member = await ctx.telegram.getChatMember(
        channel.username,
        userId
      );

      const allowedStatuses = [
        "creator",
        "administrator",
        "member"
      ];

      if (!allowedStatuses.includes(member.status)) {
        return false;
      }
    } catch (error) {
      console.error(
        `Failed checking ${channel.username}:`,
        error.message
      );

      return false;
    }
  }

  return true;
}

async function showForceJoin(ctx) {
  await ctx.reply(
    `🔒 ACCESS RESTRICTED

Before entering Entity 4.5, you must join all three required channels.

Join them below, then press the button to verify your membership.

⚡ All three channels are required.`,
    joinKeyboard(channels)
  );
}

function forceJoin(handler) {
  return async ctx => {
    const joined = await checkMembership(ctx);

    if (!joined) {
      await showForceJoin(ctx);
      return;
    }

    return handler(ctx);
  };
}

module.exports = {
  checkMembership,
  showForceJoin,
  forceJoin
};
