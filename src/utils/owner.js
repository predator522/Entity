const { ownerIds } = require("../config");

function isOwner(telegramId) {
  return ownerIds.includes(Number(telegramId));
}

module.exports = {
  isOwner
};
