import { saveToken } from './auth.js';

const app = document.getElementById('app');
app.innerHTML = `
  <h2>Sign In</h2>
  <form id="loginForm">
    <input id="email" placeholder="Email" type="email" required><br><br>
    <input id="password" placeholder="Password" type="password" required><br><br>
    <button class="btn" type="submit">LOGIN</button>
  </form>
  <div id="msg"></div>
`;
document.getElementById('loginForm').onsubmit = async e => {
  e.preventDefault();
  const body = JSON.stringify({
    email:   email.value,
    password:password.value
  });
  const res = await fetch('http://localhost:4000/api/login',{
    method:'POST', headers:{ 'Content-Type':'application/json'}, body
  });
  if(res.ok){
    const { token } = await res.json();
    saveToken(token);
    location.href='rooms.html';
  }else{
    msg.textContent='Login failed';
  }
};
// -------------- SIGN‑UP modal logic ------------------
const openBtn      = document.getElementById('openSignup');
const overlay      = document.getElementById('signupOverlay');
const signupForm   = document.getElementById('signupForm');
const avatarGrid   = document.getElementById('avatarGrid');

// show / hide modal
openBtn.onclick           = () => overlay.classList.remove('hidden');
overlay.onclick = e => { if (e.target === overlay) overlay.classList.add('hidden'); };

// build 8‑avatar grid
for (let i = 1; i <= 8; i++) {
  avatarGrid.insertAdjacentHTML('beforeend', `
    <label>
      <input type="radio" name="avatar" value="${i}" ${i===1?'checked':''}>
      <img src="assets/avatars/${i}.png" class="avatar">
    </label>`);
}

// handle submit
signupForm.onsubmit = async (e) => {
  e.preventDefault();

  const body = {
    username : document.getElementById('suUsername').value.trim(),
    email    : document.getElementById('suEmail').value.trim(),
    password : document.getElementById('suPass').value,
    avatar   : Number(document.querySelector('input[name=avatar]:checked').value)
  };

  const res = await fetch('http://localhost:4000/api/signup', {
    method : 'POST',
    headers: { 'Content-Type':'application/json' },
    body   : JSON.stringify(body)
  });

  if (res.ok) {
    const { token } = await res.json();
    saveToken(token);                 // already defined in auth.js
    location.href = 'rooms.html';
  } else {
    alert('Signup failed – maybe email or username already used.');
  }
};
