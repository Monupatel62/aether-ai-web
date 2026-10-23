import { createChatState, chatReducer } from "./chat-state.js";

const MAX_PROMPT_CHARS = 100_000;
function safeMessage(error) {
  // Do not reflect arbitrary provider/network messages into the browser: they may contain
  // upstream URLs, request details, identifiers, or credentials.
  const code = typeof error?.code === "string" ? error.code : "";
  const known = {
    rate_limit_error: "The service is busy. Please try again shortly.",
    authentication_error: "Your session could not be verified. Please sign in again.",
    timeout_error: "The request timed out. Please try again.",
    request_aborted: "The request was cancelled.",
    network_error: "The service could not be reached. Please try again.",
  };
  if (known[code]) return known[code];
  const raw = typeof error?.message === "string" ? error.message : "";
  if (raw === "Invalid assistant response" ||
      raw === "Message must be non-empty and within the character limit") return raw;
  return "Unable to complete the request. Please try again.";
}

/**
 * Browser-facing controller. API client, model selection, and ID generation are injected
 * so the UI does not own credentials or assume a particular framework.
 */
export function createChatController({ client, model, createId, onStateChange = () => {} } = {}) {
  if (!client || typeof client.createChatCompletion !== "function") throw new TypeError("An authenticated API client is required");
  if (typeof model !== "string" || !model.trim() || model.length > 200) throw new TypeError("A valid model is required");
  if (typeof createId !== "function" || typeof onStateChange !== "function") throw new TypeError("ID generator and state callback are required");
  let state = createChatState();
  let activeController = null;
  let activeRequestId = null;

  function publish(next) {
    state = next;
    try { onStateChange(state); } catch { /* presentation callbacks must not change request results */ }
    return state;
  }
  function dispatch(action) { return publish(chatReducer(state, action)); }

  return Object.freeze({
    getState() { return state; },
    async submit(text) {
      if (state.status === "streaming") throw new Error("A request is already active");
      if (typeof text !== "string" || !text.trim() || text.length > MAX_PROMPT_CHARS) throw new TypeError("Message must be non-empty and within the character limit");
      const requestId = createId();
      const userMessageId = createId();
      if (typeof requestId !== "string" || !requestId || typeof userMessageId !== "string" || !userMessageId) throw new TypeError("ID generator returned an invalid ID");
      const controller = new AbortController();
      activeController = controller;
      activeRequestId = requestId;
      dispatch({ type: "message-added", message: { id: userMessageId, role: "user", text: text.trim() } });
      dispatch({ type: "request-started", requestId });
      const messages = state.messages.map(({ role, text: content }) => ({ role, content }));
      try {
        const aborted = new Promise((_, reject) => controller.signal.addEventListener("abort", () => {
          const error = new Error("Request cancelled"); error.code = "request_aborted"; reject(error);
        }, { once: true }));
        const response = await Promise.race([
          Promise.resolve().then(() => client.createChatCompletion({ model, messages }, { signal: controller.signal })),
          aborted,
        ]);
        if (activeRequestId !== requestId || controller.signal.aborted) return state;
        const answer = response?.choices?.[0]?.message?.content;
        if (typeof answer !== "string" || answer.length > MAX_PROMPT_CHARS) throw new Error("Invalid assistant response");
        dispatch({ type: "message-added", message: { id: createId(), role: "assistant", text: answer } });
        dispatch({ type: "request-finished", requestId });
        return state;
      } catch (error) {
        if (activeRequestId !== requestId) return state;
        if (controller.signal.aborted || error?.code === "request_aborted") {
          dispatch({ type: "request-cancelled", requestId });
        } else {
          dispatch({ type: "request-failed", requestId, message: safeMessage(error) });
        }
        return state;
      } finally {
        if (activeRequestId === requestId) {
          activeController = null;
          activeRequestId = null;
        }
      }
    },
    cancel() {
      if (!activeController || !activeRequestId) return state;
      const requestId = activeRequestId;
      activeController.abort();
      activeController = null;
      activeRequestId = null;
      return dispatch({ type: "request-cancelled", requestId });
    },
    reset() {
      if (activeController) activeController.abort();
      activeController = null;
      activeRequestId = null;
      return publish(chatReducer(state, { type: "reset" }));
    },
  });
}
