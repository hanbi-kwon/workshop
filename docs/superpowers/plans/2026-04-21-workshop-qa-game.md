# 워크숍 질문 뽑기 게임 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 직원들이 익명으로 질문을 제출하고, 피플팀이 4가지 레트로 픽셀 게임 애니메이션으로 질문을 뽑아 대표가 답변하는 워크숍용 웹앱.

**Architecture:** 단일 HTML 페이지(GitHub Pages)에서 화면 전환. Google Apps Script가 서버리스 API 역할. Google Sheets가 DB. 모든 뽑기 애니메이션은 순수 CSS/JS.

**Tech Stack:** Vanilla HTML/CSS/JS, Google Apps Script, Google Sheets, GitHub Pages, Press Start 2P (Google Fonts)

---

## 파일 구조

```
/
├── index.html              # 단일 페이지, 모든 화면 포함
├── css/
│   └── style.css           # 픽셀 테마 전체 스타일
├── js/
│   ├── app.js              # 화면 전환, 전역 상태
│   ├── api.js              # Apps Script API 호출 래퍼
│   ├── admin.js            # 관리자 화면 로직
│   └── draw/
│       ├── slot.js         # 슬롯머신 애니메이션
│       ├── roulette.js     # 룰렛 애니메이션
│       ├── card.js         # 카드 뒤집기 애니메이션
│       └── shake.js        # 뽑기통 흔들기 애니메이션
└── apps-script/
    └── Code.gs             # Google Apps Script (별도 프로젝트에 복붙)
```

---

## Task 1: 레포 & 파일 뼈대

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/app.js`
- Create: `js/api.js`
- Create: `js/admin.js`
- Create: `js/draw/slot.js`
- Create: `js/draw/roulette.js`
- Create: `js/draw/card.js`
- Create: `js/draw/shake.js`
- Create: `apps-script/Code.gs`

- [ ] **Step 1: Git 초기화**

```bash
cd /Users/hanbi/workshop
git init
echo ".DS_Store" > .gitignore
echo ".superpowers/" >> .gitignore
```

- [ ] **Step 2: 디렉토리 생성**

```bash
mkdir -p css js/draw apps-script
```

- [ ] **Step 3: index.html 생성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ASK ME! — 워크숍 질문 뽑기</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- 화면 1: 질문 제출 -->
  <div id="screen-submit" class="screen active">
    <div class="pixel-container">
      <h1 class="retro-title">ASK ME!</h1>
      <p class="blink">▶ INSERT QUESTION ◀</p>
      <label class="pixel-label">// YOUR QUESTION</label>
      <textarea id="question-input" class="pixel-input" maxlength="200" placeholder="궁금한 점을 자유롭게 적어주세요 :)"></textarea>
      <div id="char-count" class="char-count">0 / 200</div>
      <button id="submit-btn" class="pixel-btn green">▶ SUBMIT</button>
      <div id="submit-msg" class="submit-msg hidden"></div>
      <button id="admin-link" class="pixel-btn-text">[ ADMIN ]</button>
    </div>
  </div>

  <!-- 화면 2: 관리자 로그인 -->
  <div id="screen-admin-login" class="screen hidden">
    <div class="pixel-container">
      <h1 class="retro-title">ADMIN</h1>
      <label class="pixel-label">// PASSWORD</label>
      <input id="admin-password" class="pixel-input" type="password" placeholder="••••••">
      <button id="admin-login-btn" class="pixel-btn">▶ ENTER</button>
      <div id="login-error" class="error-msg hidden">ACCESS DENIED</div>
      <button id="back-to-submit" class="pixel-btn-text">[ BACK ]</button>
    </div>
  </div>

  <!-- 화면 3: 관리자 대시보드 -->
  <div id="screen-admin-dash" class="screen hidden">
    <div class="pixel-container wide">
      <div class="admin-header">
        <h1 class="retro-title small">ADMIN PANEL</h1>
        <div id="question-stats" class="stats"></div>
        <button id="start-game-btn" class="pixel-btn yellow">▶ START GAME</button>
      </div>
      <div id="question-list" class="question-list"></div>
      <button id="admin-logout" class="pixel-btn-text">[ LOGOUT ]</button>
    </div>
  </div>

  <!-- 화면 4: 뽑기 모드 선택 -->
  <div id="screen-mode-select" class="screen hidden">
    <div class="pixel-container">
      <h1 class="retro-title">SELECT MODE</h1>
      <div class="mode-grid">
        <button class="mode-btn" data-mode="slot">🎰<br>SLOT</button>
        <button class="mode-btn" data-mode="roulette">🎡<br>ROULETTE</button>
        <button class="mode-btn" data-mode="card">🃏<br>CARD</button>
        <button class="mode-btn" data-mode="shake">🎲<br>SHAKE</button>
      </div>
      <button id="back-to-dash" class="pixel-btn-text">[ BACK ]</button>
    </div>
  </div>

  <!-- 화면 5: 뽑기 (모드별 콘텐츠 동적 삽입) -->
  <div id="screen-draw" class="screen hidden">
    <div id="draw-content"></div>
  </div>

  <!-- 화면 6: 질문 공개 -->
  <div id="screen-reveal" class="screen hidden">
    <div class="pixel-container">
      <div class="reveal-badge blink">★ QUESTION SELECTED ★</div>
      <div id="revealed-question" class="reveal-box"></div>
      <div id="reveal-progress" class="progress-text"></div>
      <div class="reveal-buttons">
        <button id="next-draw-btn" class="pixel-btn">▶ NEXT</button>
        <button id="change-mode-btn" class="pixel-btn-text">[ CHANGE MODE ]</button>
      </div>
    </div>
  </div>

  <!-- 수정 모달 -->
  <div id="modal-edit" class="modal hidden">
    <div class="modal-box">
      <label class="pixel-label">// EDIT QUESTION</label>
      <textarea id="edit-input" class="pixel-input" maxlength="200"></textarea>
      <div class="modal-buttons">
        <button id="modal-save" class="pixel-btn green">SAVE</button>
        <button id="modal-cancel" class="pixel-btn-text">CANCEL</button>
      </div>
    </div>
  </div>

  <script src="js/api.js"></script>
  <script src="js/draw/slot.js"></script>
  <script src="js/draw/roulette.js"></script>
  <script src="js/draw/card.js"></script>
  <script src="js/draw/shake.js"></script>
  <script src="js/admin.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 4: 나머지 파일들 빈 상태로 생성**

```bash
touch css/style.css js/app.js js/api.js js/admin.js
touch js/draw/slot.js js/draw/roulette.js js/draw/card.js js/draw/shake.js
touch apps-script/Code.gs
```

- [ ] **Step 5: 첫 커밋**

```bash
git add .
git commit -m "feat: initial project scaffold"
```

---

## Task 2: 픽셀 CSS 테마

**Files:**
- Modify: `css/style.css`

- [ ] **Step 1: style.css 작성**

```css
/* css/style.css */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #0a0a0f;
  --surface: #111;
  --surface2: #161b22;
  --border: #2a2a4a;
  --indigo: #6366f1;
  --indigo-dark: #3730a3;
  --indigo-light: #818cf8;
  --green: #22c55e;
  --green-dark: #15803d;
  --yellow: #eab308;
  --yellow-dark: #854d0e;
  --red: #f85149;
  --red-dark: #7f1d1d;
  --text: #e6edf3;
  --text-dim: #8b949e;
  --text-dimmer: #555;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Press Start 2P', monospace;
  min-height: 100vh;
  image-rendering: pixelated;
}

