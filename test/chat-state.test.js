import test from "node:test";
import assert from "node:assert/strict";
import { createChatState, chatReducer } from "../src/chat-state.js";

test("tracks streaming request and assembles assistant chunks", () => {
  let state = createChatState({ conversationId: "conv-1" });
  state = chatReducer(state, { type: "message-added", message: { id: "u1", role: "user", text: "Hello" } });
  state = chatReducer(state, { type: "request-started", requestId: "req-1" });
  state = chatReducer(state, { type: "stream-chunk", requestId: "req-1", messageId: "a1", text: "Hel" });
  state = chatReducer(state, { type: "stream-chunk", requestId: "req-1", messageId: "a1", text: "lo" });
  assert.equal(state.messages[1].text, "Hello");
  assert.equal(state.status, "streaming");
  state = chatReducer(state, { type: "request-finished", requestId: "req-1" });
  assert.equal(state.status, "idle");
});

test("ignores stale chunks and duplicate message ids", () => {
  let state = chatReducer(createChatState(), { type: "request-started", requestId: "r2" });
  assert.equal(chatReducer(state, { type: "stream-chunk", requestId: "r1", messageId: "a1", text: "stale" }), state);
  state = chatReducer(state, { type: "message-added", message: { id: "m1", role: "user", text: "one" } });
  assert.equal(chatReducer(state, { type: "message-added", message: { id: "m1", role: "user", text: "two" } }), state);
});

test("normalizes errors and cancels only the active request", () => {
  let state = chatReducer(createChatState(), { type: "request-started", requestId: "r1" });
  assert.equal(chatReducer(state, { type: "request-cancelled", requestId: "old" }), state);
  state = chatReducer(state, { type: "request-failed", requestId: "r1", message: "Bad\nrequest" });
  assert.equal(state.error, "Bad request");
  assert.equal(state.status, "error");
});

test("rejects malformed messages and invalid actions", () => {
  assert.throws(() => chatReducer(createChatState(), { type: "message-added", message: { id: "m1", role: "system", text: "x" } }), /message is invalid/);
  assert.throws(() => chatReducer(createChatState(), { type: "unknown" }), /unknown chat action/);
});


test("bounds streamed message count and rejects message id collisions", () => {
  let state = createChatState();
  state = chatReducer(state, { type: "message-added", message: { id: "same", role: "user", text: "x" } });
  state = chatReducer(state, { type: "request-started", requestId: "r1" });
  assert.throws(() => chatReducer(state, { type: "stream-chunk", requestId: "r1", messageId: "same", text: "response" }), /conflicts/);

  let full = createChatState();
  for (let i = 0; i < 500; i++) {
    full = chatReducer(full, { type: "message-added", message: { id: "m" + i, role: "user", text: "x" } });
  }
  full = chatReducer(full, { type: "request-started", requestId: "r2" });
  assert.throws(() => chatReducer(full, { type: "stream-chunk", requestId: "r2", messageId: "assistant-final", text: "x" }), /limit reached/);
});
