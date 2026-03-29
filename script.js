/**
 * SCRIPT.JS - MOE-CHAN'S FULL COGNITION
 * Includes: Calendar, Dictionary, Diary, Numogram, I-Ching, and NES Backup.
 */

// --- INITIAL DATA & STORAGE ---
const STORAGE_KEY = 'studyBuddyData';
function getDefaultData() { 
    return { days: {}, dictionary: [], diary: [], calendar: {}, streak: 0, lastActiveDate: null, starterLoaded: false }; 
}

let data = loadData();
function loadData() { 
    try { 
        const r = localStorage.getItem(STORAGE_KEY); 
        if (r) {
            let loaded = JSON.parse(r);
            if (!loaded.diary) loaded.diary = [];
            if (!loaded.calendar) loaded.calendar = {};
            return loaded;
        }
    } catch(e) { console.error("Load failed", e); }
    return getDefaultData(); 
}

function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

// --- UTILS ---
function todayStr() { const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function formatDate(s) { const [y,m,d]=s.split('-'); const mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return `${mo[parseInt(m)-1]} ${parseInt(d)}, ${y}`; }
function formatDateTime(d) { return formatDate(todayStr()) + ' at ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); }
function escHtml(s) { const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

// --- THEME ---
function updateThemeIcon() { document.getElementById('theme-btn').textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙'; }
function toggleTheme() { 
    document.body.classList.toggle('dark-mode'); 
    localStorage.setItem('studyBuddyTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); 
    updateThemeIcon(); 
}

// --- PASSWORD SYSTEM ---
document.getElementById('pw-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        if (btoa(this.value.toLowerCase().trim()) === 'Y2FrZQ==') {
            document.getElementById('password-screen').style.display = 'none';
            document.getElementById('app').style.display = 'block';
            initApp();
        } else {
            document.getElementById('pw-error').textContent = 'Wrong password... try again!';
            this.value = '';
        }
    }
});

// --- CORE APP INIT ---
function initApp() {
    document.getElementById('date-display').textContent = formatDate(todayStr());
    if (!data.starterLoaded && typeof starterDeck !== 'undefined') {
        starterDeck.forEach(word => {
            if (!data.dictionary.some(w => w.en === word.en)) {
                data.dictionary.push({ ...word, addedDate: todayStr() });
            }
        });
        data.starterLoaded = true; saveData();
    }
    
    calcStreak();
    const td = data.days[todayStr()];
    if (td) {
        if (td.flash > 0) {
            document.getElementById('flash-input-area').style.display = 'none';
            document.getElementById('flash-done').style.display = 'block';
            document.getElementById('flash-done-text').textContent = td.flash + ' min today!';
            document.getElementById('card-flash').classList.add('done');
        }
        if (td.read > 0) {
            document.getElementById('read-input-area').style.display = 'none';
            document.getElementById('read-done').style.display = 'block';
            document.getElementById('read-done-text').textContent = td.read + ' hrs today!';
            document.getElementById('card-read').classList.add('done');
        }
    }
    
    renderDictionary(); renderDiary(); renderCalendar(); updateStats(); updateMood(); startPhraseCycle(); displayDailyOracle();
}

// --- SPEECH & MOOD ---
const speeches = {
    greeting: { en: "Hello! Let's study today!", jp: "こんにちは！今日も勉強しよう！", es: "¡Hola! ¡Estudiemos hoy!" },
    bothDone: { en: "Amazing work today!", jp: "今日はすごい！", es: "¡Increíble hoy!" },
    flashDone: { en: "Great flashcards! Now read!", jp: "次は読書だよ！", es: "¡Bien! ¡Ahora a leer!" },
    readDone: { en: "Nice reading!", jp: "読書お疲れ！", es: "¡Buena lectura!" },
    newWord: { en: "New word learned!", jp: "新しい単語を覚えた！", es: "¡Nueva palabra!" }
};

function setSpeech(k) {
    const s = speeches[k]; if (!s) return;
    document.getElementById('speech-en').textContent = s.en;
    document.getElementById('speech-jp').textContent = s.jp;
    document.getElementById('speech-es').textContent = s.es;
}

function updateMood() {
    const today = data.days[todayStr()] || {};
    let mood = 30; if (today.flash > 0) mood += 30; if (today.read > 0) mood += 30; if (data.streak >= 3) mood += 10;
    mood = Math.min(100, mood);
    const fill = document.getElementById('mood-fill');
    const text = document.getElementById('mood-text');
    fill.style.width = mood + '%';
    if (mood >= 90) { text.textContent = 'Ecstatic!'; setCreatureState('happy'); }
    else if (mood >= 40) { text.textContent = 'Happy'; setCreatureState('idle'); }
    else { text.textContent = 'Needs attention'; setCreatureState('sad'); }
}

// --- CREATURE SPRITES & ANIMATION ---
const spriteMap = { idle: './idle.png', happy: './happy.png', sad: './sad.png', study: './study.png', read: './read.png', celebrate: './celebrate.png' };
function setCreatureState(state) { document.getElementById('sprite-img').src = spriteMap[state] || spriteMap.idle; }

document.getElementById('creature-sprite').addEventListener('click', function(e) {
    this.classList.add('animate-bounce');
    for (let i = 0; i < 5; i++) {
        const heart = document.createElement('div');
        heart.textContent = '✨'; heart.className = 'heart-particle';
        heart.style.setProperty('--tx', (Math.random() - 0.5) * 150 + 'px');
        heart.style.setProperty('--ty', -(Math.random() * 150) + 'px');
        heart.style.left = '50%'; heart.style.top = '50%';
        this.appendChild(heart);
        setTimeout(() => heart.remove(), 800);
    }
    setTimeout(() => this.classList.remove('animate-bounce'), 400);
});

// --- STUDY LOGGING ---
function logFlashcards() {
    const val = parseInt(document.getElementById('flash-minutes').value); if (!val) return;
    const today = todayStr(); if (!data.days[today]) data.days[today] = { flash: 0, read: 0 };
    data.days[today].flash += val;
    setCreatureState('study'); setSpeech(data.days[today].read > 0 ? 'bothDone' : 'flashDone');
    saveData(); initApp();
}

function logReading() {
    const val = parseFloat(document.getElementById('read-hours').value); if (!val) return;
    const today = todayStr(); if (!data.days[today]) data.days[today] = { flash: 0, read: 0 };
    data.days[today].read += val;
    setCreatureState('read'); setSpeech(data.days[today].flash > 0 ? 'bothDone' : 'readDone');
    saveData(); initApp();
}

// --- CALENDAR SYSTEM ---
let currentCalDate = new Date();
function renderCalendar() {
    const year = currentCalDate.getFullYear(), month = currentCalDate.getMonth();
    document.getElementById('cal-month-year').textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentCalDate);
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = document.getElementById('cal-grid'); grid.innerHTML = '';
    
    for (let i = 0; i < firstDay; i++) grid.appendChild(Object.assign(document.createElement('div'), { className: 'cal-day empty' }));
    for (let i = 1; i <= daysInMonth; i++) {
        const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayDiv = document.createElement('div'); dayDiv.className = 'cal-day';
        if (dStr === todayStr()) dayDiv.classList.add('today');
        dayDiv.innerHTML = `<div class="cal-date-num">${i}</div>`;
        if (data.calendar[dStr]) dayDiv.innerHTML += `<div class="cal-event-badge">${data.calendar[dStr]}</div>`;
        dayDiv.onclick = () => openCalEditor(dStr, i);
        grid.appendChild(dayDiv);
    }
}
function changeMonth(dir) { currentCalDate.setMonth(currentCalDate.getMonth() + dir); renderCalendar(); }
function openCalEditor(dStr, i) {
    document.getElementById('cal-event-editor').style.display = 'block';
    document.getElementById('cal-edit-date').textContent = "Editing " + dStr;
    document.getElementById('cal-event-input').value = data.calendar[dStr] || '';
    window.selectedCalDate = dStr;
}
function saveCalendarEvent() {
    const val = document.getElementById('cal-event-input').value.trim();
    if (val) data.calendar[window.selectedCalDate] = val; else delete data.calendar[window.selectedCalDate];
    saveData(); renderCalendar(); document.getElementById('cal-event-editor').style.display = 'none';
}

// --- DICTIONARY & DIARY ---
function addWord() {
    const en = document.getElementById('dict-en').value, jp = document.getElementById('dict-jp').value, es = document.getElementById('dict-es').value;
    data.dictionary.push({ en, jp, es, addedDate: todayStr() });
    saveData(); renderDictionary(); setSpeech('newWord');
}
function renderDictionary() {
    const list = document.getElementById('dict-list'); list.innerHTML = '';
    data.dictionary.slice().reverse().forEach((w, i) => {
        list.innerHTML += `<div class="dict-entry"><span class="en">${w.en}</span><span class="jp">${w.jp}</span><span class="es">${w.es}</span><button onclick="deleteWord(${data.dictionary.length - 1 - i})">×</button></div>`;
    });
}
function deleteWord(i) { data.dictionary.splice(i, 1); saveData(); renderDictionary(); }

function addDiaryEntry() {
    const text = document.getElementById('diary-input').value; if (!text) return;
    data.diary.push({ date: formatDateTime(new Date()), text });
    document.getElementById('diary-input').value = ''; saveData(); renderDiary();
}
function renderDiary() {
    const list = document.getElementById('diary-list'); list.innerHTML = '';
    data.diary.slice().reverse().forEach((e, i) => {
        list.innerHTML += `<div class="diary-entry"><div class="diary-entry-date">${e.date}</div><div>${e.text}</div></div>`;
    });
}

// --- NUMOGRAM LOGIC ---
function selectZone(n) { document.getElementById('numo-display').innerHTML = document.getElementById('data-zone-' + n).innerHTML; }
function calculateNumogram() {
    const input = document.getElementById('numo-gematria-input').value.toUpperCase();
    let sum = 0; for (let char of input) { sum += char.charCodeAt(0) - 64; }
    let root = sum % 9 || 9;
    document.getElementById('numo-result-display').innerHTML = `Sum: ${sum} | Root: ${root}`;
    selectZone(root);
}

// --- I-CHING SYSTEM ---
function castOracle() {
    let lines = []; for (let i = 0; i < 6; i++) lines.push(Math.random() > 0.5 ? 7 : 8);
    const bin = lines.map(l => l === 7 ? '1' : '0').reverse().join('');
    const hex = iChingDatabase[bin];
    document.getElementById('iching-primary-result').innerHTML = `<h3>${hex.name}</h3><p>${hex.meaning}</p>`;
    document.getElementById('iching-hex-container').style.display = 'flex';
    renderHexagram('iching-primary-vis', lines);
}
function renderHexagram(id, lines) {
    const el = document.getElementById(id); el.innerHTML = '';
    lines.forEach(l => el.innerHTML += `<div class="hex-line ${l === 7 ? 'yang' : 'yin'}"><div class="seg"></div>${l === 8 ? '<div class="seg"></div>' : ''}</div>`);
}

// --- NES BACKUP ---
function generatePassword() { document.getElementById('nes-password-box').value = btoa(JSON.stringify(data)); }
function loadPassword() { 
    try { data = JSON.parse(atob(document.getElementById('nes-password-box').value)); saveData(); initApp(); alert("Restored!"); } 
    catch(e) { alert("Invalid Password"); } 
}

// --- TABS & PHRASES ---
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn, .tab-content').forEach(el => el.classList.remove('active'));
        btn.classList.add('active'); document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    };
});
function startPhraseCycle() {
    setInterval(() => {
        const p = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
        document.getElementById('random-phrase').textContent = p.text;
    }, 8000);
}

function updateStats() {
    document.getElementById('stat-words').textContent = data.dictionary.length;
    document.getElementById('stat-days').textContent = Object.keys(data.days).length;
}

function calcStreak() { /* Basic streak logic here */ }

// --- LAUNCH ---
updateThemeIcon();
