// frontend/js/rooms.js
import { authHeader, clearToken, getToken } from './auth.js';


if (!getToken()) location.href = 'index.html';

const app  = document.getElementById('app');
app.innerHTML = `
  <h1 class="title">Rooms</h1>

  <input id="roomName" placeholder="New room name">
  <button id="createBtn" class="btn">
    <img src="assets/icons/plus.png" class="icon"> CREATE
  </button>

  <ul id="roomsList"></ul>
`;

/* ---------- create room ---------- */
document.getElementById('createBtn').onclick = async () => {
  const name = document.getElementById('roomName').value.trim();
  if (!name) return;
  await fetch('http://localhost:4000/api/rooms', {
    method : 'POST',
    headers: { 'Content-Type':'application/json', ...authHeader() },
    body   : JSON.stringify({ name })
  });
  document.getElementById('roomName').value = '';
  loadRooms();
};

/* ---------- load & render list ---------- */
async function loadRooms() {
  const res   = await fetch('http://localhost:4000/api/rooms', { headers: authHeader() });
  const rooms = await res.json();

  const list = document.getElementById('roomsList');
  list.innerHTML = rooms.map(r => `
    <li class="roomRow">
      <span>${r.name}</span>
      <span class="badge">${(r.member_count || 0)}/10</span>
      <button class="btn btn-sm" data-id="${r.id}">
        <img src="assets/icons/door.png" class="icon"> JOIN
      </button>
    </li>`).join('');
}

/* ---------- join room ---------- */
document.getElementById('roomsList').onclick = e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  location.href = `pomodoro.html?room=${id}`;
};

/* ---------- dashboard shortcut ---------- */
app.insertAdjacentHTML('beforeend', `
  <button id="dashBtn" class="btn mt">
    <img src="assets/icons/graph.png" class="icon"> DASHBOARD
  </button>
`);
document.getElementById('dashBtn').onclick = () => location.href = 'dashboard.html';

loadRooms();
