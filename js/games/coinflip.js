// js/games/coinflip.js — 🪙 동전 뒤집기 더블업
const CoinFlip = {
  bet: 10,
  pool: 0,
  streak: 0,

  start(container) {
    CasinoFx.startBgm();
    CoinFlip.pool = 0;
    CoinFlip.streak = 0;
    container.innerHTML = `
      <div class="mini-game-screen">
        <div class="mini-game-header">
          <span class="coin-display"></span>
          <span class="mini-game-title">🪙 COIN FLIP</span>
        </div>
        <div class="game-rule">앞(HEADS) 뒤(TAILS) 맞추면 x2! 계속 도전 or CASH OUT!</div>
        <div class="cf-coin" id="cf-coin">🪙</div>
        <div class="bet-controls" id="cf-bet-ctrl">
          <button class="bet-btn" data-change="-5">◀</button>
          <span class="bet-amount">BET: <span id="cf-bet">${CoinFlip.bet}</span></span>
          <button class="bet-btn" data-change="5">▶</button>
        </div>
        <div id="cf-result" class="game-result">HEADS OR TAILS?</div>
        <div class="cf-picks" id="cf-picks">
          <button class="cf-pick-btn" data-pick="heads">👑 HEADS</button>
          <button class="cf-pick-btn" data-pick="tails">🌿 TAILS</button>
        </div>
        <div id="cf-double" class="hidden">
          <button id="cf-cashout" class="pixel-btn green">💰 CASH OUT</button>
          <div class="cf-picks">
            <button class="cf-dbl-btn" data-pick="heads">👑 DOUBLE!</button>
            <button class="cf-dbl-btn" data-pick="tails">🌿 DOUBLE!</button>
          </div>
        </div>
        <button class="pixel-btn-text mini-back">[ BACK ]</button>
      </div>`;
    Coins.updateUI();

    container.querySelectorAll('.bet-btn').forEach(b => {
      b.addEventListener('click', () => {
        CasinoFx.sfx('bet');
        CoinFlip.bet = Math.max(5, Math.min(50, CoinFlip.bet + parseInt(b.dataset.change)));
        document.getElementById('cf-bet').textContent = CoinFlip.bet;
      });
    });

    container.querySelectorAll('.cf-pick-btn').forEach(b => {
      b.addEventListener('click', () => CoinFlip.flip(b.dataset.pick, false));
    });
    container.querySelectorAll('.cf-dbl-btn').forEach(b => {
      b.addEventListener('click', () => CoinFlip.flip(b.dataset.pick, true));
    });
    document.getElementById('cf-cashout').addEventListener('click', () => CoinFlip.cashout());
    container.querySelector('.mini-back').addEventListener('click', () => MiniGames.showMenu());
  },

  async flip(pick, isDouble) {
    const coin = document.getElementById('cf-coin');
    const result = document.getElementById('cf-result');

    if (!isDouble) {
      if (!Coins.spend(CoinFlip.bet)) {
        result.textContent = '코인이 부족해요!';
        result.className = 'game-result lose';
        CasinoFx.sfx('lose');
        return;
      }
      CoinFlip.pool = CoinFlip.bet;
    }

    CasinoFx.sfx('flip');
    coin.classList.add('cf-flipping');
    await new Promise(r => setTimeout(r, 600));

    const landed = Math.random() < 0.5 ? 'heads' : 'tails';
    coin.textContent = landed === 'heads' ? '👑' : '🌿';
    coin.classList.remove('cf-flipping');

    if (pick === landed) {
      CoinFlip.pool *= 2;
      CoinFlip.streak++;
      result.textContent = `🔥 ${landed.toUpperCase()}! x${CoinFlip.streak} POOL: ${CoinFlip.pool}`;
      result.className = 'game-result win';
      CasinoFx.sfx('win');
      document.getElementById('cf-picks').classList.add('hidden');
      document.getElementById('cf-bet-ctrl').classList.add('hidden');
      document.getElementById('cf-double').classList.remove('hidden');
    } else {
      result.textContent = `💀 ${landed.toUpperCase()}! -${CoinFlip.pool}`;
      result.className = 'game-result lose';
      CasinoFx.sfx('lose');
      CoinFlip.pool = 0;
      CoinFlip.streak = 0;
      document.getElementById('cf-picks').classList.remove('hidden');
      document.getElementById('cf-bet-ctrl').classList.remove('hidden');
      document.getElementById('cf-double').classList.add('hidden');
      coin.textContent = '🪙';
    }
  },

  cashout() {
    const result = document.getElementById('cf-result');
    Coins.add(CoinFlip.pool);
    result.textContent = `💰 CASHED OUT: +${CoinFlip.pool}!`;
    result.className = 'game-result win';
    CasinoFx.sfx('coin');
    CoinFlip.pool = 0;
    CoinFlip.streak = 0;
    document.getElementById('cf-picks').classList.remove('hidden');
    document.getElementById('cf-bet-ctrl').classList.remove('hidden');
    document.getElementById('cf-double').classList.add('hidden');
    document.getElementById('cf-coin').textContent = '🪙';
  }
};
