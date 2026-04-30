// js/games/coins.js — 코인 시스템 + 닉네임 + 서버 동기화
const Coins = {
  KEY: 'workshop-coins',
  NAME_KEY: 'workshop-nickname',
  _syncTimer: null,
  _dirty: false,

  get() { return parseInt(localStorage.getItem(Coins.KEY) || '100', 10); },
  set(n) {
    localStorage.setItem(Coins.KEY, Math.max(0, n));
    Coins.updateUI();
    Coins._dirty = true;
    Coins._scheduleSave();
  },
  add(n) { Coins.set(Coins.get() + n); },
  spend(n) { const c = Coins.get(); if (c < n) return false; Coins.set(c - n); return true; },
  reset() { Coins.set(100); Coins.syncNow(); },

  // ── 닉네임 ──
  getName() { return localStorage.getItem(Coins.NAME_KEY) || ''; },
  setName(name) { localStorage.setItem(Coins.NAME_KEY, name); Coins.syncNow(); },

  randomName() {
    const adj = ['용감한','귀여운','빠른','졸린','배고픈','신나는','멋진','웃긴','조용한','뜨거운','차가운','거대한','작은','느긋한','똑똑한','수상한','엉뚱한','반짝이는','무적의','전설의'];
    const animal = ['고양이','강아지','토끼','판다','펭귄','여우','곰','사자','호랑이','용','독수리','다람쥐','해달','코알라','햄스터','거북이','올빼미','돌고래','유니콘','치타'];
    const a = adj[Math.floor(Math.random() * adj.length)];
    const b = animal[Math.floor(Math.random() * animal.length)];
    const n = Math.floor(Math.random() * 100);
    return `${a}${b}${n}`;
  },

  updateUI() {
    document.querySelectorAll('.coin-display').forEach(el => {
      el.textContent = '🪙 ' + Coins.get();
    });
    document.querySelectorAll('.name-display').forEach(el => {
      el.textContent = Coins.getName() || '???';
    });
  },

  // ── 서버 동기화 (디바운스 3초) ──
  _scheduleSave() {
    if (Coins._syncTimer) return;
    Coins._syncTimer = setTimeout(() => {
      Coins._syncTimer = null;
      if (Coins._dirty) Coins.syncNow();
    }, 3000);
  },

  async syncNow() {
    const name = Coins.getName();
    if (!name) return;
    Coins._dirty = false;
    try {
      await Api.saveScore(name, Coins.get());
    } catch (e) {
      // 실패해도 로컬은 유지
    }
  },

  // ── 닉네임 입력 모달 ──
  promptName() {
    return new Promise(resolve => {
      const existing = Coins.getName();
      const overlay = document.createElement('div');
      overlay.className = 'modal';
      overlay.innerHTML = `
        <div class="modal-box">
          <h2 class="retro-title small">ENTER NAME</h2>
          <input id="name-input" class="pixel-input" type="text" maxlength="20"
            placeholder="닉네임" value="${existing}" style="min-height:auto;font-size:28px;padding:20px;">
          <button id="name-random" class="pixel-btn-text">🎲 RANDOM</button>
          <div class="modal-buttons">
            <button id="name-ok" class="pixel-btn green">OK</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);

      const input = document.getElementById('name-input');
      if (!existing) input.value = Coins.randomName();

      document.getElementById('name-random').addEventListener('click', () => {
        input.value = Coins.randomName();
        CasinoFx.sfx('flip');
      });

      document.getElementById('name-ok').addEventListener('click', () => {
        const name = input.value.trim();
        if (!name) return;
        Coins.setName(name);
        overlay.remove();
        resolve(name);
      });
    });
  }
};
