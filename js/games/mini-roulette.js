// js/games/mini-roulette.js — 🎡 미니 룰렛
const MiniRoulette = {
  bet: 10,
  colors: ['🔴', '⚫', '🔴', '⚫', '🔴', '⚫', '🔴', '⚫', '🟢'],
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 0],
  spinning: false,

  start(container) {
    CasinoFx.startBgm();
    const cells = MiniRoulette.numbers.map((n, i) =>
      `<div class="rl-cell" data-idx="${i}">${MiniRoulette.colors[i]} ${n}</div>`
    ).join('');

    container.innerHTML = `
      <div class="mini-game-screen">
        <div class="mini-game-header">
          <span class="coin-display"></span>
          <span class="mini-game-title">🎡 ROULETTE</span>
        </div>
        <div class="game-rule">RED/BLACK 맞추면 x2! GREEN 맞추면 x9! 색을 골라 베팅!</div>
        <div class="rl-board">${cells}</div>
        <div class="bet-controls">
          <button class="bet-btn" data-change="-5">◀</button>
          <span class="bet-amount">BET: <span id="rl-bet">${MiniRoulette.bet}</span></span>
          <button class="bet-btn" data-change="5">▶</button>
        </div>
        <div class="rl-pick-row">
          <button class="rl-pick-btn" data-pick="red">🔴 RED x2</button>
          <button class="rl-pick-btn" data-pick="black">⚫ BLACK x2</button>
          <button class="rl-pick-btn" data-pick="green">🟢 GREEN x9</button>
        </div>
        <div id="rl-result" class="game-result"></div>
        <button class="pixel-btn-text mini-back">[ BACK ]</button>
      </div>`;
    Coins.updateUI();

    container.querySelectorAll('.bet-btn').forEach(b => {
      b.addEventListener('click', () => {
        CasinoFx.sfx('bet');
        MiniRoulette.bet = Math.max(5, Math.min(50, MiniRoulette.bet + parseInt(b.dataset.change)));
        document.getElementById('rl-bet').textContent = MiniRoulette.bet;
      });
    });

    container.querySelectorAll('.rl-pick-btn').forEach(b => {
      b.addEventListener('click', () => MiniRoulette.spin(b.dataset.pick));
    });

    container.querySelector('.mini-back').addEventListener('click', () => MiniGames.showMenu());
  },

  async spin(pick) {
    if (MiniRoulette.spinning) return;
    const result = document.getElementById('rl-result');
    if (!Coins.spend(MiniRoulette.bet)) {
      result.textContent = '코인이 부족해요!';
      result.className = 'game-result lose';
      CasinoFx.sfx('lose');
      return;
    }
    MiniRoulette.spinning = true;
    result.textContent = '';

    const cells = document.querySelectorAll('.rl-cell');
    cells.forEach(c => c.classList.remove('rl-active'));

    // 룰렛 회전 애니메이션
    const totalTicks = 25 + Math.floor(Math.random() * 15);
    const finalIdx = Math.floor(Math.random() * MiniRoulette.numbers.length);
    let current = 0;

    for (let t = 0; t < totalTicks; t++) {
      const idx = t < totalTicks - 1
        ? (current + t) % cells.length
        : finalIdx;
      await new Promise(r => {
        const delay = 50 + (t > totalTicks - 8 ? (t - (totalTicks - 8)) * 40 : 0);
        setTimeout(() => {
          cells.forEach(c => c.classList.remove('rl-active'));
          cells[idx].classList.add('rl-active');
          CasinoFx.sfx('roulette-tick');
          r();
        }, delay);
      });
    }

    // 판정
    const landed = finalIdx;
    const landedColor = landed === 8 ? 'green' : (landed % 2 === 0 ? 'red' : 'black');

    if (pick === landedColor) {
      const multi = landedColor === 'green' ? 9 : 2;
      const payout = MiniRoulette.bet * multi;
      Coins.add(payout);
      result.textContent = `🎉 ${MiniRoulette.colors[landed]} ${MiniRoulette.numbers[landed]}! +${payout} COINS!`;
      result.className = 'game-result win';
      CasinoFx.sfx(landedColor === 'green' ? 'jackpot' : 'win');
    } else {
      result.textContent = `${MiniRoulette.colors[landed]} ${MiniRoulette.numbers[landed]} — MISS!`;
      result.className = 'game-result lose';
      CasinoFx.sfx('lose');
    }
    MiniRoulette.spinning = false;
  }
};
