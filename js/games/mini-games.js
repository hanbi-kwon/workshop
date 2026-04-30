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

  showMenu() {
    CasinoFx.stopBgm();
    App.showScreen('screen-mini-games');
    const container = document.getElementById('mini-games-content');
    const grid = MiniGames.games.map(g =>
      `<button class="mini-game-btn" data-game="${g.id}">${g.icon}<br>${g.name}</button>`
    ).join('');

    container.innerHTML = `
      <div class="pixel-container">
        <h1 class="retro-title">CASINO</h1>
        <div class="mini-coin-header">
          <span class="coin-display"></span>
          <button id="coin-reset" class="pixel-btn-text">[ RESET COINS ]</button>
        </div>
        <div class="mini-game-grid">${grid}</div>
        <button id="mini-back-home" class="pixel-btn-text">[ BACK ]</button>
      </div>`;
    Coins.updateUI();

    container.querySelectorAll('.mini-game-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const game = MiniGames.games.find(g => g.id === btn.dataset.game);
        if (game) MiniGames.startGame(game);
      });
    });

    document.getElementById('coin-reset').addEventListener('click', () => {
      Coins.reset();
      CasinoFx.sfx('coin');
    });

    document.getElementById('mini-back-home').addEventListener('click', () => {
      App.showScreen('screen-submit');
    });
  },

  startGame(game) {
    App.showScreen('screen-mini-play');
    const container = document.getElementById('mini-play-content');
    container.innerHTML = '';
    game.start(container);
  }
};
