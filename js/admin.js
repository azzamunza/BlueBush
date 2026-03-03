/* ===== BlueBush Admin — Core Logic ===== */

'use strict';

/* ===========================
   CONFIG
=========================== */
const REPO_OWNER = 'azzamunza';
const REPO_NAME = 'BlueBush';
const ADMIN_USER = 'azzamunza';

/* ===========================
   GITHUB API HELPER
=========================== */
const githubAPI = {
  _token() {
    return sessionStorage.getItem('bb_admin_token') || '';
  },
  _headers() {
    return {
      'Authorization': `Bearer ${this._token()}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  },
  _base() {
    return `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`;
  },

  async getFile(path) {
    const res = await fetch(this._base() + path, { headers: this._headers() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    const content = decodeBase64(data.content);
    return { content, sha: data.sha, raw: data };
  },

  async putFile(path, content, sha, commitMessage) {
    const encoded = encodeBase64(content);
    const body = { message: commitMessage, content: encoded };
    if (sha) body.sha = sha;
    const res = await fetch(this._base() + path, {
      method: 'PUT',
      headers: { ...this._headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  },

  async listDirectory(path) {
    const res = await fetch(this._base() + path, { headers: this._headers() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  },

  async uploadBinaryFile(path, base64Content, sha, commitMessage) {
    const body = { message: commitMessage, content: base64Content };
    if (sha) body.sha = sha;
    const res = await fetch(this._base() + path, {
      method: 'PUT',
      headers: { ...this._headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  },
};

/* ===========================
   AUTH
=========================== */
async function validateToken(token) {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
    }
  });
  if (res.status === 401) throw new Error('invalid_token');
  if (!res.ok) throw new Error('api_error');
  const data = await res.json();
  if (data.login !== ADMIN_USER) throw new Error('wrong_user');
  return data;
}

async function handleLogin(e) {
  e.preventDefault();
  const tokenInput = document.getElementById('pat-input');
  const btn = document.getElementById('login-submit');
  const errEl = document.getElementById('login-error');
  const token = (tokenInput.value || '').trim();

  if (!token) {
    showLoginError('Please enter your GitHub Personal Access Token.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Verifying…';
  errEl.classList.remove('visible');

  try {
    const user = await validateToken(token);
    sessionStorage.setItem('bb_admin_token', token);
    sessionStorage.setItem('bb_admin_user', user.login);
    showAdminApp(user.login);
  } catch (err) {
    if (err.message === 'invalid_token') {
      showLoginError('Invalid token. Please check your GitHub Personal Access Token.');
    } else if (err.message === 'wrong_user') {
      showLoginError('Access denied. This admin panel is restricted to the repository owner.');
    } else {
      showLoginError('Unable to verify token. Please try again.');
    }
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
  el.classList.add('visible');
}

function handleLogout() {
  sessionStorage.removeItem('bb_admin_token');
  sessionStorage.removeItem('bb_admin_user');
  sessionStorage.removeItem('bb_supabase_url');
  sessionStorage.removeItem('bb_supabase_key');
  document.getElementById('admin-app').classList.add('hidden');
  document.getElementById('login-overlay').classList.remove('hidden');
  document.getElementById('pat-input').value = '';
  document.getElementById('login-error').classList.remove('visible');
}

function showAdminApp(username) {
  document.getElementById('login-overlay').classList.add('hidden');
  document.getElementById('admin-app').classList.remove('hidden');
  const userEl = document.getElementById('admin-username');
  if (userEl) userEl.textContent = username || ADMIN_USER;
  navigateTo('dashboard');
}

/* ===========================
   NAVIGATION
=========================== */
function navigateTo(sectionId) {
  // Hide all sections
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav-item').forEach(b => b.classList.remove('active'));

  const section = document.getElementById('section-' + sectionId);
  if (section) section.classList.add('active');

  const navBtn = document.querySelector(`.sidebar-nav-item[data-section="${sectionId}"]`);
  if (navBtn) navBtn.classList.add('active');

  // Update header title
  const titles = {
    dashboard: 'Dashboard',
    products: 'Product Management',
    orders: 'Order Management',
    stock: 'Stock Management',
    content: 'Content Management',
    training: 'Training Data',
    settings: 'Settings',
  };
  const titleEl = document.getElementById('section-title');
  if (titleEl) titleEl.textContent = titles[sectionId] || sectionId;

  // Close mobile sidebar
  closeSidebar();

  // Lazy-load section data
  switch (sectionId) {
    case 'dashboard': loadDashboard(); break;
    case 'products': loadProducts(); break;
    case 'orders': loadOrders(); break;
    case 'stock': loadStock(); break;
    case 'content': loadContent(); break;
    case 'training': adminTraining.load(); break;
    case 'settings': loadSettings(); break;
  }
}

/* ===========================
   SIDEBAR (mobile)
=========================== */
function toggleSidebar() {
  document.getElementById('admin-sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('admin-sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

/* ===========================
   MODAL HELPERS
=========================== */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

/* ===========================
   TOAST NOTIFICATIONS
=========================== */
function showToast(type, message, duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${escapeHtml(message)}</span><button class="toast-dismiss" aria-label="Dismiss">×</button>`;
  toast.querySelector('.toast-dismiss').addEventListener('click', () => toast.remove());
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

/* ===========================
   LOADER
=========================== */
function showLoader(visible) {
  const el = document.getElementById('global-loader');
  if (el) el.classList.toggle('hidden', !visible);
}

/* ===========================
   UTILITY HELPERS
=========================== */
function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(s, n) {
  const str = String(s ?? '');
  return str.length > n ? str.slice(0, n) + '…' : str;
}

function decodeBase64(b64) {
  return decodeURIComponent(escape(atob(b64.replace(/\n/g, ''))));
}

function encodeBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function downloadFile(name, content, mime = 'text/plain') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function renderPagination(current, total, onPage) {
  if (total <= 1) return '';
  let html = `<button class="page-btn" onclick="(${onPage.toString()})(${current - 1})" ${current === 1 ? 'disabled' : ''}>‹</button>`;
  const range = paginationRange(current, total);
  range.forEach(p => {
    if (p === '…') html += `<span class="page-info">…</span>`;
    else html += `<button class="page-btn ${p === current ? 'active' : ''}" onclick="(${onPage.toString()})(${p})">${p}</button>`;
  });
  html += `<button class="page-btn" onclick="(${onPage.toString()})(${current + 1})" ${current === total ? 'disabled' : ''}>›</button>`;
  return html;
}

function paginationRange(c, t) {
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
  if (c <= 4) return [1, 2, 3, 4, 5, '…', t];
  if (c >= t - 3) return [1, '…', t - 4, t - 3, t - 2, t - 1, t];
  return [1, '…', c - 1, c, c + 1, '…', t];
}

/* ===========================
   DASHBOARD
=========================== */
let _productsCache = null;
let _productsSha = null;

async function loadDashboard() {
  try {
    showLoader(true);
    const products = await getProducts();
    renderDashboardStats(products);
    renderLowStockList(products);
    if (typeof adminCharts !== 'undefined') adminCharts.renderDashboardCharts(products);
  } catch (e) {
    showToast('error', 'Failed to load dashboard data.');
  } finally {
    showLoader(false);
  }
}

function renderDashboardStats(products) {
  const total = products.length;
  const cats = new Set(products.map(p => p.category)).size;
  const lowStock = products.filter(p => (p.dynamic_data.stock_level > 0 && p.dynamic_data.stock_level < 10) || p.dynamic_data.status === 'Low Stock').length;
  const outOfStock = products.filter(p => p.dynamic_data.stock_level === 0).length;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('stat-total', total);
  set('stat-cats', cats);
  set('stat-low', lowStock);
  set('stat-out', outOfStock);
}

function renderLowStockList(products) {
  const low = products.filter(p => p.dynamic_data.stock_level < 10 || p.dynamic_data.status === 'Low Stock')
    .sort((a, b) => a.dynamic_data.stock_level - b.dynamic_data.stock_level)
    .slice(0, 10);

  const tbody = document.getElementById('low-stock-tbody');
  if (!tbody) return;
  if (low.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-muted" style="text-align:center;padding:1rem">No low-stock products 🎉</td></tr>';
    return;
  }
  tbody.innerHTML = low.map(p => `
    <tr>
      <td>${escapeHtml(p.name)}</td>
      <td><code style="font-size:0.78rem">${escapeHtml(p.id)}</code></td>
      <td>
        <span class="badge ${p.dynamic_data.stock_level === 0 ? 'badge-red' : 'badge-amber'}">
          ${p.dynamic_data.stock_level}
        </span>
      </td>
      <td class="text-muted">${p.dynamic_data.next_shipment_eta ? escapeHtml(p.dynamic_data.next_shipment_eta) : '—'}</td>
    </tr>`).join('');
}

/* ===========================
   PRODUCT MANAGEMENT
=========================== */
let _productPage = 1;
let _productSearch = '';
let _productCatFilter = '';
let _productStatusFilter = '';
let _editingProductId = null;

async function getProducts(forceReload = false) {
  if (_productsCache && !forceReload) return _productsCache;
  const { content, sha } = await githubAPI.getFile('data/products.json');
  _productsCache = JSON.parse(content);
  _productsSha = sha;
  return _productsCache;
}

async function saveProducts(products, commitMessage) {
  const content = JSON.stringify(products, null, 2);
  const result = await githubAPI.putFile('data/products.json', content, _productsSha, commitMessage);
  _productsSha = result.content?.sha || _productsSha;
  _productsCache = products;
}

async function loadProducts() {
  try {
    showLoader(true);
    const products = await getProducts();
    populateCategoryFilter(products, 'product-cat-filter');
    renderProductTable(products);
  } catch (e) {
    showToast('error', 'Failed to load products: ' + e.message);
  } finally {
    showLoader(false);
  }
}

function populateCategoryFilter(products, selectId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const cats = [...new Set(products.map(p => p.category))].sort();
  const current = sel.value;
  sel.innerHTML = '<option value="">All Categories</option>' +
    cats.map(c => `<option value="${escapeHtml(c)}" ${c === current ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('');
}

function renderProductTable(products) {
  let filtered = products;
  if (_productSearch) {
    const q = _productSearch.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }
  if (_productCatFilter) filtered = filtered.filter(p => p.category === _productCatFilter);
  if (_productStatusFilter) filtered = filtered.filter(p => p.dynamic_data.status === _productStatusFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / 20));
  if (_productPage > totalPages) _productPage = 1;
  const page = filtered.slice((_productPage - 1) * 20, _productPage * 20);

  const tbody = document.getElementById('product-tbody');
  if (!tbody) return;

  if (page.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">📦</div><div class="empty-state-title">No products found</div></div></td></tr>';
  } else {
    tbody.innerHTML = page.map(p => {
      const s = p.dynamic_data;
      const statusBadge = s.status === 'In Stock'
        ? '<span class="badge badge-green">In Stock</span>'
        : s.status === 'Low Stock'
          ? '<span class="badge badge-amber">Low Stock</span>'
          : '<span class="badge badge-red">Out of Stock</span>';
      return `<tr>
        <td><code style="font-size:0.78rem">${escapeHtml(p.id)}</code></td>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.category)}</td>
        <td>$${s.price_aud.toFixed(2)}</td>
        <td>${s.stock_level}</td>
        <td>${statusBadge}</td>
        <td>${p.static_data.eco_badge ? `<span class="badge badge-green">🌿 ${escapeHtml(p.static_data.eco_badge)}</span>` : '—'}</td>
        <td>
          <button class="btn-secondary btn-sm" onclick="openProductEdit('${escapeHtml(p.id)}')">Edit</button>
          <button class="btn-danger btn-sm" onclick="deleteProduct('${escapeHtml(p.id)}')">Delete</button>
        </td>
      </tr>`;
    }).join('');
  }

  const pag = document.getElementById('product-pagination');
  if (pag) {
    pag.innerHTML = renderPagination(_productPage, totalPages, p => {
      _productPage = p;
      renderProductTable(_productsCache || []);
    });
  }

  const cnt = document.getElementById('product-count');
  if (cnt) cnt.textContent = `${filtered.length} products`;
}

async function openProductEdit(productId) {
  const products = await getProducts();
  const p = products.find(x => x.id === productId);
  if (!p) return;

  _editingProductId = productId;
  document.getElementById('product-form-title').textContent = `Edit Product: ${p.id}`;
  populateProductForm(p);
  loadProductImages(productId);
  showProductFormSection();
}

function openProductAdd() {
  _editingProductId = null;
  document.getElementById('product-form-title').textContent = 'Add New Product';
  resetProductForm();
  document.getElementById('product-images-section').classList.add('hidden');
  showProductFormSection();
}

function showProductFormSection() {
  document.getElementById('product-list-section').classList.add('hidden');
  document.getElementById('product-form-section').classList.remove('hidden');
}

function showProductListSection() {
  document.getElementById('product-form-section').classList.add('hidden');
  document.getElementById('product-list-section').classList.remove('hidden');
}

function populateProductForm(p) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? '';
  };

  set('pf-id', p.id);
  set('pf-name', p.name);
  set('pf-category', p.category);
  set('pf-price', p.dynamic_data.price_aud);
  set('pf-stock', p.dynamic_data.stock_level);
  set('pf-status', p.dynamic_data.status);
  set('pf-eta', p.dynamic_data.next_shipment_eta || '');
  set('pf-origin', p.static_data.origin);
  set('pf-weight', p.static_data.weight_kg);
  set('pf-eco', p.static_data.eco_badge || '');
  set('pf-power', p.static_data.power_source || '');
  set('pf-warranty', p.static_data.warranty_period || '');
  set('pf-capacity', p.static_data.capacity || '');
  set('pf-hook', p.content_triage.marketing_hook || '');
  set('pf-manual', p.rag_resources.manual_excerpt || '');

  setTagInput('pf-variants', p.static_data.variants || []);
  setTagInput('pf-promos', p.dynamic_data.active_promotions || []);
  setRepeater('pf-specs', p.content_triage.technical_specs || []);
  setRepeater('pf-care', p.rag_resources.care_instructions || []);
  setKvPairs('pf-dims', p.static_data.dimensions_cm || {});
}

function resetProductForm() {
  document.getElementById('product-form').reset();
  setTagInput('pf-variants', []);
  setTagInput('pf-promos', []);
  setRepeater('pf-specs', []);
  setRepeater('pf-care', []);
  setKvPairs('pf-dims', {});
}

async function saveProduct() {
  const f = id => document.getElementById(id);
  const val = id => f(id)?.value?.trim() || '';

  const id = val('pf-id');
  const name = val('pf-name');
  const category = val('pf-category');
  const price = parseFloat(val('pf-price'));
  const stock = parseInt(val('pf-stock'), 10);
  const status = val('pf-status');

  // Validation
  let valid = true;
  const setErr = (id, msg) => {
    const el = document.getElementById(id + '-err');
    if (el) { el.textContent = msg; el.classList.toggle('visible', !!msg); }
    const inp = document.getElementById(id);
    if (inp) inp.classList.toggle('invalid', !!msg);
    if (msg) valid = false;
  };

  setErr('pf-id', id ? '' : 'Product ID is required');
  setErr('pf-name', name ? '' : 'Product name is required');
  setErr('pf-category', category ? '' : 'Category is required');
  setErr('pf-price', isNaN(price) || price < 0 ? 'Valid price required' : '');
  setErr('pf-stock', isNaN(stock) || stock < 0 ? 'Valid stock required' : '');

  if (!valid) return;

  try {
    showLoader(true);
    const products = await getProducts();

    const product = {
      id,
      name,
      category,
      dynamic_data: {
        price_aud: price,
        stock_level: stock,
        status,
        next_shipment_eta: val('pf-eta') || null,
        active_promotions: getTagInput('pf-promos'),
      },
      static_data: {
        origin: val('pf-origin'),
        weight_kg: parseFloat(val('pf-weight')) || 0,
        variants: getTagInput('pf-variants'),
        eco_badge: val('pf-eco') || null,
        dimensions_cm: getKvPairs('pf-dims'),
        ...(val('pf-power') ? { power_source: val('pf-power') } : {}),
        ...(val('pf-warranty') ? { warranty_period: val('pf-warranty') } : {}),
        ...(val('pf-capacity') ? { capacity: val('pf-capacity') } : {}),
      },
      content_triage: {
        marketing_hook: val('pf-hook'),
        technical_specs: getRepeater('pf-specs'),
      },
      rag_resources: {
        care_instructions: getRepeater('pf-care'),
        manual_excerpt: val('pf-manual'),
      },
    };

    if (_editingProductId) {
      const idx = products.findIndex(p => p.id === _editingProductId);
      if (idx !== -1) products[idx] = product;
      else products.push(product);
    } else {
      if (products.find(p => p.id === id)) {
        setErr('pf-id', 'A product with this ID already exists');
        return;
      }
      products.push(product);
    }

    await saveProducts(products, `Admin: ${_editingProductId ? 'Update' : 'Add'} product ${id}`);
    showToast('success', `Product ${id} saved successfully.`);
    showProductListSection();
    renderProductTable(_productsCache);
  } catch (e) {
    showToast('error', 'Save failed: ' + e.message);
  } finally {
    showLoader(false);
  }
}

async function deleteProduct(productId) {
  if (!confirm(`Delete product "${productId}"? This cannot be undone.`)) return;
  try {
    showLoader(true);
    const products = await getProducts();
    const updated = products.filter(p => p.id !== productId);
    await saveProducts(updated, `Admin: Delete product ${productId}`);
    showToast('success', `Product ${productId} deleted.`);
    renderProductTable(_productsCache);
  } catch (e) {
    showToast('error', 'Delete failed: ' + e.message);
  } finally {
    showLoader(false);
  }
}

/* ===========================
   PRODUCT IMAGES
=========================== */
async function loadProductImages(productId) {
  const section = document.getElementById('product-images-section');
  const grid = document.getElementById('product-images-grid');
  if (!section || !grid) return;
  section.classList.remove('hidden');
  grid.innerHTML = '<div class="text-muted" style="padding:0.5rem">Loading images…</div>';
  try {
    const files = await githubAPI.listDirectory('product_images');
    const prefix = productId + '-';
    const imgs = Array.isArray(files) ? files.filter(f => f.name.startsWith(prefix)) : [];
    if (imgs.length === 0) {
      grid.innerHTML = '<div class="text-muted" style="padding:0.5rem">No images found for this product.</div>';
    } else {
      grid.innerHTML = imgs.map(f => `
        <div class="image-tile">
          <img src="https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/product_images/${encodeURIComponent(f.name)}" alt="${escapeHtml(f.name)}" loading="lazy">
          <div class="image-tile-footer">
            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:80px" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</span>
            <button class="btn-danger btn-sm" onclick="deleteProductImage('${escapeHtml(f.name)}','${escapeHtml(f.sha)}')">×</button>
          </div>
        </div>`).join('');
    }
  } catch {
    grid.innerHTML = '<div class="text-muted" style="padding:0.5rem">Could not load images.</div>';
  }
}

async function uploadProductImage() {
  const productId = _editingProductId;
  if (!productId) return;
  const input = document.getElementById('image-upload-input');
  if (!input?.files?.[0]) { showToast('error', 'Please select an image file.'); return; }
  const file = input.files[0];
  const ext = file.name.split('.').pop();
  const name = productId + '-' + file.name;
  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result.split(',')[1];
    try {
      showLoader(true);
      await githubAPI.uploadBinaryFile(`product_images/${name}`, base64, null, `Admin: Upload image ${name}`);
      showToast('success', 'Image uploaded.');
      input.value = '';
      loadProductImages(productId);
    } catch (e) {
      showToast('error', 'Upload failed: ' + e.message);
    } finally {
      showLoader(false);
    }
  };
  reader.readAsDataURL(file);
}

async function deleteProductImage(name, sha) {
  if (!confirm(`Delete image "${name}"?`)) return;
  try {
    showLoader(true);
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/product_images/${encodeURIComponent(name)}`,
      {
        method: 'DELETE',
        headers: { ...githubAPI._headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Admin: Delete image ${name}`, sha }),
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    showToast('success', 'Image deleted.');
    loadProductImages(_editingProductId);
  } catch (e) {
    showToast('error', 'Delete failed: ' + e.message);
  } finally {
    showLoader(false);
  }
}

/* ===========================
   TAG INPUT HELPERS
=========================== */
function setTagInput(containerId, values) {
  const wrap = document.getElementById(containerId + '-wrap');
  if (!wrap) return;
  const existingInput = wrap.querySelector('.tag-text-input');
  wrap.querySelectorAll('.tag').forEach(t => t.remove());
  (values || []).forEach(v => {
    const tag = createTag(v, containerId);
    wrap.insertBefore(tag, existingInput);
  });
}

function createTag(value, containerId) {
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.dataset.value = value;
  tag.innerHTML = `${escapeHtml(value)}<button type="button" class="tag-remove" aria-label="Remove ${escapeHtml(value)}">×</button>`;
  tag.querySelector('.tag-remove').addEventListener('click', () => tag.remove());
  return tag;
}

function getTagInput(containerId) {
  const wrap = document.getElementById(containerId + '-wrap');
  if (!wrap) return [];
  return [...wrap.querySelectorAll('.tag')].map(t => t.dataset.value);
}

function handleTagKeydown(e, containerId) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    const input = e.target;
    const val = input.value.trim().replace(/,$/, '');
    if (!val) return;
    const wrap = document.getElementById(containerId + '-wrap');
    if (!wrap) return;
    const tag = createTag(val, containerId);
    wrap.insertBefore(tag, input);
    input.value = '';
  }
}

/* ===========================
   REPEATER HELPERS
=========================== */
function setRepeater(id, values) {
  const container = document.getElementById(id + '-container');
  if (!container) return;
  container.innerHTML = '';
  (values || []).forEach(v => addRepeaterRow(id, v));
}

function addRepeaterRow(id, value = '') {
  const container = document.getElementById(id + '-container');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'repeater-item';
  const isTA = container.dataset.type === 'textarea';
  row.innerHTML = isTA
    ? `<textarea>${escapeHtml(value)}</textarea><button type="button" class="repeater-remove" aria-label="Remove">×</button>`
    : `<input type="text" value="${escapeHtml(value)}"><button type="button" class="repeater-remove" aria-label="Remove">×</button>`;
  row.querySelector('.repeater-remove').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

function getRepeater(id) {
  const container = document.getElementById(id + '-container');
  if (!container) return [];
  return [...container.querySelectorAll('input, textarea')].map(el => el.value.trim()).filter(Boolean);
}

/* ===========================
   KEY-VALUE PAIR HELPERS
=========================== */
function setKvPairs(id, obj) {
  const container = document.getElementById(id + '-container');
  if (!container) return;
  container.innerHTML = '';
  Object.entries(obj || {}).forEach(([k, v]) => addKvRow(id, k, v));
}

function addKvRow(id, key = '', value = '') {
  const container = document.getElementById(id + '-container');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'kv-pair';
  row.innerHTML = `<input class="kv-key" type="text" placeholder="Key" value="${escapeHtml(key)}"><input class="kv-val" type="text" placeholder="Value" value="${escapeHtml(value)}"><button type="button" class="kv-remove" aria-label="Remove">×</button>`;
  row.querySelector('.kv-remove').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

function getKvPairs(id) {
  const container = document.getElementById(id + '-container');
  if (!container) return {};
  const obj = {};
  container.querySelectorAll('.kv-pair').forEach(row => {
    const k = row.querySelector('.kv-key')?.value?.trim();
    const v = row.querySelector('.kv-val')?.value?.trim();
    if (k) obj[k] = v || '';
  });
  return obj;
}

/* ===========================
   STOCK MANAGEMENT
=========================== */
let _stockEdits = {}; // { productId: { stock_level, status, next_shipment_eta } }

async function loadStock() {
  _stockEdits = {};
  try {
    showLoader(true);
    const products = await getProducts();
    populateCategoryFilter(products, 'stock-cat-filter');
    renderStockTable(products);
  } catch (e) {
    showToast('error', 'Failed to load stock data.');
  } finally {
    showLoader(false);
  }
}

function renderStockTable(products) {
  let filtered = products;
  const cat = document.getElementById('stock-cat-filter')?.value || '';
  if (cat) filtered = filtered.filter(p => p.category === cat);

  const tbody = document.getElementById('stock-tbody');
  if (!tbody) return;

  tbody.innerHTML = filtered.map(p => {
    const s = p.dynamic_data;
    const edit = _stockEdits[p.id] || {};
    const stockVal = edit.stock_level !== undefined ? edit.stock_level : s.stock_level;
    const statusVal = edit.status || s.status;
    const etaVal = edit.next_shipment_eta !== undefined ? edit.next_shipment_eta : (s.next_shipment_eta || '');
    const rowClass = stockVal === 0 ? 'stock-row-red' : stockVal <= 10 ? 'stock-row-amber' : '';
    return `<tr class="${rowClass}" data-product-id="${escapeHtml(p.id)}">
      <td><code style="font-size:0.78rem">${escapeHtml(p.id)}</code></td>
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.category)}</td>
      <td><input class="inline-input" type="number" min="0" value="${stockVal}" onchange="recordStockEdit('${escapeHtml(p.id)}','stock_level',this.value)"></td>
      <td>
        <select class="inline-select" onchange="recordStockEdit('${escapeHtml(p.id)}','status',this.value)">
          ${['In Stock','Low Stock','Out of Stock'].map(st =>
            `<option value="${st}" ${statusVal === st ? 'selected' : ''}>${st}</option>`
          ).join('')}
        </select>
      </td>
      <td><input class="inline-input" style="width:130px" type="date" value="${etaVal}" onchange="recordStockEdit('${escapeHtml(p.id)}','next_shipment_eta',this.value)"></td>
    </tr>`;
  }).join('');
}

function recordStockEdit(productId, field, value) {
  if (!_stockEdits[productId]) _stockEdits[productId] = {};
  if (field === 'stock_level') _stockEdits[productId][field] = parseInt(value, 10);
  else _stockEdits[productId][field] = value;

  // Update row highlight
  const row = document.querySelector(`tr[data-product-id="${productId}"]`);
  if (row) {
    const stockEdit = _stockEdits[productId];
    const products = _productsCache || [];
    const p = products.find(x => x.id === productId);
    const stock = stockEdit.stock_level !== undefined ? stockEdit.stock_level : (p?.dynamic_data.stock_level || 0);
    row.className = stock === 0 ? 'stock-row-red' : stock <= 10 ? 'stock-row-amber' : '';
  }
}

async function saveAllStock() {
  if (Object.keys(_stockEdits).length === 0) {
    showToast('info', 'No changes to save.');
    return;
  }
  if (!confirm('Save all stock changes?')) return;
  try {
    showLoader(true);
    const products = await getProducts();
    let changed = 0;
    products.forEach(p => {
      const edit = _stockEdits[p.id];
      if (edit) {
        if (edit.stock_level !== undefined) p.dynamic_data.stock_level = edit.stock_level;
        if (edit.status) p.dynamic_data.status = edit.status;
        if (edit.next_shipment_eta !== undefined) p.dynamic_data.next_shipment_eta = edit.next_shipment_eta || null;
        changed++;
      }
    });
    await saveProducts(products, 'Admin: Bulk stock update');
    _stockEdits = {};
    showToast('success', `Saved stock updates for ${changed} product(s).`);
  } catch (e) {
    showToast('error', 'Save failed: ' + e.message);
  } finally {
    showLoader(false);
  }
}

function exportStockCSV() {
  const products = _productsCache || [];
  const rows = [['ID','Name','Category','Stock Level','Status','Next Shipment ETA']];
  products.forEach(p => {
    rows.push([
      p.id, p.name, p.category,
      p.dynamic_data.stock_level,
      p.dynamic_data.status,
      p.dynamic_data.next_shipment_eta || ''
    ]);
  });
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  downloadFile('bluebush-stock.csv', csv, 'text/csv');
}

function handleStockCSVImport(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split('\n').slice(1); // skip header
    let count = 0;
    lines.forEach(line => {
      const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
      const [id, , , stock, status, eta] = cols;
      if (!id) return;
      _stockEdits[id] = {
        stock_level: parseInt(stock, 10),
        status: status || 'In Stock',
        next_shipment_eta: eta || null,
      };
      count++;
    });
    renderStockTable(_productsCache || []);
    showToast('success', `Imported ${count} rows. Review and click "Save All Changes".`);
  };
  reader.readAsText(file);
}

/* ===========================
   CONTENT — FAQ MANAGER
=========================== */
let _faqsCache = null;
let _faqsSha = null;

async function loadContent() {
  loadFaqs();
  loadPromos();
  loadSiteSettings();
}

async function loadFaqs() {
  try {
    const { content, sha } = await githubAPI.getFile('data/faqs.json');
    _faqsCache = JSON.parse(content);
    _faqsSha = sha;
    renderFaqTable();
  } catch (e) {
    showToast('error', 'Failed to load FAQs: ' + e.message);
  }
}

function renderFaqTable() {
  const tbody = document.getElementById('faq-tbody');
  if (!tbody) return;
  const faqs = _faqsCache || [];
  if (faqs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon">❓</div><div class="empty-state-title">No FAQs yet</div></div></td></tr>';
    return;
  }
  tbody.innerHTML = faqs.map(f => `
    <tr>
      <td><code style="font-size:0.78rem">${escapeHtml(f.id)}</code></td>
      <td>${escapeHtml(truncate(f.question, 60))}</td>
      <td><span class="badge badge-blue">${escapeHtml(f.category)}</span></td>
      <td class="text-muted">${escapeHtml(truncate(f.answer, 60))}</td>
      <td>
        <button class="btn-secondary btn-sm" onclick="openFaqEdit('${escapeHtml(f.id)}')">Edit</button>
        <button class="btn-danger btn-sm" onclick="deleteFaq('${escapeHtml(f.id)}')">Delete</button>
      </td>
    </tr>`).join('');
}

let _editingFaqId = null;

function openFaqAdd() {
  _editingFaqId = null;
  document.getElementById('faq-modal-title').textContent = 'Add FAQ';
  document.getElementById('faq-q').value = '';
  document.getElementById('faq-a').value = '';
  document.getElementById('faq-cat').value = 'General';
  openModal('faq-modal');
}

function openFaqEdit(id) {
  _editingFaqId = id;
  const faq = (_faqsCache || []).find(f => f.id === id);
  if (!faq) return;
  document.getElementById('faq-modal-title').textContent = 'Edit FAQ';
  document.getElementById('faq-q').value = faq.question;
  document.getElementById('faq-a').value = faq.answer;
  document.getElementById('faq-cat').value = faq.category;
  openModal('faq-modal');
}

async function saveFaq() {
  const q = document.getElementById('faq-q').value.trim();
  const a = document.getElementById('faq-a').value.trim();
  const cat = document.getElementById('faq-cat').value;
  if (!q || !a) { showToast('error', 'Question and answer are required.'); return; }
  try {
    showLoader(true);
    const faqs = _faqsCache || [];
    if (_editingFaqId) {
      const idx = faqs.findIndex(f => f.id === _editingFaqId);
      if (idx !== -1) faqs[idx] = { ...faqs[idx], question: q, answer: a, category: cat };
    } else {
      const newId = 'FAQ-' + String(faqs.length + 1).padStart(3, '0');
      faqs.push({ id: newId, question: q, answer: a, category: cat });
    }
    const result = await githubAPI.putFile('data/faqs.json', JSON.stringify(faqs, null, 2), _faqsSha, `Admin: ${_editingFaqId ? 'Update' : 'Add'} FAQ`);
    _faqsSha = result.content?.sha || _faqsSha;
    _faqsCache = faqs;
    renderFaqTable();
    closeModal('faq-modal');
    showToast('success', 'FAQ saved.');
  } catch (e) {
    showToast('error', 'Save failed: ' + e.message);
  } finally {
    showLoader(false);
  }
}

async function deleteFaq(id) {
  if (!confirm(`Delete FAQ "${id}"?`)) return;
  try {
    showLoader(true);
    const faqs = (_faqsCache || []).filter(f => f.id !== id);
    const result = await githubAPI.putFile('data/faqs.json', JSON.stringify(faqs, null, 2), _faqsSha, `Admin: Delete FAQ ${id}`);
    _faqsSha = result.content?.sha || _faqsSha;
    _faqsCache = faqs;
    renderFaqTable();
    showToast('success', 'FAQ deleted.');
  } catch (e) {
    showToast('error', 'Delete failed: ' + e.message);
  } finally {
    showLoader(false);
  }
}

/* ===========================
   CONTENT — PROMOTIONS MANAGER
=========================== */
async function loadPromos() {
  try {
    const products = await getProducts();
    renderPromoTable(products);
    // Populate global promo category dropdown
    const cats = [...new Set(products.map(p => p.category))].sort();
    const sel = document.getElementById('global-promo-cat');
    if (sel) {
      sel.innerHTML = '<option value="">Select category…</option>' +
        cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    }
  } catch {}
}

function renderPromoTable(products) {
  const tbody = document.getElementById('promo-tbody');
  if (!tbody) return;
  const withPromos = products.filter(p => p.dynamic_data.active_promotions?.length > 0);
  if (withPromos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3"><div class="empty-state"><div class="empty-state-icon">🏷️</div><div class="empty-state-title">No active promotions</div></div></td></tr>';
    return;
  }
  tbody.innerHTML = withPromos.map(p => `
    <tr>
      <td>${escapeHtml(p.name)}</td>
      <td>${p.dynamic_data.active_promotions.map(pr => `<span class="badge badge-purple">${escapeHtml(pr)}</span>`).join(' ')}</td>
      <td><button class="btn-secondary btn-sm" onclick="openPromoEdit('${escapeHtml(p.id)}')">Edit</button></td>
    </tr>`).join('');
}

let _promoEditId = null;

function openPromoEdit(productId) {
  _promoEditId = productId;
  const products = _productsCache || [];
  const p = products.find(x => x.id === productId);
  if (!p) return;
  document.getElementById('promo-modal-title').textContent = `Promotions: ${p.name}`;
  setTagInput('promo-tags', p.dynamic_data.active_promotions || []);
  openModal('promo-modal');
}

async function savePromo() {
  const promos = getTagInput('promo-tags');
  try {
    showLoader(true);
    const products = await getProducts();
    const p = products.find(x => x.id === _promoEditId);
    if (p) p.dynamic_data.active_promotions = promos;
    await saveProducts(products, `Admin: Update promotions for ${_promoEditId}`);
    closeModal('promo-modal');
    renderPromoTable(_productsCache);
    showToast('success', 'Promotions updated.');
  } catch (e) {
    showToast('error', 'Save failed: ' + e.message);
  } finally {
    showLoader(false);
  }
}

async function addGlobalPromo() {
  const cat = document.getElementById('global-promo-cat')?.value;
  const promo = document.getElementById('global-promo-text')?.value?.trim();
  if (!cat || !promo) { showToast('error', 'Please select a category and enter a promotion.'); return; }
  if (!confirm(`Add "${promo}" to ALL products in category "${cat}"?`)) return;
  try {
    showLoader(true);
    const products = await getProducts();
    let count = 0;
    products.forEach(p => {
      if (p.category === cat) {
        if (!p.dynamic_data.active_promotions.includes(promo)) {
          p.dynamic_data.active_promotions.push(promo);
          count++;
        }
      }
    });
    await saveProducts(products, `Admin: Global promo "${promo}" to ${cat}`);
    renderPromoTable(_productsCache);
    showToast('success', `Added promotion to ${count} product(s).`);
  } catch (e) {
    showToast('error', 'Failed: ' + e.message);
  } finally {
    showLoader(false);
  }
}

/* ===========================
   CONTENT — SITE SETTINGS
=========================== */
let _settingsSha = null;

async function loadSiteSettings() {
  try {
    const { content, sha } = await githubAPI.getFile('data/site-settings.json');
    _settingsSha = sha;
    const settings = JSON.parse(content);
    populateSiteSettingsForm(settings);
  } catch (e) {
    showToast('error', 'Failed to load site settings.');
  }
}

function populateSiteSettingsForm(s) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = !!val;
    else el.value = val ?? '';
  };
  set('ss-name', s.store_name);
  set('ss-email', s.contact_email);
  set('ss-phone', s.contact_phone);
  set('ss-address', s.store_address);
  set('ss-instagram', s.instagram_url);
  set('ss-facebook', s.facebook_url);
  set('ss-chatbot', s.chatbot_enabled);
  set('ss-chatbot-greeting', s.chatbot_greeting);
  set('ss-free-ship', s.free_shipping_threshold);
  set('ss-std-ship', s.standard_shipping_cost);
  set('ss-exp-ship', s.express_shipping_cost);
}

async function saveSiteSettings() {
  const get = id => {
    const el = document.getElementById(id);
    if (!el) return undefined;
    if (el.type === 'checkbox') return el.checked;
    return el.value.trim();
  };
  const settings = {
    store_name: get('ss-name'),
    contact_email: get('ss-email'),
    contact_phone: get('ss-phone'),
    store_address: get('ss-address'),
    instagram_url: get('ss-instagram'),
    facebook_url: get('ss-facebook'),
    chatbot_enabled: get('ss-chatbot'),
    chatbot_greeting: get('ss-chatbot-greeting'),
    free_shipping_threshold: parseFloat(get('ss-free-ship')) || 150,
    standard_shipping_cost: parseFloat(get('ss-std-ship')) || 9.95,
    express_shipping_cost: parseFloat(get('ss-exp-ship')) || 19.95,
  };
  try {
    showLoader(true);
    const result = await githubAPI.putFile('data/site-settings.json', JSON.stringify(settings, null, 2), _settingsSha, 'Admin: Update site settings');
    _settingsSha = result.content?.sha || _settingsSha;
    showToast('success', 'Site settings saved.');
  } catch (e) {
    showToast('error', 'Save failed: ' + e.message);
  } finally {
    showLoader(false);
  }
}

/* ===========================
   ORDERS (Supabase)
=========================== */
function loadOrders() {
  const url = sessionStorage.getItem('bb_supabase_url');
  const key = sessionStorage.getItem('bb_supabase_key');
  if (!url || !key) {
    document.getElementById('orders-placeholder').classList.remove('hidden');
    document.getElementById('orders-table-wrap').classList.add('hidden');
    return;
  }
  document.getElementById('orders-placeholder').classList.add('hidden');
  document.getElementById('orders-table-wrap').classList.remove('hidden');
  fetchOrders(url, key);
}

async function saveSupabaseConfig() {
  const url = document.getElementById('sb-url')?.value?.trim();
  const key = document.getElementById('sb-key')?.value?.trim();
  if (!url || !key) { showToast('error', 'Both URL and key are required.'); return; }
  sessionStorage.setItem('bb_supabase_url', url);
  sessionStorage.setItem('bb_supabase_key', key);
  showToast('success', 'Supabase configuration saved.');
  loadOrders();
}

async function fetchOrders(url, key) {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  tbody.innerHTML = '<tr class="loading-row"><td colspan="8"><div class="spinner"></div></td></tr>';
  const status = document.getElementById('order-status-filter')?.value || '';
  let endpoint = `${url}/rest/v1/orders?select=*,order_items(*)&order=created_at.desc&limit=50`;
  if (status) endpoint += `&status=eq.${encodeURIComponent(status)}`;
  try {
    const res = await fetch(endpoint, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const orders = await res.json();
    renderOrdersTable(orders);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-muted" style="padding:1.5rem;text-align:center">Failed to load orders: ${escapeHtml(e.message)}</td></tr>`;
  }
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">No orders found</div></div></td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(o => {
    const itemCount = o.order_items?.length || 0;
    const statusBadge = {
      confirmed: 'badge-blue', processing: 'badge-amber',
      shipped: 'badge-purple', completed: 'badge-green', cancelled: 'badge-red'
    }[o.status] || 'badge-gray';
    return `<tr style="cursor:pointer" onclick="toggleOrderDetail('${escapeHtml(o.id)}')">
      <td><code style="font-size:0.75rem">${escapeHtml(String(o.id).slice(0,8))}…</code></td>
      <td>${escapeHtml(o.customer_name || '—')}</td>
      <td class="text-muted">${escapeHtml(o.customer_email || '—')}</td>
      <td class="text-muted">${new Date(o.created_at).toLocaleDateString('en-AU')}</td>
      <td>${itemCount}</td>
      <td>$${(o.total_aud || 0).toFixed(2)}</td>
      <td><span class="badge ${statusBadge}">${escapeHtml(o.status || '—')}</span></td>
      <td><button class="btn-secondary btn-sm">Details</button></td>
    </tr>
    <tr id="order-detail-${escapeHtml(o.id)}" style="display:none">
      <td colspan="8">${renderOrderDetail(o)}</td>
    </tr>`;
  }).join('');
}

