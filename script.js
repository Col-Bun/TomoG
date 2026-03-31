@@ -5,22 +5,15 @@ function formatDateTime(d) { return formatDate(todayStr()) + ' at ' + d.toLocale
function escHtml(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML;}

function updateThemeIcon() { document.getElementById('theme-btn').textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙'; }
updateThemeIcon();
function toggleTheme() { document.body.classList.toggle('dark-mode'); localStorage.setItem('studyBuddyTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); updateThemeIcon(); }

// ===== DATA INITIALIZATION =====
const STORAGE_KEY = 'studyBuddyData';
function getDefaultData() { 
  return { 
    days: {}, 
    dictionary: [], 
    diary: [], 
    streak: 0, 
    lastActiveDate: null, 
    starterLoaded: false, 
    schedule: {}, 
    calendar: {},
    quotes: [] // <--- Added this!
    days: {}, dictionary: [], diary: [], streak: 0, 
    lastActiveDate: null, starterLoaded: false, 
    schedule: {}, calendar: {}, quotes: [] 
  }; 
}

@@ -32,7 +25,7 @@ function loadData() {
      if (!loaded.diary) loaded.diary = []; 
      if (!loaded.schedule) loaded.schedule = {};
      if (!loaded.calendar) loaded.calendar = {};
      if (!loaded.quotes) loaded.quotes = []; // <--- Added this!
      if (!loaded.quotes) loaded.quotes = []; 
      return loaded; 
    } 
  } catch(e) {} 
@@ -41,82 +34,31 @@ function loadData() {
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
let data = loadData();

if (!data.starterLoaded && typeof starterDeck !== 'undefined') {
  starterDeck.forEach(word => { if (!data.dictionary.some(w => w.en === word.en)) data.dictionary.push({ en: word.en, jp: word.jp, es: word.es, addedDate: todayStr() }); });
  data.starterLoaded = true; saveData();
}

// ===== NES PASSWORD =====
function generatePassword() { document.getElementById('nes-password-box').value = btoa(encodeURIComponent(JSON.stringify(data))).match(/.{1,8}/g).join('-'); }
function loadPassword() {
  const input = document.getElementById('nes-password-box').value.trim(); if (!input) return alert("ENTER PASSWORD.");
  try {
    let imported = JSON.parse(decodeURIComponent(atob(input.replace(/[-\s]/g, ''))));
    if (imported.days && imported.dictionary) { 
      if (!imported.diary) imported.diary = []; 
      if (!imported.calendar) imported.calendar = {};
      if (!imported.quotes) imported.quotes = [];
      data = imported; saveData(); initApp(); alert("RESTORED!"); document.getElementById('nes-password-box').value = ''; 
    } else alert("INVALID DATA.");
  } catch (err) { alert("INVALID FORMAT."); }
}
function copyPassword() { const pwBox = document.getElementById('nes-password-box'); if (!pwBox.value) return; pwBox.select(); document.execCommand('copy'); alert("COPIED!"); }

function calcStreak() {
  const sortedDays=Object.keys(data.days).sort().reverse(); if(!sortedDays.length){data.streak=0;return;}
  let streak=0, cd=new Date(); if(!data.days[todayStr()])cd.setDate(cd.getDate()-1);
  while(true){ const ds=cd.getFullYear()+'-'+String(cd.getMonth()+1).padStart(2,'0')+'-'+String(cd.getDate()).padStart(2,'0'); const day=data.days[ds]; if(day&&(day.flash>0||day.read>0)){streak++;cd.setDate(cd.getDate()-1);}else break; }
  data.streak=streak;
}

const speeches={ greeting:{en:"Hello! Let's study today!",jp:"こんにちは！今日も勉強しよう！",es:"¡Hola! ¡Estudiemos hoy!"}, bothDone:{en:"Amazing work today!",jp:"今日はすごい！",es:"¡Increíble hoy!"}, flashDone:{en:"Great flashcards! Now read!",jp:"次は読書だよ！",es:"¡Bien! ¡Ahora a leer!"}, readDone:{en:"Nice reading!",jp:"読書お疲れ！",es:"¡Buena lectura!"}, streakHigh:{en:"🔥 Incredible streak!",jp:"🔥 すごい連続記録！",es:"🔥 ¡Racha increíble!"}, newWord:{en:"New word learned!",jp:"新しい単語を覚えた！",es:"¡Nueva palabra!"} };
function setSpeech(k){const s=speeches[k];if(!s)return;document.getElementById('speech-en').textContent=s.en;document.getElementById('speech-jp').textContent=s.jp;document.getElementById('speech-es').textContent=s.es;}

function updateMood(){
  const today=data.days[todayStr()]||{};let mood=30; if(today.flash>0)mood+=30;if(today.read>0)mood+=30;if(data.streak>=3)mood+=10; mood=Math.min(100,mood);
  const fill=document.getElementById('mood-fill'),text=document.getElementById('mood-text'); fill.style.width=mood+'%';
  if(mood>=90){fill.style.background='linear-gradient(90deg,#7ec832,#a8e84c)';text.textContent='Ecstatic!';setCreatureState('happy');}
  else if(mood>=60){fill.style.background='linear-gradient(90deg,#ffcc00,#ff8a00)';text.textContent='Happy';setCreatureState('idle');}
  else if(mood>=40){fill.style.background='linear-gradient(90deg,#ff8a00,#e06500)';text.textContent='Neutral';setCreatureState('idle');}
  else{fill.style.background='linear-gradient(90deg,#ff3c8e,#d42070)';text.textContent='Needs attention';setCreatureState('sad');}
}

const spriteMap={ idle:'./idle.png', happy:'./happy.png', sad:'./sad.png', sleep:'./sleep.png', study:'./study.png', read:'./read.png', celebrate:'./celebrate.png' };
function setCreatureState(state){ const el=document.getElementById('sprite-img');if(!el)return; el.src=spriteMap[state]||spriteMap.idle; }

let isBouncing = false;
const spriteEl = document.getElementById('creature-sprite');
if (spriteEl) {
  spriteEl.addEventListener('click', function(e) {
    if(isBouncing) return; isBouncing = true; const img = document.getElementById('sprite-img'); const prevSrc = img.src; img.src = spriteMap.happy; this.classList.add('animate-bounce');
    for(let i = 0; i < Math.floor(Math.random() * 3) + 3; i++) {
      const heart = document.createElement('div'); heart.textContent = ['💖', '✨', '💕', '💗'][Math.floor(Math.random()*4)]; heart.className = 'heart-particle';
      heart.style.setProperty('--tx', (Math.random() - 0.5) * 120 + 'px'); heart.style.setProperty('--ty', -(Math.random() * 120 + 60) + 'px'); heart.style.left = '45%'; heart.style.top = '45%';
      this.appendChild(heart); setTimeout(() => heart.remove(), 800);
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
    setTimeout(() => { this.classList.remove('animate-bounce'); if(img.src.includes('happy.png')) img.src = prevSrc; isBouncing = false; }, 400);
  });
}

document.getElementById('pw-input').addEventListener('keydown',function(e){
  if(e.key==='Enter'){
    if(btoa(this.value.toLowerCase().trim()) === 'Y2FrZQ=='){
      document.getElementById('password-screen').style.display='none'; document.getElementById('app').style.display='block'; initApp();
    }else{ document.getElementById('pw-error').textContent='Wrong password... try again!'; this.value=''; }
  }
});

// ===== TAB SWITCHING & MOE-CHAN CENTER LOGIC =====
// ===== TAB SWITCHING =====
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active')); 
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    btn.classList.add('active'); 
    
    const tabId = btn.dataset.tab;
    document.getElementById('tab-'+tabId).classList.add('active');

    // Dynamic Moe-Chan placement
    const moeContainer = document.getElementById('moe-container');
    if(moeContainer) {
      if(tabId === 'home') {
@@ -132,70 +74,35 @@ document.querySelectorAll('.tab-btn').forEach(btn=>{
  });
});

// ===== LOGGING LOGIC =====
function logFlashcards(){
  const val=parseInt(document.getElementById('flash-minutes').value);if(!val||val<=0)return;
  const today=todayStr();if(!data.days[today])data.days[today]={flash:0,read:0}; data.days[today].flash=(data.days[today].flash||0)+val;
  document.getElementById('flash-input-area').style.display='none'; document.getElementById('flash-done').style.display='block'; document.getElementById('flash-done-text').textContent=data.days[today].flash+' min today!';
  document.getElementById('card-flash').classList.add('done'); setCreatureState('study');
  const readDone=(data.days[today].read||0)>0;setSpeech(readDone?'bothDone':'flashDone'); calcStreak();saveData();updateStats();updateMood(); if(readDone)setTimeout(()=>setCreatureState('celebrate'),300);
}
function logReading(){
  const val=parseFloat(document.getElementById('read-hours').value);if(!val||val<=0)return;
  const today=todayStr();if(!data.days[today])data.days[today]={flash:0,read:0}; data.days[today].read=(data.days[today].read||0)+val;
  document.getElementById('read-input-area').style.display='none'; document.getElementById('read-done').style.display='block'; document.getElementById('read-done-text').textContent=data.days[today].read+' hrs today!';
  document.getElementById('card-read').classList.add('done'); setCreatureState('read');
  const flashDone=(data.days[today].flash||0)>0;setSpeech(flashDone?'bothDone':'readDone'); calcStreak();saveData();updateStats();updateMood(); if(flashDone)setTimeout(()=>setCreatureState('celebrate'),300);
}

function addWord(){
  const en=document.getElementById('dict-en').value.trim(),jp=document.getElementById('dict-jp').value.trim(),es=document.getElementById('dict-es').value.trim(); if(!en&&!jp&&!es)return;
  data.dictionary.push({en:en||'—',jp:jp||'—',es:es||'—',addedDate:todayStr()});
  document.getElementById('dict-en').value='';document.getElementById('dict-jp').value='';document.getElementById('dict-es').value=''; saveData();renderDictionary();updateStats();setSpeech('newWord');setCreatureState('happy');
}
['dict-en','dict-jp','dict-es'].forEach(id=>{document.getElementById(id).addEventListener('keydown',e=>{if(e.key==='Enter')addWord();});});
function deleteWord(i){data.dictionary.splice(i,1);saveData();renderDictionary();updateStats();}

function renderDictionary(){
  const search=(document.getElementById('dict-search').value||'').toLowerCase(); const list=document.getElementById('dict-list');list.innerHTML='';
  const filtered=data.dictionary.filter(w=>{if(!search)return true;return w.en.toLowerCase().includes(search)||w.jp.toLowerCase().includes(search)||w.es.toLowerCase().includes(search);});
  filtered.slice().reverse().forEach((w)=>{ const realIndex=data.dictionary.lastIndexOf(w); const row=document.createElement('div');row.className='dict-entry';
    row.innerHTML=`<span class="en">${escHtml(w.en)}</span><span class="jp">${escHtml(w.jp)}</span><span class="es">${escHtml(w.es)}</span><button class="del-word" onclick="deleteWord(${realIndex})">×</button>`; list.appendChild(row); });
  document.getElementById('dict-count').textContent=data.dictionary.length+' words'; document.getElementById('dict-tab-count').textContent='('+data.dictionary.length+')';
}

function renderHistory(){
  const grid=document.getElementById('history-grid');grid.innerHTML=''; const sortedDays=Object.keys(data.days).sort().reverse();
  if(!sortedDays.length){grid.innerHTML='<p style="color:rgba(255,255,255,0.5);text-align:center;padding:20px">No study days yet!</p>';return;}
  sortedDays.forEach(day=>{
    const d=data.days[day];const row=document.createElement('div');row.className='history-day'; 
    const streakIcon = (d.flash>0||d.read>0)?'✓':'—';
    const oracleIcon = (d.iching) ? '<span title="Oracle Cast" style="font-size:1.1rem;color:#ff3c8e;margin-right:4px;">☯️</span>' : '';
    row.innerHTML=`<span class="day-date">${formatDate(day)}</span><span class="day-stat">📇 ${d.flash||0} min</span><span class="day-stat">📚 ${d.read||0} hrs</span><span class="day-streak">${oracleIcon} ${streakIcon}</span>`; 
    grid.appendChild(row);
  });
}

function updateStats(){
  let tf=0,tr=0;Object.values(data.days).forEach(d=>{tf+=d.flash||0;tr+=d.read||0;});
  document.getElementById('stat-total-flash').textContent=tf; document.getElementById('stat-total-read').textContent=tr;
  document.getElementById('stat-words').textContent=data.dictionary.length; document.getElementById('stat-days').textContent=Object.keys(data.days).length;
  document.getElementById('streak-badge').textContent='🔥 '+data.streak+' day streak'; renderHistory();
  const val=parseInt(document.getElementById('flash-minutes').value); if(!val||val<=0) return;
  const today=todayStr(); if(!data.days[today]) data.days[today]={flash:0,read:0};
  data.days[today].flash += val;
  document.getElementById('flash-input-area').style.display='none'; 
  document.getElementById('flash-done').style.display='block'; 
  document.getElementById('flash-done-text').textContent=data.days[today].flash+' min today!';
  document.getElementById('card-flash').classList.add('done');
  saveData(); updateStats(); updateMood(); calcStreak();
}

// ===== DIARY =====
function addDiaryEntry() { const text = document.getElementById('diary-input').value.trim(); if(!text) return; data.diary.push({ date: formatDateTime(new Date()), text: text }); document.getElementById('diary-input').value = ''; saveData(); renderDiary(); }
function deleteDiaryEntry(i) { data.diary.splice(i, 1); saveData(); renderDiary(); }
function renderDiary() {
  const list = document.getElementById('diary-list'); list.innerHTML = '';
  if(!data.diary.length) return list.innerHTML = '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:20px">No diary entries yet.</p>';
  data.diary.slice().reverse().forEach(entry => { const realIndex = data.diary.lastIndexOf(entry); const row = document.createElement('div'); row.className = 'diary-entry'; row.innerHTML = `<div class="diary-entry-date">${escHtml(entry.date)}</div><div class="diary-entry-text">${escHtml(entry.text)}</div><button class="diary-del-btn" onclick="deleteDiaryEntry(${realIndex})">×</button>`; list.appendChild(row); });
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
@@ -211,7 +118,10 @@ function renderQuotes() {
  const list = document.getElementById('quotes-list');
  if (!list) return;
  list.innerHTML = '';
  if(!data.quotes || !data.quotes.length) return list.innerHTML = '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:20px">No quotes saved yet.</p>';
  if(!data.quotes || !data.quotes.length) {
    list.innerHTML = '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:20px">No quotes saved yet.</p>';
    return;
  }
  data.quotes.slice().reverse().forEach((q, index) => {
    const realIndex = data.quotes.length - 1 - index;
    const row = document.createElement('div');
@@ -226,317 +136,55 @@ function renderQuotes() {
  });
}

// ===== CALENDAR =====
let currentCalDate = new Date();
let selectedCalDateStr = null;

function getJapaneseDateStr(date) {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 (${days[date.getDay()]})`;
}

function renderCalendar() {
    const year = currentCalDate.getFullYear(); const month = currentCalDate.getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('cal-month-year').textContent = `${monthNames[month]} ${year}`;
    document.getElementById('cal-jp-date').textContent = "本日: " + getJapaneseDateStr(new Date());

    const firstDay = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = document.getElementById('cal-grid'); grid.innerHTML = '';
    
    for(let i = 0; i < firstDay; i++) { const emptyDate = document.createElement('div'); emptyDate.className = 'cal-day empty'; grid.appendChild(emptyDate); }
    
    const today = new Date();
    for(let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div'); dayDiv.className = 'cal-day';
        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) dayDiv.classList.add('today');
        
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        dayDiv.innerHTML = `<div class="cal-date-num">${i}</div>`;
        
        if (data.calendar && data.calendar[dateStr]) {
            const evt = document.createElement('div'); evt.className = 'cal-event-badge'; evt.textContent = data.calendar[dateStr]; dayDiv.appendChild(evt);
        }
        dayDiv.onclick = () => openCalEditor(dateStr, i, monthNames[month], year);
        grid.appendChild(dayDiv);
    }
}

function changeMonth(dir) { currentCalDate.setMonth(currentCalDate.getMonth() + dir); renderCalendar(); document.getElementById('cal-event-editor').style.display = 'none'; }

function openCalEditor(dateStr, day, monthName, year) {
    selectedCalDateStr = dateStr;
    document.getElementById('cal-edit-date').textContent = `Editing: ${monthName} ${day}, ${year}`;
    document.getElementById('cal-event-input').value = (data.calendar && data.calendar[dateStr]) ? data.calendar[dateStr] : '';
    document.getElementById('cal-event-editor').style.display = 'block';
}

function saveCalendarEvent() {
    if (!selectedCalDateStr) return; if (!data.calendar) data.calendar = {};
    const val = document.getElementById('cal-event-input').value.trim();
    if (val) data.calendar[selectedCalDateStr] = val; else delete data.calendar[selectedCalDateStr];
    saveData(); renderCalendar(); document.getElementById('cal-event-editor').style.display = 'none';
}

// ===== RANDOM PHRASES =====
let lastPhraseIndex = -1;
function showRandomPhrase() {
  const bubble = document.getElementById('random-bubble'); if (!bubble || typeof randomPhrases === 'undefined') return; let idx; 
  do { idx = Math.floor(Math.random() * randomPhrases.length); } while (idx === lastPhraseIndex && randomPhrases.length > 1); lastPhraseIndex = idx;
  const p = randomPhrases[idx]; bubble.style.opacity = '0'; setTimeout(() => { document.getElementById('random-phrase').textContent = p.text; document.getElementById('random-lang-tag').textContent = p.label; document.getElementById('random-lang-tag').className = 'random-lang-tag ' + p.lang; bubble.style.opacity = '1'; }, 400);
}
function startPhraseCycle() { showRandomPhrase(); setInterval(showRandomPhrase, 8000); }

// ===== NUMOGRAM =====
function selectZone(zoneNum) { 
  document.querySelectorAll('.zone-group').forEach(n => n.classList.remove('active')); 
  const btn = document.getElementById('btn-zone-' + zoneNum); if(btn) btn.classList.add('active'); 
  document.getElementById('numo-display').innerHTML = document.getElementById('data-zone-' + zoneNum).innerHTML; 
}

function calculateNumogram() {
  const input = document.getElementById('numo-gematria-input').value.trim().toUpperCase(); const display = document.getElementById('numo-result-display'); if (!input) return display.textContent = "Please enter data.";
  let totalSum = 0; for (let i = 0; i < input.length; i++) { const char = input[i]; if (/[A-Z]/.test(char)) totalSum += char.charCodeAt(0) - 64; else if (/[0-9]/.test(char)) totalSum += parseInt(char); }
  if (totalSum === 0) return display.textContent = "Invalid entry.";
  let digitalRoot = totalSum % 9; if (digitalRoot === 0 && totalSum > 0) digitalRoot = 9;
  display.innerHTML = `Sum: <span style="color:#fff">${totalSum}</span> ➔ Digital Root: <span style="color:#fff; font-size:1.5rem">${digitalRoot}</span>`; selectZone(digitalRoot);
}

function findDemon() {
   const z1Str = document.getElementById('demon-z1').value; const z2Str = document.getElementById('demon-z2').value; if(z1Str === "" || z2Str === "") return;
   const z1 = parseInt(z1Str); const z2 = parseInt(z2Str); const max = Math.max(z1, z2); const min = Math.min(z1, z2);
   const warpPlex = [0, 3, 6, 9]; const torque = [1, 2, 4, 5, 7, 8];
   let classification = (warpPlex.includes(max) && warpPlex.includes(min)) ? "Xenodemon (Outside Time)" : (torque.includes(max) && torque.includes(min)) ? "Chronodemon (Chronic Time)" : "Amphidemon (Crossing)";
   const planets = ["Sol", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
   document.getElementById('demon-result').innerHTML = `<strong>Net-Span [${max}::${min}]</strong><br>Class: <span style="color:#00e5ff">${classification}</span><br>Planetary Bridge: ${planets[max]} ↔ ${planets[min]}`;
}

function searchLexicon() {
   const q = document.getElementById('lexicon-search').value.toLowerCase(); const resDiv = document.getElementById('lexicon-results'); resDiv.innerHTML = ''; if(!q || typeof ccruLexicon === 'undefined') return;
   const matches = ccruLexicon.filter(item => item.term.toLowerCase().includes(q) || item.def.toLowerCase().includes(q));
   if(matches.length === 0) return resDiv.innerHTML = '<p style="color:rgba(255,255,255,0.5)">No archives found.</p>';
   matches.forEach(m => { resDiv.innerHTML += `<div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1)"><strong style="color: #ff3c8e; font-size:0.95rem;">${m.term}</strong><p style="margin-top: 4px;">${m.def}</p></div>`; });
}

// ===== I-CHING & AUTO-LOG =====
function getHexagramData(binary) { return typeof iChingDatabase !== 'undefined' ? iChingDatabase[binary] : null; }

function renderHexagram(containerId, lines) {
  const container = document.getElementById(containerId); container.innerHTML = '';
  lines.forEach((val) => {
    const isYang = (val === 7 || val === 9); const isChanging = (val === 6 || val === 9);
    const div = document.createElement('div'); div.className = `hex-line ${isYang ? 'yang' : 'yin'}`;
    let innerHTML = isYang ? `<div class="seg"></div>` : `<div class="seg"></div><div class="seg"></div>`;
    if (isChanging) innerHTML += `<span class="hex-line-marker">${val === 9 ? '(O)' : '(X)'}</span>`;
    div.innerHTML = innerHTML; container.appendChild(div);
  });
}

function getBinaryFromLines(lines) { return lines.map(v => (v === 7 || v === 9) ? '1' : '0').join(''); }

function displayDailyOracle() {
  const today = todayStr(); if (!data.days[today] || !data.days[today].iching) return;
  const daily = data.days[today].iching; const panel = document.getElementById('daily-oracle-panel'); panel.style.display = 'block';
  document.getElementById('daily-yoji-kanji').textContent = daily.yojijukugo.k; document.getElementById('daily-yoji-meaning').textContent = daily.yojijukugo.m;
  document.getElementById('daily-pri-name').textContent = `Hex ${daily.primary.num}: ${daily.primary.name.split(' ')[0]}`;
  if (daily.secondary) {
    document.getElementById('daily-sec-box').style.display = 'block'; document.getElementById('daily-sec-name').textContent = `Hex ${daily.secondary.num}: ${daily.secondary.name.split(' ')[0]}`;
  } else { document.getElementById('daily-sec-box').style.display = 'none'; }
}

function autoLogOracle() {
  if (typeof iChingDatabase === 'undefined' || typeof yojijukugoList === 'undefined') return;
  const today = todayStr();
  if (!data.days[today]) data.days[today] = { flash: 0, read: 0 };
  
  if (!data.days[today].iching) {
    const keys = Object.keys(iChingDatabase);
    const randomBinary = keys[Math.floor(Math.random() * keys.length)];
    const primaryData = iChingDatabase[randomBinary];
    const randomYoji = yojijukugoList[Math.floor(Math.random() * yojijukugoList.length)];
    
    data.days[today].iching = {
      primary: { num: primaryData.num, name: primaryData.name },
      secondary: null, 
      yojijukugo: randomYoji
    };
    saveData();
  }
}

function castOracle() {
  if (typeof iChingDatabase === 'undefined') return alert("Oracle database missing.");
  document.getElementById('iching-hex-container').style.display = 'flex';
  const primaryLines = []; const secondaryLines = []; let hasChanging = false;
  
  for(let i = 0; i < 6; i++) {
    const sum = (Math.random() < 0.5 ? 2 : 3) + (Math.random() < 0.5 ? 2 : 3) + (Math.random() < 0.5 ? 2 : 3);
    primaryLines.push(sum);
    if (sum === 6) { hasChanging = true; secondaryLines.push(7); } else if (sum === 9) { hasChanging = true; secondaryLines.push(8); } else { secondaryLines.push(sum); }
  }
  
  renderHexagram('iching-primary-vis', primaryLines);
  const primaryData = getHexagramData(getBinaryFromLines(primaryLines));
  const priBox = document.getElementById('iching-primary-result');
  priBox.style.display = 'block'; priBox.innerHTML = `<h3>Hexagram ${primaryData.num}: ${primaryData.name}</h3><p>${primaryData.meaning}</p>`;
  
  const secBoxUI = document.getElementById('iching-secondary-box'); const secResultBox = document.getElementById('iching-secondary-result');
  let secondaryData = null;
  if (hasChanging) {
    secBoxUI.style.display = 'flex'; renderHexagram('iching-secondary-vis', secondaryLines);
    secondaryData = getHexagramData(getBinaryFromLines(secondaryLines));
    secResultBox.style.display = 'block'; secResultBox.innerHTML = `<h3>Changes to Hexagram ${secondaryData.num}: ${secondaryData.name}</h3><p>${secondaryData.meaning}</p>`;
  } else { secBoxUI.style.display = 'none'; secResultBox.style.display = 'none'; }
}
// ===== SCHEDULE LOGIC =====
// ===== SCHEDULE =====
function renderSchedule() {
  const list = document.getElementById('schedule-list');
  if(!list) return;
  list.innerHTML = '';
  // Loop 24 hours
  for(let i=0; i<24; i++) {
    let hour = i === 0 ? 12 : (i > 12 ? i - 12 : i);
    let ampm = i < 12 ? "AM" : "PM";
    let timeLabel = `${hour} ${ampm}`;
    let val = data.schedule[i] || "";
    list.innerHTML += `<div class="schedule-row">
      <div class="schedule-time">${timeLabel}</div>
      <input type="text" class="schedule-input" id="sched-input-${i}" value="${escHtml(val)}" placeholder="Plan something...">
      <div class="schedule-time">${hour} ${ampm}</div>
      <input type="text" class="schedule-input" id="sched-input-${i}" value="${escHtml(val)}" placeholder="...">
    </div>`;
  }
}

function saveSchedule() {
  for(let i=0; i<24; i++) {
    data.schedule[i] = document.getElementById(`sched-input-${i}`).value;
  }
  for(let i=0; i<24; i++) { data.schedule[i] = document.getElementById(`sched-input-${i}`).value; }
  saveData();
  const btn = document.querySelector('#tab-schedule .btn-green');
  btn.textContent = "Saved! ✔️";
  setTimeout(() => btn.textContent = "Save Schedule", 2000);
}

// ===== CALENDAR LOGIC =====
// ===== CALENDAR =====
let currentDate = new Date();
let selectedDateStr = "";

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  document.getElementById('cal-month-year').textContent = `${months[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  daysOfWeek.forEach(d => grid.innerHTML += `<div class="cal-header">${d}</div>`);
  
  // Empty slots for previous month
  for(let i=0; i<firstDay; i++) { grid.innerHTML += `<div></div>`; }
  
  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for(let i=0; i<firstDay; i++) grid.innerHTML += `<div></div>`;
  for(let i=1; i<=daysInMonth; i++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
    const tasks = data.calendar[dateStr] || [];
    let taskHTML = '';
    
    // Render up to 3 tasks on the grid, show "+X more" if exceeded
    tasks.slice(0, 3).forEach(t => taskHTML += `<div class="cal-task">${escHtml(t)}</div>`);
    if(tasks.length > 3) taskHTML += `<div class="cal-task more">+${tasks.length - 3} more</div>`;
    
    let isToday = (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) ? 'today' : '';
    grid.innerHTML += `<div class="cal-day ${isToday}" onclick="openCalModal('${dateStr}')"><div class="cal-day-num">${i}</div>${taskHTML}</div>`;
    let taskHTML = tasks.slice(0, 2).map(t => `<div class="cal-task">${escHtml(t)}</div>`).join('');
    grid.innerHTML += `<div class="cal-day" onclick="openCalModal('${dateStr}')"><div class="cal-day-num">${i}</div>${taskHTML}</div>`;
  }
}
function changeMonth(delta) { currentDate.setMonth(currentDate.getMonth() + delta); renderCalendar(); }

function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  renderCalendar();
}

function openCalModal(dateStr) {
  selectedDateStr = dateStr;
  document.getElementById('cal-modal').style.display = 'flex';
  renderCalModal();
}

function closeCalModal() {
  document.getElementById('cal-modal').style.display = 'none';
  renderCalendar(); 
}

function renderCalModal() {
  document.getElementById('cal-modal-date').textContent = formatDate(selectedDateStr);
  const tasks = data.calendar[selectedDateStr] || [];
  const list = document.getElementById('cal-modal-list');
  list.innerHTML = '';
  if(tasks.length === 0) list.innerHTML = '<p style="color:rgba(255,255,255,0.5);text-align:center;font-size:0.85rem;margin:10px 0;">No tasks for this day.</p>';
  tasks.forEach((t, idx) => {
    list.innerHTML += `<div class="cal-modal-task">
      <span>${escHtml(t)}</span>
      <button class="del-word" onclick="delCalTask(${idx})">×</button>
    </div>`;
  });
}

function addCalTask() {
  const input = document.getElementById('cal-modal-input');
  const val = input.value.trim();
  if(!val) return;
  if(!data.calendar[selectedDateStr]) data.calendar[selectedDateStr] = [];
  data.calendar[selectedDateStr].push(val);
  saveData();
  input.value = '';
  renderCalModal();
}

function delCalTask(idx) {
  data.calendar[selectedDateStr].splice(idx, 1);
  saveData();
  renderCalModal();
}
// ===== APP INITIALIZATION =====
function initApp(){
  document.getElementById('date-display').textContent=formatDate(todayStr()); 
  calcStreak();

  const td = data.days[todayStr()]; 
  if(td){ 
    if(td.flash > 0){
      document.getElementById('flash-input-area').style.display = 'none';
      document.getElementById('flash-done').style.display = 'block';
      document.getElementById('flash-done-text').textContent = td.flash + ' min today!';
      document.getElementById('card-flash').classList.add('done');
    } 
    if(td.read > 0){
      document.getElementById('read-input-area').style.display = 'none';
      document.getElementById('read-done').style.display = 'block';
      document.getElementById('read-done-text').textContent = td.read + ' hrs today!';
      document.getElementById('card-read').classList.add('done');
    } 
    if(td.flash > 0 && td.read > 0) setSpeech('bothDone');
    else if(td.flash > 0) setSpeech('flashDone');
    else if(td.read > 0) setSpeech('readDone');
    else setSpeech('greeting'); 
  } else {
    setSpeech('greeting');
  }
  
  if(data.streak >= 5) setSpeech('streakHigh'); 
  
  autoLogOracle(); // Runs daily auto-log for the I-Ching

// ===== APP INITIALIZATION (DATE-SMART & MOOD-INTEGRATED) =====
function initApp(){
  const realToday = todayStr(); // Always uses current computer clock
  document.getElementById('date-display').textContent = formatDate(realToday); 

  // 1. MANDATORY UI RESET
  // This clears the "Done" screens so loading a save doesn't look "stuck"
  document.getElementById('flash-input-area').style.display = 'block';
  document.getElementById('flash-done').style.display = 'none';
  document.getElementById('card-flash').classList.remove('done');

  document.getElementById('read-input-area').style.display = 'block';
  document.getElementById('read-done').style.display = 'none';
  document.getElementById('card-read').classList.remove('done');

  // 2. CHECK DATA FOR THE ACTUAL CURRENT DAY
  const td = data.days[realToday]; 
  
  if(td) { 
    // If work was done TODAY, update the UI to show progress
    if(td.flash > 0){
      document.getElementById('flash-input-area').style.display = 'none';
      document.getElementById('flash-done').style.display = 'block';
      document.getElementById('flash-done-text').textContent = td.flash + ' min today!';
      document.getElementById('card-flash').classList.add('done');
    } 
    if(td.read > 0){
      document.getElementById('read-input-area').style.display = 'none';
      document.getElementById('read-done').style.display = 'block';
      document.getElementById('read-done-text').textContent = td.read + ' hrs today!';
      document.getElementById('card-read').classList.add('done');
    } 

    // Character Speech Logic
    if(td.flash > 0 && td.read > 0) setSpeech('bothDone');
    else if(td.flash > 0) setSpeech('flashDone');
    else if(td.read > 0) setSpeech('readDone');
    else setSpeech('greeting'); 

  } else {
    // If it's a brand new day (or an old save from a different day), start fresh
    data.days[realToday] = { flash: 0, read: 0 };
    setSpeech('greeting');
  }

  if(data.streak >= 5) setSpeech('streakHigh'); 

  // 3. INITIALIZE ALL UI COMPONENTS
  updateThemeIcon();
  renderSchedule();   // Hourly Schedule
  renderCalendar();   // Advanced Calendar
  renderDictionary(); 
  renderDiary(); 
  renderQuotes(); 
  updateStats(); 
  updateMood();       // Character image logic
  calcStreak();
  saveData();

  // 4. RUN BACKGROUND CYCLES
  if(typeof startPhraseCycle === 'function') startPhraseCycle();
  if(typeof displayDailyOracle === 'function') displayDailyOracle();
  if(typeof autoLogOracle === 'function') autoLogOracle();
}

// Ensure these two functions exist so initApp doesn't crash:
function updateMood() {
  const moeImg = document.getElementById('moe-img');
  if (!moeImg) return;
  const td = data.days[todayStr()];
  if (!td || (td.flash === 0 && td.read === 0)) {
    moeImg.src = "https://i.postimg.cc/7Z9yZz4y/moe-neutral.png"; 
  } else if (td.flash > 0 && td.read > 0) {
    moeImg.src = "https://i.postimg.cc/9M3P098P/moe-happy.png"; 
  } else {
    moeImg.src = "https://i.postimg.cc/Bv9yZz4y/moe-study.png";
  }
}

function setSpeech(type) {
  const bubble = document.getElementById('moe-speech');
  if (!bubble) return;
  const lines = {
    greeting: ["Ready to study?", "Let's get to work!"],
    flashDone: ["Flashcards complete!", "Your memory is getting better!"],
    readDone: ["Finished reading? Nice!", "Knowledge is power!"],
    bothDone: ["You finished everything today! ✨", "Amazing work!"],
    streakHigh: ["Look at that streak!", "Don't stop now!"]
  };
  const choices = lines[type] || lines['greeting'];
  bubble.textContent = choices[Math.floor(Math.random() * choices.length)];
}
