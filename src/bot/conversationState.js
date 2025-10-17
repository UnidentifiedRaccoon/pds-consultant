const conversations = new Map();

export function getConversation(chatId) {
  return conversations.get(chatId);
}

export function setConversation(chatId, state) {
  conversations.set(chatId, state);
  return state;
}

export function updateConversation(chatId, patch) {
  const current = conversations.get(chatId) || {};
  const nextData = {
    ...(current.data || {}),
    ...(patch.data || {}),
  };
  const nextState = {
    ...current,
    ...patch,
    data: Object.keys(nextData).length ? nextData : current.data,
  };
  conversations.set(chatId, nextState);
  return nextState;
}

export function clearConversation(chatId) {
  conversations.delete(chatId);
}

export function resetConversation(chatId, initialState = {}) {
  const state = { ...initialState };
  conversations.set(chatId, state);
  return state;
}
