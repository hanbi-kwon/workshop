// js/draw/card.js
const Card = {
  async start(container) {
    // 질문 수를 먼저 파악해서 카드 개수 결정
    let remaining = 5; // fallback
    try {
      const questionsRes = await Api.getQuestions();
      if (questionsRes.ok) {
        remaining = questionsRes.questions.filter(q => !q.drawn).length;
      }
    } catch {
      // 네트워크 오류 시 기본 5장
    }

    const cardCount = Math.min(Math.max(remaining, 1), 9);

    const cards = Array.from({ length: cardCount }, (_, i) => `
      <div class="flip-card" data-index="${i}">
        <div class="flip-card-inner">
          <div class="flip-card-front">❓</div>
          <div class="flip-card-back" id="card-back-${i}">...</div>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="card-screen">
        <div class="retro-title" style="font-size:14px">🃏 CARD FLIP</div>
        <div style="font-size:8px;color:var(--text-dim)">카드를 선택하세요</div>
        <div class="card-grid">${cards}</div>
        <button id="card-back" class="pixel-btn-text">[ CHANGE MODE ]</button>
      </div>
    `;

    document.getElementById('card-back').addEventListener('click', () => App.showScreen('screen-mode-select'));

    document.querySelectorAll('.flip-card').forEach(card => {
      card.addEventListener('click', () => Card.flip(card));
    });
  },

  async flip(cardEl) {
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('disabled')) return;

    // 다른 카드 모두 비활성화
    document.querySelectorAll('.flip-card').forEach(c => c.classList.add('disabled'));

    let res;
    try {
      res = await Api.drawQuestion();
    } catch {
      document.querySelectorAll('.flip-card').forEach(c => c.classList.remove('disabled'));
      const screen = document.querySelector('.card-screen');
      if (screen) screen.insertAdjacentHTML('beforeend',
        `<div style="font-size:8px;color:var(--red);text-align:center">NETWORK ERROR — TRY AGAIN</div>`);
      return;
    }

    if (!res.ok) {
      document.querySelectorAll('.flip-card').forEach(c => c.classList.remove('disabled'));
      if (res.error === 'NO_MORE_QUESTIONS') {
        const screen = document.querySelector('.card-screen');
        screen.insertAdjacentHTML('beforeend', `<div style="font-size:9px;color:var(--green);text-align:center">★ ALL DRAWN! ★</div>`);
      }
      return;
    }

    // 카드 뒤면에 텍스트 삽입 후 플립
    const index = cardEl.dataset.index;
    const backEl = document.getElementById(`card-back-${index}`);
    backEl.textContent = res.question.text;
    backEl.style.fontSize = res.question.text.length > 30 ? '8px' : '10px';

    cardEl.classList.add('flipped');

    setTimeout(() => App.showReveal(res.question.text, res.drawn, res.total), 1200);
  }
};
