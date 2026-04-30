// js/games/dice.js — 🎲 주사위 언더/오버
const Dice = {
  bet: 10,
  faces: ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'],

  start(container) {
    CasinoFx.startBgm();
    container.innerHTML = `
      <div class="mini-game-screen">
        <div class="mini-game-header">
          <span class="coin-display"></span>
          <span class="mini-game-title">🎲 UNDER / OVER</span>
        </div>
        <div class="game-rule">주사위 2개의 합이 7보다 작으면 UNDER, 크면 OVER! 딱 7이면 x5!</div>
        <div class="dice-area">
          <span class="dice-face" id="die-0">⚀</span>
          <span class="dice-face" id="die-1">⚀</span>
        </div>
        <div class="dice-sum">SUM: <span id="dice-sum">—</span></div>
        <div class="bet-controls">
          <button class="bet-btn" data-change="-5">◀</button>
          <span class="bet-amount">BET: <span id="dice-bet">${Dice.bet}</span></span>
          <button class="bet-btn" data-change="5">▶</button>
        </div>
        <div id="dice-result" class="game-result">SUM이 7 기준 UNDER/OVER/LUCKY7!</div>
        <div class="dice-picks">
          <button class="dice-pick-btn" data-pick="under">⬇️ UNDER 7<br><small>x2</small></button>
          <button class="dice-pick-btn dice-pick-seven" data-pick="seven">7️⃣ LUCKY 7<br><small>x5</small></button>
          <button class="dice-pick-btn" data-pick="over">⬆️ OVER 7<br><small>x2</small></button>
        </div>
        <button class="pixel-btn-text mini-back">[ BACK ]</button>
      </div>`;
    Coins.updateUI();

    container.querySelectorAll('.bet-btn').forEach(b => {
      b.addEventListener('click', () => {
        CasinoFx.sfx('bet');
        Dice.bet = Math.max(5, Math.min(50, Dice.bet + parseInt(b.dataset.change)));
        document.getElementById('dice-bet').textContent = Dice.bet;
      });
    });

    container.querySelectorAll('.dice-pick-btn').forEach(b => {
      b.addEventListener('click', () => Dice.roll(b.dataset.pick));
    });
    container.querySelector('.mini-back').addEventListener('click', () => MiniGames.showMenu());
  },

  async roll(pick) {
    const result = document.getElementById('dice-result');
    if (!Coins.spend(Dice.bet)) {
      result.textContent = '코인이 부족해요!';
      result.className = 'game-result lose';
      CasinoFx.sfx('lose');
      return;
    }

    const btns = document.querySelectorAll('.dice-pick-btn');
    btns.forEach(b => b.disabled = true);

    CasinoFx.sfx('dice');
    const d0 = document.getElementById('die-0');
    const d1 = document.getElementById('die-1');
    const sumEl = document.getElementById('dice-sum');

    // 굴리기 애니메이션
    for (let i = 0; i < 12; i++) {
      await new Promise(r => setTimeout(r, 60 + i * 15));
      d0.textContent = Dice.faces[Math.floor(Math.random() * 6)];
      d1.textContent = Dice.faces[Math.floor(Math.random() * 6)];
      d0.classList.add('dice-shake');
      d1.classList.add('dice-shake');
    }

    const v0 = Math.floor(Math.random() * 6) + 1;
    const v1 = Math.floor(Math.random() * 6) + 1;
    d0.textContent = Dice.faces[v0 - 1];
    d1.textContent = Dice.faces[v1 - 1];
    d0.classList.remove('dice-shake');
    d1.classList.remove('dice-shake');

    const sum = v0 + v1;
    sumEl.textContent = sum;

    const actual = sum < 7 ? 'under' : sum === 7 ? 'seven' : 'over';

    if (pick === actual) {
      const multi = actual === 'seven' ? 5 : 2;
      const payout = Dice.bet * multi;
      Coins.add(payout);
      result.textContent = actual === 'seven'
        ? `🎉 LUCKY 7! +${payout} COINS!`
        : `✨ ${actual.toUpperCase()}! +${payout} COINS`;
      result.className = 'game-result win';
      CasinoFx.sfx(actual === 'seven' ? 'jackpot' : 'win');
    } else {
      result.textContent = `💀 ${sum} — ${actual.toUpperCase()}! MISS`;
      result.className = 'game-result lose';
      CasinoFx.sfx('lose');
    }

    btns.forEach(b => b.disabled = false);
  }
};
