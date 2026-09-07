const {
  reminderIntervalHours,
  reminderScanMinutes
} = require("./config");

const {
  findInactiveUsers,
  setReminder
} = require("./services/userService");

function startReminderWorker(bot) {
  const scan = async () => {
    try {
      const now = new Date();

      const inactiveCutoff = new Date(
        now.getTime() -
          reminderIntervalHours * 60 * 60 * 1000
      );

      const reminderCutoff = new Date(
        now.getTime() -
          reminderIntervalHours * 60 * 60 * 1000
      );

      const users = await findInactiveUsers(
        inactiveCutoff,
        reminderCutoff
      );

      for (const user of users) {
        const telegramIds =
          user.telegramIds || [];

        for (const telegramId of telegramIds) {
          try {
            await bot.telegram.sendMessage(
              telegramId,
              `🐕 Hey ${user.name || "there"}.

I'm still here waiting for you.

Entity 4.5 is ready whenever you are. ⚡`
            );
          } catch (error) {
            console.error(
              `Reminder failed for ${telegramId}:`,
              error.message
            );
          }
        }

        await setReminder(
          user._id,
          now
        );
      }
    } catch (error) {
      console.error(
        "Reminder worker error:",
        error
      );
    }
  };

  const interval = setInterval(
    scan,
    Math.max(
      1,
      reminderScanMinutes
    ) * 60 * 1000
  );

  scan();

  return () => clearInterval(interval);
}

module.exports = {
  startReminderWorker
};