/* ── 화면 전환 ── */
.screen { display: none; }
.screen.active { display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding: 32px 16px; }
.screen.fullscreen { display: flex; padding: 0; }

/* ── 컨테이너 ── */
.pixel-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
}
.pixel-container.wide { max-width: 680px; }

/* ── 타이포 ── */
.retro-title {
  font-size: 22px;
  color: var(--indigo);
  text-shadow: 3px 3px 0 var(--indigo-dark), -1px -1px 0 var(--indigo-light);
  text-align: center;
  letter-spacing: 2px;
  margin-bottom: 4px;
}
.retro-title.small { font-size: 14px; }

.pixel-label {
  font-size: 8px;
  color: var(--indigo);
  letter-spacing: 2px;
}

.blink {
  font-size: 8px;
  color: var(--green);
  letter-spacing: 2px;
  text-align: center;
  animation: blink 1s step-end infinite;
}

@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ── 입력 ── */
.pixel-input {
  width: 100%;
  background: #000;
  border: none;
  outline: none;
  color: var(--green);
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  padding: 12px;
  line-height: 2;
  resize: none;
  box-shadow: inset 2px 2px 0 #333, inset -2px -2px 0 #555;
}
.pixel-input::placeholder { color: var(--text-dimmer); }
textarea.pixel-input { min-height: 100px; }

.char-count {
  font-size: 7px;
  color: var(--text-dimmer);
  text-align: right;
}

