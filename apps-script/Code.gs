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

function getLeaderboardSheet() {
  const { sheetId } = getConfig();
  const ss = SpreadsheetApp.openById(sheetId);
  let sheet = ss.getSheetByName('leaderboard');
  if (!sheet) {
    sheet = ss.insertSheet('leaderboard');
    sheet.appendRow(['name', 'coins', 'updated_at']);
  }
  return sheet;
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

    if (action === 'submitQuestion')  return submitQuestion(data);
    if (action === 'drawQuestion')    return drawQuestion();
    if (action === 'getQuestions')    return getQuestions();
    if (action === 'saveScore')       return saveScore(data);
    if (action === 'getLeaderboard')  return getLeaderboard();

    if (!checkAdmin(password)) return respond({ ok: false, error: 'ACCESS DENIED' });
    if (action === 'deleteQuestion') return deleteQuestion(data);
    if (action === 'updateQuestion') return updateQuestion(data);

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
  if (!id) return respond({ ok: false, error: 'Missing id' });

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const sheet = getSheet();
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === id) {
        sheet.deleteRow(i + 1);
        return respond({ ok: true });
      }
    }
    return respond({ ok: false, error: 'Not found' });
  } finally {
    lock.releaseLock();
  }
}

// ── 질문 수정 (관리자) ───────────────────────────────
function updateQuestion(data) {
  const { id, text } = data;
  if (!id) return respond({ ok: false, error: 'Missing id' });
  const trimmed = (text || '').trim();
  if (!trimmed || trimmed.length > 200) return respond({ ok: false, error: 'Invalid text' });

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const sheet = getSheet();
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === id) {
        sheet.getRange(i + 1, 2).setValue(trimmed);
        return respond({ ok: true });
      }
    }
    return respond({ ok: false, error: 'Not found' });
  } finally {
    lock.releaseLock();
  }
}

// ── 리더보드: 점수 저장 ─────────────────────────────
function saveScore(data) {
  const name = (data.name || '').trim();
  const coins = parseInt(data.coins, 10);
  if (!name || name.length > 20 || isNaN(coins)) return respond({ ok: false, error: 'Invalid data' });

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const sheet = getLeaderboardSheet();
    const rows = sheet.getDataRange().getValues();
    const now = new Date().toISOString();

    // 이름이 같으면 업데이트
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === name) {
        sheet.getRange(i + 1, 2).setValue(coins);
        sheet.getRange(i + 1, 3).setValue(now);
        return respond({ ok: true });
      }
    }
    // 새 참가자
    sheet.appendRow([name, coins, now]);
    return respond({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// ── 리더보드: 조회 ──────────────────────────────────
function getLeaderboard() {
  const sheet = getLeaderboardSheet();
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return respond({ ok: true, leaderboard: [] });

  const leaderboard = rows.slice(1)
    .filter(r => r[0])
    .map(r => ({ name: r[0], coins: parseInt(r[1], 10) || 0 }))
    .sort((a, b) => b.coins - a.coins);

  return respond({ ok: true, leaderboard });
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
