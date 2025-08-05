/*****************************************************************
 *  ChronoStudy – Pixel‑Focus Pomodoro script
 *****************************************************************/
import { authHeader, getToken } from './auth.js';
if (!getToken()) location.href = 'index.html';

/* ---------- constants ---------- */
const DUR = { work:25*60, short:5*60, long:15*60 };

/* ---------- inject UI ---------- */
const app  = document.getElementById('app');
app.innerHTML = `
  <div class="pomoCard">

    <div class="tabRow">
      <button data-mode="work"  class="tab current">Work</button>
      <button data-mode="short" class="tab">Short</button>
      <button data-mode="long"  class="tab">Long</button>
    </div>

    <div id="clock" class="clock">25:00</div>

    <button id="mainBtn" class="pomoBtn">START</button>

    <p id="status" class="status">Ready!</p>

    <h4 class="taskHead">Tasks</h4>
    <ul id="taskList" class="taskList"></ul>
    <button id="addTask" class="btn btn-sm">+ Add task (next sprint)</button>

  </div>`;
/* ------------------------------------------------------------- */

const clock   = document.getElementById('clock');
const mainBtn = document.getElementById('mainBtn');
const status  = document.getElementById('status');

let mode        = 'work';          // work | short | long
let secondsLeft = DUR[mode];
let tick        = null;
let running     = false;
let sessionId   = null;

/* ---------- helpers ---------- */
const show = s=>{
  const m = String(Math.floor(s/60)).padStart(2,'0');
  const n = String(s%60).padStart(2,'0');
  clock.textContent = `${m}:${n}`;
};
const roomId = () => new URLSearchParams(location.search).get('room');

/* ---------- tab switching ---------- */
document.querySelectorAll('.tab').forEach(btn=>{
  btn.onclick = ()=>{
    if(running) return;                   // don’t switch mid‑session
    document.querySelector('.tab.current').classList.remove('current');
    btn.classList.add('current');
    mode = btn.dataset.mode;
    secondsLeft = DUR[mode];
    show(secondsLeft);
  };
});

/* ---------- start / pause ---------- */
mainBtn.onclick = async ()=>{
  if(!running){                 /* -------- START -------- */
    const res = await fetch('http://localhost:4000/api/rooms/pomodoro/start',{
      method : 'POST',
      headers: { 'Content-Type':'application/json', ...authHeader() },
      body   : JSON.stringify({ room_id: roomId(), mode })
    });
    const out = await res.json();
    sessionId = out.session.id;

    running = true;
    mainBtn.textContent = 'STOP';
    status.textContent  = `Focus for ${mode==='work'?'work':'break'}!`;

    tick = setInterval(()=>{
      secondsLeft--; show(secondsLeft);
      if(secondsLeft<=0) stopSession();
    },1000);

  } else {                      /* -------- STOP -------- */
    stopSession();
  }
};

async function stopSession(){
  clearInterval(tick);
  running = false;
  mainBtn.textContent = 'START';
  status.textContent  = 'Paused';

  if(sessionId){
    await fetch('http://localhost:4000/api/rooms/pomodoro/stop',{
      method : 'POST',
      headers: { 'Content-Type':'application/json', ...authHeader() },
      body   : JSON.stringify({ session_id: sessionId })
    });
    sessionId = null;
  }
}

/* ---------- initial ---------- */
show(secondsLeft);
