// js/fx.js — 인터랙션 효과 + 8비트 BGM
const Fx = {
  audioCtx: null,
  bgmInterval: null,
  bgmPlaying: false,
  bgmTrackIndex: 0,

  // ── 화면 플래시 (제출 성공 시) ──
  flash(color = '#22c55e') {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;background:${color};opacity:0.4;z-index:9999;
      pointer-events:none;animation:fx-flash 0.4s ease-out forwards;
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('animationend', () => overlay.remove());
  },

  // ── 글리치 전환 ──
  glitch() {
    const overlay = document.createElement('div');
    overlay.className = 'fx-glitch';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 300);
  },

  // ── 로딩 도트 애니메이션 (버튼 안에) ──
  btnLoading(btn, originalText) {
    let dots = 0;
    btn.dataset.originalText = originalText;
    btn.disabled = true;
    const id = setInterval(() => {
      dots = (dots + 1) % 4;
      btn.textContent = 'LOADING' + '.'.repeat(dots);
    }, 250);
    btn.dataset.loadingId = id;
  },

  btnDone(btn) {
    clearInterval(Number(btn.dataset.loadingId));
    btn.textContent = btn.dataset.originalText;
    btn.disabled = false;
  },

  // ── 공개 화면 입장 효과 ──
  revealEntrance() {
    const box = document.querySelector('.reveal-box');
    if (box) {
      box.style.animation = 'none';
      void box.offsetWidth;
      box.style.animation = 'fx-reveal-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    }
    const badge = document.querySelector('.reveal-badge');
    if (badge) {
      badge.style.animation = 'none';
      void badge.offsetWidth;
      badge.style.animation = 'fx-badge-drop 0.4s ease-out forwards';
    }
  },

  // ── 8비트 효과음 ──
  sfx(type) {
    if (!Fx.audioCtx) Fx.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = Fx.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    gain.gain.value = 0.08;

    const now = ctx.currentTime;
    if (type === 'submit') {
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.setValueAtTime(659, now + 0.08);
      osc.frequency.setValueAtTime(784, now + 0.16);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'reveal') {
      osc.frequency.setValueAtTime(392, now);
      osc.frequency.setValueAtTime(523, now + 0.1);
      osc.frequency.setValueAtTime(659, now + 0.2);
      osc.frequency.setValueAtTime(784, now + 0.3);
      osc.frequency.setValueAtTime(1047, now + 0.4);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'click') {
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'error') {
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.setValueAtTime(150, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  },

  // ── 8비트 BGM 트랙 목록 ──
  bgmTracks: [
    { // Track 1: 클래식 마리오풍
      bpm: 160,
      melody: [
        523, 523, 0, 523, 0, 415, 523, 0,
        659, 0, 0, 0, 330, 0, 0, 0,
        392, 0, 0, 523, 0, 0, 330, 0,
        0, 262, 0, 0, 349, 0, 392, 0,
        0, 440, 0, 494, 0, 466, 440, 0,
        392, 523, 659, 0, 784, 0, 880, 0,
        698, 784, 0, 0, 659, 0, 523, 0,
        349, 392, 330, 0, 0, 0, 0, 0
      ],
      bass: [
        131, 131, 131, 131, 165, 165, 165, 165,
        175, 175, 175, 175, 131, 131, 131, 131,
        131, 131, 131, 131, 165, 165, 165, 165,
        175, 175, 175, 175, 196, 196, 196, 196,
        175, 175, 175, 175, 165, 165, 165, 165,
        131, 131, 131, 131, 165, 165, 165, 165,
        175, 175, 175, 175, 131, 131, 131, 131,
        131, 131, 131, 131, 131, 131, 131, 131
      ],
      melodyWave: 'square', bassWave: 'triangle'
    },
    { // Track 2: 던전 탐험풍 (미스터리)
      bpm: 120,
      melody: [
        330, 0, 311, 0, 330, 0, 311, 0,
        294, 0, 277, 0, 294, 0, 330, 0,
        392, 0, 370, 0, 330, 0, 294, 0,
        277, 0, 262, 0, 247, 0, 262, 0,
        330, 0, 392, 0, 440, 0, 392, 0,
        370, 0, 330, 0, 294, 0, 330, 0,
        370, 0, 392, 0, 440, 0, 494, 0,
        523, 0, 494, 0, 440, 0, 0, 0
      ],
      bass: [
        110, 110, 110, 110, 131, 131, 131, 131,
        147, 147, 147, 147, 110, 110, 110, 110,
        131, 131, 131, 131, 147, 147, 147, 147,
        165, 165, 165, 165, 131, 131, 131, 131,
        110, 110, 110, 110, 131, 131, 131, 131,
        147, 147, 147, 147, 165, 165, 165, 165,
        175, 175, 175, 175, 147, 147, 147, 147,
        131, 131, 131, 131, 110, 110, 110, 110
      ],
      melodyWave: 'square', bassWave: 'triangle'
    },
    { // Track 3: 승리 행진곡풍 (밝고 경쾌)
      bpm: 180,
      melody: [
        523, 0, 659, 0, 784, 0, 1047, 0,
        880, 0, 784, 0, 659, 0, 784, 0,
        523, 0, 659, 0, 784, 0, 659, 0,
        523, 0, 440, 0, 523, 0, 0, 0,
        587, 0, 698, 0, 880, 0, 1175, 0,
        1047, 0, 880, 0, 698, 0, 880, 0,
        587, 0, 698, 0, 880, 0, 698, 0,
        587, 0, 523, 0, 587, 0, 0, 0
      ],
      bass: [
        131, 131, 196, 196, 262, 262, 196, 196,
        175, 175, 220, 220, 262, 262, 220, 220,
        131, 131, 196, 196, 262, 262, 196, 196,
        175, 175, 220, 220, 131, 131, 131, 131,
        147, 147, 220, 220, 294, 294, 220, 220,
        196, 196, 262, 262, 330, 330, 262, 262,
        147, 147, 220, 220, 294, 294, 220, 220,
        175, 175, 220, 220, 147, 147, 147, 147
      ],
      melodyWave: 'square', bassWave: 'sawtooth'
    },
    { // Track 4: 우주 스테이지풍 (드리미)
      bpm: 140,
      melody: [
        659, 0, 0, 784, 0, 0, 880, 0,
        0, 784, 0, 0, 659, 0, 0, 0,
        587, 0, 0, 659, 0, 0, 784, 0,
        0, 659, 0, 0, 587, 0, 0, 0,
        523, 0, 0, 587, 0, 0, 659, 0,
        0, 784, 0, 0, 880, 0, 0, 0,
        1047, 0, 0, 880, 0, 0, 784, 0,
        0, 659, 0, 0, 523, 0, 0, 0
      ],
      bass: [
        131, 131, 131, 131, 165, 165, 165, 165,
        147, 147, 147, 147, 131, 131, 131, 131,
        110, 110, 110, 110, 131, 131, 131, 131,
        147, 147, 147, 147, 165, 165, 165, 165,
        175, 175, 175, 175, 196, 196, 196, 196,
        220, 220, 220, 220, 196, 196, 196, 196,
        175, 175, 175, 175, 165, 165, 165, 165,
        147, 147, 147, 147, 131, 131, 131, 131
      ],
      melodyWave: 'sine', bassWave: 'triangle'
    },
    { // Track 5: 보스전풍 (긴박)
      bpm: 200,
      melody: [
        330, 330, 0, 330, 330, 0, 311, 0,
        330, 330, 0, 392, 0, 0, 440, 0,
        494, 494, 0, 494, 494, 0, 466, 0,
        440, 0, 392, 0, 330, 0, 0, 0,
        523, 523, 0, 523, 523, 0, 494, 0,
        440, 0, 392, 0, 440, 0, 494, 0,
        523, 0, 587, 0, 659, 0, 587, 0,
        523, 0, 494, 0, 440, 0, 0, 0
      ],
      bass: [
        165, 165, 165, 165, 165, 165, 165, 165,
        196, 196, 196, 196, 220, 220, 220, 220,
        247, 247, 247, 247, 247, 247, 247, 247,
        220, 220, 220, 220, 165, 165, 165, 165,
        262, 262, 262, 262, 262, 262, 262, 262,
        220, 220, 220, 220, 196, 196, 196, 196,
        175, 175, 175, 175, 165, 165, 165, 165,
        175, 175, 175, 175, 196, 196, 196, 196
      ],
      melodyWave: 'sawtooth', bassWave: 'square'
    }
  ],

  // ── 8비트 BGM 재생 (트랙 순환, 무한 반복) ──
  _playTrack(trackIdx) {
    if (!Fx.bgmPlaying) return;
    const ctx = Fx.audioCtx;
    const track = Fx.bgmTracks[trackIdx % Fx.bgmTracks.length];
    const bpm = track.bpm;
    const interval = (60 / bpm / 2) * 1000;
    let step = 0;
    const totalSteps = track.melody.length;

    Fx.bgmInterval = setInterval(() => {
      if (!Fx.bgmPlaying) return;
      const now = ctx.currentTime;
      const dur = interval / 1000 * 0.8;

      // 멜로디
      const freq = track.melody[step];
      if (freq > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = track.melodyWave;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
        osc.start(now);
        osc.stop(now + dur);
      }

      // 베이스 (매 4스텝마다)
      if (step % 4 === 0) {
        const bFreq = track.bass[step % track.bass.length];
        if (bFreq > 0) {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.type = track.bassWave;
          osc2.frequency.value = bFreq;
          gain2.gain.setValueAtTime(0.6, now);
          gain2.gain.exponentialRampToValueAtTime(0.01, now + dur * 2);
          osc2.start(now);
          osc2.stop(now + dur * 2);
        }
      }

      step++;
      // 트랙 끝 → 다음 트랙으로
      if (step >= totalSteps) {
        clearInterval(Fx.bgmInterval);
        Fx.bgmTrackIndex = (trackIdx + 1) % Fx.bgmTracks.length;
        Fx._playTrack(Fx.bgmTrackIndex);
      }
    }, interval);
  },

  startBgm() {
    if (Fx.bgmPlaying) return;
    if (!Fx.audioCtx) Fx.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    Fx.bgmPlaying = true;
    Fx._playTrack(Fx.bgmTrackIndex);
  },

  stopBgm() {
    Fx.bgmPlaying = false;
    if (Fx.bgmInterval) {
      clearInterval(Fx.bgmInterval);
      Fx.bgmInterval = null;
    }
  },

  toggleBgm() {
    if (Fx.bgmPlaying) Fx.stopBgm();
    else Fx.startBgm();
    return Fx.bgmPlaying;
  }
};
