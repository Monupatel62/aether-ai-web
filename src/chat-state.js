const MAX_MESSAGES = 500;
const MAX_TEXT_CHARS = 100_000;
const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export function createChatState({ conversationId = null } = {}) {
  if (conversationId !== null && !ID.test(conversationId)) throw new TypeError("conversationId is invalid");
  return Object.freeze({ conversationId, messages: Object.freeze([]), status: "idle", activeRequestId: null, error: null });
}

export function chatReducer(state, action) {
  if (!state || !Array.isArray(state.messages) || !action || typeof action.type !== "string") throw new TypeError("valid state and action are required");
  switch (action.type) {
    case "request-started": {
      if (!ID.test(action.requestId ?? "")) throw new TypeError("requestId is invalid");
      return freeze({ ...state, status: "streaming", activeRequestId: action.requestId, error: null });
    }
    case "message-added": {
      const m = action.message;
      if (!m || !ID.test(m.id ?? "") || !["user", "assistant"].includes(m.role) || typeof m.text !== "string" || m.text.length > MAX_TEXT_CHARS) throw new TypeError("message is invalid");
      if (state.messages.some((item) => item.id === m.id)) return state;
      if (state.messages.length >= MAX_MESSAGES) throw new RangeError("conversation message limit reached");
      return freeze({ ...state, messages: [...state.messages, { id: m.id, role: m.role, text: m.text }] });
    }
    case "stream-chunk": {
      if (state.status !== "streaming" || action.requestId !== state.activeRequestId) return state;
      if (typeof action.text !== "string" || action.text.length > MAX_TEXT_CHARS) throw new TypeError("stream chunk is invalid");
      const messages = [...state.messages];
      const last = messages[messages.length - 1];
      if (last?.role === "assistant" && last.id === action.messageId) {
        if (last.text.length + action.text.length > MAX_TEXT_CHARS) throw new RangeError("assistant response limit reached");
        messages[messages.length - 1] = { ...last, text: last.text + action.text };
      } else {
        if (!ID.test(action.messageId ?? "")) throw new TypeError("messageId is invalid");
        if (messages.some((message) => message.id === action.messageId)) throw new TypeError("assistant message id conflicts with existing message");
        if (messages.length >= MAX_MESSAGES) throw new RangeError("conversation message limit reached");
        messages.push({ id: action.messageId, role: "assistant", text: action.text });
      }
      return freeze({ ...state, messages });
    }
    case "request-finished":
      if (action.requestId !== state.activeRequestId) return state;
      return freeze({ ...state, status: "idle", activeRequestId: null });
    case "request-failed":
      if (action.requestId !== state.activeRequestId) return state;
      return freeze({ ...state, status: "error", activeRequestId: null, error: safeErrorMessage(action.message) });
    case "request-cancelled":
      if (action.requestId !== state.activeRequestId) return state;
      return freeze({ ...state, status: "idle", activeRequestId: null, error: null });
    case "reset":
      return createChatState({ conversationId: state.conversationId });
    default:
      throw new TypeError("unknown chat action");
  }
}

function safeErrorMessage(message) {
  if (typeof message !== "string" || !message.trim()) return "Something went wrong. Please try again.";
  const normalized = message.replace(/[\r\n\t]+/g, " ").trim();
  return normalized.length > 240 ? normalized.slice(0, 237) + "..." : normalized;
}
function freeze(state) {
  return Object.freeze({ ...state, messages: Object.freeze(state.messages.map((message) => Object.freeze({ ...message }))) });
}
