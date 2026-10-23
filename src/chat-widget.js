import { createChatController } from "./chat-controller.js";

export function mountChatWidget(root, { client, model, createId, title = "Aether AI Chat" } = {}) {
  const document = root?.ownerDocument;
  if (!root || typeof root.replaceChildren !== "function" || !document || typeof document.createElement !== "function") {
    throw new TypeError("A DOM root element is required");
  }
  if (typeof createId !== "function") throw new TypeError("ID generator is required");

  const region = document.createElement("section");
  region.setAttribute("role", "region");
  region.setAttribute("aria-label", title);
  const heading = document.createElement("h2");
  heading.textContent = title;
  const messages = document.createElement("ol");
  messages.setAttribute("aria-label", "Conversation");
  messages.setAttribute("aria-live", "polite");
  messages.setAttribute("aria-relevant", "additions text");
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  const form = document.createElement("form");
  const prompt = document.createElement("textarea");
  prompt.id = createId();
  prompt.setAttribute("aria-label", "Message");
  prompt.setAttribute("rows", "3");
  prompt.setAttribute("maxlength", "100000");
  const send = document.createElement("button");
  send.type = "submit";
  send.textContent = "Send";
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.textContent = "Cancel response";
  cancel.hidden = true;
  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "Clear conversation";
  form.append(prompt, send);
  region.append(heading, messages, status, form, cancel, reset);
  root.replaceChildren(region);

  function render(state) {
    messages.replaceChildren();
    for (const message of state.messages) {
      const item = document.createElement("li");
      item.setAttribute("data-role", message.role);
      const label = document.createElement("strong");
      label.textContent = message.role === "user" ? "You: " : "Assistant: ";
      const text = document.createElement("span");
      text.textContent = message.text;
      item.append(label, text);
      messages.append(item);
    }
    status.textContent = state.status === "streaming" ? "Assistant is responding…"
      : state.status === "error" ? state.error ?? "Request failed."
      : state.messages.length ? "Conversation ready." : "Start a conversation.";
    cancel.hidden = state.status !== "streaming";
    send.disabled = state.status === "streaming";
    prompt.disabled = state.status === "streaming";
    if (state.status === "error") status.setAttribute("role", "alert");
    else status.setAttribute("role", "status");
  }

  const controller = createChatController({ client, model, createId, onStateChange: render });
  render(controller.getState());
  let disposed = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (disposed) return;
    const value = prompt.value;
    try {
      await controller.submit(value);
      const state = controller.getState();
      if (state.status !== "error") prompt.value = "";
    } catch (error) {
      status.setAttribute("role", "alert");
      status.textContent = error instanceof Error ? error.message : "Message could not be sent.";
    }
  });
  cancel.addEventListener("click", () => { if (!disposed) controller.cancel(); });
  reset.addEventListener("click", () => { if (!disposed) { controller.reset(); prompt.value = ""; } });

  return Object.freeze({
    controller,
    destroy() {
      if (disposed) return;
      disposed = true;
      controller.reset();
      root.replaceChildren();
    },
  });
}
