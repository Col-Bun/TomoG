// ===== UTILS =====
function todayStr() { const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function formatDate(s) { const [y,m,d]=s.split('-'); const mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return mo[parseInt(m)-1]+' '+parseInt(d)+', '+y; }
function formatDateTime(d) { return formatDate(todayStr()) + ' at ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); }
function escHtml(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML;}

function updateThemeIcon() { document.getElementById('theme-btn').textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙'; }
function toggleTheme() { document.body.classList.toggle('dark-mode'); localStorage.setItem('studyBuddyTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); updateThemeIcon(); }

// ===== DATA INITIALIZATION =====
const STORAGE_KEY = 'studyBuddyData';
function getDefaultData() { 
  return { 
    days: {}, dictionary: [], diary: [], streak: 0, 
    lastActiveDate: null, starterLoaded: false, 
    schedule: {}, calendar: {}, quotes: [] 
  }; 
}

function loadData() { 
  try { 
    const r = localStorage.getItem(STORAGE_KEY); 
    if (r) { 
      let loaded = JSON.parse(r); 
      if (!loaded.diary) loaded.diary = []; 
      if (!loaded.schedule) loaded.schedule = {};
      if (!loaded.calendar) loaded.calendar = {};
      if (!loaded.quotes) loaded.quotes = []; 
      return loaded; 
    } 
  } catch(e) {} 
  return getDefaultData(); 
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
let data = loadData();

// ===== PASSWORD SCREEN (FIXED) =====
document.getElementById('pw-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    const val = this.value.toLowerCase().trim();
    // Directly check for 'cake' or 'moe'
    if (val === 'cake' || val === 'moe') {
      document.getElementById('password-screen').style.display = 'none'; 
      document.getElementById('app').style.display = 'block'; 
      initApp();
    } else { 
      document.getElementById('pw-error').textContent = 'Wrong password... try again!'; 
      this.value = ''; 
    }
  }
});

// ===== TAB SWITCHING =====
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active')); 
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    btn.classList.add('active'); 
    const tabId = btn.dataset.tab;
    document.getElementById('tab-'+tabId).classList.add('active');

    const moeContainer = document.getElementById('moe-container');
    if(moeContainer) {
      if(tabId === 'home') {
         moeContainer.className = 'creature-area glass';
         const mainRow = document.querySelector('.home-main-row');
         const readCard = document.getElementById('card-read');
         if(mainRow && readCard) mainRow.insertBefore(moeContainer, readCard);
      } else {
         moeContainer.className = 'persistent-moe';
         document.body.appendChild(moeContainer);
      }
    }
  });
});

// ===== LOGGING LOGIC =====
function logFlashcards(){
  const val=parseInt(document.getElementById('flash-minutes').value); if(!val||val<=0) return;
  const today=todayStr(); if(!data.days[today]) data.days[today]={flash:0,read:0};
  data.days[today].flash += val;
  document.getElementById('flash-input-area').style.display='none'; 
  document.getElementById('flash-done').style.display='block'; 
  document.getElementById('flash-done-text').textContent=data.days[today].flash+' min today!';
  document.getElementById('card-flash').classList.add('done');
  saveData(); updateStats(); updateMood(); calcStreak();
}

function logReading(){
  const val=parseFloat(document.getElementById('read-hours').value); if(!val||val<=0) return;
  const today=todayStr(); if(!data.days[today]) data.days[today]={flash:0,read:0};
  data.days[today].read += val;
  document.getElementById('read-input-area').style.display='none'; 
  document.getElementById('read-done').style.display='block'; 
  document.getElementById('read-done-text').textContent=data.days[today].read+' hrs today!';
  document.getElementById('card-read').classList.add('done');
  saveData(); updateStats(); updateMood(); calcStreak();
}

// ===== QUOTES =====
function addQuote() {
  const text = document.getElementById('quote-text').value.trim();
  const img = document.getElementById('quote-img').value.trim();
  if (!text) return;
  if (!data.quotes) data.quotes = [];
  data.quotes.push({ text: text, img: img, date: todayStr() });
  document.getElementById('quote-text').value = '';
  document.getElementById('quote-img').value = '';
  saveData(); renderQuotes();
}

function deleteQuote(i) {
  data.quotes.splice(i, 1);
  saveData(); renderQuotes();
}

function renderQuotes() {
  const list = document.getElementById('quotes-list');
  if (!list) return;
  list.innerHTML = '';
  if(!data.quotes || !data.quotes.length) {
    list.innerHTML = '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:20px">No quotes saved yet.</p>';
    return;
  }
  data.quotes.slice().reverse().forEach((q, index) => {
    const realIndex = data.quotes.length - 1 - index;
    const row = document.createElement('div');
    row.className = 'diary-entry';
    let imgHtml = q.img ? `<img src="${escHtml(q.img)}" style="max-width:100%; border-radius:12px; margin-top:12px; border:1px solid rgba(255,255,255,0.2);">` : '';
    row.innerHTML = `
      <div style="font-style:italic; font-size:1.1rem; color:#fff; line-height:1.5;">"${escHtml(q.text)}"</div>
      ${imgHtml}
      <button class="diary-del-btn" onclick="deleteQuote(${realIndex})">×</button>
    `;
    list.appendChild(row);
  });
}

// ===== SCHEDULE =====
function renderSchedule() {
  const list = document.getElementById('schedule-list');
  if(!list) return;
  list.innerHTML = '';
  for(let i=0; i<24; i++) {
    let hour = i === 0 ? 12 : (i > 12 ? i - 12 : i);
    let ampm = i < 12 ? "AM" : "PM";
    let val = data.schedule[i] || "";
    list.innerHTML += `<div class="schedule-row">
      <div class="schedule-time">${hour} ${ampm}</div>
      <input type="text" class="schedule-input" id="sched-input-${i}" value="${escHtml(val)}" placeholder="...">
    </div>`;
  }
}

function saveSchedule() {
  for(let i=0; i<24; i++) { data.schedule[i] = document.getElementById(`sched-input-${i}`).value; }
  saveData();
}

// ===== CALENDAR =====
let currentDate = new Date();
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  document.getElementById('cal-month-year').textContent = `${months[month]} ${year}`;
  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for(let i=0; i<firstDay; i++) grid.innerHTML += `<div></div>`;
  for(let i=1; i<=daysInMonth; i++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
    const tasks = data.calendar[dateStr] || [];
    let taskHTML = tasks.slice(0, 2).map(t => `<div class="cal-task">${escHtml(t)}</div>`).join('');
    grid.innerHTML += `<div class="cal-day" onclick="openCalModal('${dateStr}')"><div class="cal-day-num">${i}</div>${taskHTML}</div>`;
  }
}
function changeMonth(delta) { currentDate.setMonth(currentDate.getMonth() + delta); renderCalendar(); }

// ===== APP INITIALIZATION =====
function initApp(){
  document.getElementById('date-display').textContent=formatDate(todayStr()); 
  updateThemeIcon();
  renderSchedule();
  renderCalendar();
  renderQuotes();
  // Add other render functions here as needed (Dictionary, Diary, etc.)
  saveData();
}
