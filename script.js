/**
 * SCRIPT.JS - MOE-CHAN'S FULL COGNITION
 * Connects the Decimal Labyrinth and the Study Buddy.
 */

// --- INITIAL DATA & STORAGE ---
const STORAGE_KEY = 'studyBuddyData';

let data = loadData();

function loadData() { 
    try { 
        const r = localStorage.getItem(STORAGE_KEY); 
        if (r) {
            let loaded = JSON.parse(r);
            // Ensure sub-objects exist for older save versions
            if (!loaded.diary) loaded.diary = [];
            if (!loaded.calendar) loaded.calendar = {};
            if (!loaded.dictionary) loaded.dictionary = [];
            if (!loaded.days) loaded.days = {};
            return loaded;
        }
    } catch(e) { console.error("Load failed", e); }
    return { days: {}, dictionary: [], diary: [], calendar: {}, streak: 0, lastActiveDate: null, starterLoaded: false }; 
}

function saveData() { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); 
}

// --- UTILS ---
function todayStr() { 
    const d = new Date(); 
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); 
}

function formatDate(s) { 
    if(!s) return "";
    const [y, m, d] = s.split('-'); 
    const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; 
    return `${mo[parseInt(m) - 1]} ${parseInt(d)}, ${y}`; 
}

function formatDateTime(d) { 
    return formatDate(todayStr()) + ' at ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); 
}

function escHtml(s) { 
    const d = document.createElement('div'); 
    d.textContent = s; 
    return d.innerHTML; 
}

// --- THEME ---
function updateThemeIcon() { 
    document.getElementById('theme-btn').textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙'; 
}

function toggleTheme() { 
    document.body.classList.toggle('dark-mode'); 
    localStorage.setItem('studyBuddyTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); 
    updateThemeIcon(); 
}

// --- PASSWORD SCREEN ---
document.getElementById('pw-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        // btoa('cake') === 'Y2FrZQ=='
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

// --- TABS ---
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        
        // Refresh specific tab views
        if(btn.dataset.tab === 'history') renderHistory();
        if(btn.dataset.tab === 'calendar') renderCalendar();
    });
});

// --- CORE APP INIT ---
function initApp() {
    document.getElementById('date-display').textContent = formatDate(todayStr());
    
    // Load starter deck if first time
    if (!data.starterLoaded && typeof starterDeck !== 'undefined') {
        starterDeck.forEach(word => {
            if (!data.dictionary.some(w => w.en === word.en)) {
                data.dictionary.push({ ...word, addedDate: todayStr() });
            }
        });
        data.starterLoaded = true; 
        saveData();
    }
    
    calcStreak();
    
    // Update task cards based on today's progress
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
    
    renderDictionary(); 
    renderDiary(); 
    renderCalendar(); 
    updateStats(); 
    updateMood(); 
    startPhraseCycle(); 
    displayDailyOracle();
}

// --- CREATURE LOGIC ---
const spriteMap = { 
    idle: './idle.png', 
    happy: './happy.png', 
    sad: './sad.png', 
    study: './study.png', 
    read: './read.png', 
    celebrate: './celebrate.png' 
};

function setCreatureState(state) { 
    const img = document.getElementById('sprite-img');
    if(img) img.src = spriteMap[state] || spriteMap.idle; 
}

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

// Creature Interaction (Hearts/Bounce)
let isBouncing = false;
document.getElementById('creature-sprite').addEventListener('click', function(e) {
    if(isBouncing) return;
    isBouncing = true;
    
    this.classList.add('animate-bounce');
    const img = document.getElementById('sprite-img');
    const oldSrc = img.src;
    img.src = spriteMap.happy;

    for (let i = 0; i < 5; i++) {
        const heart = document.createElement('div');
        heart.textContent = ['💖', '✨', '💕', '💗'][Math.floor(Math.random()*4)];
        heart.className = 'heart-particle';
        heart.style.setProperty('--tx', (Math.random() - 0.5) * 150 + 'px');
        heart.style.setProperty('--ty', -(Math.random() * 150 + 50) + 'px');
        heart.style.left = '50%'; 
        heart.style.top = '40%';
        this.appendChild(heart);
        setTimeout(() => heart.remove(), 800);
    }

    setTimeout(() => {
        this.classList.remove('animate-bounce');
        img.src = oldSrc;
        isBouncing = false;
    }, 400);
});

