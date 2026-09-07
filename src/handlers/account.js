const {
  getSession,
  setState,
  clearSession
} = require("../services/sessionService");

const {
  createAccount,
  findByLogin,
  findByTelegramId,
  verifyPassword,
  linkTelegram
} = require("../services/userService");

async function handleAccountText(ctx, text) {
  const session = getSession(ctx.from.id);

  if (!session.state) {
    return false;
  }

  if (text === "/cancel") {
    clearSession(ctx.from.id);

    await ctx.reply(
      "❌ Account operation cancelled."
    );

    return true;
  }

  if (session.state === "register_name") {
    if (text.length < 2 || text.length > 80) {
      await ctx.reply(
        "Please send a valid name between 2 and 80 characters."
      );

      return true;
    }

    setState(ctx.from.id, "register_email", {
      name: text
    });

    await ctx.reply(
      "📧 Now send your email address."
    );

    return true;
  }

  if (session.state === "register_email") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      await ctx.reply(
        "That email does not look valid. Send a valid email address."
      );

      return true;
    }

    setState(ctx.from.id, "register_phone", {
      ...session.data,
      email: text.toLowerCase()
    });

    await ctx.reply(
      "📱 Now send your phone number.\n\nInclude the country code, for example +233..."
    );

    return true;
  }

  if (session.state === "register_phone") {
    if (!/^\+?[0-9][0-9\s().-]{6,20}$/.test(text)) {
      await ctx.reply(
        "Please send a valid phone number, preferably with the country code."
      );

      return true;
    }

    setState(ctx.from.id, "register_password", {
      ...session.data,
      phone: text
    });

    await ctx.reply(
      "🔑 Create a password.\n\nUse at least 8 characters."
    );

    return true;
  }

  if (session.state === "register_password") {
    if (text.length < 8) {
      await ctx.reply(
        "Your password must contain at least 8 characters."
      );

      return true;
    }

    try {
      const user = await createAccount({
        ...session.data,
        password: text,
        telegramId: ctx.from.id
      });

      clearSession(ctx.from.id);

      await ctx.reply(
        `✅ ACCOUNT CREATED

Welcome, ${user.name}.

Your Entity memory is now tied to this account.

You can later log in from another Telegram account using your email/phone and password.`
      );
    } catch (error) {
      clearSession(ctx.from.id);

      await ctx.reply(
        `❌ Could not create the account.\n\n${error.message}`
      );
    }

    return true;
  }

  if (session.state === "login_identifier") {
    setState(ctx.from.id, "login_password", {
      identifier: text
    });

    await ctx.reply(
      "🔑 Now send your password."
    );

    return true;
  }

  if (session.state === "login_password") {
    const user = await findByLogin(
      session.data.identifier
    );

    if (!user) {
      clearSession(ctx.from.id);

      await ctx.reply(
        "❌ No Entity account was found with that email or phone number."
      );

      return true;
    }

    const valid = await verifyPassword(
      user,
      text
    );

    if (!valid) {
      clearSession(ctx.from.id);

      await ctx.reply(
        "❌ Incorrect password."
      );

      return true;
    }

    const alreadyLinked =
      await findByTelegramId(ctx.from.id);

    if (
      alreadyLinked &&
      String(alreadyLinked._id) !==
        String(user._id)
    ) {
      clearSession(ctx.from.id);

      await ctx.reply(
        "❌ This Telegram account is already linked to another Entity account. Log out first."
      );

      return true;
    }

    await linkTelegram(
      user._id,
      ctx.from.id
    );

    clearSession(ctx.from.id);

    await ctx.reply(
      `✅ LOGIN SUCCESSFUL

Welcome back, ${user.name}.

Your existing Entity memory is connected to this Telegram account.`
    );

    return true;
  }

  return false;
}

module.exports = {
  handleAccountText
};
