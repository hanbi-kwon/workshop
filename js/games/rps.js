// js/games/rps.js — ✊ 가위바위보 더블업
const RPS = {
  choices: ['✊', '✌️', '✋'],
  names: ['ROCK', 'SCISSORS', 'PAPER'],
  streak: 0,
  pool: 0,
  bet: 10,

  start(container) {
    CasinoFx.startBgm();
    RPS.streak = 0;
    RPS.pool = 0;
    container.innerHTML = `
      <div class="mini-game-screen">
        <div class="mini-game-header">
          <span class="coin-display"></span>
          <span class="mini-game-title">✊ DOUBLE UP</span>
        </div>
        <div class="rps-arena">
          <div class="rps-vs">
            <div class="rps-side">
              <div class="rps-emoji" id="rps-player">❓</div>
              <div class="rps-label">YOU</div>
            </div>
            <div class="rps-vs-text">VS</div>
            <div class="rps-side">
              <div class="rps-emoji" id="rps-cpu">❓</div>
              <div class="rps-label">CPU</div>
            </div>
          </div>
        </div>
        <div id="rps-info" class="game-result">BET ${RPS.bet} TO START!</div>
        <div class="rps-choices" id="rps-choices">
          <button class="rps-pick" data-idx="0">✊</button>
          <button class="rps-pick" data-idx="1">✌️</button>
          <button class="rps-pick" data-idx="2">✋</button>
        </div>
        <div id="rps-double" class="hidden">
          <button id="rps-cashout" class="pixel-btn green">💰 CASH OUT</button>
          <button id="rps-again" class="pixel-btn yellow">⚡ DOUBLE OR NOTHING!</button>
        </div>
        <button class="pixel-btn-text mini-back">[ BACK ]</button>
      </div>`;
    Coins.updateUI();

    container.querySelectorAll('.rps-pick').forEach(b => {
      b.addEventListener('click', () => RPS.play(parseInt(b.dataset.idx)));
    });
    container.querySelector('.mini-back').addEventListener('click', () => MiniGames.showMenu());
  },

  play(playerIdx) {
    const info = document.getElementById('rps-info');

    if (RPS.pool === 0) {
      if (!Coins.spend(RPS.bet)) {
        info.textContent = '코인이 부족해요!';
        info.className = 'game-result lose';
        CasinoFx.sfx('lose');
        return;
      }
      RPS.pool = RPS.bet;
    }

    CasinoFx.sfx('flip');
    const cpuIdx = Math.floor(Math.random() * 3);
    document.getElementById('rps-player').textContent = RPS.choices[playerIdx];
    document.getElementById('rps-cpu').textContent = RPS.choices[cpuIdx];

    // 승패: 0→rock, 1→scissors, 2→paper
    // rock beats scissors, scissors beats paper, paper beats rock
    const win = (playerIdx === 0 && cpuIdx === 1) || (playerIdx === 1 && cpuIdx === 2) || (playerIdx === 2 && cpuIdx === 0);
    const draw = playerIdx === cpuIdx;

    if (draw) {
      info.textContent = `DRAW! TRY AGAIN (POOL: ${RPS.pool})`;
      info.className = 'game-result';
      CasinoFx.sfx('bet');
    } else if (win) {
      RPS.pool *= 2;
      RPS.streak++;
      info.textContent = `🔥 WIN! x${RPS.streak} STREAK! POOL: ${RPS.pool}`;
      info.className = 'game-result win';
      CasinoFx.sfx('win');
      // show double-or-nothing
      document.getElementById('rps-choices').classList.add('hidden');
      document.getElementById('rps-double').classList.remove('hidden');
      document.getElementById('rps-cashout').onclick = () => {
        Coins.add(RPS.pool);
        info.textContent = `💰 CASHED OUT: +${RPS.pool} COINS!`;
        info.className = 'game-result win';
        CasinoFx.sfx('coin');
        RPS.pool = 0;
        RPS.streak = 0;
        document.getElementById('rps-double').classList.add('hidden');
        document.getElementById('rps-choices').classList.remove('hidden');
        document.getElementById('rps-player').textContent = '❓';
        document.getElementById('rps-cpu').textContent = '❓';
      };
      document.getElementById('rps-again').onclick = () => {
        document.getElementById('rps-double').classList.add('hidden');
        document.getElementById('rps-choices').classList.remove('hidden');
        document.getElementById('rps-player').textContent = '❓';
        document.getElementById('rps-cpu').textContent = '❓';
        info.textContent = `POOL: ${RPS.pool} — PICK!`;
        info.className = 'game-result';
      };
    } else {
      info.textContent = `💀 LOSE! -${RPS.pool} COINS`;
      info.className = 'game-result lose';
      CasinoFx.sfx('lose');
      RPS.pool = 0;
      RPS.streak = 0;
    }
  }
};
