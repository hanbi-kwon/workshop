// js/app.js
const App = {
  adminPassword: null,
  currentMode: null,
  drawnCount: 0,
  totalCount: 0,

  showScreen(id) {
    Fx.glitch();
    Fx.sfx('click');
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });
    const target = document.getElementById(id);
    if (!target) { console.error('showScreen: no element with id', id); return; }
    target.classList.remove('hidden');
    target.classList.add('active');
  },

  init() {
    // 제출 화면
    const input = document.getElementById('question-input');
    const charCount = document.getElementById('char-count');
    const submitBtn = document.getElementById('submit-btn');
    const submitMsg = document.getElementById('submit-msg');

    input.addEventListener('input', () => {
      charCount.textContent = `${input.value.length} / 200`;
    });

    submitBtn.addEventListener('click', async () => {
      const text = input.value.trim();
      if (!text) return;
      submitMsg.className = 'submit-msg hidden';
      Fx.btnLoading(submitBtn, submitBtn.textContent);
      try {
        const res = await Api.submit(text);
        if (res.ok) {
          input.value = '';
          charCount.textContent = '0 / 200';
          submitMsg.textContent = '✓ 질문이 전달됐어요!';
          submitMsg.className = 'submit-msg success';
          Fx.flash('#22c55e');
          Fx.sfx('submit');
        } else {
          submitMsg.textContent = '✗ 오류가 발생했어요. 다시 시도해주세요.';
          submitMsg.className = 'submit-msg error';
          Fx.sfx('error');
        }
      } catch {
        submitMsg.textContent = '✗ 네트워크 오류입니다.';
        submitMsg.className = 'submit-msg error';
        Fx.sfx('error');
      }
      Fx.btnDone(submitBtn);
      // 5초 쿨다운
      submitBtn.disabled = true;
      setTimeout(() => { submitBtn.disabled = false; }, 5000);
    });

    document.getElementById('game-start-link').addEventListener('click', () => {
      App.showScreen('screen-mode-select');
    });

    document.getElementById('casino-link').addEventListener('click', () => {
      MiniGames.showMenu();
    });

    document.getElementById('admin-link').addEventListener('click', () => {
      App.showScreen('screen-admin-login');
    });

    // 관리자 로그인
    document.getElementById('admin-login-btn').addEventListener('click', () => Admin.login());
    document.getElementById('admin-password').addEventListener('keydown', e => {
      if (e.key === 'Enter') Admin.login();
    });
    document.getElementById('back-to-submit').addEventListener('click', () => {
      App.showScreen('screen-submit');
    });

    // 관리자 대시보드
    document.getElementById('admin-logout').addEventListener('click', () => {
      App.adminPassword = null;
      App.showScreen('screen-submit');
    });

    document.getElementById('lb-refresh-btn').addEventListener('click', () => {
      Admin.loadLeaderboard();
    });

    // 모드 선택
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        App.currentMode = btn.dataset.mode;
        App.startDraw();
      });
    });
    document.getElementById('back-to-home').addEventListener('click', () => {
      App.showScreen('screen-submit');
    });

    // 공개 화면
    document.getElementById('next-draw-btn').addEventListener('click', () => App.startDraw());
    document.getElementById('change-mode-btn').addEventListener('click', () => {
      App.showScreen('screen-mode-select');
    });

    // 전체화면 버튼 동적 추가
    const fsBtn = document.createElement('button');
    fsBtn.className = 'fullscreen-btn';
    fsBtn.textContent = '[ FULLSCREEN ]';
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    });
    document.body.appendChild(fsBtn);

    // BGM 토글 버튼
    const bgmBtn = document.createElement('button');
    bgmBtn.className = 'bgm-btn';
    bgmBtn.textContent = '♪ OFF';
    bgmBtn.addEventListener('click', () => {
      const playing = Fx.toggleBgm();
      bgmBtn.textContent = playing ? '♪ ON' : '♪ OFF';
    });
    document.body.appendChild(bgmBtn);
  },

  async startDraw() {
    App.showScreen('screen-draw');
    const drawContent = document.getElementById('draw-content');
    drawContent.innerHTML = '';

    const mode = App.currentMode;
    const drawFn = { slot: Slot.start, roulette: Roulette.start, card: Card.start, shake: Shake.start }[mode];
    if (drawFn) drawFn(drawContent);
  },

  showReveal(text, drawn, total) {
    App.drawnCount = drawn;
    App.totalCount = total;
    document.getElementById('revealed-question').textContent = `"${text}"`;
    document.getElementById('reveal-progress').textContent = `Q.${drawn} / ${total}  |  REMAIN: ${total - drawn}`;
    Fx.flash('#6366f1');
    App.showScreen('screen-reveal');
    Fx.sfx('reveal');
    Fx.revealEntrance();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
