// js/games/memory.js — 🃏 카드 짝맞추기
const Memory = {
  symbols: ['🍒', '🍋', '🔔', '⭐', '💎', '👑'],
  cards: [],
  flipped: [],
  matched: 0,
  tries: 0,
  locked: false,
  bet: 10,

  start(container) {
    CasinoFx.startBgm();
    Memory.matched = 0;
    Memory.tries = 0;
    Memory.flipped = [];
    Memory.locked = false;

    // 6쌍 = 12장, 셔플
    const deck = [...Memory.symbols, ...Memory.symbols];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    Memory.cards = deck;

    if (!Coins.spend(Memory.bet)) {
      container.innerHTML = `
        <div class="mini-game-screen">
          <div class="mini-game-header">
            <span class="coin-display"></span>
            <span class="mini-game-title">🃏 MEMORY</span>
          </div>
          <div class="game-result lose">코인이 부족해요!</div>
          <button class="pixel-btn-text mini-back">[ BACK ]</button>
        </div>`;
      Coins.updateUI();
      container.querySelector('.mini-back').addEventListener('click', () => MiniGames.showMenu());
      return;
    }

    const grid = deck.map((s, i) =>
      `<div class="mem-card" data-idx="${i}"><div class="mem-card-inner"><div class="mem-front">?</div><div class="mem-back">${s}</div></div></div>`
    ).join('');

    container.innerHTML = `
      <div class="mini-game-screen">
        <div class="mini-game-header">
          <span class="coin-display"></span>
          <span class="mini-game-title">🃏 MEMORY</span>
        </div>
        <div id="mem-info" class="game-result">FIND ALL 6 PAIRS!</div>
        <div class="mem-grid">${grid}</div>
        <button class="pixel-btn-text mini-back">[ BACK ]</button>
      </div>`;
    Coins.updateUI();

    container.querySelectorAll('.mem-card').forEach(c => {
      c.addEventListener('click', () => Memory.flipCard(c));
    });
    container.querySelector('.mini-back').addEventListener('click', () => MiniGames.showMenu());
  },

  flipCard(card) {
    if (Memory.locked) return;
    const idx = parseInt(card.dataset.idx);
    if (card.classList.contains('mem-flipped') || card.classList.contains('mem-matched')) return;

    CasinoFx.sfx('flip');
    card.classList.add('mem-flipped');
    Memory.flipped.push({ idx, card });

    if (Memory.flipped.length === 2) {
      Memory.locked = true;
      Memory.tries++;
      const [a, b] = Memory.flipped;

      if (Memory.cards[a.idx] === Memory.cards[b.idx]) {
        // 매치!
        CasinoFx.sfx('match');
        a.card.classList.add('mem-matched');
        b.card.classList.add('mem-matched');
        Memory.matched++;
        Memory.flipped = [];
        Memory.locked = false;

        if (Memory.matched === 6) {
          const info = document.getElementById('mem-info');
          // 보너스: 시도 횟수가 적을수록 더 많이
          let payout;
          if (Memory.tries <= 8) { payout = 100; CasinoFx.sfx('jackpot'); }
          else if (Memory.tries <= 12) { payout = 50; CasinoFx.sfx('win'); }
          else if (Memory.tries <= 18) { payout = 20; CasinoFx.sfx('win'); }
          else { payout = 10; CasinoFx.sfx('coin'); }
          Coins.add(payout);
          info.textContent = `🎉 CLEAR! ${Memory.tries} TRIES → +${payout} COINS!`;
          info.className = 'game-result win';
        }
      } else {
        // 불일치
        setTimeout(() => {
          a.card.classList.remove('mem-flipped');
          b.card.classList.remove('mem-flipped');
          Memory.flipped = [];
          Memory.locked = false;
        }, 600);
      }
    }
  }
};