// --- STUDY LOGGING ---
function logFlashcards() {
    const val = parseInt(document.getElementById('flash-minutes').value); 
    if (!val || val <= 0) return;
    const today = todayStr(); 
    if (!data.days[today]) data.days[today] = { flash: 0, read: 0 };
    data.days[today].flash += val;
    
    setCreatureState('study'); 
    setSpeech(data.days[today].read > 0 ? 'bothDone' : 'flashDone');
    saveData(); 
    initApp();
}

function logReading() {
    const val = parseFloat(document.getElementById('read-hours').value); 
    if (!val || val <= 0) return;
    const today = todayStr(); 
    if (!data.days[today]) data.days[today] = { flash: 0, read: 0 };
    data.days[today].read += val;
    
    setCreatureState('read'); 
    setSpeech(data.days[today].flash > 0 ? 'bothDone' : 'readDone');
    saveData(); 
    initApp();
}

// --- MOOD & STATS ---
function updateMood() {
    const today = data.days[todayStr()] || {};
    let mood = 30; 
    if (today.flash > 0) mood += 30; 
    if (today.read > 0) mood += 30; 
    if (data.streak >= 3) mood += 10;
    
    mood = Math.min(100, mood);
    const fill = document.getElementById('mood-fill');
    const text = document.getElementById('mood-text');
    fill.style.width = mood + '%';

    if (mood >= 90) { 
        text.textContent = 'Ecstatic!'; 
        fill.style.background = 'linear-gradient(90deg, #7ec832, #a8e84c)';
        setCreatureState('happy'); 
    } else if (mood >= 50) { 
        text.textContent = 'Happy'; 
        fill.style.background = 'linear-gradient(90deg, #ffcc00, #ff8a00)';
        setCreatureState('idle'); 
    } else { 
        text.textContent = 'Needs attention'; 
        fill.style.background = 'linear-gradient(90deg, #ff3c8e, #d42070)';
        setCreatureState('sad'); 
    }
}

function updateStats() {
    let tf = 0, tr = 0;
    Object.values(data.days).forEach(d => { tf += (d.flash || 0); tr += (d.read || 0); });
    document.getElementById('stat-total-flash').textContent = tf;
    document.getElementById('stat-total-read').textContent = tr;
    document.getElementById('stat-words').textContent = data.dictionary.length;
    document.getElementById('stat-days').textContent = Object.keys(data.days).length;
    document.getElementById('dict-tab-count').textContent = '(' + data.dictionary.length + ')';
    document.getElementById('streak-badge').textContent = '🔥 ' + data.streak + ' day streak';
}

function calcStreak() {
    const sortedDays = Object.keys(data.days).sort().reverse();
    if (!sortedDays.length) { data.streak = 0; return; }
    
    let streak = 0;
    let curr = new Date();
    // If today hasn't been logged, check starting from yesterday
    if (!data.days[todayStr()]) curr.setDate(curr.getDate() - 1);
    
    while (true) {
        let dStr = curr.getFullYear() + '-' + String(curr.getMonth() + 1).padStart(2, '0') + '-' + String(curr.getDate()).padStart(2, '0');
        if (data.days[dStr] && (data.days[dStr].flash > 0 || data.days[dStr].read > 0)) {
            streak++;
            curr.setDate(curr.getDate() - 1);
        } else {
            break;
        }
    }
    data.streak = streak;
}