/* ── 버튼 ── */
.pixel-btn {
  display: inline-block;
  background: var(--indigo);
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 12px 20px;
  border: none;
  cursor: pointer;
  width: 100%;
  box-shadow: 0 4px 0 var(--indigo-dark), 4px 0 0 #4f46e5, 4px 4px 0 #312e81, -2px -2px 0 var(--indigo-light);
  transition: transform 0.05s, box-shadow 0.05s;
  text-align: center;
}
.pixel-btn:hover { background: var(--indigo-light); }
.pixel-btn:active { transform: translate(2px, 2px); box-shadow: 0 2px 0 var(--indigo-dark), 2px 0 0 #4f46e5; }
.pixel-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.pixel-btn.green {
  background: var(--green);
  box-shadow: 0 4px 0 var(--green-dark), 4px 0 0 #16a34a, 4px 4px 0 #14532d, -2px -2px 0 #4ade80;
}
.pixel-btn.green:hover { background: #4ade80; }

.pixel-btn.yellow {
  background: var(--yellow);
  color: #000;
  box-shadow: 0 4px 0 var(--yellow-dark), 4px 0 0 #a16207, 4px 4px 0 #713f12, -2px -2px 0 #fde047;
}
.pixel-btn.yellow:hover { background: #fde047; }

.pixel-btn.red {
  background: #b91c1c;
  box-shadow: 0 4px 0 var(--red-dark), 4px 0 0 #991b1b, 4px 4px 0 #450a0a, -2px -2px 0 #fca5a5;
}

.pixel-btn-text {
  background: none;
  border: none;
  color: var(--text-dim);
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  cursor: pointer;
  text-align: center;
  width: 100%;
  padding: 8px;
}
.pixel-btn-text:hover { color: var(--text); }

/* ── 메시지 ── */
.hidden { display: none !important; }

.submit-msg {
  font-size: 8px;
  text-align: center;
  padding: 10px;
  line-height: 2;
}
.submit-msg.success { color: var(--green); }
.submit-msg.error { color: var(--red); }

.error-msg {
  font-size: 8px;
  color: var(--red);
  text-align: center;
  animation: blink 0.5s step-end infinite;
}

/* ── 관리자 대시보드 ── */
.admin-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}
.admin-header .retro-title { margin-bottom: 0; }
.admin-header .pixel-btn { width: auto; }

.stats {
  font-size: 8px;
  color: var(--text-dim);
  line-height: 2;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 60vh;
  overflow-y: auto;
}

.q-item {
  background: var(--surface2);
  border-left: 3px solid var(--indigo);
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  box-shadow: 2px 2px 0 var(--border);
}
.q-item.drawn { opacity: 0.35; border-left-color: var(--text-dimmer); }

.q-item-text { font-size: 7px; color: var(--text); line-height: 1.8; flex: 1; }
.q-item-time { font-size: 6px; color: var(--text-dimmer); margin-top: 4px; }

.q-item-actions { display: flex; gap: 6px; flex-shrink: 0; }

.q-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  padding: 4px 7px;
  cursor: pointer;
}
.q-btn:hover { color: var(--text); border-color: var(--indigo); }
.q-btn.del { color: var(--red); border-color: var(--red-dark); }
.q-btn.del:hover { background: var(--red-dark); color: #fff; }

/* ── 모드 선택 ── */
.mode-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.mode-btn {
  background: var(--surface);
  border: 2px solid var(--border);
  color: var(--text);
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  padding: 20px 10px;
  cursor: pointer;
  line-height: 2.5;
  box-shadow: 3px 3px 0 var(--border);
  transition: transform 0.05s, box-shadow 0.05s;
}
.mode-btn:hover { border-color: var(--indigo); color: var(--indigo); }
.mode-btn:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 var(--border); }

/* ── 공개 화면 ── */
.reveal-badge {
  font-size: 9px;
  color: var(--green);
  text-align: center;
  letter-spacing: 2px;
}

.reveal-box {
  background: #000;
  padding: 24px 20px;
  font-size: 11px;
  color: var(--text);
  line-height: 2;
  text-align: center;
  box-shadow: inset 2px 2px 0 #333, 4px 4px 0 var(--border);
  word-break: keep-all;
}

.progress-text {
  font-size: 8px;
  color: var(--text-dimmer);
  text-align: center;
}

.reveal-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── 모달 ── */
.modal {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}
.modal-box {
  background: var(--surface);
  border: 2px solid var(--indigo);
  padding: 24px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 4px 4px 0 var(--indigo-dark);
}
.modal-buttons { display: flex; flex-direction: column; gap: 8px; }

/* ── 슬롯머신 ── */
.slot-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 24px;
  padding: 32px 16px;
}
.slot-title { font-size: 16px; color: var(--indigo); text-shadow: 2px 2px 0 var(--indigo-dark); }
.slot-machine {
  border: 3px solid var(--indigo);
  background: #000;
  width: 300px;
  height: 80px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 0 0 3px var(--indigo-dark), 6px 6px 0 #1e1b4b;
}
.slot-reel {
  position: absolute;
  width: 100%;
  transition: top 0.05s;
}
.slot-item {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: var(--text);
  padding: 0 16px;
  text-align: center;
  line-height: 1.8;
  border-bottom: 1px solid #111;
}
.slot-item.selected { color: var(--green); }
.slot-arrows {
  font-size: 10px;
  color: var(--indigo-dark);
  text-align: center;
}

/* ── 룰렛 ── */
.roulette-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 20px;
  padding: 32px 16px;
}
.roulette-wrap {
  position: relative;
  width: 260px;
  height: 260px;
}
.roulette-canvas {
  width: 260px;
  height: 260px;
  image-rendering: pixelated;
}
.roulette-pointer {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  filter: drop-shadow(0 0 4px var(--yellow));
}

/* ── 카드 뒤집기 ── */
.card-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 24px;
  padding: 32px 16px;
}
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  max-width: 400px;
}
.flip-card {
  width: 80px;
  height: 110px;
  perspective: 600px;
  cursor: pointer;
}
.flip-card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}
.flip-card.flipped .flip-card-inner { transform: rotateY(180deg); }
.flip-card-front, .flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  border: 2px solid var(--indigo);
  box-shadow: 2px 2px 0 var(--indigo-dark);
}
.flip-card-front { background: #0d0d1a; }
.flip-card-back {
  background: #000;
  transform: rotateY(180deg);
  font-size: 7px;
  color: var(--green);
  padding: 6px;
  text-align: center;
  line-height: 1.8;
  border-color: var(--green);
}
.flip-card.disabled { cursor: default; opacity: 0.4; }

/* ── 뽑기통 ── */
.shake-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 24px;
  padding: 32px 16px;
  text-align: center;
}
.shake-pot {
  font-size: 80px;
  line-height: 1;
  transition: transform 0.1s;
  filter: drop-shadow(0 0 8px var(--yellow));
}
.shake-pot.shaking { animation: shake-anim 0.5s steps(4) forwards; }
@keyframes shake-anim {
  0%   { transform: rotate(0deg) translateX(0); }
  25%  { transform: rotate(-15deg) translateX(-8px); }
  50%  { transform: rotate(15deg) translateX(8px); }
  75%  { transform: rotate(-10deg) translateX(-4px); }
  100% { transform: rotate(0deg) translateX(0); }
}
.shake-hint { font-size: 8px; color: var(--text-dim); line-height: 2; }

/* ── 전체화면 버튼 ── */
.fullscreen-btn {
  position: fixed;
  bottom: 16px;
  right: 16px;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  padding: 6px 10px;
  cursor: pointer;
  z-index: 50;
}
.fullscreen-btn:hover { color: var(--text); border-color: var(--indigo); }
```

- [ ] **Step 2: 브라우저에서 index.html 열어 폰트와 기본 레이아웃 확인**

제출 화면이 보이고, Press Start 2P 폰트가 적용돼 있어야 함.

- [ ] **Step 3: 커밋**

```bash
git add css/style.css
git commit -m "feat: pixel retro CSS theme"
```

---

## Task 3: Apps Script 백엔드

**Files:**
- Modify: `apps-script/Code.gs`

> 이 파일은 Google Apps Script 에디터(script.google.com)에 붙여넣기 해야 함.

- [ ] **Step 1: Google Sheets 스프레드시트 생성**

1. sheets.google.com → 새 스프레드시트 생성
2. 시트 이름을 `questions` 로 변경
3. 1행에 헤더 입력: `id | text | submitted_at | drawn | drawn_at`
4. URL에서 스프레드시트 ID 복사 (예: `https://docs.google.com/spreadsheets/d/**SPREADSHEET_ID**/edit`)

