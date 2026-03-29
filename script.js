/* =========================================================
   1. TAB SWITCHING LOGIC (The "Page Separator")
   ========================================================= */

// This function handles the "separation" of pages.
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            // 1. Remove 'active' class from all buttons to dim them
            tabs.forEach(t => t.classList.remove('active'));
            // 2. Hide ALL pages immediately
            contents.forEach(c => c.classList.remove('active'));

            // 3. Highlight the clicked button
            btn.classList.add('active');
            // 4. Show ONLY the page that matches the button's data-tab
            const targetPage = document.getElementById('tab-' + target);
            if (targetPage) {
                targetPage.classList.add('active');
            }

            // Trigger specific renders if needed when a tab opens
            if (target === 'calendar') renderCalendar();
            if (target === 'history') renderHistory();
            if (target === 'dictionary') renderDictionary();
        });
    });
}

/* =========================================================
   2. CORE DATA & INITIALIZATION
   ========================================================= */
const STORAGE_KEY = 'studyBuddyData';
let data = loadData();

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
    return { days: {}, dictionary: [], diary: [], calendar: {}, streak: 0, lastActiveDate: null, starterLoaded: false }; 
}

function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function initApp() {
    setupTabs(); // Initialize the tab separator
    document.getElementById('date-display').textContent = formatDate(todayStr());
    
    // Load starter deck
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
    updateStats();
    updateMood();
    startPhraseCycle();
    displayDailyOracle();
    renderDictionary();
    renderDiary();
    renderCalendar();
}

/* =========================================================
   3. PASSWORD & THEME
   ========================================================= */
document.getElementById('pw-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        if (btoa(this.value.toLowerCase().trim()) === 'Y2FrZQ==') {
            document.getElementById('password-screen').style.display = 'none';
            document.getElementById('app').style.display = 'block';
            initApp();
        } else {
            document.getElementById('pw-error').textContent = 'Wrong password...';
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
   4. NUMOGRAM SYSTEM (Clickable Map)
   ========================================================= */
function selectZone(n) { 
    // Remove highlight from all zones
    document.querySelectorAll('.zone-group').forEach(z => z.classList.remove('active'));
    // Highlight the selected SVG group
    const btn = document.getElementById('btn-zone-' + n);
    if(btn) btn.classList.add('active');
    
    // Pull text from the hidden HTML data store
    const store = document.getElementById('data-zone-' + n);
    const display = document.getElementById('numo-display');
    if(store && display) {
        display.innerHTML = store.innerHTML;
    }
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
    document.getElementById('demon-result').innerHTML = `Net-Span [${max}::${min}]<br>Class: ${classification}`;
}

/* =========================================================
   5. I-CHING ORACLE (Daily & Random)
   ========================================================= */
function castOracle() {
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
    
    document.getElementById('iching-hex-container').style.display = 'flex';
    document.getElementById('iching-primary-result').style.display = 'block';
    document.getElementById('iching-primary-result').innerHTML = `<h3>Hex ${priData.num}: ${priData.name}</h3><p>${priData.meaning}</p>`;
    renderHexVisual('iching-primary-vis', primaryLines);

    if (hasChanging) {
        const secData = iChingDatabase[toBin(secondaryLines)];
        document.getElementById('iching-secondary-box').style.display = 'flex';
        document.getElementById('iching-secondary-result').style.display = 'block';
        document.getElementById('iching-secondary-result').innerHTML = `<h3>Changes to Hex ${secData.num}: ${secData.name}</h3><p>${secData.meaning}</p>`;
        renderHexVisual('iching-secondary-vis', secondaryLines);
    } else {
        document.getElementById('iching-secondary-box').style.display = 'none';
        document.getElementById('iching-secondary-result').style.display = 'none';
    }

    const today = todayStr();
    if(!data.days[today]) data.days[today] = { flash:0, read:0 };
    if(!data.days[today].iching) {
        data.days[today].iching = { primary: priData, yojijukugo: yojijukugoList[Math.floor(Math.random()*yojijukugoList.length)] };
        saveData();
        displayDailyOracle();
    }
}

function renderHexVisual(id, lines) {
    const el = document.getElementById(id); el.innerHTML = '';
    lines.forEach(l => {
        const isYang = (l === 7 || l === 9);
        const div = document.createElement('div');
        div.className = `hex-line ${isYang ? 'yang' : 'yin'}`;
        div.innerHTML = isYang ? `<div class="seg"></div>` : `<div class="seg"></div><div class="seg"></div>`;
        el.appendChild(div);
    });
}

/* =========================================================
   6. UTILS & HELPERS
   ========================================================= */
function todayStr() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function formatDate(s) { if(!s) return ""; const [y, m, d] = s.split('-'); const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return `${mo[parseInt(m) - 1]} ${parseInt(d)}, ${y}`; }
function startPhraseCycle() { 
    const update = () => {
        const p = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
        document.getElementById('random-phrase').textContent = p.text;
    };
    update(); setInterval(update, 8000);
}
function calcStreak() { /* Logic here */ }
function updateStats() { /* Logic here */ }
function updateMood() { /* Logic here */ }

// Initialize
updateThemeIcon();
