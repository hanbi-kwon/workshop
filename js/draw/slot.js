// js/draw/slot.js
const Slot = {
  async start(container) {
    container.innerHTML = `
      <div class="slot-screen">
        <div class="retro-title slot-title">🎰 SLOT MACHINE</div>
        <div class="slot-arrows">▲▲▲</div>
        <div class="slot-machine">
          <div class="slot-reel" id="slot-reel"></div>
        </div>
        <div class="slot-arrows">▼▼▼</div>
        <button id="slot-spin-btn" class="pixel-btn" style="max-width:550px">▶ SPIN!</button>
        <button id="slot-back" class="pixel-btn-text">[ CHANGE MODE ]</button>
      </div>
    `;

    document.getElementById('slot-back').addEventListener('click', () => {
      App.showScreen('screen-mode-select');
    });

    document.getElementById('slot-spin-btn').addEventListener('click', () => Slot.spin());
  },

  escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  async spin() {
    const btn = document.getElementById('slot-spin-btn');
    btn.disabled = true;

    // 뽑기 API 호출
    let res;
    try {
      res = await Api.drawQuestion();
    } catch {
      btn.disabled = false;
      const screen = document.querySelector('.slot-screen');
      if (screen) screen.insertAdjacentHTML('beforeend',
        `<div style="font-size:8px;color:var(--red);text-align:center">NETWORK ERROR — TRY AGAIN</div>`);
      return;
    }

    if (!res.ok) {
      if (res.error === 'NO_MORE_QUESTIONS') {
        document.querySelector('.slot-screen').insertAdjacentHTML('beforeend',
          `<div style="font-size:9px;color:var(--green);text-align:center">★ ALL QUESTIONS DRAWN! ★</div>`);
      }
      btn.disabled = false;
      return;
    }

    // 더미 질문들로 릴 채우기 (시각적 효과)
    const dummies = [
      '회사 복지는?', '목표 달성률?', '채용 계획?', '비전은?',
      res.question.text, '연봉 인상?', '팀 확장?', res.question.text
    ];

    const reel = document.getElementById('slot-reel');
    reel.innerHTML = dummies.map((t, i) =>
      `<div class="slot-item${t === res.question.text && i === 4 ? ' selected' : ''}">${Slot.escapeHtml(t)}</div>`
    ).join('');

    // 초기 위치: 맨 아래에서 시작
    const itemHeight = 200;
    const targetIndex = 4; // 정답 위치
    reel.style.transition = 'none';
    reel.style.top = `-${(dummies.length - 1) * itemHeight}px`;

    await new Promise(r => setTimeout(r, 50));

    // 빠른 스크롤 → 감속 → 멈춤
    reel.style.transition = `top 2s cubic-bezier(0.23, 1, 0.32, 1)`;
    reel.style.top = `-${targetIndex * itemHeight}px`;

    await new Promise(r => setTimeout(r, 2200));

    App.showReveal(res.question.text, res.drawn, res.total);
  }
};