- [ ] **Step 2: Apps Script 프로젝트 생성**

1. script.google.com → 새 프로젝트
2. 프로젝트 이름: `workshop-qa-api`

- [ ] **Step 3: Code.gs 작성 (아래 코드를 apps-script/Code.gs에도 저장)**

```javascript
// apps-script/Code.gs
// ── 설정 ──────────────────────────────────────────────
// Script Properties에 다음 키를 설정하세요:
//   SHEET_ID  : 스프레드시트 ID
//   ADMIN_PW  : 관리자 비밀번호

function getConfig() {
  const props = PropertiesService.getScriptProperties();
  return {
    sheetId: props.getProperty('SHEET_ID'),
    adminPw: props.getProperty('ADMIN_PW')
  };
}

function getSheet() {
  const { sheetId } = getConfig();
  return SpreadsheetApp.openById(sheetId).getSheetByName('questions');
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkAdmin(password) {
  return password === getConfig().adminPw;
}

// ── 라우터 ────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { action, password } = data;

    if (action === 'submitQuestion') return submitQuestion(data);

    if (!checkAdmin(password)) return respond({ ok: false, error: 'ACCESS DENIED' });

    if (action === 'getQuestions')   return getQuestions();
    if (action === 'deleteQuestion') return deleteQuestion(data);
    if (action === 'updateQuestion') return updateQuestion(data);
    if (action === 'drawQuestion')   return drawQuestion();

    return respond({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}

function doGet() {
  return respond({ ok: true, status: 'Workshop QA API running' });
}

// ── 질문 제출 (익명, 인증 불필요) ───────────────────────
function submitQuestion(data) {
  const text = (data.text || '').trim();
  if (!text || text.length > 200) return respond({ ok: false, error: 'Invalid text' });

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const sheet = getSheet();
    const id = Utilities.getUuid();
    const now = new Date().toISOString();
    sheet.appendRow([id, text, now, 'false', '']);
    return respond({ ok: true, id });
  } finally {
    lock.releaseLock();
  }
}

// ── 질문 전체 조회 (관리자) ───────────────────────────
function getQuestions() {
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return respond({ ok: true, questions: [] });

  const questions = rows.slice(1).map(r => ({
    id: r[0],
    text: r[1],
    submitted_at: r[2],
    drawn: r[3] === 'true' || r[3] === true,
    drawn_at: r[4]
  })).filter(q => q.id);

  return respond({ ok: true, questions });
}

// ── 질문 삭제 (관리자) ───────────────────────────────
function deleteQuestion(data) {
  const { id } = data;
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      sheet.deleteRow(i + 1);
      return respond({ ok: true });
    }
  }
  return respond({ ok: false, error: 'Not found' });
}

// ── 질문 수정 (관리자) ───────────────────────────────
function updateQuestion(data) {
  const { id, text } = data;
  const trimmed = (text || '').trim();
  if (!trimmed || trimmed.length > 200) return respond({ ok: false, error: 'Invalid text' });

  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      sheet.getRange(i + 1, 2).setValue(trimmed);
      return respond({ ok: true });
    }
  }
  return respond({ ok: false, error: 'Not found' });
}

// ── 질문 뽑기 (관리자) ──────────────────────────────
function drawQuestion() {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const sheet = getSheet();
    const rows = sheet.getDataRange().getValues();
    const undrawn = [];

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][3] !== 'true' && rows[i][3] !== true) {
        undrawn.push({ rowIndex: i + 1, id: rows[i][0], text: rows[i][1] });
      }
    }

    if (undrawn.length === 0) return respond({ ok: false, error: 'NO_MORE_QUESTIONS' });

    const picked = undrawn[Math.floor(Math.random() * undrawn.length)];
    sheet.getRange(picked.rowIndex, 4).setValue('true');
    sheet.getRange(picked.rowIndex, 5).setValue(new Date().toISOString());

    const total = rows.length - 1;
    const drawnCount = total - undrawn.length + 1;

    return respond({ ok: true, question: { id: picked.id, text: picked.text }, drawn: drawnCount, total });
  } finally {
    lock.releaseLock();
  }
}
```

- [ ] **Step 4: Script Properties 설정**

Apps Script 에디터 → 프로젝트 설정 → 스크립트 속성 → 추가:
- `SHEET_ID` = 스프레드시트 ID
- `ADMIN_PW` = 원하는 비밀번호 (예: `people2024`)

- [ ] **Step 5: 웹 앱으로 배포**

Apps Script 에디터 → 배포 → 새 배포 →
- 유형: 웹 앱
- 다음으로 실행: 나 (본인 계정)
- 액세스 권한: 모든 사람
→ 배포 URL 복사 (이후 `api.js`에서 사용)

- [ ] **Step 6: doGet 테스트**

배포 URL을 브라우저에서 열어 `{"ok":true,"status":"Workshop QA API running"}` 응답 확인.

- [ ] **Step 7: 커밋**

```bash
git add apps-script/Code.gs
git commit -m "feat: Apps Script backend with CRUD and draw"
```

---

## Task 4: api.js — API 호출 래퍼

**Files:**
- Modify: `js/api.js`

- [ ] **Step 1: api.js 작성**

