// js/draw/shake.js
const Shake = {
  motionListener: null,
  lastShakeTime: 0,

  async start(container) {
    container.innerHTML = `
      <div class="shake-screen">
        <div class="retro-title" style="font-size:14px">🎲 SHAKE!</div>
        <div class="shake-pot" id="shake-pot">🏮</div>
        <div class="shake-hint">버튼을 누르거나<br>폰을 흔들어주세요!</div>
        <button id="shake-btn" class="pixel-btn" style="max-width:220px">🎲 SHAKE!</button>
        <button id="shake-back" class="pixel-btn-text">[ CHANGE MODE ]</button>
      </div>
    `;

    document.getElementById('shake-back').addEventListener('click', () => {
      Shake.cleanup();
      App.showScreen('screen-mode-select');
    });

    document.getElementById('shake-btn').addEventListener('click', () => Shake.trigger());

    // 모바일 흔들기 감지
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS 13+ 권한 요청
      DeviceMotionEvent.requestPermission().then(state => {
        if (state === 'granted') Shake.setupMotion();
      }).catch(() => {});
    } else if (window.DeviceMotionEvent) {
      Shake.setupMotion();
    }
  },

  setupMotion() {
    let lastAcc = { x: 0, y: 0, z: 0 };
    Shake.motionListener = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const delta = Math.abs(acc.x - lastAcc.x) + Math.abs(acc.y - lastAcc.y) + Math.abs(acc.z - lastAcc.z);
      lastAcc = { x: acc.x, y: acc.y, z: acc.z };
      const now = Date.now();
      if (delta > 25 && now - Shake.lastShakeTime > 2000) {
        Shake.lastShakeTime = now;
        Shake.trigger();
      }
    };
    window.addEventListener('devicemotion', Shake.motionListener);
  },

  cleanup() {
    if (Shake.motionListener) {
      window.removeEventListener('devicemotion', Shake.motionListener);
      Shake.motionListener = null;
    }
  },

  async trigger() {
    const btn = document.getElementById('shake-btn');
    const pot = document.getElementById('shake-pot');
    if (!btn || !pot) return;

    btn.disabled = true;
    pot.classList.add('shaking');

    await new Promise(r => setTimeout(r, 600));
    pot.classList.remove('shaking');

    const res = await Api.drawQuestion(App.adminPassword);

    if (!res.ok) {
      if (res.error === 'NO_MORE_QUESTIONS') {
        pot.textContent = '🎊';
        document.querySelector('.shake-hint').textContent = '★ ALL QUESTIONS DRAWN! ★';
      }
      btn.disabled = false;
      return;
    }

    Shake.cleanup();
    App.showReveal(res.question.text, res.drawn, res.total);
  }
};
