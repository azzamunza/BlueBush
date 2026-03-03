/* ===== BlueBush Admin — Training Data Manager ===== */

const adminTraining = {
  entries: [],        // Parsed JSONL entries (array of objects)
  rawLines: [],       // Raw string lines from JSONL
  fileSha: null,      // GitHub SHA for write-back
  currentPage: 1,
  pageSize: 50,
  searchQuery: '',
  filterType: '',

  SYSTEM_PROMPT: `You are Bilby, the friendly and knowledgeable AI assistant for BlueBush — a premium sustainable Australian homewares brand. You help customers find the perfect products, answer questions about materials and care, and share BlueBush's commitment to sustainability. Always be warm, helpful, and authentically Australian in your tone.`,

  /** Load and parse the JSONL file via GitHub API */
  async load() {
    this.renderLoader();
    try {
      const { content, sha } = await githubAPI.getFile('training/bluebush-training.jsonl');
      this.fileSha = sha;
      this.rawLines = content.split('\n').filter(l => l.trim());
      this.entries = this.rawLines.map((line, i) => {
        try { return { _index: i, ...JSON.parse(line) }; }
        catch { return { _index: i, _invalid: true, _raw: line }; }
      });
      this.renderOverview();
      this.renderBrowser();
      this.renderTodos();
    } catch (e) {
      document.getElementById('training-browser-body').innerHTML =
        `<tr><td colspan="6" class="text-muted" style="padding:2rem;text-align:center">Failed to load training data: ${escapeHtml(e.message)}</td></tr>`;
      showToast('error', 'Failed to load training data.');
    }
  },

  renderLoader() {
    document.getElementById('training-browser-body').innerHTML =
      '<tr class="loading-row"><td colspan="6"><div class="spinner"></div></td></tr>';
  },

  /** Filter entries based on current search and type filter */
  filteredEntries() {
    let entries = this.entries.filter(e => !e._invalid);
    const q = this.searchQuery.toLowerCase();
    if (q) {
      entries = entries.filter(e =>
        (e.messages || []).some(m => (m.content || '').toLowerCase().includes(q))
      );
    }
    if (this.filterType) {
      entries = entries.filter(e => this.detectType(e) === this.filterType);
    }
    return entries;
  },

  /** Detect entry type from content */
  detectType(entry) {
    const text = (entry.messages || []).map(m => m.content || '').join(' ');
    if (text.includes('TODO')) return 'PersonaPlex / TODO';
    if (/[A-Z]{2,5}-\d{3}/.test(text)) return 'Product Knowledge';
    if (/\.(png|jpg|jpeg|webp)/i.test(text)) return 'Image Metadata';
    const supportWords = ['shipping', 'return', 'payment', 'order', 'refund', 'track'];
    if (supportWords.some(w => text.toLowerCase().includes(w))) return 'Support Scenario';
    const catWords = ['bedroom', 'bathroom', 'kitchen', 'dining', 'living', 'outdoor', 'tech'];
    if (catWords.some(w => text.toLowerCase().includes(w))) return 'Category Overview';
    return 'General';
  },

  /** Render the dataset overview card */
  renderOverview() {
    const total = this.entries.filter(e => !e._invalid).length;
    const todos = this.entries.filter(e => !e._invalid &&
      (e.messages || []).some(m => (m.content || '').includes('TODO'))).length;
    const el = document.getElementById('training-overview-stats');
    if (!el) return;
    el.innerHTML = `
      <div class="stats-grid" style="margin-bottom:0">
        <div class="stat-card">
          <div class="stat-icon blue"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"/></svg></div>
          <div><div class="stat-label">Total Entries</div><div class="stat-value">${total}</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
          <div><div class="stat-label">Format</div><div class="stat-value" style="font-size:1.1rem">JSONL</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon amber"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg></div>
          <div><div class="stat-label">TODO Entries</div><div class="stat-value" style="color:#b45309">${todos}</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue"><svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg></div>
          <div><div class="stat-label">Last Updated</div><div class="stat-value" style="font-size:1.1rem">2026-03-01</div></div>
        </div>
      </div>
      <div class="admin-card mt-2" style="background:#fffbeb;border-color:#fde68a">
        <div class="admin-card-title" style="color:#92400e">⚠️ PersonaPlex TODO Notice</div>
        <p style="font-size:0.85rem;color:#92400e">This dataset contains <strong>${todos}</strong> placeholder entries marked with TODO that require completion for the NVIDIA PersonaPlex integration. Use the TODO Tracker sub-section to review and resolve these entries before production use.</p>
      </div>`;
  },

  /** Render the paginated entry browser */
  renderBrowser() {
    const filtered = this.filteredEntries();
    const totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    if (this.currentPage > totalPages) this.currentPage = 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const page = filtered.slice(start, start + this.pageSize);

    const tbody = document.getElementById('training-browser-body');
    if (!tbody) return;

    if (page.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">No entries found</div><div class="empty-state-desc">Try adjusting your search or filter.</div></div></td></tr>';
    } else {
      tbody.innerHTML = page.map(e => {
        const msgs = e.messages || [];
        const userMsg = msgs.find(m => m.role === 'user');
        const asstMsg = msgs.find(m => m.role === 'assistant');
        const type = this.detectType(e);
        const hasTodo = (e.messages || []).some(m => (m.content || '').includes('TODO'));
        return `<tr>
          <td>${e._index + 1}</td>
          <td class="training-entry-user">${escapeHtml(truncate(userMsg?.content || '—', 80))}</td>
          <td class="training-entry-assistant">${escapeHtml(truncate(asstMsg?.content || '—', 80))}</td>
          <td><span class="badge ${typeColor(type)}">${escapeHtml(type)}</span>${hasTodo ? ' <span class="badge badge-amber">TODO</span>' : ''}</td>
          <td>
            <button class="btn-secondary btn-sm" onclick="adminTraining.openEntryModal(${e._index}, false)">View</button>
            <button class="btn-primary btn-sm" onclick="adminTraining.openEntryModal(${e._index}, true)">Edit</button>
          </td>
        </tr>`;
      }).join('');
    }

    // Pagination
    const pag = document.getElementById('training-pagination');
    if (pag) {
      pag.innerHTML = renderPagination(this.currentPage, totalPages, p => {
        this.currentPage = p;
        this.renderBrowser();
      });
    }

    // Update count
    const cnt = document.getElementById('training-count');
    if (cnt) cnt.textContent = `${filtered.length} entries`;
  },

  /** Render the TODO tracker */
  renderTodos() {
    const todos = this.entries.filter(e => !e._invalid &&
      (e.messages || []).some(m => (m.content || '').includes('TODO')));
    const el = document.getElementById('todo-list');
    if (!el) return;

    const counter = document.getElementById('todo-counter');
    if (counter) counter.textContent = `${todos.length} TODO entries remaining`;

    if (todos.length === 0) {
      el.innerHTML = '<div class="empty-state"><div class="empty-state-icon">✅</div><div class="empty-state-title">No TODO entries</div><div class="empty-state-desc">All placeholder entries have been resolved.</div></div>';
      return;
    }

    el.innerHTML = todos.map(e => {
      const allContent = (e.messages || []).map(m => m.content || '').join('\n');
      const todoLines = allContent.split('\n')
        .filter(l => l.includes('TODO'))
        .map(l => escapeHtml(l).replace(/TODO/g, '<span class="todo-highlight">TODO</span>'))
        .join('<br>');
      return `<div class="todo-item">
        <div class="todo-num">Entry #${e._index + 1}</div>
        <div class="todo-text">${todoLines}</div>
        <div class="todo-footer">
          <span class="badge badge-amber">Pending</span>
          <button class="btn-primary btn-sm" onclick="adminTraining.openEntryModal(${e._index}, true)">Edit</button>
        </div>
      </div>`;
    }).join('');
  },

  /** Open entry view/edit modal */
  openEntryModal(index, editable) {
    const entry = this.entries.find(e => e._index === index);
    if (!entry) return;
    const msgs = entry.messages || [];
    const get = role => msgs.find(m => m.role === role)?.content || '';

    document.getElementById('modal-entry-title').textContent =
      `${editable ? 'Edit' : 'View'} Entry #${index + 1}`;

    const roAttr = editable ? '' : 'readonly';
    document.getElementById('modal-entry-body').innerHTML = `
      <div class="form-group mb-2">
        <label class="form-label">System</label>
        <textarea id="me-system" class="form-textarea" style="min-height:80px" ${roAttr}>${escapeHtml(get('system'))}</textarea>
      </div>
      <div class="form-group mb-2">
        <label class="form-label">User</label>
        <textarea id="me-user" class="form-textarea" style="min-height:80px" ${roAttr}>${escapeHtml(get('user'))}</textarea>
      </div>
      <div class="form-group mb-2">
        <label class="form-label">Assistant</label>
        <textarea id="me-assistant" class="form-textarea" style="min-height:120px" ${roAttr}>${escapeHtml(get('assistant'))}</textarea>
      </div>`;

    const saveBtn = document.getElementById('modal-entry-save');
    const delBtn = document.getElementById('modal-entry-delete');
    if (saveBtn) {
      if (editable) {
        saveBtn.classList.remove('hidden');
        saveBtn.onclick = () => this.saveEntry(index);
      } else {
        saveBtn.classList.add('hidden');
      }
    }
    if (delBtn) {
      delBtn.onclick = () => this.deleteEntry(index);
    }

    openModal('training-entry-modal');
  },

  /** Open the "add new entry" modal */
  openAddModal() {
    document.getElementById('modal-entry-title').textContent = 'Add New Training Entry';
    document.getElementById('modal-entry-body').innerHTML = `
      <div class="form-group mb-2">
        <label class="form-label">System</label>
        <textarea id="me-system" class="form-textarea" style="min-height:80px">${escapeHtml(this.SYSTEM_PROMPT)}</textarea>
      </div>
      <div class="form-group mb-2">
        <label class="form-label">User</label>
        <textarea id="me-user" class="form-textarea" style="min-height:80px"></textarea>
      </div>
      <div class="form-group mb-2">
        <label class="form-label">Assistant</label>
        <textarea id="me-assistant" class="form-textarea" style="min-height:120px"></textarea>
      </div>`;

    const saveBtn = document.getElementById('modal-entry-save');
    const delBtn = document.getElementById('modal-entry-delete');
    if (saveBtn) {
      saveBtn.classList.remove('hidden');
      saveBtn.onclick = () => this.saveNewEntry();
    }
    if (delBtn) delBtn.classList.add('hidden');

    openModal('training-entry-modal');
  },

  /** Save changes to an existing entry */
  async saveEntry(index) {
    const system = document.getElementById('me-system')?.value || '';
    const user = document.getElementById('me-user')?.value || '';
    const assistant = document.getElementById('me-assistant')?.value || '';

    if (!user.trim() || !assistant.trim()) {
      showToast('error', 'User and Assistant messages are required.');
      return;
    }

    const entry = this.entries.find(e => e._index === index);
    if (!entry) return;

    const newObj = { messages: [] };
    if (system.trim()) newObj.messages.push({ role: 'system', content: system });
    newObj.messages.push({ role: 'user', content: user });
    newObj.messages.push({ role: 'assistant', content: assistant });

    this.rawLines[index] = JSON.stringify(newObj);
    this.entries[index] = { _index: index, ...newObj };

    await this._writeBack(`Training: Update entry #${index + 1}`);
    closeModal('training-entry-modal');
    this.renderBrowser();
    this.renderTodos();
  },

  /** Save a new entry */
  async saveNewEntry() {
    const system = document.getElementById('me-system')?.value || '';
    const user = document.getElementById('me-user')?.value || '';
    const assistant = document.getElementById('me-assistant')?.value || '';

    if (!user.trim() || !assistant.trim()) {
      showToast('error', 'User and Assistant messages are required.');
      return;
    }

    const newObj = { messages: [] };
    if (system.trim()) newObj.messages.push({ role: 'system', content: system });
    newObj.messages.push({ role: 'user', content: user });
    newObj.messages.push({ role: 'assistant', content: assistant });

    const newIndex = this.rawLines.length;
    this.rawLines.push(JSON.stringify(newObj));
    this.entries.push({ _index: newIndex, ...newObj });

    await this._writeBack('Training: Add new entry');
    closeModal('training-entry-modal');
    this.renderBrowser();
    this.renderOverview();
    this.renderTodos();
  },

  /** Delete an entry by index */
  async deleteEntry(index) {
    if (!confirm(`Delete training entry #${index + 1}? This cannot be undone.`)) return;
    this.rawLines.splice(index, 1);
    this.entries = this.rawLines.map((line, i) => {
      try { return { _index: i, ...JSON.parse(line) }; }
      catch { return { _index: i, _invalid: true, _raw: line }; }
    });
    await this._writeBack(`Training: Delete entry #${index + 1}`);
    closeModal('training-entry-modal');
    this.renderBrowser();
    this.renderOverview();
    this.renderTodos();
  },

  /** Write rawLines back to GitHub */
  async _writeBack(commitMessage) {
    try {
      showLoader(true);
      const content = this.rawLines.join('\n') + '\n';
      const result = await githubAPI.putFile(
        'training/bluebush-training.jsonl',
        content,
        this.fileSha,
        commitMessage
      );
      this.fileSha = result.content?.sha || this.fileSha;
      showToast('success', commitMessage);
    } catch (e) {
      showToast('error', `Save failed: ${e.message}`);
      throw e;
    } finally {
      showLoader(false);
    }
  },

  /** Download JSONL as a file */
  downloadJSONL() {
    const content = this.rawLines.join('\n') + '\n';
    downloadFile('bluebush-training.jsonl', content, 'application/x-ndjson');
  },

  /** Copy dataset stats to clipboard */
  async copyStats() {
    const valid = this.entries.filter(e => !e._invalid);
    const todos = valid.filter(e =>
      (e.messages || []).some(m => (m.content || '').includes('TODO'))).length;
    const stats = `## BlueBush Training Dataset Stats

- **Total Entries:** ${valid.length}
- **Format:** JSONL (OpenAI Chat)
- **Schema Version:** 1.0
- **Products Covered:** 60
- **Support Scenarios:** 30+
- **TODO Entries (Pending):** ${todos}
- **Last Updated:** 2026-03-01
`;
    try {
      await navigator.clipboard.writeText(stats);
      showToast('success', 'Stats copied to clipboard.');
    } catch {
      showToast('error', 'Could not copy to clipboard.');
    }
  },

  /** Validate JSONL: check each line is valid JSON with messages array */
  validate() {
    const errors = [];
    this.rawLines.forEach((line, i) => {
      try {
        const obj = JSON.parse(line);
        if (!Array.isArray(obj.messages)) errors.push(`Line ${i + 1}: missing messages array`);
        else {
          obj.messages.forEach((m, j) => {
            if (!m.role) errors.push(`Line ${i + 1}, message ${j + 1}: missing role`);
            if (!m.content) errors.push(`Line ${i + 1}, message ${j + 1}: missing content`);
          });
        }
      } catch (e) {
        errors.push(`Line ${i + 1}: invalid JSON — ${e.message}`);
      }
    });
    const el = document.getElementById('training-validate-result');
    if (!el) return;
    if (errors.length === 0) {
      el.innerHTML = '<span style="color:#16a34a;font-weight:700">✅ All entries valid.</span>';
    } else {
      el.innerHTML = `<span style="color:#dc2626;font-weight:700">❌ ${errors.length} error(s):</span><ul style="margin-top:0.5rem;font-size:0.82rem;color:#dc2626">${errors.slice(0, 20).map(e => `<li>${escapeHtml(e)}</li>`).join('')}${errors.length > 20 ? `<li>…and ${errors.length - 20} more</li>` : ''}</ul>`;
    }
  }
};

/* ===== Helpers ===== */
function typeColor(type) {
  switch (type) {
    case 'Product Knowledge': return 'badge-green';
    case 'Support Scenario': return 'badge-blue';
    case 'Image Metadata': return 'badge-gray';
    case 'PersonaPlex / TODO': return 'badge-amber';
    case 'Category Overview': return 'badge-purple';
    default: return 'badge-gray';
  }
}
