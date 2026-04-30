// js/admin.js
const Admin = {
  editingId: null,

  async login() {
    const pw = document.getElementById('admin-password').value;
    const errEl = document.getElementById('login-error');
    errEl.classList.add('hidden');

    if (!pw) return;

    let res;
    try {
      res = await Api.getQuestions(pw);
    } catch {
      errEl.textContent = 'NETWORK ERROR';
      errEl.classList.remove('hidden');
      return;
    }
    if (!res.ok) {
      errEl.textContent = 'ACCESS DENIED';
      errEl.classList.remove('hidden');
      document.getElementById('admin-password').value = '';
      return;
    }

    App.adminPassword = pw;
    document.getElementById('admin-password').value = '';
    Admin.renderDashboard(res.questions);
    Admin.loadLeaderboard();
    App.showScreen('screen-admin-dash');
  },

  async loadDashboard() {
    try {
      const res = await Api.getQuestions(App.adminPassword);
      if (res.ok) Admin.renderDashboard(res.questions);
    } catch {
      document.getElementById('question-list').innerHTML =
        '<div style="font-size:8px;color:var(--red);text-align:center;padding:20px">NETWORK ERROR — REFRESH</div>';
    }
  },

  renderDashboard(questions) {
    const total = questions.length;
    const drawn = questions.filter(q => q.drawn).length;

    document.getElementById('question-stats').innerHTML =
      `TOTAL: ${total} &nbsp;|&nbsp; DRAWN: ${drawn} &nbsp;|&nbsp; LEFT: ${total - drawn}`;

    const list = document.getElementById('question-list');
    list.innerHTML = '';

    if (total === 0) {
      list.innerHTML = '<div style="font-size:8px;color:var(--text-dimmer);text-align:center;padding:20px">NO QUESTIONS YET</div>';
      return;
    }

    // 미뽑힌 것 먼저, 그 다음 뽑힌 것
    const sorted = [...questions].sort((a, b) => (a.drawn ? 1 : 0) - (b.drawn ? 1 : 0));

    sorted.forEach(q => {
      const item = document.createElement('div');
      item.className = `q-item${q.drawn ? ' drawn' : ''}`;

      const timeAgo = Admin.timeAgo(q.submitted_at);
      item.innerHTML = `
        <div class="q-item-info">
          <div class="q-item-text">${Admin.escapeHtml(q.text)}</div>
          <div class="q-item-time">${timeAgo}${q.drawn ? ' · DRAWN' : ''}</div>
        </div>
        <div class="q-item-actions">
          <button class="q-btn edit" data-id="${q.id}">EDIT</button>
          <button class="q-btn del" data-id="${q.id}">DEL</button>
        </div>
      `;

      item.querySelector('.edit').addEventListener('click', () => Admin.openEdit(q.id, q.text));
      item.querySelector('.del').addEventListener('click', () => Admin.deleteQuestion(q.id));

      list.appendChild(item);
    });
  },

  async deleteQuestion(id) {
    if (!confirm('삭제할까요?')) return;
    const res = await Api.deleteQuestion(App.adminPassword, id);
    if (res.ok) Admin.loadDashboard();
  },

  openEdit(id, text) {
    Admin.editingId = id;
    document.getElementById('edit-input').value = text;
    document.getElementById('modal-edit').classList.remove('hidden');

    document.getElementById('modal-save').onclick = () => Admin.saveEdit();
    document.getElementById('modal-cancel').onclick = () => Admin.closeEdit();
  },

  async saveEdit() {
    const text = document.getElementById('edit-input').value.trim();
    if (!text) return;
    const res = await Api.updateQuestion(App.adminPassword, Admin.editingId, text);
    if (res.ok) {
      Admin.closeEdit();
      Admin.loadDashboard();
    }
  },

  closeEdit() {
    Admin.editingId = null;
    document.getElementById('modal-edit').classList.add('hidden');
  },

  escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  async loadLeaderboard() {
    const container = document.getElementById('admin-leaderboard');
    if (!container) return;
    container.innerHTML = '<div class="lb-loading">LOADING...</div>';

    try {
      const res = await Api.getLeaderboard();
      if (!res.ok || !res.leaderboard.length) {
        container.innerHTML = '<div class="lb-empty">NO PLAYERS YET</div>';
        return;
      }

      const medals = ['👑', '🥈', '🥉'];
      container.innerHTML = res.leaderboard.map((p, i) => {
        const rank = i < 3 ? medals[i] : `${i + 1}.`;
        return `<div class="lb-row${i < 3 ? ' lb-top' + (i + 1) : ''}">
          <span class="lb-rank">${rank}</span>
          <span class="lb-name">${Admin.escapeHtml(p.name)}</span>
          <span class="lb-coins">🪙 ${p.coins}</span>
        </div>`;
      }).join('');
    } catch {
      container.innerHTML = '<div class="lb-empty">NETWORK ERROR</div>';
    }
  },

  timeAgo(isoString) {
    if (!isoString) return '';
    const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
    if (diff < 60) return `${diff}초 전`;
    if (diff < 3600) return `${Math.floor(diff/60)}분 전`;
    return `${Math.floor(diff/3600)}시간 전`;
  }
};
