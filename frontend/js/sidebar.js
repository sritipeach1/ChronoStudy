import { authHeader, getToken, clearToken } from './auth.js';
if (!getToken()) location.href = 'index.html';

(async () => {
  const res = await fetch('http://localhost:4000/api/me', { headers: authHeader() });
  const me  = await res.json();
  document.body.insertAdjacentHTML('afterbegin', `
    <aside id="sidebar">
      <img class="avatar" src="assets/avatars/${me.avatar}.png">
      <div class="caption">@${me.username}</div>
      <button id="logout" class="btn btn-sm mt">LOG OUT</button>
    </aside>`);
  logout.onclick = () => { clearToken(); location.href='index.html'; };
})();
