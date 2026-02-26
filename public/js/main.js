/* BlueBush - Shared JavaScript */

// ===== CART STATE =====
const cart = {
  items: JSON.parse(localStorage.getItem('bb_cart') || '[]'),

  save() {
    localStorage.setItem('bb_cart', JSON.stringify(this.items));
    this.updateUI();
  },

  addItem(id, name, price, variant) {
    const existing = this.items.find(i => i.id === id && i.variant === variant);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ id, name, price, variant, qty: 1 });
    }
    this.save();
    openCart();
  },

  removeItem(id, variant) {
    this.items = this.items.filter(i => !(i.id === id && i.variant === variant));
    this.save();
  },

  updateQty(id, variant, delta) {
    const item = this.items.find(i => i.id === id && i.variant === variant);
    if (item) {
      item.qty = Math.max(0, item.qty + delta);
      if (item.qty === 0) this.removeItem(id, variant);
      else this.save();
    }
  },

  getTotal() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  getTotalItems() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  updateUI() {
    // Badge
    const badge = document.getElementById('cart-badge');
    if (badge) {
      const count = this.getTotalItems();
      badge.textContent = count;
      badge.classList.toggle('hidden', count === 0);
    }

    // Drawer body
    const body = document.getElementById('cart-body');
    if (!body) return;

    if (this.items.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>
          <p style="font-family:'Poppins',sans-serif;font-size:1.125rem;color:#374151;">Your cart is empty</p>
          <p style="font-size:0.875rem;color:#6b7280;">Add some sustainable goodies!</p>
        </div>`;
    } else {
      body.innerHTML = this.items.map(item => `
        <div class="cart-item">
          <div class="cart-item-img">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>
          </div>
          <div class="cart-item-info">
            <div class="cart-item-name">${escHtml(item.name)}</div>
            <div class="cart-item-variant">${escHtml(item.variant)}</div>
            <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
            <div class="cart-qty">
              <button class="qty-btn" onclick="cart.updateQty('${item.id}','${item.variant}',-1)" aria-label="Decrease quantity">−</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn" onclick="cart.updateQty('${item.id}','${item.variant}',1)" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="remove-btn" onclick="cart.removeItem('${item.id}','${item.variant}')" aria-label="Remove ${escHtml(item.name)}">✕</button>
        </div>`).join('');
    }

    // Footer
    const footer = document.getElementById('cart-footer');
    if (footer) {
      footer.style.display = this.items.length > 0 ? 'block' : 'none';
    }

    const totalEl = document.getElementById('cart-total');
    if (totalEl) {
      totalEl.textContent = `$${this.getTotal().toFixed(2)}`;
    }
  }
};

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== PRODUCT IMAGE HELPER =====
function getProductImagePath(productId, productName, variant) {
  const base = getBase();
  const nameSlug = productName.replace(/\s+/g, '_');
  const filename = `${productId}-${nameSlug}-${variant}.png`;
  return `${base}images/products/${filename}`;
}

// ===== CART DRAWER =====
function openCart() {
  document.getElementById('cart-overlay')?.classList.add('open');
  document.getElementById('cart-drawer')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== MOBILE MENU =====
function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-icon-open');
  const iconClose = document.getElementById('menu-icon-close');
  if (!menu) return;
  const isOpen = menu.classList.toggle('open');
  if (iconOpen) iconOpen.style.display = isOpen ? 'none' : 'block';
  if (iconClose) iconClose.style.display = isOpen ? 'block' : 'none';
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.anim').forEach(el => observer.observe(el));

  // Fallback: make all .anim elements visible after 1.5s (covers edge cases)
  setTimeout(() => {
    document.querySelectorAll('.anim:not(.visible)').forEach(el => el.classList.add('visible'));
  }, 1500);
}

// ===== HEADER NAV ACTIVE STATE =====
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.desktop-nav a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const isHome = (href === 'index.html' || href === './' || href === '../' || href === '/BlueBush/') && (path.endsWith('/') || path.endsWith('index.html') || path === '/BlueBush');
    const isMatch = !isHome && href !== 'index.html' && path.includes(href.replace('.html', ''));
    if (isHome || isMatch) a.classList.add('active');
  });
}

// ===== HEADER HTML =====
function renderHeader() {
  const el = document.getElementById('site-header');
  if (!el) return;

  // Determine base path (for GitHub Pages /BlueBush/ or root)
  const base = getBase();

  el.innerHTML = `
    <header class="site-header" role="banner">
      <div class="container">
        <div class="header-inner">
          <!-- Logo -->
          <a href="${base}index.html" class="logo" aria-label="BlueBush Home">
            <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M20 2C20 2 6 10 6 24C6 32.8 12.2 40 20 40C27.8 40 34 32.8 34 24C34 10 20 2 20 2Z" fill="#86c8de"/>
              <path d="M20 8C20 8 9 15 9 26C9 33.2 14 39 20 40C14.5 36 12 30 12 26C12 17 20 8 20 8Z" fill="#286a58"/>
              <path d="M20 12C20 12 14 18 14 26C14 32 16.5 37 20 40C23.5 37 26 32 26 26C26 18 20 12 20 12Z" fill="#206c68"/>
            </svg>
            <span class="logo-text">BlueBush</span>
          </a>

          <!-- Desktop Navigation -->
          <nav class="desktop-nav" aria-label="Main navigation">
            <a href="${base}shop.html">Shop</a>
            <a href="${base}our-story.html">Our Story</a>
            <a href="${base}journal.html">Journal</a>
            <a href="${base}contact.html">Contact</a>
          </nav>

          <!-- Right Side -->
          <div class="header-right">
            <!-- Search (desktop) -->
            <div class="search-wrap" role="search">
              <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="search" class="search-input" placeholder="Search products..." aria-label="Search products" id="search-input-desktop" oninput="handleSearch(this.value)">
            </div>

            <!-- Account -->
            <a href="${base}account.html" class="icon-btn" aria-label="My account">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
            </a>

            <!-- Cart -->
            <button class="icon-btn cart-btn" onclick="openCart()" aria-label="Open shopping cart">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>
              <span class="cart-badge hidden" id="cart-badge" aria-live="polite" aria-label="Cart items">0</span>
            </button>

            <!-- Mobile menu button -->
            <button class="icon-btn menu-btn" onclick="toggleMenu()" aria-label="Toggle navigation menu" aria-expanded="false">
              <svg id="menu-icon-open" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
              <svg id="menu-icon-close" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true" style="display:none"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Mobile Search -->
        <div class="mobile-search-row" role="search">
          <div class="mobile-search-wrap">
            <svg class="mobile-search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="search" class="mobile-search-input" placeholder="Search products..." aria-label="Search products" oninput="handleSearch(this.value)">
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div class="mobile-menu" id="mobile-menu" role="navigation" aria-label="Mobile navigation">
        <nav>
          <a href="${base}shop.html" onclick="toggleMenu()">Shop</a>
          <a href="${base}our-story.html" onclick="toggleMenu()">Our Story</a>
          <a href="${base}journal.html" onclick="toggleMenu()">Journal</a>
          <a href="${base}contact.html" onclick="toggleMenu()">Contact</a>
          <a href="${base}account.html" onclick="toggleMenu()">My Account</a>
        </nav>
      </div>
    </header>`;

  setActiveNav();
}

// ===== FOOTER HTML =====
function renderFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;

  const base = getBase();
  const year = new Date().getFullYear();

  el.innerHTML = `
    <footer class="site-footer" role="contentinfo">
      <div class="container footer-inner">
        <div class="footer-grid">
          <div>
            <h3 class="footer-heading">About BlueBush</h3>
            <p class="footer-text">Premium sustainable Australian homewares. Ethically sourced, beautifully crafted, built to last.</p>
          </div>
          <div>
            <h3 class="footer-heading">Shop</h3>
            <ul class="footer-links">
              <li><a href="${base}shop.html?category=Bedroom">Bedroom</a></li>
              <li><a href="${base}shop.html?category=Bathroom">Bathroom</a></li>
              <li><a href="${base}shop.html?category=Dining">Dining</a></li>
              <li><a href="${base}shop.html?category=Living">Living</a></li>
            </ul>
          </div>
          <div>
            <h3 class="footer-heading">Customer Service</h3>
            <ul class="footer-links">
              <li><a href="${base}contact.html">Contact Us</a></li>
              <li><a href="${base}contact.html">Shipping &amp; Returns</a></li>
              <li><a href="${base}faq.html">FAQ</a></li>
              <li><a href="${base}account.html">My Account</a></li>
            </ul>
          </div>
          <div>
            <h3 class="footer-heading">Connect</h3>
            <ul class="footer-links">
              <li><a href="${base}our-story.html">Our Story</a></li>
              <li><a href="${base}journal.html">Journal</a></li>
              <li><a href="mailto:hello@bluebush.com.au">hello@bluebush.com.au</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="footer-copy">© ${year} BlueBush. Sustainable Homewares. Australian Grown.</p>
          <p class="footer-wcag">WCAG 2.1 AA Compliant • Built with care for accessibility</p>
        </div>
      </div>
    </footer>`;
}

// ===== CART DRAWER HTML =====
function renderCartDrawer() {
  const el = document.getElementById('cart-drawer-root');
  if (!el) return;

  el.innerHTML = `
    <div class="cart-overlay" id="cart-overlay" onclick="closeCart()" role="presentation"></div>
    <div class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div class="cart-header">
        <h2>Your Cart</h2>
        <button class="icon-btn" onclick="closeCart()" aria-label="Close cart">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="cart-body" id="cart-body"></div>
      <div class="cart-footer" id="cart-footer" style="display:none">
        <div class="cart-total">
          <span class="cart-total-label">Total</span>
          <span class="cart-total-value" id="cart-total">$0.00</span>
        </div>
        <a href="${getBase()}contact.html" class="btn-checkout">Proceed to Checkout</a>
      </div>
    </div>`;
}

// ===== BASE PATH DETECTION =====
function getBase() {
  // Works for GitHub Pages /BlueBush/ and local file:// or /
  const path = window.location.pathname;
  if (path.startsWith('/BlueBush/')) return '/BlueBush/';
  if (path.includes('/BlueBush')) return '/BlueBush/';
  // For local development - find the depth
  const depth = (path.match(/\//g) || []).length - 1;
  return depth > 0 ? '../'.repeat(depth) : './';
}

// ===== SEARCH HANDLER (redirects to shop) =====
function handleSearch(query) {
  if (query && query.length > 0) {
    const base = getBase();
    // We'll just redirect to shop with query param if Enter is pressed
    // Attach keydown handlers
  }
}

function setupSearchRedirect() {
  ['search-input-desktop'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && el.value.trim()) {
          window.location.href = `${getBase()}shop.html?search=${encodeURIComponent(el.value.trim())}`;
        }
      });
    }
  });

  document.querySelectorAll('.mobile-search-input').forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && el.value.trim()) {
        window.location.href = `${getBase()}shop.html?search=${encodeURIComponent(el.value.trim())}`;
      }
    });
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  renderCartDrawer();
  cart.updateUI();
  initScrollAnimations();
  setupSearchRedirect();
});
