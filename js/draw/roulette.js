// js/draw/roulette.js
const Roulette = {
  rafId: null,

  async start(container) {
    container.innerHTML = `
      <div class="roulette-screen">
        <div class="retro-title" style="font-size:35px">🎡 ROULETTE</div>
        <div class="roulette-wrap">
          <canvas id="roulette-canvas" class="roulette-canvas" width="650" height="650"></canvas>
          <div class="roulette-pointer">▼</div>
        </div>
        <div id="roulette-label" style="font-size:20px;color:var(--text-dim);text-align:center">SPIN을 눌러주세요</div>
        <button id="roulette-spin-btn" class="pixel-btn" style="max-width:550px">▶ SPIN!</button>
        <button id="roulette-back" class="pixel-btn-text">[ CHANGE MODE ]</button>
      </div>
    `;

    document.getElementById('roulette-back').addEventListener('click', () => {
      Roulette.cleanup();
      App.showScreen('screen-mode-select');
    });
    document.getElementById('roulette-spin-btn').addEventListener('click', () => Roulette.spin());

    // 초기 원판 그리기 (빈 칸으로)
    Roulette.draw(0, 8);
  },

  cleanup() {
    if (Roulette.rafId) {
      cancelAnimationFrame(Roulette.rafId);
      Roulette.rafId = null;
    }
  },

  draw(angle, segments) {
    const canvas = document.getElementById('roulette-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 325, cy = 325, r = 300;
    const colors = ['#3730a3','#4f46e5','#6366f1','#818cf8','#4338ca','#5b21b6','#7c3aed','#6d28d9'];
    const segAngle = (Math.PI * 2) / segments;

    ctx.clearRect(0, 0, 650, 650);

    for (let i = 0; i < segments; i++) {
      const start = angle + i * segAngle;
      const end = start + segAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#0a0a0f';
      ctx.lineWidth = 5;
      ctx.stroke();

      // 구분선 (픽셀 느낌)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(start), cy + r * Math.sin(start));
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 8;
      ctx.stroke();
    }

    // 중심 원
    ctx.beginPath();
    ctx.arc(cx, cy, 35, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0f';
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 8;
    ctx.stroke();
  },

  async spin() {
    const btn = document.getElementById('roulette-spin-btn');
    const label = document.getElementById('roulette-label');
    btn.disabled = true;
    label.textContent = 'SPINNING...';

    let res;
    try {
      res = await Api.drawQuestion();
    } catch {
      label.textContent = 'NETWORK ERROR — TRY AGAIN';
      btn.disabled = false;
      return;
    }

    if (!res.ok) {
      if (res.error === 'NO_MORE_QUESTIONS') label.textContent = '★ ALL DRAWN! ★';
      btn.disabled = false;
      return;
    }

    // 스핀 애니메이션
    const segments = 8;
    const duration = 3000;
    const totalRotation = Math.PI * 2 * 5 + Math.random() * Math.PI * 2; // 5바퀴 + 랜덤
    const startTime = Date.now();
    let current = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      current = totalRotation * eased;

      Roulette.draw(current, segments);

      if (progress < 1) {
        Roulette.rafId = requestAnimationFrame(animate);
      } else {
        Roulette.rafId = null;
        setTimeout(() => App.showReveal(res.question.text, res.drawn, res.total), 500);
      }
    };

    Roulette.rafId = requestAnimationFrame(animate);
  }
};
