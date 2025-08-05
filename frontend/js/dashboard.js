export async function renderMiniDash(targetSelector){
  const box = document.querySelector(targetSelector);
  if(!box) return;

  /* fetch only streaks */
  const res = await fetch('http://localhost:4000/api/stats/overview',{ headers:authHeader() });
  const s   = await res.json();

  box.innerHTML = `
    <div class="statTile" style="width:110px;margin-bottom:6px">
      <span class="bigNum">${s.currentStreak}</span>
      <p style="font-size:10px">Streak</p>
    </div>
  `;
}




import { authHeader, getToken } from './auth.js';
if(!getToken()) location.href='index.html';

const app = document.getElementById('app');
app.innerHTML = `
  <div class="dashCard">

    <div class="tileRow">
      <div class="statTile">
        <span id="curStreak" class="bigNum">0</span>
        <p>Day streak</p>
      </div>
      <div class="statTile">
        <span id="longStreak" class="bigNum">0</span>
        <p>Longest</p>
      </div>
    </div>

    <div class="chartBox"><canvas id="weekChart" height="120"></canvas></div>
    <div class="chartBox" style="margin-top:16px">
      <canvas id="distChart" height="120"></canvas>
    </div>

    <button id="back" class="btn mt">BACK</button>
  </div>`;


document.getElementById('back').onclick = () => history.back();

/* ---------- fetch stats ---------- */
(async ()=>{
  const res = await fetch('http://localhost:4000/api/stats/overview',{ headers:authHeader() });
  const s   = await res.json();

  /* numbers */
  document.getElementById('curStreak').textContent  = s.currentStreak;
  document.getElementById('longStreak').textContent = s.longestStreak;

  /* weekly bar */
  new Chart(document.getElementById('weekChart'),{
    type:'bar',
    data:{
      labels:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
      datasets:[{ data:s.weeklyMinutes, borderWidth:0 }]
    },
    options:{
      responsive:true,
      plugins:{ legend:{display:false} },
      scales:{
        y:{ ticks:{stepSize:10}, grid:{color:'#3c3254'} },
        x:{ grid:{display:false} }
      }
    }
  });

  /* distribution doughnut */
  new Chart(document.getElementById('distChart'),{
    type:'doughnut',
    data:{
      labels:['Work','Break'],
      datasets:[{ data:[s.distribution.work||0, s.distribution.break||0] }]
    },
    options:{
      responsive:true,
      plugins:{ legend:{position:'bottom'} }
    }
  });
})();
Chart.defaults.color         = '#dcdafc';     // light labels
Chart.defaults.borderColor   = '#3c3254';     // grid lines