function renderOrderDetail(o) {
  const items = o.order_items || [];
  return `<div class="order-detail-panel open">
    <div class="order-detail-grid">
      <div>
        <div class="form-section-title" style="margin-top:0">Customer</div>
        <p><strong>${escapeHtml(o.customer_name || '—')}</strong><br>${escapeHtml(o.customer_email || '')}</p>
        <div class="form-section-title">Shipping Address</div>
        <p class="text-muted" style="font-size:0.85rem">${escapeHtml(o.shipping_address || '—')}</p>
      </div>
      <div>
        <div class="form-section-title" style="margin-top:0">Order Info</div>
        <p class="text-muted" style="font-size:0.85rem">Method: ${escapeHtml(o.shipping_method || '—')}<br>Shipping: $${(o.shipping_cost || 0).toFixed(2)}<br>Payment: ${escapeHtml(o.payment_method || '—')}</p>
        <div class="form-section-title">Update Status</div>
        <div class="flex gap-1">
          <select class="form-select" id="order-status-${escapeHtml(o.id)}">
            ${['confirmed','processing','shipped','completed','cancelled'].map(s =>
              `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
          <button class="btn-primary" onclick="updateOrderStatus('${escapeHtml(o.id)}')">Save</button>
        </div>
      </div>
    </div>
    <div class="form-section-title">Line Items</div>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead><tr><th>Product</th><th>Variant</th><th>Qty</th><th>Unit Price</th><th>Line Total</th><th>Backorder</th></tr></thead>
        <tbody>${items.map(i => `<tr>
          <td>${escapeHtml(i.product_id || '—')}</td>
          <td>${escapeHtml(i.variant || '—')}</td>
          <td>${i.quantity || 1}</td>
          <td>$${(i.price_aud || 0).toFixed(2)}</td>
          <td>$${((i.price_aud || 0) * (i.quantity || 1)).toFixed(2)}</td>
          <td>${i.is_backorder ? '<span class="badge badge-amber">Backorder</span>' : '—'}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>
  </div>`;
}

function toggleOrderDetail(orderId) {
  const row = document.getElementById('order-detail-' + orderId);
  if (row) row.style.display = row.style.display === 'none' ? '' : 'none';
}

async function updateOrderStatus(orderId) {
  const url = sessionStorage.getItem('bb_supabase_url');
  const key = sessionStorage.getItem('bb_supabase_key');
  const status = document.getElementById('order-status-' + orderId)?.value;
  if (!url || !key || !status) return;
  try {
    showLoader(true);
    const res = await fetch(`${url}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    showToast('success', 'Order status updated.');
  } catch (e) {
    showToast('error', 'Update failed: ' + e.message);
  } finally {
    showLoader(false);
  }
}

/* ===========================
   SETTINGS
=========================== */
async function loadSettings() {
  await checkApiStatus();
  const url = sessionStorage.getItem('bb_supabase_url') || '';
  const key = sessionStorage.getItem('bb_supabase_key') || '';
  const urlEl = document.getElementById('settings-sb-url');
  const keyEl = document.getElementById('settings-sb-key');
  if (urlEl) urlEl.value = url;
  if (keyEl) keyEl.value = key;
}

async function checkApiStatus() {
  const token = sessionStorage.getItem('bb_admin_token');
  const dot = document.getElementById('api-status-dot');
  const text = document.getElementById('api-status-text');
  if (!dot || !text) return;
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json' }
    });
    if (res.ok) {
      dot.className = 'status-dot green';
      text.textContent = 'GitHub API: Connected';
    } else {
      dot.className = 'status-dot red';
      text.textContent = 'GitHub API: Error ' + res.status;
    }
  } catch {
    dot.className = 'status-dot red';
    text.textContent = 'GitHub API: Offline';
  }
}

function saveSettingsSupabase() {
  const url = document.getElementById('settings-sb-url')?.value?.trim();
  const key = document.getElementById('settings-sb-key')?.value?.trim();
  if (!url || !key) { showToast('error', 'Both URL and key are required.'); return; }
  sessionStorage.setItem('bb_supabase_url', url);
  sessionStorage.setItem('bb_supabase_key', key);
  showToast('success', 'Supabase credentials saved to session.');
}

async function validateProductsJSON() {
  const el = document.getElementById('validate-products-result');
  if (!el) return;
  el.textContent = 'Validating…';
  try {
    const products = await getProducts();
    const required = ['id', 'name', 'category', 'dynamic_data', 'static_data', 'content_triage', 'rag_resources'];
    const errors = [];
    products.forEach((p, i) => {
      required.forEach(field => {
        if (!p[field]) errors.push(`Product ${i + 1} (${p.id || '?'}): missing field "${field}"`);
      });
    });
    if (errors.length === 0) {
      el.innerHTML = `<span style="color:#16a34a;font-weight:700">✅ All ${products.length} products valid.</span>`;
    } else {
      el.innerHTML = `<span style="color:#dc2626;font-weight:700">❌ ${errors.length} error(s):</span><ul style="margin-top:0.5rem;font-size:0.82rem;color:#dc2626">${errors.slice(0, 20).map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul>`;
    }
  } catch (e) {
    el.textContent = 'Error: ' + e.message;
  }
}

async function exportAllData() {
  try {
    showLoader(true);
    const [p, f, s] = await Promise.all([
      githubAPI.getFile('data/products.json'),
      githubAPI.getFile('data/faqs.json'),
      githubAPI.getFile('data/site-settings.json'),
    ]);
    downloadFile('products.json', p.content, 'application/json');
    downloadFile('faqs.json', f.content, 'application/json');
    downloadFile('site-settings.json', s.content, 'application/json');
    showToast('success', 'All data files downloaded.');
  } catch (e) {
    showToast('error', 'Export failed: ' + e.message);
  } finally {
    showLoader(false);
  }
}

/* ===========================
   CONTENT TABS
=========================== */
function switchContentTab(tab) {
  document.querySelectorAll('#section-content .admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('#section-content .admin-sub-section').forEach(s => s.classList.toggle('active', s.id === 'content-' + tab));
}

function switchTrainingTab(tab) {
  document.querySelectorAll('#section-training .admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('#section-training .admin-sub-section').forEach(s => s.classList.toggle('active', s.id === 'training-' + tab));
}

/* ===========================
   INIT
=========================== */
document.addEventListener('DOMContentLoaded', async () => {
  // Check for existing session
  const token = sessionStorage.getItem('bb_admin_token');
  if (token) {
    try {
      const user = await validateToken(token);
      showAdminApp(user.login);
    } catch {
      sessionStorage.removeItem('bb_admin_token');
    }
  }
});
