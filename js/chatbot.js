/* BlueBush Chatbot Widget */

const CHAT_API_BASE_URL = (typeof window !== 'undefined' && window.CHAT_API_BASE_URL)
  ? window.CHAT_API_BASE_URL
  : 'https://bluebush-chat-relay.azzamunza.workers.dev';

const CHAT_API_TIMEOUT_MS = 15000;

let chatInFlight = false;

function createChatbotWidget() {
  const widget = document.createElement('div');
  widget.id = 'chatbot-widget';
  widget.innerHTML = `
    <button class="chatbot-toggle" id="chatbot-toggle" aria-label="Open chat assistant" onclick="toggleChatbot()">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/></svg>
      <span class="chatbot-badge" id="chatbot-badge" style="display:none">1</span>
    </button>

    <div class="chatbot-window" id="chatbot-window" role="dialog" aria-modal="true" aria-label="BlueBush chat assistant">
      <div class="chatbot-header">
        <div class="chatbot-header-info">
          <div class="chatbot-avatar" aria-hidden="true">🦘</div>
          <div>
            <div class="chatbot-name">Chloe</div>
            <div class="chatbot-status">BlueBush Virtual Assistant</div>
          </div>
        </div>
        <button class="chatbot-close" onclick="toggleChatbot()" aria-label="Close chat">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="chatbot-messages" id="chatbot-messages" role="log" aria-live="polite" aria-label="Chat messages">
        <!-- Messages injected here -->
      </div>
      <div class="chatbot-suggestions" id="chatbot-suggestions">
        <button onclick="sendSuggestion('Shipping info')">🚚 Shipping</button>
        <button onclick="sendSuggestion('Return policy')">📦 Returns</button>
        <button onclick="sendSuggestion('Our location')">📍 Location</button>
        <button onclick="sendSuggestion('Is it vegan?')">🌿 Vegan?</button>
      </div>
      <div class="chatbot-input-row">
        <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Type a message..." aria-label="Chat message input" onkeydown="chatbotKeydown(event)" maxlength="200">
        <button class="chatbot-send" onclick="sendChatMessage()" aria-label="Send message">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
        </button>
      </div>
    </div>`;
  document.body.appendChild(widget);

  // Show welcome message after short delay
  setTimeout(() => {
    addBotMessage("G'day! 👋 I'm <strong>Chloe</strong>, your BlueBush virtual assistant. Ask me anything about our products, shipping, returns, or sustainability — I'm here to help!");
    document.getElementById('chatbot-badge').style.display = 'flex';
  }, 2000);
}

function toggleChatbot() {
  const win = document.getElementById('chatbot-window');
  const toggle = document.getElementById('chatbot-toggle');
  const badge = document.getElementById('chatbot-badge');
  if (!win) return;
  const isOpen = win.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) {
    badge.style.display = 'none';
    document.getElementById('chatbot-input')?.focus();
  }
}

function chatbotKeydown(e) {
  if (e.key === 'Enter') sendChatMessage();
}

function sendSuggestion(text) {
  if (chatInFlight) return;
  addUserMessage(text);
  document.getElementById('chatbot-suggestions').style.display = 'none';
  callChatAPI(text);
}

function sendChatMessage() {
  if (chatInFlight) return;
  const input = document.getElementById('chatbot-input');
  const text = input?.value.trim();
  if (!text) return;
  input.value = '';
  addUserMessage(text);
  document.getElementById('chatbot-suggestions').style.display = 'none';
  callChatAPI(text);
}

async function callChatAPI(text) {
  const input = document.getElementById('chatbot-input');
  const btn = document.querySelector('.chatbot-send');
  const msgs = document.getElementById('chatbot-messages');
  if (!msgs) return;

  chatInFlight = true;
  if (input) input.disabled = true;
  if (btn) btn.disabled = true;

  const typing = document.createElement('div');
  typing.className = 'chat-msg chat-bot';
  typing.setAttribute('aria-label', 'Chloe is typing');
  typing.innerHTML = '<div class="chat-avatar" aria-hidden="true">🦘</div><div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>';
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHAT_API_TIMEOUT_MS);
    const resp = await fetch(`${CHAT_API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!resp.ok) throw new Error(`status ${resp.status}`);
    const data = await resp.json();
    const reply = data && data.reply;
    if (!reply || !reply.trim()) throw new Error('empty reply');

    msgs.removeChild(typing);
    const div = document.createElement('div');
    div.className = 'chat-msg chat-bot';
    div.innerHTML = `<div class="chat-avatar" aria-hidden="true">🦘</div><div class="chat-bubble">${escHtml(reply)}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  } catch (err) {
    if (msgs.contains(typing)) msgs.removeChild(typing);
    const div = document.createElement('div');
    div.className = 'chat-msg chat-bot';
    const msg = err.name === 'AbortError'
      ? "Sorry, the request timed out. Please try again."
      : "Sorry, I couldn't connect right now. Please try again in a moment.";
    div.innerHTML = `<div class="chat-avatar" aria-hidden="true">🦘</div><div class="chat-bubble chat-error">${msg}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  } finally {
    chatInFlight = false;
    if (input) { input.disabled = false; input.focus(); }
    if (btn) btn.disabled = false;
  }
}

function addUserMessage(text) {
  const msgs = document.getElementById('chatbot-messages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'chat-msg chat-user';
  div.innerHTML = `<div class="chat-bubble">${escHtml(text)}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addBotMessage(html) {
  const msgs = document.getElementById('chatbot-messages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'chat-msg chat-bot';
  div.innerHTML = `<div class="chat-avatar" aria-hidden="true">🦘</div><div class="chat-bubble">${html}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

// Init chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', createChatbotWidget);