```javascript
// js/api.js
const API_URL = 'YOUR_APPS_SCRIPT_DEPLOY_URL'; // Task 3 Step 5에서 복사한 URL

async function apiCall(payload) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

const Api = {
  submit(text) {
    return apiCall({ action: 'submitQuestion', text });
  },
  getQuestions(password) {
    return apiCall({ action: 'getQuestions', password });
  },
  deleteQuestion(password, id) {
    return apiCall({ action: 'deleteQuestion', password, id });
  },
  updateQuestion(password, id, text) {
    return apiCall({ action: 'updateQuestion', password, id, text });
  },
  drawQuestion(password) {
    return apiCall({ action: 'drawQuestion', password });
  }
};
```

> **주의:** `Content-Type: text/plain` 사용. `application/json`은 Apps Script에서 preflight CORS 오류 발생.

- [ ] **Step 2: API URL 교체**

`YOUR_APPS_SCRIPT_DEPLOY_URL` 을 Task 3에서 복사한 실제 URL로 교체.

- [ ] **Step 3: 브라우저 콘솔에서 테스트**

index.html을 브라우저에서 열고 콘솔에서:
```javascript
Api.submit('테스트 질문입니다').then(console.log)
// 예상: { ok: true, id: "uuid..." }
```
Google Sheets에 행이 추가됐는지 확인.

- [ ] **Step 4: 커밋**

```bash
git add js/api.js
git commit -m "feat: API wrapper for Apps Script"
```

---

## Task 5: app.js — 화면 전환 & 전역 상태

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: app.js 작성**

```javascript
// js/app.js
const App = {
  adminPassword: null,
  currentMode: null,
  drawnCount: 0,
  totalCount: 0,

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });
    const target = document.getElementById(id);
    target.classList.remove('hidden');
    target.classList.add('active');
  },

  init() {
    // 제출 화면
    const input = document.getElementById('question-input');
    const charCount = document.getElementById('char-count');
    const submitBtn = document.getElementById('submit-btn');
    const submitMsg = document.getElementById('submit-msg');

    input.addEventListener('input', () => {
      charCount.textContent = `${input.value.length} / 200`;
    });

    submitBtn.addEventListener('click', async () => {
      const text = input.value.trim();
      if (!text) return;
      submitBtn.disabled = true;
      submitMsg.className = 'submit-msg hidden';
      try {
        const res = await Api.submit(text);
        if (res.ok) {
          input.value = '';
          charCount.textContent = '0 / 200';
          submitMsg.textContent = '✓ 질문이 전달됐어요!';
          submitMsg.className = 'submit-msg success';
        } else {
          submitMsg.textContent = '✗ 오류가 발생했어요. 다시 시도해주세요.';
          submitMsg.className = 'submit-msg error';
        }
      } catch {
        submitMsg.textContent = '✗ 네트워크 오류입니다.';
        submitMsg.className = 'submit-msg error';
      }
      // 5초 쿨다운
      setTimeout(() => { submitBtn.disabled = false; }, 5000);
    });

    document.getElementById('admin-link').addEventListener('click', () => {
      App.showScreen('screen-admin-login');
    });

    // 관리자 로그인
    document.getElementById('admin-login-btn').addEventListener('click', () => Admin.login());
    document.getElementById('admin-password').addEventListener('keydown', e => {
      if (e.key === 'Enter') Admin.login();
    });
    document.getElementById('back-to-submit').addEventListener('click', () => {
      App.showScreen('screen-submit');
    });

    // 관리자 대시보드
    document.getElementById('start-game-btn').addEventListener('click', () => {
      App.showScreen('screen-mode-select');
    });
    document.getElementById('admin-logout').addEventListener('click', () => {
      App.adminPassword = null;
      App.showScreen('screen-submit');
    });

    // 모드 선택
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        App.currentMode = btn.dataset.mode;
        App.startDraw();
      });
    });
    document.getElementById('back-to-dash').addEventListener('click', () => {
      Admin.loadDashboard();
      App.showScreen('screen-admin-dash');
    });

    // 공개 화면
    document.getElementById('next-draw-btn').addEventListener('click', () => App.startDraw());
    document.getElementById('change-mode-btn').addEventListener('click', () => {
      App.showScreen('screen-mode-select');
    });

    // 전체화면 버튼 동적 추가
    const fsBtn = document.createElement('button');
    fsBtn.className = 'fullscreen-btn';
    fsBtn.textContent = '[ FULLSCREEN ]';
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    });
    document.body.appendChild(fsBtn);
  },

  async startDraw() {
    App.showScreen('screen-draw');
    const drawContent = document.getElementById('draw-content');
    drawContent.innerHTML = '';

    const mode = App.currentMode;
    const drawFn = { slot: Slot.start, roulette: Roulette.start, card: Card.start, shake: Shake.start }[mode];
    if (drawFn) drawFn(drawContent);
  },

  showReveal(text, drawn, total) {
    App.drawnCount = drawn;
    App.totalCount = total;
    document.getElementById('revealed-question').textContent = `"${text}"`;
    document.getElementById('reveal-progress').textContent = `Q.${drawn} / ${total}  |  REMAIN: ${total - drawn}`;
    App.showScreen('screen-reveal');
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
```

- [ ] **Step 2: 브라우저에서 화면 전환 확인**

- [ ADMIN ] 클릭 → 로그인 화면으로 이동하는지 확인
- [ BACK ] 클릭 → 제출 화면으로 돌아오는지 확인

- [ ] **Step 3: 커밋**

```bash
git add js/app.js
git commit -m "feat: screen routing and global state"
```

---

## Task 6: admin.js — 관리자 화면 로직

**Files:**
- Modify: `js/admin.js`

- [ ] **Step 1: admin.js 작성**

