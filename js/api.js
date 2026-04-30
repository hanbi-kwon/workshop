// js/api.js
const API_URL = 'https://script.google.com/macros/s/AKfycbyL6Biqketh9Idg6_MzkLXKfdipvKx8QghKcLmfLuYmVqXX2OA-x7NT_NQAmRp4taMU/exec';

async function apiCall(payload) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
  drawQuestion() {
    return apiCall({ action: 'drawQuestion' });
  },
  saveScore(name, coins) {
    return apiCall({ action: 'saveScore', name, coins });
  },
  getLeaderboard() {
    return apiCall({ action: 'getLeaderboard' });
  }
};
