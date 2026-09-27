const chat = document.querySelector("#chat");
const welcome = document.querySelector("#welcome");
const form = document.querySelector("#chat-form");
const input = document.querySelector("#message");
const sendButton = document.querySelector("#send");
const newChatButton = document.querySelector("#new-chat");

let history = [];

function addMessage(role, text) {
  welcome?.remove();

  const row = document.createElement("div");
  row.className = `message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "You" : "✦";

  const content = document.createElement("div");
  content.className = "message-content";
  content.textContent = text;

  row.append(avatar, content);
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;

  return content;
}

async function sendMessage(text) {
  addMessage("user", text);
  history.push({ role: "user", content: text });

  const replyBox = addMessage("assistant", "Thinking...");
  sendButton.disabled = true;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    replyBox.textContent = data.reply;
    history.push({ role: "assistant", content: data.reply });
  } catch (error) {
    replyBox.textContent =
      `Sorry, I couldn't get a response. ${error.message}`;
    history.pop();
  } finally {
    sendButton.disabled = false;
    input.focus();
    chat.scrollTop = chat.scrollHeight;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text || sendButton.disabled) return;

  input.value = "";
  input.style.height = "auto";
  await sendMessage(text);
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    form.requestSubmit();
  });
});

newChatButton.addEventListener("click", () => {
  history = [];
  chat.innerHTML = "";
  chat.appendChild(welcome);
  input.value = "";
  input.focus();
});