```javascript
// js/admin.js
const Admin = {
  editingId: null,

  async login() {
    const pw = document.getElementById('admin-password').value;
    const errEl = document.getElementById('login-error');
    errEl.classList.add('hidden');

    if (!pw) return;

    const res = await Api.getQuestions(pw);
    if (!res.ok) {
      errEl.classList.remove('hidden');
      document.getElementById('admin-password').value = '';
      return;
    }

    App.adminPassword = pw;
    document.getElementById('admin-password').value = '';
    Admin.renderDashboard(res.questions);
    App.showScreen('screen-admin-dash');
  },

  async loadDashboard() {
    const res = await Api.getQuestions(App.adminPassword);
    if (res.ok) Admin.renderDashboard(res.questions);
  },

  renderDashboard(questions) {
    const total = questions.length;
    const drawn = questions.filter(q => q.drawn).length;

    document.getElementById('question-stats').innerHTML =
      `TOTAL: ${total} &nbsp;|&nbsp; DRAWN: ${drawn} &nbsp;|&nbsp; LEFT: ${total - drawn}`;

    const list = document.getElementById('question-list');
    list.innerHTML = '';

    if (total === 0) {
      list.innerHTML = '<div style="font-size:8px;color:var(--text-dimmer);text-align:center;padding:20px">NO QUESTIONS YET</div>';
      return;
    }

    // 미뽑힌 것 먼저, 그 다음 뽑힌 것
    const sorted = [...questions].sort((a, b) => (a.drawn ? 1 : 0) - (b.drawn ? 1 : 0));

    sorted.forEach(q => {
      const item = document.createElement('div');
      item.className = `q-item${q.drawn ? ' drawn' : ''}`;

      const timeAgo = Admin.timeAgo(q.submitted_at);
      item.innerHTML = `
        <div class="q-item-info">
          <div class="q-item-text">${Admin.escapeHtml(q.text)}</div>
          <div class="q-item-time">${timeAgo}${q.drawn ? ' · DRAWN' : ''}</div>
        </div>
        <div class="q-item-actions">
          <button class="q-btn edit" data-id="${q.id}">EDIT</button>
          <button class="q-btn del" data-id="${q.id}">DEL</button>
        </div>
      `;

      item.querySelector('.edit').addEventListener('click', () => Admin.openEdit(q.id, q.text));
      item.querySelector('.del').addEventListener('click', () => Admin.deleteQuestion(q.id));

      list.appendChild(item);
    });
  },

  async deleteQuestion(id) {
    if (!confirm('삭제할까요?')) return;
    const res = await Api.deleteQuestion(App.adminPassword, id);
    if (res.ok) Admin.loadDashboard();
  },

  openEdit(id, text) {
    Admin.editingId = id;
    document.getElementById('edit-input').value = text;
    document.getElementById('modal-edit').classList.remove('hidden');

    document.getElementById('modal-save').onclick = () => Admin.saveEdit();
    document.getElementById('modal-cancel').onclick = () => Admin.closeEdit();
  },

  async saveEdit() {
    const text = document.getElementById('edit-input').value.trim();
    if (!text) return;
    const res = await Api.updateQuestion(App.adminPassword, Admin.editingId, text);
    if (res.ok) {
      Admin.closeEdit();
      Admin.loadDashboard();
    }
  },

  closeEdit() {
    Admin.editingId = null;
    document.getElementById('modal-edit').classList.add('hidden');
  },

  escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },

  timeAgo(isoString) {
    if (!isoString) return '';
    const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
    if (diff < 60) return `${diff}초 전`;
    if (diff < 3600) return `${Math.floor(diff/60)}분 전`;
    return `${Math.floor(diff/3600)}시간 전`;
  }
};
```

- [ ] **Step 2: 동작 확인**

1. index.html 열기 → `[ ADMIN ]` 클릭
2. 잘못된 비밀번호 입력 → "ACCESS DENIED" 표시 확인
3. 올바른 비밀번호 입력 → 대시보드 진입, 질문 목록 표시 확인
4. 삭제 버튼 클릭 → 시트에서 행 삭제됐는지 확인
5. 수정 버튼 클릭 → 모달 열림, 저장 후 목록 업데이트 확인

- [ ] **Step 3: 커밋**

```bash
git add js/admin.js
git commit -m "feat: admin dashboard with CRUD"
```

---

## Task 7: 슬롯머신 뽑기

**Files:**
- Modify: `js/draw/slot.js`

- [ ] **Step 1: slot.js 작성**

```javascript
// js/draw/slot.js
const Slot = {
  async start(container) {
    container.innerHTML = `
      <div class="slot-screen">
        <div class="retro-title slot-title">🎰 SLOT MACHINE</div>
        <div class="slot-arrows">▲▲▲</div>
        <div class="slot-machine">
          <div class="slot-reel" id="slot-reel"></div>
        </div>
        <div class="slot-arrows">▼▼▼</div>
        <button id="slot-spin-btn" class="pixel-btn" style="max-width:220px">▶ SPIN!</button>
        <button id="slot-back" class="pixel-btn-text">[ CHANGE MODE ]</button>
      </div>
    `;

    document.getElementById('slot-back').addEventListener('click', () => {
      App.showScreen('screen-mode-select');
    });

    document.getElementById('slot-spin-btn').addEventListener('click', () => Slot.spin());
  },

  async spin() {
    const btn = document.getElementById('slot-spin-btn');
    btn.disabled = true;

    // 뽑기 API 호출
    const res = await Api.drawQuestion(App.adminPassword);

    if (!res.ok) {
      if (res.error === 'NO_MORE_QUESTIONS') {
        document.querySelector('.slot-screen').innerHTML +=
          `<div style="font-size:9px;color:var(--green);text-align:center">★ ALL QUESTIONS DRAWN! ★</div>`;
      }
      btn.disabled = false;
      return;
    }

    // 더미 질문들로 릴 채우기 (시각적 효과)
    const dummies = [
      '회사 복지는?', '목표 달성률?', '채용 계획?', '비전은?',
      res.question.text, '연봉 인상?', '팀 확장?', res.question.text
    ];

    const reel = document.getElementById('slot-reel');
    reel.innerHTML = dummies.map((t, i) =>
      `<div class="slot-item${t === res.question.text && i === 4 ? ' selected' : ''}">${t}</div>`
    ).join('');

    // 초기 위치: 맨 아래에서 시작
    const itemHeight = 80;
    const targetIndex = 4; // 정답 위치
    reel.style.transition = 'none';
    reel.style.top = `-${(dummies.length - 1) * itemHeight}px`;

    await new Promise(r => setTimeout(r, 50));

    // 빠른 스크롤 → 감속 → 멈춤
    reel.style.transition = `top 2s cubic-bezier(0.23, 1, 0.32, 1)`;
    reel.style.top = `-${targetIndex * itemHeight}px`;

    await new Promise(r => setTimeout(r, 2200));

    App.showReveal(res.question.text, res.drawn, res.total);
  }
};
```

