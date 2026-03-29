/* SCRIPT.JS - FULL ORIGINAL LOGIC */
let data = loadData() || { days: {}, dictionary: [], diary: [], calendar: {}, streak: 0, lastActiveDate: null, starterLoaded: false };

function todayStr() { const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function loadData() { try { const r = localStorage.getItem('studyBuddyData'); return r ? JSON.parse(r) : null; } catch(e) { return null; } }
function saveData() { localStorage.setItem('studyBuddyData', JSON.stringify(data)); }

window.onload = () => {
    document.getElementById('pw-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (btoa(e.target.value.toLowerCase().trim()) === 'Y2FrZQ==') {
                document.getElementById('password-screen').style.display = 'none';
                document.getElementById('app').style.display = 'block';
                initApp();
            } else {
                document.getElementById('pw-error').textContent = 'Wrong password!';
            }
        }
    });
};

function initApp() {
    // Uses starterDeck from data.js
    if (!data.starterLoaded) {
        starterDeck.forEach(w => data.dictionary.push({...w, addedDate: todayStr()}));
        data.starterLoaded = true; saveData();
    }
    updateMood();
    startPhraseCycle();
    document.getElementById('date-display').textContent = new Date().toLocaleDateString();
}

function castOracle() {
    // Generate the random lines
    const lines = []; for(let i=0; i<6; i++) lines.push(Math.random() > 0.5 ? 7 : 8);
    const binary = lines.map(v => v === 7 ? '1' : '0').join('');
    // iChingDatabase is in data.js
    const hex = iChingDatabase[binary];
    const resBox = document.getElementById('iching-primary-result');
    resBox.innerHTML = `<h3>${hex.name}</h3><p>${hex.meaning}</p>`;
}

function updateMood() {
    const today = data.days[todayStr()] || {};
    let mood = 30;
    if(today.flash > 0) mood += 35;
    if(today.read > 0) mood += 35;
    document.getElementById('mood-fill').style.width = Math.min(100, mood) + '%';
    document.getElementById('mood-text').textContent = mood >= 70 ? 'Ecstatic!' : 'Chilling';
}

function startPhraseCycle() {
    const show = () => {
        const p = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
        document.getElementById('random-phrase').textContent = p.text;
        document.getElementById('random-lang-tag').textContent = p.label;
    };
    show(); setInterval(show, 10000);
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
});
