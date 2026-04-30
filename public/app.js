const state = {
  currentPersona: "anshuman",
  conversations: {
    anshuman: [],
    abhimanyu: [],
    kshitij: [],
  },
  isLoading: false,
  lastActivity: Date.now(),
  personas: {
    anshuman: {
      name: "Anshuman Singh",
      title: "Co-founder, Scaler & InterviewBit",
      avatar: "AS",
      color: "#2563eb",
      colorName: "blue",
      suggestions: [
        "How should I prepare for system design interviews?",
        "I'm from a tier-3 college — can I crack FAANG?",
        "What skills should I focus on in the age of AI?",
        "Is Scaler worth the investment?",
      ],
    },
    abhimanyu: {
      name: "Abhimanyu Saxena",
      title: "Co-founder, Scaler & InterviewBit",
      avatar: "AX",
      color: "#06b6d4",
      colorName: "teal",
      suggestions: [
        "Should I do a master's or upskill online?",
        "How did you come up with the idea for Scaler?",
        "Is 30 too late to switch into tech?",
        "What's your advice for aspiring founders?",
      ],
    },
    kshitij: {
      name: "Kshitij Mishra",
      title: "Head of Instructors, Scaler",
      avatar: "KM",
      color: "#f43f5e",
      colorName: "coral",
      suggestions: [
        "How do I get better at Dynamic Programming?",
        "What's the best way to practice DSA daily?",
        "How important is time complexity in interviews?",
        "I'm a beginner — where do I start with DSA?",
      ],
    },
  },
};

const messagesContainer = document.getElementById("messages-container");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");
const typingAvatar = document.getElementById("typing-avatar");
const suggestionsContainer = document.getElementById("suggestions-container");
const personaTabs = document.querySelectorAll(".persona-tab");
const clearChatButton = document.getElementById("clear-chat");

function init() {
  renderWelcomeMessage();
  renderSuggestions();
  bindEvents();
}

function bindEvents() {
  personaTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const persona = tab.dataset.persona;
      if (persona !== state.currentPersona && !state.isLoading) {
        switchPersona(persona);
      }
    });
  });

  sendButton.addEventListener("click", handleSend);

  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        return;
      } else if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        handleSend();
      } else {
        e.preventDefault();
        handleSend();
      }
    }

    if (e.key === "Escape") {
      messageInput.value = "";
      autoResizeTextarea();
      sendButton.disabled = true;
    }
  });

  messageInput.addEventListener("input", () => {
    autoResizeTextarea();
    sendButton.disabled = !messageInput.value.trim();
    state.lastActivity = Date.now();
  });

  messageInput.addEventListener("focus", () => {
    state.lastActivity = Date.now();
  });

  setTimeout(() => messageInput.focus(), 100);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.activeElement === messageInput) {
      messageInput.value = "";
      autoResizeTextarea();
      sendButton.disabled = true;
      e.preventDefault();
    }
  });

  clearChatButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the conversation?")) {
      clearConversation();
    }
  });
}

function switchPersona(personaKey) {
  state.currentPersona = personaKey;
  const persona = state.personas[personaKey];

  personaTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.persona === personaKey);
  });

  state.conversations[personaKey] = [];

  messagesContainer.classList.add("switching");
  setTimeout(() => messagesContainer.classList.remove("switching"), 300);

  messagesContainer.innerHTML = "";
  renderWelcomeMessage();

  suggestionsContainer.style.display = "flex";
  renderSuggestions();
}

function clearConversation() {
  state.conversations[state.currentPersona] = [];
  messagesContainer.innerHTML = "";
  renderWelcomeMessage();
  suggestionsContainer.style.display = "flex";
  renderSuggestions();
  messageInput.value = "";
  sendButton.disabled = true;
  autoResizeTextarea();
  showToast("Conversation cleared!");
}

function renderWelcomeMessage() {
  const persona = state.personas[state.currentPersona];
  const welcomeDiv = document.createElement("div");
  welcomeDiv.className = "message message--welcome";
  welcomeDiv.innerHTML = `
    <div class="message__bubble">
      <div class="welcome-title">👋 Chat with ${persona.name}</div>
      <div class="welcome-subtitle">${persona.title}</div>
      <div class="welcome-features">
        <div class="welcome-feature">
          <span class="welcome-feature-icon">💡</span>
          <span>Get personalized career advice</span>
        </div>
        <div class="welcome-feature">
          <span class="welcome-feature-icon">🎯</span>
          <span>Learn system design & DSA tips</span>
        </div>
        <div class="welcome-feature">
          <span class="welcome-feature-icon">🚀</span>
          <span>Discover Scaler success stories</span>
        </div>
      </div>
    </div>
  `;
  messagesContainer.appendChild(welcomeDiv);
}

