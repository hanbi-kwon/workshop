// js/games/slot-machine.js — 🎰 슬롯머신
const SlotMachine = {
  symbols: ['🍒', '🍋', '🔔', '⭐', '💎', '7️⃣', '🍀', '👑'],
  payouts: { '7️⃣': 50, '💎': 30, '👑': 25, '⭐': 15, '🔔': 10, '🍀': 8, '🍒': 5, '🍋': 3 },
  bet: 5,

  start(container) {
    CasinoFx.startBgm();
    container.innerHTML = `
      <div class="mini-game-screen">
        <div class="mini-game-header">
          <span class="coin-display"></span>
          <span class="mini-game-title">🎰 SLOT MACHINE</span>
        </div>
        <div class="game-rule">SPIN 누르면 릴이 돌아요. 3개 같으면 JACKPOT! 2개 같으면 x2!</div>
        <div class="slot-mg-machine">
          <div class="slot-mg-reel" id="reel-0"><span>${SlotMachine.symbols[0]}</span></div>
          <div class="slot-mg-reel" id="reel-1"><span>${SlotMachine.symbols[0]}</span></div>
          <div class="slot-mg-reel" id="reel-2"><span>${SlotMachine.symbols[0]}</span></div>
        </div>
        <div class="bet-controls">
          <button class="bet-btn" data-change="-5">◀</button>
          <span class="bet-amount">BET: <span id="slot-bet">${SlotMachine.bet}</span></span>
          <button class="bet-btn" data-change="5">▶</button>
        </div>
        <div id="slot-result" class="game-result"></div>
        <button id="slot-spin" class="pixel-btn yellow">▶ SPIN!</button>
        <button class="pixel-btn-text mini-back">[ BACK ]</button>
      </div>`;
    Coins.updateUI();

    container.querySelectorAll('.bet-btn').forEach(b => {
      b.addEventListener('click', () => {
        CasinoFx.sfx('bet');
        SlotMachine.bet = Math.max(5, Math.min(50, SlotMachine.bet + parseInt(b.dataset.change)));
        document.getElementById('slot-bet').textContent = SlotMachine.bet;
      });
    });

    document.getElementById('slot-spin').addEventListener('click', () => SlotMachine.spin());
    container.querySelector('.mini-back').addEventListener('click', () => MiniGames.showMenu());
  },

  async spin() {
    const btn = document.getElementById('slot-spin');
    const result = document.getElementById('slot-result');
    if (!Coins.spend(SlotMachine.bet)) {
      result.textContent = '코인이 부족해요!';
      result.className = 'game-result lose';
      CasinoFx.sfx('lose');
      return;
    }
    btn.disabled = true;
    result.textContent = '';
    CasinoFx.sfx('spin');

    const reels = [0, 1, 2].map(i => document.getElementById(`reel-${i}`));
    const results = [];

    for (let r = 0; r < 3; r++) {
      const reel = reels[r];
      let ticks = 15 + r * 5;
      await new Promise(resolve => {
        let count = 0;
        const iv = setInterval(() => {
          const sym = SlotMachine.symbols[Math.floor(Math.random() * SlotMachine.symbols.length)];
          reel.querySelector('span').textContent = sym;
          reel.classList.add('slot-mg-tick');
          setTimeout(() => reel.classList.remove('slot-mg-tick'), 40);
          count++;
          if (count >= ticks) {
            clearInterval(iv);
            const final = SlotMachine.symbols[Math.floor(Math.random() * SlotMachine.symbols.length)];
            reel.querySelector('span').textContent = final;
            results.push(final);
            CasinoFx.sfx('bet');
            resolve();
          }
        }, 60);
      });
    }

    // 판정
    if (results[0] === results[1] && results[1] === results[2]) {
      const payout = (SlotMachine.payouts[results[0]] || 5) * SlotMachine.bet;
      Coins.add(payout);
      result.textContent = `🎉 JACKPOT! +${payout} COINS!`;
      result.className = 'game-result win';
      CasinoFx.sfx('jackpot');
    } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
      const payout = SlotMachine.bet * 2;
      Coins.add(payout);
      result.textContent = `✨ 2 MATCH! +${payout} COINS`;
      result.className = 'game-result win';
      CasinoFx.sfx('win');
    } else {
      result.textContent = `💨 NO MATCH...`;
      result.className = 'game-result lose';
      CasinoFx.sfx('lose');
    }
    btn.disabled = false;
  }
};
