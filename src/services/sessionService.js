const sessions = new Map();

function getSession(telegramId) {
  const id = Number(telegramId);

  if (!sessions.has(id)) {
    sessions.set(id, {
      state: null,
      data: {}
    });
  }

  return sessions.get(id);
}

function setState(telegramId, state, data = {}) {
  const session = getSession(telegramId);

  session.state = state;
  session.data = data;
}

function clearSession(telegramId) {
  sessions.delete(Number(telegramId));
}

module.exports = {
  getSession,
  setState,
  clearSession
};