function renderSuggestions() {
  const persona = state.personas[state.currentPersona];
  suggestionsContainer.innerHTML = "";

  persona.suggestions.forEach((text) => {
    const chip = document.createElement("button");
    chip.className = "suggestion-chip";
    chip.textContent = text;
    chip.dataset.personaColor = persona.colorName;
    chip.addEventListener("click", () => {
      if (!state.isLoading) {
        messageInput.value = text;
        sendButton.disabled = false;
        handleSend();
      }
    });
    suggestionsContainer.appendChild(chip);
  });
}

async function handleSend() {
  const text = messageInput.value.trim();
  if (!text || state.isLoading) return;

  const timestamp = Date.now();

  messageInput.value = "";
  sendButton.disabled = true;
  autoResizeTextarea();

  suggestionsContainer.style.display = "none";

  state.conversations[state.currentPersona].push({
    role: "user",
    content: text,
    timestamp: timestamp,
  });
  appendMessageToDOM("user", text, timestamp);
  scrollToBottom();

  showTyping();

  state.isLoading = true;
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        persona: state.currentPersona,
        messages: state.conversations[state.currentPersona],
      }),
    });

    const data = await response.json();

    hideTyping();

    if (data.error) {
      const errorTimestamp = Date.now();
      appendMessageToDOM("error", data.error, errorTimestamp);
      state.conversations[state.currentPersona].push({
        role: "error",
        content: data.error,
        timestamp: errorTimestamp,
      });
    } else {
      const replyTimestamp = Date.now();
      state.conversations[state.currentPersona].push({
        role: "assistant",
        content: data.reply,
        timestamp: replyTimestamp,
      });
      appendMessageToDOM("assistant", data.reply, replyTimestamp);
    }
  } catch (err) {
    hideTyping();
    const errorTimestamp = Date.now();
    appendMessageToDOM(
      "error",
      "Network error — please check your connection and try again.",
      errorTimestamp
    );
    state.conversations[state.currentPersona].push({
      role: "error",
      content: "Network error — please check your connection and try again.",
      timestamp: errorTimestamp,
    });
  } finally {
    state.isLoading = false;
    scrollToBottom();
  }
}

function appendMessageToDOM(role, content, timestamp = Date.now()) {
  const persona = state.personas[state.currentPersona];
  const div = document.createElement("div");
  const timeString = formatTime(timestamp);

  if (role === "user") {
    div.className = "message message--user";
    div.innerHTML = `
      <div class="message__bubble">
        <div class="message__content">${escapeHtml(content)}</div>
        <div class="message__actions">
          <button class="message__action" onclick="copyToClipboard('${escapeHtml(content)}')" title="Copy message">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          <span class="message__time">${timeString}</span>
        </div>
      </div>
    `;
  } else if (role === "assistant") {
    div.className = "message message--bot";
    div.innerHTML = `
      <div class="message__avatar" style="background: ${persona.color};">${persona.avatar}</div>
      <div class="message__bubble">
        <div class="message__content">${formatMarkdown(content)}</div>
        <div class="message__actions">
          <button class="message__action" onclick="copyToClipboard('${escapeHtml(content).replace(/'/g, "\\'")}')" title="Copy message">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          <span class="message__time">${timeString}</span>
        </div>
      </div>
    `;
  } else if (role === "error") {
    div.className = "message message--bot message--error";
    div.innerHTML = `
      <div class="message__avatar" style="background: var(--accent-coral);">⚠</div>
      <div class="message__bubble">
        <div class="message__content">${escapeHtml(content)}</div>
        <div class="message__actions">
          <button class="message__action message__retry" onclick="retryLastMessage()" title="Retry">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="message__time">${timeString}</span>
        </div>
      </div>
    `;
  }

  messagesContainer.appendChild(div);
  return div;
}

function showTyping() {
  const persona = state.personas[state.currentPersona];
  typingAvatar.textContent = persona.avatar;
  typingAvatar.style.background = persona.color;
  typingIndicator.style.display = "flex";
  scrollToBottom();
}

function hideTyping() {
  typingIndicator.style.display = "none";
}

window.copyToClipboard = async function(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!");
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    showToast("Copied to clipboard!");
  }
};

window.retryLastMessage = function() {
  const conversation = state.conversations[state.currentPersona];
  if (conversation.length === 0) return;

  for (let i = conversation.length - 1; i >= 0; i--) {
    if (conversation[i].role === "user") {
      messageInput.value = conversation[i].content;
      sendButton.disabled = false;
      autoResizeTextarea();
      messageInput.focus();
      break;
    }
  }
};

function scrollToBottom() {
  requestAnimationFrame(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}

function autoResizeTextarea() {
  messageInput.style.height = "auto";
  messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + "px";
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) {
    return "now";
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}m ago`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function showToast(message) {
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("toast--visible"), 10);

  setTimeout(() => {
    toast.classList.remove("toast--visible");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");
  html = html.replace(/\n/g, "<br>");
  return html;
}

document.addEventListener("DOMContentLoaded", init);