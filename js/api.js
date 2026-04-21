// js/api.js
const API_URL = 'YOUR_APPS_SCRIPT_DEPLOY_URL'; // Task 3 Step 5에서 복사한 URL

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
  drawQuestion(password) {
    return apiCall({ action: 'drawQuestion', password });
  }
};