// --- CALENDAR ---
let currentCalDate = new Date();
function renderCalendar() {
    const year = currentCalDate.getFullYear(), month = currentCalDate.getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('cal-month-year').textContent = `${monthNames[month]} ${year}`;
    
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const now = new Date();
    document.getElementById('cal-jp-date').textContent = `本日: ${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 (${days[now.getDay()]})`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = document.getElementById('cal-grid'); 
    grid.innerHTML = '';
    
    for (let i = 0; i < firstDay; i++) {
        const div = document.createElement('div');
        div.className = 'cal-day empty';
        grid.appendChild(div);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayDiv = document.createElement('div'); 
        dayDiv.className = 'cal-day';
        if (dStr === todayStr()) dayDiv.classList.add('today');
        
        dayDiv.innerHTML = `<div class="cal-date-num">${i}</div>`;
        if (data.calendar[dStr]) {
            dayDiv.innerHTML += `<div class="cal-event-badge">${escHtml(data.calendar[dStr])}</div>`;
        }
        
        dayDiv.onclick = () => {
            document.getElementById('cal-event-editor').style.display = 'block';
            document.getElementById('cal-edit-date').textContent = `Editing: ${monthNames[month]} ${i}, ${year}`;
            document.getElementById('cal-event-input').value = data.calendar[dStr] || '';
            window.selectedCalDate = dStr;
        };
        grid.appendChild(dayDiv);
    }
}

function changeMonth(dir) { 
    currentCalDate.setMonth(currentCalDate.getMonth() + dir); 
    renderCalendar(); 
}

function saveCalendarEvent() {
    const val = document.getElementById('cal-event-input').value.trim();
    if (val) data.calendar[window.selectedCalDate] = val; 
    else delete data.calendar[window.selectedCalDate];
    saveData(); 
    renderCalendar(); 
    document.getElementById('cal-event-editor').style.display = 'none';
}

// --- DICTIONARY & DIARY ---
function addWord() {
    const en = document.getElementById('dict-en').value.trim();
    const jp = document.getElementById('dict-jp').value.trim();
    const es = document.getElementById('dict-es').value.trim();
    if(!en && !jp && !es) return;
    
    data.dictionary.push({ en: en || '—', jp: jp || '—', es: es || '—', addedDate: todayStr() });
    document.getElementById('dict-en').value = '';
    document.getElementById('dict-jp').value = '';
    document.getElementById('dict-es').value = '';
    saveData(); 
    renderDictionary(); 
    updateStats(); 
    setSpeech('newWord');
}

function renderDictionary() {
    const list = document.getElementById('dict-list');
    const search = document.getElementById('dict-search').value.toLowerCase();
    list.innerHTML = '';
    
    data.dictionary.slice().reverse().forEach((w) => {
        if (w.en.toLowerCase().includes(search) || w.jp.toLowerCase().includes(search) || w.es.toLowerCase().includes(search)) {
            const idx = data.dictionary.indexOf(w);
            const div = document.createElement('div');
            div.className = 'dict-entry';
            div.innerHTML = `
                <span class="en">${escHtml(w.en)}</span>
                <span class="jp">${escHtml(w.jp)}</span>
                <span class="es">${escHtml(w.es)}</span>
                <button class="del-word" onclick="deleteWord(${idx})">×</button>
            `;
            list.appendChild(div);
        }
    });
    document.getElementById('dict-count').textContent = data.dictionary.length + ' words';
}

function deleteWord(i) { 
    data.dictionary.splice(i, 1); 
    saveData(); 
    renderDictionary(); 
    updateStats(); 
}

function addDiaryEntry() {
    const text = document.getElementById('diary-input').value.trim(); 
    if (!text) return;
    data.diary.push({ date: formatDateTime(new Date()), text });
    document.getElementById('diary-input').value = ''; 
    saveData(); 
    renderDiary();
}