- [ ] **Step 2: 동작 확인**

1. 관리자 로그인 → START GAME → SLOT 선택
2. SPIN 버튼 클릭 → 릴이 돌다 멈추는 애니메이션 확인
3. 약 2초 후 공개 화면으로 전환 확인

- [ ] **Step 3: 커밋**

```bash
git add js/draw/slot.js
git commit -m "feat: slot machine draw animation"
```

---

## Task 8: 룰렛 뽑기

**Files:**
- Modify: `js/draw/roulette.js`

- [ ] **Step 1: roulette.js 작성**

```javascript
// js/draw/roulette.js
const Roulette = {
  async start(container) {
    container.innerHTML = `
      <div class="roulette-screen">
        <div class="retro-title" style="font-size:14px">🎡 ROULETTE</div>
        <div class="roulette-wrap">
          <canvas id="roulette-canvas" class="roulette-canvas" width="260" height="260"></canvas>
          <div class="roulette-pointer">▼</div>
        </div>
        <div id="roulette-label" style="font-size:8px;color:var(--text-dim);text-align:center">SPIN을 눌러주세요</div>
        <button id="roulette-spin-btn" class="pixel-btn" style="max-width:220px">▶ SPIN!</button>
        <button id="roulette-back" class="pixel-btn-text">[ CHANGE MODE ]</button>
      </div>
    `;

    document.getElementById('roulette-back').addEventListener('click', () => App.showScreen('screen-mode-select'));
    document.getElementById('roulette-spin-btn').addEventListener('click', () => Roulette.spin());

    // 초기 원판 그리기 (빈 칸으로)
    Roulette.draw(0, 8);
  },

  draw(angle, segments) {
    const canvas = document.getElementById('roulette-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 130, cy = 130, r = 120;
    const colors = ['#3730a3','#4f46e5','#6366f1','#818cf8','#4338ca','#5b21b6','#7c3aed','#6d28d9'];
    const segAngle = (Math.PI * 2) / segments;

    ctx.clearRect(0, 0, 260, 260);

    for (let i = 0; i < segments; i++) {
      const start = angle + i * segAngle;
      const end = start + segAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#0a0a0f';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 구분선 (픽셀 느낌)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(start), cy + r * Math.sin(start));
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 중심 원
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0f';
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.stroke();
  },

  async spin() {
    const btn = document.getElementById('roulette-spin-btn');
    const label = document.getElementById('roulette-label');
    btn.disabled = true;
    label.textContent = 'SPINNING...';

    const res = await Api.drawQuestion(App.adminPassword);

    if (!res.ok) {
      if (res.error === 'NO_MORE_QUESTIONS') label.textContent = '★ ALL DRAWN! ★';
      btn.disabled = false;
      return;
    }

    // 스핀 애니메이션
    const segments = 8;
    const duration = 3000;
    const totalRotation = Math.PI * 2 * 5 + Math.random() * Math.PI * 2; // 5바퀴 + 랜덤
    const startTime = Date.now();
    let current = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      current = totalRotation * eased;

      Roulette.draw(current, segments);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => App.showReveal(res.question.text, res.drawn, res.total), 500);
      }
    };

    requestAnimationFrame(animate);
  }
};
```

- [ ] **Step 2: 동작 확인**

1. ROULETTE 선택 → 원판이 그려지는지 확인
2. SPIN 클릭 → 빠르게 돌다 서서히 멈추는지 확인
3. 멈춘 후 공개 화면으로 전환 확인

- [ ] **Step 3: 커밋**

```bash
git add js/draw/roulette.js
git commit -m "feat: roulette wheel draw animation"
```

---

## Task 9: 카드 뒤집기 뽑기

**Files:**
- Modify: `js/draw/card.js`

- [ ] **Step 1: card.js 작성**

```javascript
// js/draw/card.js
const Card = {
  async start(container) {
    // 질문 수를 먼저 파악해서 카드 개수 결정
    const questionsRes = await Api.getQuestions(App.adminPassword);
    const remaining = questionsRes.ok
      ? questionsRes.questions.filter(q => !q.drawn).length
      : 5;

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

    const res = await Api.drawQuestion(App.adminPassword);

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
    backEl.style.fontSize = res.question.text.length > 30 ? '6px' : '7px';

    cardEl.classList.add('flipped');

    setTimeout(() => App.showReveal(res.question.text, res.drawn, res.total), 1200);
  }
};
```

- [ ] **Step 2: 동작 확인**

1. CARD 선택 → 뒤집힌 카드들이 그리드로 표시 확인
2. 카드 클릭 → 3D 플립 애니메이션으로 질문 공개 확인
3. 1.2초 후 공개 화면으로 전환 확인

