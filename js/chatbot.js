/* BlueBush Chatbot Widget */

const chatbotResponses = {
  greetings: ['hello','hi','hey','g\'day','howdy'],
  shipping: ['shipping','delivery','postage','dispatch','send','ship'],
  returns: ['return','refund','exchange','send back'],
  sustainability: ['sustainable','eco','environment','carbon','green','ethical'],
  products: ['product','item','stock','available','range','sell'],
  price: ['price','cost','how much','expensive','cheap','afford'],
  contact: ['contact','phone','email','call','speak','talk','human','person','agent'],
  hours: ['hours','open','close','trading','when'],
  location: ['location','address','where','perth','store','showroom','visit','pickup'],
  warranty: ['warranty','guarantee','defect','broken','damaged','fault'],
  payment: ['pay','payment','card','credit','debit','afterpay','zip'],
  vegan: ['vegan','animal','cruelty','wool','silk','beeswax'],
  linen: ['linen','shrink','wash','care','iron','flax'],
  default: []
};

const chatbotAnswers = {
  greetings: "G'day! 👋 I'm Bilby, the BlueBush virtual assistant. How can I help you today? I can answer questions about our products, shipping, returns, or sustainability practices.",
  shipping: "🚚 We offer **free standard shipping** on Australian orders over $75. Standard shipping (3–7 business days) is $9.95 for orders under $75. Express shipping (1–3 business days) is $14.95. We dispatch from our Perth warehouse within 1–2 business days.",
  returns: "📦 We accept returns of unused, unopened items within **30 days** of delivery. Sale items are final sale unless faulty. To start a return, please contact us with your order number. For hygiene reasons, opened personal care products can't be returned unless defective.",
  sustainability: "🌿 Sustainability is at our core. We use OEKO-TEX certified materials, plastic-free packaging, and offset every order by planting a native Australian tree. All our suppliers meet strict ethical sourcing standards.",
  products: "We carry a curated range of sustainable homewares across Bedroom, Bathroom, Kitchen, Dining, and Living categories — over 69 products in total! Visit our Shop page to browse the full collection.",
  price: "Our prices reflect the quality and ethical sourcing of every product. We offer free shipping over $75. Check individual product pages for pricing. We also offer trade discounts for businesses!",
  contact: "📞 You can reach us at **hello@bluebush.com.au** or call **1300 123 456** (Mon–Fri 9am–6pm, Sat 10am–4pm). You can also use our Contact form for non-urgent enquiries.",
  hours: "🕐 We're available Mon–Fri 9am–6pm AWST, and Saturday 10am–4pm. Our online store is open 24/7!",
  location: "📍 Our showroom is at **42 Wandoo Way, Jarrawood WA 6999**, Perth. Local pickup is available by appointment — select 'Local Pickup' at checkout.",
  warranty: "🛡️ All BlueBush products are covered by **Australian Consumer Law** guarantees. For manufacturing defects within 12 months of purchase, contact us and we'll arrange a replacement or refund.",
  payment: "💳 We accept Visa, Mastercard, and American Express. We're working on adding Afterpay — sign up to our newsletter for updates!",
  vegan: "Most of our products are **vegan**. Exceptions include our Silk Eye Mask (natural silk), Beeswax Wraps, and Wool Throw — clearly noted on each product page. Nothing is tested on animals. 🐾",
  linen: "Our Maireana linen is **pre-washed** to minimise shrinkage. Wash in cold/warm water (max 30°C), line dry in shade. Some initial shedding is normal for natural flax — it settles after 3–4 washes.",
  default: "That's a great question! I'm still learning 🌱 For detailed help, please visit our <a href=\"faq.html\">FAQ page</a> or <a href=\"contact.html\">contact our team</a> directly — we'd love to help!"
};

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
            <div class="chatbot-name">Bilby</div>
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
    addBotMessage("G'day! 👋 I'm <strong>Bilby</strong>, your BlueBush virtual assistant. Ask me anything about our products, shipping, returns, or sustainability — I'm here to help!");
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
  addUserMessage(text);
  document.getElementById('chatbot-suggestions').style.display = 'none';
  setTimeout(() => processChatMessage(text), 600);
}

function sendChatMessage() {
  const input = document.getElementById('chatbot-input');
  const text = input?.value.trim();
  if (!text) return;
  input.value = '';
  addUserMessage(text);
  document.getElementById('chatbot-suggestions').style.display = 'none';
  setTimeout(() => processChatMessage(text), 600);
}

function processChatMessage(text) {
  const lower = text.toLowerCase();
  let category = 'default';
  for (const [key, keywords] of Object.entries(chatbotResponses)) {
    if (key === 'default') continue;
    if (keywords.some(kw => lower.includes(kw))) { category = key; break; }
  }
  addBotMessage(chatbotAnswers[category] || chatbotAnswers.default);
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
  // Typing indicator
  const typing = document.createElement('div');
  typing.className = 'chat-msg chat-bot';
  typing.innerHTML = '<div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>';
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;
  setTimeout(() => {
    msgs.removeChild(typing);
    const div = document.createElement('div');
    div.className = 'chat-msg chat-bot';
    div.innerHTML = `<div class="chat-avatar" aria-hidden="true">🦘</div><div class="chat-bubble">${html}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }, 800);
}

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

// Init chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', createChatbotWidget);
