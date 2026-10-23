import test from "node:test";
import assert from "node:assert/strict";
import { createChatController } from "../src/chat-controller.js";

function controller(client, overrides = {}) {
  let sequence = 0;
  return createChatController({ client, model: "model-a", createId: () => "id-" + (++sequence), ...overrides });
}

test("submits authenticated chat through injected client and records assistant reply", async () => {
  let request;
  const updates = [];
  const chat = controller({ createChatCompletion: async (input, options) => {
    request = { input, options };
    return { choices: [{ message: { content: "Hello back" } }] };
  } }, { onStateChange: (state) => updates.push(state.status) });
  const state = await chat.submit(" Hello ");
  assert.equal(request.input.model, "model-a");
  assert.deepEqual(request.input.messages, [{ role: "user", content: "Hello" }]);
  assert.ok(request.options.signal instanceof AbortSignal);
  assert.equal(state.messages[1].text, "Hello back");
  assert.equal(state.status, "idle");
  assert.ok(updates.includes("streaming"));
});

test("rejects blank prompts and concurrent submissions", async () => {
  const chat = controller({ createChatCompletion: (_input, { signal }) => new Promise((_, reject) => signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true })) });
  await assert.rejects(chat.submit("  "), TypeError);
  const pending = chat.submit("hello");
  await assert.rejects(chat.submit("second"), /already active/);
  chat.cancel();
  await pending;
  assert.equal(chat.getState().status, "idle");
});

test("normalizes API failures and resets conversation state", async () => {
  const chat = controller({ createChatCompletion: async () => { throw new Error("private\nprovider detail"); } });
  const failed = await chat.submit("hello");
  assert.equal(failed.status, "error");
  assert.equal(failed.error, "private provider detail");
  const reset = chat.reset();
  assert.equal(reset.messages.length, 0);
  assert.equal(reset.status, "idle");
});

test("rejects malformed assistant response without leaking raw data", async () => {
  const chat = controller({ createChatCompletion: async () => ({ choices: [] }) });
  const state = await chat.submit("hello");
  assert.equal(state.status, "error");
  assert.equal(state.error, "Invalid assistant response");
});
