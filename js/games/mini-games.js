// js/games/mini-games.js — 미니게임 메뉴 컨트롤러
const MiniGames = {
  games: [
    { id: 'slot-machine', icon: '🎰', name: 'SLOT', start: c => SlotMachine.start(c) },
    { id: 'rps',          icon: '✊', name: 'DOUBLE UP', start: c => RPS.start(c) },
    { id: 'roulette',     icon: '🎡', name: 'ROULETTE', start: c => MiniRoulette.start(c) },
    { id: 'coinflip',     icon: '🪙', name: 'COIN FLIP', start: c => CoinFlip.start(c) },
    { id: 'memory',       icon: '🃏', name: 'MEMORY', start: c => Memory.start(c) },
    { id: 'dice',         icon: '🎲', name: 'DICE', start: c => Dice.start(c) },
  ],

  async showMenu() {
    CasinoFx.stopBgm();

    // 닉네임 없으면 먼저 입력
    if (!Coins.getName()) {
      await Coins.promptName();
    }

    App.showScreen('screen-mini-games');
    const container = document.getElementById('mini-games-content');
    const grid = MiniGames.games.map(g =>
      `<button class="mini-game-btn" data-game="${g.id}">${g.icon}<br>${g.name}</button>`
    ).join('');

    container.innerHTML = `
      <div class="pixel-container">
        <h1 class="retro-title">CASINO</h1>
        <div class="mini-player-info">
          <span class="name-display"></span>
          <span class="coin-display"></span>
        </div>
        <div class="mini-game-grid">${grid}</div>
        <div class="mini-bottom-btns">
          <button id="show-leaderboard" class="pixel-btn">🏆 RANKING</button>
          <button id="change-name" class="pixel-btn-text">[ CHANGE NAME ]</button>
          <button id="coin-reset" class="pixel-btn-text">[ RESET COINS ]</button>
          <button id="mini-back-home" class="pixel-btn-text">[ BACK ]</button>
        </div>
      </div>`;
    Coins.updateUI();

    container.querySelectorAll('.mini-game-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const game = MiniGames.games.find(g => g.id === btn.dataset.game);
        if (game) MiniGames.startGame(game);
      });
    });

    document.getElementById('show-leaderboard').addEventListener('click', () => MiniGames.showLeaderboard());

    document.getElementById('change-name').addEventListener('click', async () => {
      await Coins.promptName();
      Coins.updateUI();
    });

    document.getElementById('coin-reset').addEventListener('click', () => {
      Coins.reset();
      CasinoFx.sfx('coin');
    });

    document.getElementById('mini-back-home').addEventListener('click', () => {
      Coins.syncNow();
      App.showScreen('screen-submit');
    });
  },

  startGame(game) {
    App.showScreen('screen-mini-play');
    const container = document.getElementById('mini-play-content');
    container.innerHTML = '';
    game.start(container);
  },

  async showLeaderboard() {
    App.showScreen('screen-mini-play');
    const container = document.getElementById('mini-play-content');

    // 먼저 내 점수 저장
    await Coins.syncNow();

    container.innerHTML = `
      <div class="mini-game-screen">
        <div class="mini-game-header">
          <span class="coin-display"></span>
          <span class="mini-game-title">🏆 RANKING</span>
        </div>
        <div id="lb-list" class="lb-loading">LOADING...</div>
        <button id="lb-refresh" class="pixel-btn yellow">🔄 REFRESH</button>
        <button class="pixel-btn-text mini-back">[ BACK ]</button>
      </div>`;
    Coins.updateUI();

    container.querySelector('.mini-back').addEventListener('click', () => MiniGames.showMenu());
    document.getElementById('lb-refresh').addEventListener('click', () => MiniGames._loadBoard());

    MiniGames._loadBoard();
  },

  async _loadBoard() {
    const list = document.getElementById('lb-list');
    list.innerHTML = 'LOADING...';
    list.className = 'lb-loading';

    try {
      const res = await Api.getLeaderboard();
      if (!res.ok || !res.leaderboard.length) {
        list.innerHTML = 'NO DATA YET';
        list.className = 'lb-empty';
        return;
      }

      const myName = Coins.getName();
      const medals = ['👑', '🥈', '🥉'];
      list.className = 'lb-list';
      list.innerHTML = res.leaderboard.map((p, i) => {
        const rank = i < 3 ? medals[i] : `${i + 1}.`;
        const isMe = p.name === myName ? ' lb-me' : '';
        return `<div class="lb-row${isMe}">
          <span class="lb-rank">${rank}</span>
          <span class="lb-name">${p.name}</span>
          <span class="lb-coins">🪙 ${p.coins}</span>
        </div>`;
      }).join('');
    } catch {
      list.innerHTML = 'NETWORK ERROR';
      list.className = 'lb-empty';
    }
  }
};
