// js/games/coins.js — 코인 시스템
const Coins = {
  KEY: 'workshop-coins',
  get() { return parseInt(localStorage.getItem(Coins.KEY) || '100', 10); },
  set(n) { localStorage.setItem(Coins.KEY, Math.max(0, n)); Coins.updateUI(); },
  add(n) { Coins.set(Coins.get() + n); },
  spend(n) { const c = Coins.get(); if (c < n) return false; Coins.set(c - n); return true; },
  reset() { Coins.set(100); },
  updateUI() {
    document.querySelectorAll('.coin-display').forEach(el => {
      el.textContent = '🪙 ' + Coins.get();
    });
  }
};
