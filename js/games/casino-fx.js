// js/games/casino-fx.js — 카지노 사운드 + BGM
const CasinoFx = {
  audioCtx: null,
  bgmInterval: null,
  bgmPlaying: false,

  _ctx() {
    if (!CasinoFx.audioCtx) CasinoFx.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return CasinoFx.audioCtx;
  },

  // ── 효과음 ──
  sfx(type) {
    const ctx = CasinoFx._ctx();
    const now = ctx.currentTime;

    if (type === 'spin') {
      // 슬롯 릴 돌아가는 소리 — 빠른 틱틱
      for (let i = 0; i < 8; i++) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.value = 600 + (i * 50);
        g.gain.setValueAtTime(0.15, now + i * 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.04);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.04);
      }
    } else if (type === 'win') {
      // 잭팟! 화려한 상승음
      const notes = [523, 659, 784, 1047, 1319, 1568];
      notes.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.value = f;
        g.gain.setValueAtTime(0.3, now + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.15);
      });
    } else if (type === 'lose') {
      // 하강 — 꽝
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);
      g.gain.setValueAtTime(0.25, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'coin') {
      // 코인 획득 — 챠링
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setValueAtTime(1600, now + 0.05);
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'bet') {
      // 베팅 — 딸깍
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = 440;
      g.gain.setValueAtTime(0.15, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'flip') {
      // 카드/코인 뒤집기
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.setValueAtTime(1200, now + 0.05);
      osc.frequency.setValueAtTime(600, now + 0.1);
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'dice') {
      // 주사위 — 데구르르
      for (let i = 0; i < 6; i++) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'noise' in osc ? 'square' : 'square';
        osc.frequency.value = 200 + Math.random() * 400;
        g.gain.setValueAtTime(0.12, now + i * 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.04);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.04);
      }
    } else if (type === 'jackpot') {
      // 대박! 연속 팡파레
      const notes = [523, 659, 784, 1047, 784, 1047, 1319, 1568, 1319, 1568];
      notes.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = i % 2 === 0 ? 'square' : 'sawtooth';
        osc.frequency.value = f;
        g.gain.setValueAtTime(0.35, now + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.18);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.18);
      });
    } else if (type === 'match') {
      // 매치 성공 — 딩동
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1100, now + 0.1);
      g.gain.setValueAtTime(0.25, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'roulette-tick') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.value = 1000;
      g.gain.setValueAtTime(0.1, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      osc.start(now);
      osc.stop(now + 0.02);
    }
  },

  // ── 카지노 BGM (재즈/라운지풍 8비트) ──
  startBgm() {
    if (CasinoFx.bgmPlaying) return;
    const ctx = CasinoFx._ctx();
    CasinoFx.bgmPlaying = true;

    // 스윙 재즈풍 멜로디
    const melody = [
      440, 0, 523, 0, 587, 0, 659, 0,
      698, 0, 659, 0, 587, 0, 523, 0,
      440, 0, 494, 0, 523, 0, 587, 0,
      659, 0, 0, 0, 523, 0, 0, 0,
      587, 0, 659, 0, 698, 0, 784, 0,
      880, 0, 784, 0, 698, 0, 659, 0,
      587, 0, 523, 0, 494, 0, 440, 0,
      494, 0, 523, 0, 440, 0, 0, 0
    ];
    const bass = [
      110, 110, 165, 165, 131, 131, 165, 165,
      147, 147, 175, 175, 131, 131, 165, 165,
      110, 110, 165, 165, 131, 131, 165, 165,
      147, 147, 175, 175, 196, 196, 165, 165,
      147, 147, 175, 175, 131, 131, 165, 165,
      110, 110, 131, 131, 147, 147, 165, 165,
      175, 175, 196, 196, 220, 220, 196, 196,
      175, 175, 165, 165, 147, 147, 131, 131
    ];

    let step = 0;
    const bpm = 130;
    const interval = (60 / bpm / 2) * 1000;

    CasinoFx.bgmInterval = setInterval(() => {
      if (!CasinoFx.bgmPlaying) return;
      const now = ctx.currentTime;
      const dur = interval / 1000 * 0.7;

      const freq = melody[step % melody.length];
      if (freq > 0) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0.25, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + dur);
        osc.start(now);
        osc.stop(now + dur);
      }

      if (step % 4 === 0) {
        const bFreq = bass[step % bass.length];
        if (bFreq > 0) {
          const osc2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          osc2.connect(g2); g2.connect(ctx.destination);
          osc2.type = 'sine';
          osc2.frequency.value = bFreq;
          g2.gain.setValueAtTime(0.3, now);
          g2.gain.exponentialRampToValueAtTime(0.01, now + dur * 2);
          osc2.start(now);
          osc2.stop(now + dur * 2);
        }
      }

      step++;
    }, interval);
  },

  stopBgm() {
    CasinoFx.bgmPlaying = false;
    if (CasinoFx.bgmInterval) {
      clearInterval(CasinoFx.bgmInterval);
      CasinoFx.bgmInterval = null;
    }
  }
};