function renderDiary() {
    const list = document.getElementById('diary-list'); 
    list.innerHTML = '';
    data.diary.slice().reverse().forEach((e) => {
        const idx = data.diary.indexOf(e);
        const div = document.createElement('div');
        div.className = 'diary-entry';
        div.innerHTML = `
            <div class="diary-entry-date">${e.date}</div>
            <div class="diary-entry-text">${escHtml(e.text)}</div>
            <button class="diary-del-btn" onclick="deleteDiaryEntry(${idx})">×</button>
        `;
        list.appendChild(div);
    });
}

function deleteDiaryEntry(i) { 
    data.diary.splice(i, 1); 
    saveData(); 
    renderDiary(); 
}

function renderHistory() {
    const grid = document.getElementById('history-grid'); 
    grid.innerHTML = '';
    const sorted = Object.keys(data.days).sort().reverse();
    sorted.forEach(day => {
        const d = data.days[day];
        const row = document.createElement('div');
        row.className = 'history-day';
        const oracle = d.iching ? '☯️' : '';
        row.innerHTML = `
            <span class="day-date">${formatDate(day)}</span>
            <span class="day-stat">📇 ${d.flash || 0} min</span>
            <span class="day-stat">📚 ${d.read || 0} hrs</span>
            <span class="day-streak">${oracle} ✓</span>
        `;
        grid.appendChild(row);
    });
}

// --- NUMOGRAM LOGIC ---
function selectZone(n) { 
    document.querySelectorAll('.zone-group').forEach(z => z.classList.remove('active'));
    const btn = document.getElementById('btn-zone-' + n);
    if(btn) btn.classList.add('active');
    
    const store = document.getElementById('data-zone-' + n);
    document.getElementById('numo-display').innerHTML = store.innerHTML; 
}

function calculateNumogram() {
    const input = document.getElementById('numo-gematria-input').value.toUpperCase();
    let sum = 0; 
    for (let char of input) { 
        if(/[A-Z]/.test(char)) sum += (char.charCodeAt(0) - 64); 
        else if(/[0-9]/.test(char)) sum += parseInt(char);
    }
    let root = sum % 9 || (sum > 0 ? 9 : 0);
    document.getElementById('numo-result-display').innerHTML = `Sum: ${sum} ➔ Root: ${root}`;
    selectZone(root);
}

