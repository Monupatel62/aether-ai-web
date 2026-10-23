import test from "node:test";
import assert from "node:assert/strict";
import { mountChatWidget } from "../src/chat-widget.js";

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName;
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.textContent = "";
    this.value = "";
    this.hidden = false;
    this.disabled = false;
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = [...nodes]; }
  addEventListener(type, callback) { this.listeners[type] = callback; }
  async dispatch(type) { return this.listeners[type]?.({ preventDefault() {} }); }
}
function fixture(client) {
  const document = { createElement: (tag) => new FakeElement(tag, document) };
  const root = new FakeElement("root", document);
  let n = 0;
  const widget = mountChatWidget(root, { client, model: "model-a", createId: () => "id-" + (++n) });
  const find = (tag, node = root) => node.tagName === tag ? node : node.children.map((child) => find(tag, child)).find(Boolean);
  const findText = (text, node = root) => node.textContent === text ? node : node.children.map((child) => findText(text, child)).find(Boolean);
  return { root, widget, find, findText };
}

test("renders accessible conversation and uses text content for assistant output", async () => {
  const { root, widget, find, findText } = fixture({ createChatCompletion: async () => ({ choices: [{ message: { content: "<img src=x onerror=alert(1)>" } }] }) });
  const region = root.children[0];
  assert.equal(region.attributes.role, "region");
  assert.equal(find("ol").attributes["aria-live"], "polite");
  find("textarea").value = "hello";
  await find("form").dispatch("submit");
  assert.equal(widget.controller.getState().messages[1].text, "<img src=x onerror=alert(1)>");
  assert.equal(findText("<img src=x onerror=alert(1)>").textContent, "<img src=x onerror=alert(1)>");
  assert.equal("innerHTML" in find("span"), false);
});

test("cancel button settles a request even when client ignores cancellation", async () => {
  const { widget, find, findText } = fixture({ createChatCompletion: () => new Promise(() => {}) });
  find("textarea").value = "hello";
  const pending = find("form").dispatch("submit");
  await Promise.resolve();
  const cancel = findText("Cancel response");
  await cancel.dispatch("click");
  await pending;
  assert.equal(widget.controller.getState().status, "idle");
  assert.equal(cancel.hidden, true);
});

test("destroy clears the root and resets the active conversation", () => {
  const { root, widget } = fixture({ createChatCompletion: async () => ({ choices: [{ message: { content: "ok" } }] }) });
  widget.destroy();
  assert.equal(root.children.length, 0);
  assert.equal(widget.controller.getState().messages.length, 0);
});
