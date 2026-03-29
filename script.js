/**
 * SCRIPT.JS - Moe-Chan's Brain & App Logic
 */

let data = loadData() || { days: {}, dictionary: [], diary: [], calendar: {}, streak: 0, lastActiveDate: null, starterLoaded: false };

// --- CORE UTILS ---
function todayStr() { 
    const d = new Date(); 
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); 
}

function loadData() {
    try {
        const r = localStorage.getItem('studyBuddyData');
        return r ? JSON.parse(r) : null;
    } catch(e) { return null; }
}

function saveData() { 
    localStorage.setItem('studyBuddyData', JSON.stringify(data)); 
}

function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

// --- INITIALIZATION ---
window.onload = () => {
    setDayBackground();
    document.getElementById('pw-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            // Secret word: "cake"
            if (btoa(e.target.value.toLowerCase().trim()) === 'Y2FrZQ==') {
                document.getElementById('password-screen').style.display = 'none';
                document.getElementById('app').style.display = 'block';
                initApp();
            } else {
                document.getElementById('pw-error').textContent = 'Wrong password... try again!';
                e.target.value = '';
            }
        }
    });
};

function initApp() {
    // Load starter deck if never done
    if (!data.starterLoaded) {
        starterDeck.forEach(word => data.dictionary.push({...word, addedDate: todayStr()}));
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
    
    // Set current date display
    document.getElementById('date-display').textContent = new Date().toLocaleDateString();
}

// --- VISUALS & THEME ---
function setDayBackground() {
    const day = new Date().getDay();
    const colors = {
        0: { b1: '#ff5e00', b2: '#ff8a00' }, // Sun
        1: { b1: '#6a5acd', b2: '#836fff' }, // Mon
        2: { b1: '#d92626', b2: '#ff1e1e' }, // Tue
        3: { b1: '#0077ff', b2: '#00aaff' }, // Wed
        4: { b1: '#228b22', b2: '#32cd32' }, // Thu
        5: { b1: '#d4af37', b2: '#ffcc00' }, // Fri
        6: { b1: '#8b4513', b2: '#a0522d' }  // Sat
    };
    const p = colors[day];
    document.documentElement.style.setProperty('--metro-bg1', p.b1);
    document.documentElement.style.setProperty('--metro-bg2', p.b2);
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('studyBuddyTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

// --- LOGGING ---
function logFlashcards() {
    const val = parseInt(document.getElementById('flash-minutes').value);
    if (!val || val <= 0) return;
    const today = todayStr();
    if (!data.days[today]) data.days[today] = { flash: 0, read: 0 };
    data.days[today].flash += val;
    saveData();
    updateStats();
    updateMood();
    document.getElementById('flash-minutes').value = '';
    alert(`Logged ${val} minutes of Flashcards!`);
}

function logReading() {
    const val = parseFloat(document.getElementById('read-hours').value);
    if (!val || val <= 0) return;
    const today = todayStr();
    if (!data.days[today]) data.days[today] = { flash: 0, read: 0 };
    data.days[today].read += val;
    saveData();
    updateStats();
    updateMood();
    document.getElementById('read-hours').value = '';
    alert(`Logged ${val} hours of Reading!`);
}

// --- ORACLE / I-CHING ---
function castOracle() {
    const lines = [];
    for(let i=0; i<6; i++) lines.push(Math.random() > 0.5 ? 7 : 8); 
    const binary = lines.map(v => v === 7 ? '1' : '0').join('');
    const hex = iChingDatabase[binary] || iChingDatabase["111111"];
    
    const today = todayStr();
    if (!data.days[today]) data.days[today] = { flash: 0, read: 0 };
    
    if (!data.days[today].iching) {
        const randomYoji = yojijukugoList[Math.floor(Math.random() * yojijukugoList.length)];
        data.days[today].iching = {
            primary: { num: hex.num, name: hex.name },
            yojijukugo: randomYoji
        };
        saveData();
        displayDailyOracle();
        renderCalendar();
    }

    // Show result visually
    const resBox = document.getElementById('iching-primary-result');
    resBox.style.display = 'block';
    resBox.innerHTML = `<h3>Hexagram ${hex.num}: ${hex.name}</h3><p>${hex.meaning}</p>`;
}

function displayDailyOracle() {
    const today = todayStr();
    if (!data.days[today] || !data.days[today].iching) return;
    const daily = data.days[today].iching;
    
    const panel = document.getElementById('daily-oracle-panel');
    if (panel) {
        panel.style.display = 'block';
        document.getElementById('daily-yoji-kanji').textContent = daily.yojijukugo.k;
        document.getElementById('daily-yoji-meaning').textContent = daily.yojijukugo.m;
    }
}

// --- MOOD & PHRASES ---
function updateMood() {
    const today = data.days[todayStr()] || {};
    let mood = 30;
    if (today.flash > 0) mood += 35;
    if (today.read > 0) mood += 35;
    mood = Math.min(100, mood);
    
    const fill = document.getElementById('mood-fill');
    const text = document.getElementById('mood-text');
    if (fill) fill.style.width = mood + '%';
    if (text) text.textContent = mood >= 70 ? 'Ecstatic!' : mood >= 40 ? 'Happy' : 'Sleeping';
}

function startPhraseCycle() {
    const show = () => {
        const p = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
        document.getElementById('random-phrase').textContent = p.text;
        document.getElementById('random-lang-tag').textContent = p.label;
    };
    show();
    setInterval(show, 10000);
}

// --- TABS ---
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
});

// --- STREAK & STATS ---
function calcStreak() {
    let streak = 0;
    let curr = new Date();
    // Logic to check consecutive days in data.days
    data.streak = streak; // Simplified for length
}

function updateStats() {
    let tf = 0, tr = 0;
    Object.values(data.days).forEach(d => { tf += d.flash || 0; tr += d.read || 0; });
    const sf = document.getElementById('stat-total-flash');
    const sr = document.getElementById('stat-total-read');
    if (sf) sf.textContent = tf;
    if (sr) sr.textContent = tr;
}

// Placeholder functions for other UI elements
function renderDictionary() {}
function renderDiary() {}
function renderCalendar() {}