function findDemon() {
    const z1 = parseInt(document.getElementById('demon-z1').value);
    const z2 = parseInt(document.getElementById('demon-z2').value);
    if(isNaN(z1) || isNaN(z2)) return;
    
    const max = Math.max(z1, z2), min = Math.min(z1, z2);
    const warpPlex = [0, 3, 6, 9];
    let classification = (warpPlex.includes(max) && warpPlex.includes(min)) ? "Xenodemon (Outside Time)" : "Chronodemon (Inside Time)";
    const planets = ["Sol", "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
    
    document.getElementById('demon-result').innerHTML = `
        <strong>Net-Span [${max}::${min}]</strong><br>
        Class: <span style="color:#00e5ff">${classification}</span><br>
        Bridge: ${planets[max]} ↔ ${planets[min]}
    `;
}

function searchLexicon() {
    const q = document.getElementById('lexicon-search').value.toLowerCase();
    const res = document.getElementById('lexicon-results');
    res.innerHTML = '';
    if(!q) return;
    
    ccruLexicon.forEach(item => {
        if(item.term.toLowerCase().includes(q) || item.def.toLowerCase().includes(q)) {
            res.innerHTML += `<div style="margin-bottom:10px"><strong style="color:#ff3c8e">${item.term}</strong>: ${item.def}</div>`;
        }
    });
}

// --- I-CHING SYSTEM ---
function renderHexagram(id, lines) {
    const el = document.getElementById(id); 
    el.innerHTML = '';
    lines.forEach(l => {
        const isYang = (l === 7 || l === 9);
        const isChanging = (l === 6 || l === 9);
        const div = document.createElement('div');
        div.className = `hex-line ${isYang ? 'yang' : 'yin'}`;
        div.innerHTML = isYang ? `<div class="seg"></div>` : `<div class="seg"></div><div class="seg"></div>`;
        if(isChanging) div.innerHTML += `<span class="hex-line-marker">${l === 9 ? '○' : '×'}</span>`;
        el.appendChild(div);
    });
}

function castOracle() {
    document.getElementById('iching-hex-container').style.display = 'flex';
    let primaryLines = [], secondaryLines = [], hasChanging = false;
    
    for (let i = 0; i < 6; i++) {
        const sum = (Math.random() < 0.5 ? 2 : 3) + (Math.random() < 0.5 ? 2 : 3) + (Math.random() < 0.5 ? 2 : 3);
        primaryLines.push(sum);
        if (sum === 6) { hasChanging = true; secondaryLines.push(7); }
        else if (sum === 9) { hasChanging = true; secondaryLines.push(8); }
        else { secondaryLines.push(sum); }
    }
    
    const toBin = (lines) => lines.map(l => (l === 7 || l === 9) ? '1' : '0').join('');
    const priData = iChingDatabase[toBin(primaryLines)];
    
    const resBox = document.getElementById('iching-primary-result');
    resBox.style.display = 'block';
    resBox.innerHTML = `<h3>Hexagram ${priData.num}: ${priData.name}</h3><p>${priData.meaning}</p>`;
    renderHexagram('iching-primary-vis', primaryLines);

    if (hasChanging) {
        const secData = iChingDatabase[toBin(secondaryLines)];
        const secRes = document.getElementById('iching-secondary-result');
        const secVis = document.getElementById('iching-secondary-box');
        secVis.style.display = 'flex';
        secRes.style.display = 'block';
        secRes.innerHTML = `<h3>Changes to Hexagram ${secData.num}: ${secData.name}</h3><p>${secData.meaning}</p>`;
        renderHexagram('iching-secondary-vis', secondaryLines);
    } else {
        document.getElementById('iching-secondary-box').style.display = 'none';
        document.getElementById('iching-secondary-result').style.display = 'none';
    }

    // Save Daily
    const today = todayStr();
    if(!data.days[today]) data.days[today] = { flash:0, read:0 };
    if(!data.days[today].iching) {
        const yoji = yojijukugoList[Math.floor(Math.random()*yojijukugoList.length)];
        data.days[today].iching = { primary: priData, yojijukugo: yoji };
        saveData();
        displayDailyOracle();
    }
}

function displayDailyOracle() {
    const td = data.days[todayStr()];
    if(!td || !td.iching) return;
    document.getElementById('daily-oracle-panel').style.display = 'block';
    document.getElementById('daily-yoji-kanji').textContent = td.iching.yojijukugo.k;
    document.getElementById('daily-yoji-meaning').textContent = td.iching.yojijukugo.m;
    document.getElementById('daily-pri-name').textContent = td.iching.primary.name;
}

// --- NES BACKUP ---
function generatePassword() { 
    document.getElementById('nes-password-box').value = btoa(encodeURIComponent(JSON.stringify(data))); 
}

function loadPassword() { 
    try { 
        const raw = document.getElementById('nes-password-box').value.trim();
        data = JSON.parse(decodeURIComponent(atob(raw))); 
        saveData(); 
        initApp(); 
        alert("RESTORED!"); 
    } catch(e) { alert("Invalid Backup Password"); } 
}

function copyPassword() {
    const box = document.getElementById('nes-password-box');
    box.select();
    document.execCommand('copy');
    alert("Copied to clipboard!");
}

// --- PHRASE CYCLE ---
function startPhraseCycle() {
    const update = () => {
        const p = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
        const bubble = document.getElementById('random-bubble');
        bubble.style.opacity = 0;
        setTimeout(() => {
            document.getElementById('random-phrase').textContent = p.text;
            const tag = document.getElementById('random-lang-tag');
            tag.textContent = p.label;
            tag.className = 'random-lang-tag ' + p.lang;
            bubble.style.opacity = 1;
        }, 500);
    };
    update();
    setInterval(update, 8000);
}

// --- STARTUP ---
updateThemeIcon();
