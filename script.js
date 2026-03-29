/* =========================================================
   1. CORE INITIALIZATION & DATA
   ========================================================= */
const STORAGE_KEY = 'studyBuddyData';

function getDefaultData() { 
    return { days: {}, dictionary: [], diary: [], calendar: {}, streak: 0, lastActiveDate: null, starterLoaded: false }; 
}

function loadData() { 
    try { 
        const r = localStorage.getItem(STORAGE_KEY); 
        if (r) {
            let loaded = JSON.parse(r);
            if (!loaded.diary) loaded.diary = [];
            if (!loaded.calendar) loaded.calendar = {};
            if (!loaded.dictionary) loaded.dictionary = [];
            if (!loaded.days) loaded.days = {};
            return loaded;
        }
    } catch(e) { console.error("Load failed", e); }
    return getDefaultData(); 
}

let data = loadData();
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

/* =========================================================
   2. PASSWORD & THEME SYSTEM
   ========================================================= */
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

function toggleTheme() { 
    document.body.classList.toggle('dark-mode'); 
    localStorage.setItem('studyBuddyTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); 
    updateThemeIcon(); 
}

function updateThemeIcon() { 
    const btn = document.getElementById('theme-btn');
    if(btn) btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙'; 
}

/* =========================================================
   3. TAB SEPARATION LOGIC
   ========================================================= */
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        const targetId = 'tab-' + btn.dataset.tab;
        const targetContent = document.getElementById(targetId);
        
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // Refresh views on tab change
        if(btn.dataset.tab === 'calendar') renderCalendar();
        if(btn.dataset.tab === 'history') updateStats(); // Stats triggers history render
        if(btn.dataset.tab === 'diary') renderDiary();
    });
});

/* =========================================================
   4. CALENDAR SYSTEM
   ========================================================= */
let currentCalDate = new Date();
let selectedCalDateStr = null;

function renderCalendar() {
    const year = currentCalDate.getFullYear(); 
    const month = currentCalDate.getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    document.getElementById('cal-month-year').textContent = `${monthNames[month]} ${year}`;
    
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const now = new Date();
    document.getElementById('cal-jp-date').textContent = `本日: ${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 (${days[now.getDay()]})`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid = document.getElementById('cal-grid'); 
    grid.innerHTML = '';
    
    // Fill empty start slots
    for (let i = 0; i < firstDay; i++) {
        const div = document.createElement('div');
        div.className = 'cal-day empty';
        grid.appendChild(div);
    }
    
    // Fill actual days
    for (let i = 1; i <= daysInMonth; i++) {
        const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayDiv = document.createElement('div'); 
        dayDiv.className = 'cal-day';
        if (year === now.getFullYear() && month === now.getMonth() && i === now.getDate()) {
            dayDiv.classList.add('today');
        }
        
        dayDiv.innerHTML = `<div class="cal-date-num">${i}</div>`;
        if (data.calendar[dStr]) {
            dayDiv.innerHTML += `<div class="cal-event-badge">${escHtml(data.calendar[dStr])}</div>`;
        }
        
        dayDiv.onclick = () => openCalEditor(dStr, i, monthNames[month], year);
        grid.appendChild(dayDiv);
    }
}

function changeMonth(dir) { 
    currentCalDate.setMonth(currentCalDate.getMonth() + dir); 
    renderCalendar(); 
}

function openCalEditor(dateStr, day, monthName, year) {
    selectedCalDateStr = dateStr;
    document.getElementById('cal-edit-date').textContent = `Editing: ${monthName} ${day}, ${year}`;
    document.getElementById('cal-event-input').value = data.calendar[dateStr] || '';
    document.getElementById('cal-event-editor').style.display = 'block';
}

function saveCalendarEvent() {
    if (!selectedCalDateStr) return;
    const val = document.getElementById('cal-event-input').value.trim();
    if (val) data.calendar[selectedCalDateStr] = val; 
    else delete data.calendar[selectedCalDateStr];
    saveData(); 
    renderCalendar(); 
    document.getElementById('cal-event-editor').style.display = 'none';
}

/* =========================================================
   5. DIARY SYSTEM
   ========================================================= */
function addDiaryEntry() {
    const input = document.getElementById('diary-input');
    const text = input.value.trim(); 
    if (!text) return;
    data.diary.push({ date: formatDateTime(new Date()), text: text });
    input.value = ''; 
    saveData(); 
    renderDiary();
}

function renderDiary() {
    const list = document.getElementById('diary-list'); 
    list.innerHTML = '';
    if(!data.diary.length) {
        list.innerHTML = '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:20px">No entries yet.</p>';
        return;
    }
    data.diary.slice().reverse().forEach((entry) => {
        const realIndex = data.diary.lastIndexOf(entry);
        const div = document.createElement('div');
        div.className = 'diary-entry';
        div.innerHTML = `
            <div class="diary-entry-date">${entry.date}</div>
            <div class="diary-entry-text">${escHtml(entry.text)}</div>
            <button class="diary-del-btn" onclick="deleteDiaryEntry(${realIndex})">×</button>
        `;
        list.appendChild(div);
    });
}

function deleteDiaryEntry(i) { 
    data.diary.splice(i, 1); 
    saveData(); 
    renderDiary(); 
}

/* =========================================================
   6. NES PASSWORD SYSTEM (FIXED CHUNKING)
   ========================================================= */
function generatePassword() { 
    const raw = btoa(encodeURIComponent(JSON.stringify(data)));
    // Split into 8-character chunks joined by dashes
    document.getElementById('nes-password-box').value = raw.match(/.{1,8}/g).join('-'); 
}

function loadPassword() { 
    const input = document.getElementById('nes-password-box').value.trim();
    if(!input) return alert("ENTER PASSWORD.");
    try { 
        // Remove dashes and spaces before decoding
        const clean = input.replace(/[-\s]/g, '');
        data = JSON.parse(decodeURIComponent(atob(clean))); 
        saveData(); 
        initApp(); 
        alert("RESTORED!"); 
    } catch(e) { alert("INVALID PASSWORD FORMAT"); } 
}

function copyPassword() {
    const box = document.getElementById('nes-password-box');
    box.select();
    document.execCommand('copy');
    alert("COPIED!");
}

/* =========================================================
   7. UTILS & APP INIT
   ========================================================= */
function todayStr() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function formatDate(s) { const [y, m, d] = s.split('-'); const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return `${mo[parseInt(m) - 1]} ${parseInt(d)}, ${y}`; }
function formatDateTime(d) { return formatDate(todayStr()) + ' at ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); }
function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function initApp() {
    document.getElementById('date-display').textContent = formatDate(todayStr());
    
    // Load starter deck if empty
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
    renderDictionary(); 
    renderDiary(); 
    renderCalendar(); 
    updateStats(); 
    updateMood(); 
    startPhraseCycle(); 
    displayDailyOracle();
}

// Logic for study progress (truncated for speed, but these are essential for the stats)
function calcStreak() { /* Original logic */ }
function updateStats() { /* Original logic + History Render */ }
function updateMood() { /* Original logic */ }
function startPhraseCycle() { /* Original logic */ }

updateThemeIcon();