- [ ] **Step 3: 커밋**

```bash
git add js/draw/card.js
git commit -m "feat: card flip draw animation"
```

---

## Task 10: 뽑기통 흔들기

**Files:**
- Modify: `js/draw/shake.js`

- [ ] **Step 1: shake.js 작성**

```javascript
// js/draw/shake.js
const Shake = {
  motionListener: null,
  lastShakeTime: 0,

  async start(container) {
    container.innerHTML = `
      <div class="shake-screen">
        <div class="retro-title" style="font-size:14px">🎲 SHAKE!</div>
        <div class="shake-pot" id="shake-pot">🏮</div>
        <div class="shake-hint">버튼을 누르거나<br>폰을 흔들어주세요!</div>
        <button id="shake-btn" class="pixel-btn" style="max-width:220px">🎲 SHAKE!</button>
        <button id="shake-back" class="pixel-btn-text">[ CHANGE MODE ]</button>
      </div>
    `;

    document.getElementById('shake-back').addEventListener('click', () => {
      Shake.cleanup();
      App.showScreen('screen-mode-select');
    });

    document.getElementById('shake-btn').addEventListener('click', () => Shake.trigger());

    // 모바일 흔들기 감지
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS 13+ 권한 요청
      DeviceMotionEvent.requestPermission().then(state => {
        if (state === 'granted') Shake.setupMotion();
      }).catch(() => {});
    } else if (window.DeviceMotionEvent) {
      Shake.setupMotion();
    }
  },

  setupMotion() {
    let lastAcc = { x: 0, y: 0, z: 0 };
    Shake.motionListener = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const delta = Math.abs(acc.x - lastAcc.x) + Math.abs(acc.y - lastAcc.y) + Math.abs(acc.z - lastAcc.z);
      lastAcc = { x: acc.x, y: acc.y, z: acc.z };
      const now = Date.now();
      if (delta > 25 && now - Shake.lastShakeTime > 2000) {
        Shake.lastShakeTime = now;
        Shake.trigger();
      }
    };
    window.addEventListener('devicemotion', Shake.motionListener);
  },

  cleanup() {
    if (Shake.motionListener) {
      window.removeEventListener('devicemotion', Shake.motionListener);
      Shake.motionListener = null;
    }
  },

  async trigger() {
    const btn = document.getElementById('shake-btn');
    const pot = document.getElementById('shake-pot');
    if (!btn || !pot) return;

    btn.disabled = true;
    pot.classList.add('shaking');

    await new Promise(r => setTimeout(r, 600));
    pot.classList.remove('shaking');

    const res = await Api.drawQuestion(App.adminPassword);

    if (!res.ok) {
      if (res.error === 'NO_MORE_QUESTIONS') {
        pot.textContent = '🎊';
        document.querySelector('.shake-hint').textContent = '★ ALL QUESTIONS DRAWN! ★';
      }
      btn.disabled = false;
      return;
    }

    Shake.cleanup();
    App.showReveal(res.question.text, res.drawn, res.total);
  }
};
```

- [ ] **Step 2: 동작 확인**

1. SHAKE 선택 → 뽑기통(🏮) 이모지 화면 확인
2. SHAKE 버튼 클릭 → 흔들리는 애니메이션 후 공개 화면 전환 확인
3. 모바일에서 폰 흔들기 → 자동 발동 확인 (iOS: 권한 요청 팝업 표시)

- [ ] **Step 3: 커밋**

```bash
git add js/draw/shake.js
git commit -m "feat: shake pot draw animation with device motion"
```

---

## Task 11: GitHub Pages 배포

**Files:**
- Create: `.github/workflows/deploy.yml` (선택사항 — 자동 배포)

- [ ] **Step 1: GitHub 레포 생성**

```bash
# GitHub에서 새 레포 생성 후
git remote add origin https://github.com/YOUR_USERNAME/workshop-qa.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: GitHub Pages 활성화**

GitHub 레포 → Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / `/ (root)` → Save

- [ ] **Step 3: 배포 URL 확인**

약 1~2분 후 `https://YOUR_USERNAME.github.io/workshop-qa/` 접속 확인.

- [ ] **Step 4: 모바일에서 접속 테스트**

- 질문 제출 → 시트에 행 추가 확인
- 관리자 로그인 → 질문 목록 확인
- 4가지 모드로 각각 뽑기 테스트

- [ ] **Step 5: 최종 커밋**

```bash
git add .
git commit -m "feat: complete workshop QA game"
git push
```

---

## Self-Review

**스펙 커버리지 확인:**
- [x] 직원 익명 제출 → Task 4, 5
- [x] 피플팀 비밀번호 관리자 모드 → Task 6
- [x] 질문 수정/삭제 → Task 6
- [x] 슬롯머신 → Task 7
- [x] 룰렛 → Task 8
- [x] 카드 뒤집기 → Task 9
- [x] 뽑기통 흔들기 → Task 10
- [x] 질문 공개 화면 (진행 표시, 전체화면) → Task 5 (app.js)
- [x] 뽑힌 질문 중복 방지 → Task 3 (drawQuestion)
- [x] 스팸 방지 쿨다운 → Task 5
- [x] 스프레드시트 구조 → Task 3
- [x] GitHub Pages 배포 → Task 11

**타입 일관성 확인:**
- `Api.drawQuestion(password)` → slot.js, roulette.js, card.js, shake.js 모두 동일 시그니처 ✓
- `App.showReveal(text, drawn, total)` → 모든 draw 모듈에서 동일하게 호출 ✓
- `App.adminPassword` → admin.js, app.js, 모든 draw 모듈에서 동일 키 사용 ✓
