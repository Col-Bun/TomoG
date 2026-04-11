// ===== JAPANESE VERB CONJUGATION GAME =====
// Practice conjugating Japanese verbs in various forms
// 3 difficulties: Easy (10 verbs), Normal (50 verbs), Hard (100 verbs)
// Correct answers earn loot (materials, MoeBucks, rare chimera encounters)

// ===== VERB DATABASE =====
const VERBS = [
  // Godan (u-verbs)
  { dict: '走る', reading: 'はしる', meaning: 'to run', group: 'godan-r' },
  { dict: '書く', reading: 'かく', meaning: 'to write', group: 'godan-k' },
  { dict: '飲む', reading: 'のむ', meaning: 'to drink', group: 'godan-m' },
  { dict: '話す', reading: 'はなす', meaning: 'to speak', group: 'godan-s' },
  { dict: '読む', reading: 'よむ', meaning: 'to read', group: 'godan-m' },
  { dict: '待つ', reading: 'まつ', meaning: 'to wait', group: 'godan-t' },
  { dict: '買う', reading: 'かう', meaning: 'to buy', group: 'godan-u' },
  { dict: '泳ぐ', reading: 'およぐ', meaning: 'to swim', group: 'godan-g' },
  { dict: '死ぬ', reading: 'しぬ', meaning: 'to die', group: 'godan-n' },
  { dict: '遊ぶ', reading: 'あそぶ', meaning: 'to play', group: 'godan-b' },
  { dict: '歩く', reading: 'あるく', meaning: 'to walk', group: 'godan-k' },
  { dict: '歌う', reading: 'うたう', meaning: 'to sing', group: 'godan-u' },
  { dict: '立つ', reading: 'たつ', meaning: 'to stand', group: 'godan-t' },
  { dict: '座る', reading: 'すわる', meaning: 'to sit', group: 'godan-r' },
  { dict: '帰る', reading: 'かえる', meaning: 'to return', group: 'godan-r' },
  { dict: '送る', reading: 'おくる', meaning: 'to send', group: 'godan-r' },
  { dict: '持つ', reading: 'もつ', meaning: 'to hold', group: 'godan-t' },
  { dict: '作る', reading: 'つくる', meaning: 'to make', group: 'godan-r' },
  { dict: '乗る', reading: 'のる', meaning: 'to ride', group: 'godan-r' },
  { dict: '売る', reading: 'うる', meaning: 'to sell', group: 'godan-r' },
  { dict: '思う', reading: 'おもう', meaning: 'to think', group: 'godan-u' },
  { dict: '知る', reading: 'しる', meaning: 'to know', group: 'godan-r' },
  { dict: '切る', reading: 'きる', meaning: 'to cut', group: 'godan-r' },
  { dict: '動く', reading: 'うごく', meaning: 'to move', group: 'godan-k' },
  { dict: '消す', reading: 'けす', meaning: 'to erase', group: 'godan-s' },
  { dict: '押す', reading: 'おす', meaning: 'to push', group: 'godan-s' },
  { dict: '引く', reading: 'ひく', meaning: 'to pull', group: 'godan-k' },
  { dict: '飛ぶ', reading: 'とぶ', meaning: 'to fly', group: 'godan-b' },
  { dict: '笑う', reading: 'わらう', meaning: 'to laugh', group: 'godan-u' },
  { dict: '怒る', reading: 'おこる', meaning: 'to be angry', group: 'godan-r' },
  { dict: '叫ぶ', reading: 'さけぶ', meaning: 'to shout', group: 'godan-b' },
  { dict: '選ぶ', reading: 'えらぶ', meaning: 'to choose', group: 'godan-b' },
  { dict: '開く', reading: 'あく', meaning: 'to open', group: 'godan-k' },
  { dict: '閉まる', reading: 'しまる', meaning: 'to close', group: 'godan-r' },
  { dict: '払う', reading: 'はらう', meaning: 'to pay', group: 'godan-u' },
  { dict: '使う', reading: 'つかう', meaning: 'to use', group: 'godan-u' },
  { dict: '頼む', reading: 'たのむ', meaning: 'to request', group: 'godan-m' },
  { dict: '届く', reading: 'とどく', meaning: 'to reach', group: 'godan-k' },
  { dict: '磨く', reading: 'みがく', meaning: 'to polish', group: 'godan-k' },
  { dict: '脱ぐ', reading: 'ぬぐ', meaning: 'to undress', group: 'godan-g' },
  { dict: '急ぐ', reading: 'いそぐ', meaning: 'to hurry', group: 'godan-g' },
  { dict: '置く', reading: 'おく', meaning: 'to put/place', group: 'godan-k' },
  // Ichidan (ru-verbs)
  { dict: '食べる', reading: 'たべる', meaning: 'to eat', group: 'ichidan' },
  { dict: '見る', reading: 'みる', meaning: 'to see', group: 'ichidan' },
  { dict: '起きる', reading: 'おきる', meaning: 'to wake up', group: 'ichidan' },
  { dict: '寝る', reading: 'ねる', meaning: 'to sleep', group: 'ichidan' },
  { dict: '出る', reading: 'でる', meaning: 'to exit', group: 'ichidan' },
  { dict: '着る', reading: 'きる', meaning: 'to wear', group: 'ichidan' },
  { dict: '開ける', reading: 'あける', meaning: 'to open (tr.)', group: 'ichidan' },
  { dict: '閉める', reading: 'しめる', meaning: 'to close (tr.)', group: 'ichidan' },
  { dict: '教える', reading: 'おしえる', meaning: 'to teach', group: 'ichidan' },
  { dict: '考える', reading: 'かんがえる', meaning: 'to think', group: 'ichidan' },
  { dict: '答える', reading: 'こたえる', meaning: 'to answer', group: 'ichidan' },
  { dict: '忘れる', reading: 'わすれる', meaning: 'to forget', group: 'ichidan' },
  { dict: '覚える', reading: 'おぼえる', meaning: 'to remember', group: 'ichidan' },
  { dict: '始める', reading: 'はじめる', meaning: 'to begin', group: 'ichidan' },
  { dict: '止める', reading: 'やめる', meaning: 'to stop', group: 'ichidan' },
  { dict: '入れる', reading: 'いれる', meaning: 'to put in', group: 'ichidan' },
  { dict: '調べる', reading: 'しらべる', meaning: 'to investigate', group: 'ichidan' },
  { dict: '集める', reading: 'あつめる', meaning: 'to collect', group: 'ichidan' },
  { dict: '信じる', reading: 'しんじる', meaning: 'to believe', group: 'ichidan' },
  { dict: '感じる', reading: 'かんじる', meaning: 'to feel', group: 'ichidan' },
  { dict: '生まれる', reading: 'うまれる', meaning: 'to be born', group: 'ichidan' },
  { dict: '落ちる', reading: 'おちる', meaning: 'to fall', group: 'ichidan' },
  { dict: '逃げる', reading: 'にげる', meaning: 'to escape', group: 'ichidan' },
  { dict: '負ける', reading: 'まける', meaning: 'to lose', group: 'ichidan' },
  { dict: '混ぜる', reading: 'まぜる', meaning: 'to mix', group: 'ichidan' },
  // Irregular
  { dict: 'する', reading: 'する', meaning: 'to do', group: 'irregular-suru' },
  { dict: '来る', reading: 'くる', meaning: 'to come', group: 'irregular-kuru' },
  { dict: '勉強する', reading: 'べんきょうする', meaning: 'to study', group: 'irregular-suru' },
  { dict: '料理する', reading: 'りょうりする', meaning: 'to cook', group: 'irregular-suru' },
  { dict: '運動する', reading: 'うんどうする', meaning: 'to exercise', group: 'irregular-suru' },
  { dict: '掃除する', reading: 'そうじする', meaning: 'to clean', group: 'irregular-suru' },
  { dict: '散歩する', reading: 'さんぽする', meaning: 'to take a walk', group: 'irregular-suru' },
  { dict: '旅行する', reading: 'りょこうする', meaning: 'to travel', group: 'irregular-suru' },
  { dict: '練習する', reading: 'れんしゅうする', meaning: 'to practice', group: 'irregular-suru' },
];

// ===== CONJUGATION FORMS =====
const CONJ_FORMS = [
  { id: 'te', name: 'て-form', desc: 'Connecting/request form' },
  { id: 'nai', name: 'ない-form', desc: 'Negative (plain)' },
  { id: 'masu', name: 'ます-form', desc: 'Polite present' },
  { id: 'ta', name: 'た-form', desc: 'Past (plain)' },
  { id: 'mashita', name: 'ました-form', desc: 'Polite past' },
  { id: 'potential', name: '可能形', desc: 'Potential (can do)' },
  { id: 'volitional', name: '意向形', desc: 'Volitional (let\'s)' },
  { id: 'imperative', name: '命令形', desc: 'Imperative (command)' },
];

// ===== CONJUGATION ENGINE =====
function conjugateVerb(verb, form) {
  const stem = verb.dict;
  const group = verb.group;

  if (group === 'ichidan') {
    const ichidanStem = stem.slice(0, -1); // Remove る
    switch (form) {
      case 'te': return ichidanStem + 'て';
      case 'nai': return ichidanStem + 'ない';
      case 'masu': return ichidanStem + 'ます';
      case 'ta': return ichidanStem + 'た';
      case 'mashita': return ichidanStem + 'ました';
      case 'potential': return ichidanStem + 'られる';
      case 'volitional': return ichidanStem + 'よう';
      case 'imperative': return ichidanStem + 'ろ';
    }
  }

  if (group === 'irregular-suru') {
    const suruStem = stem.slice(0, -2); // Remove する
    switch (form) {
      case 'te': return suruStem + 'して';
      case 'nai': return suruStem + 'しない';
      case 'masu': return suruStem + 'します';
      case 'ta': return suruStem + 'した';
      case 'mashita': return suruStem + 'しました';
      case 'potential': return suruStem + 'できる';
      case 'volitional': return suruStem + 'しよう';
      case 'imperative': return suruStem + 'しろ';
    }
  }

  if (group === 'irregular-kuru') {
    switch (form) {
      case 'te': return '来て';
      case 'nai': return '来ない';
      case 'masu': return '来ます';
      case 'ta': return '来た';
      case 'mashita': return '来ました';
      case 'potential': return '来られる';
      case 'volitional': return '来よう';
      case 'imperative': return '来い';
    }
  }

  // Godan verbs
  const lastChar = stem.slice(-1);
  const godanStem = stem.slice(0, -1);

  // Te/ta form mappings
  const teMap = {
    'く': { te: 'いて', ta: 'いた' },
    'ぐ': { te: 'いで', ta: 'いだ' },
    'す': { te: 'して', ta: 'した' },
    'ぬ': { te: 'んで', ta: 'んだ' },
    'ぶ': { te: 'んで', ta: 'んだ' },
    'む': { te: 'んで', ta: 'んだ' },
    'る': { te: 'って', ta: 'った' },
    'つ': { te: 'って', ta: 'った' },
    'う': { te: 'って', ta: 'った' },
  };

  // Exception: 行く -> 行って (not 行いて)
  if (stem === '行く') {
    if (form === 'te') return '行って';
    if (form === 'ta') return '行った';
  }

  // i-stem (for masu, mashita)
  const iStemMap = { 'く': 'き', 'ぐ': 'ぎ', 'す': 'し', 'ぬ': 'に', 'ぶ': 'び', 'む': 'み', 'る': 'り', 'つ': 'ち', 'う': 'い' };
  // a-stem (for nai)
  const aStemMap = { 'く': 'か', 'ぐ': 'が', 'す': 'さ', 'ぬ': 'な', 'ぶ': 'ば', 'む': 'ま', 'る': 'ら', 'つ': 'た', 'う': 'わ' };
  // e-stem (for potential, imperative)
  const eStemMap = { 'く': 'け', 'ぐ': 'げ', 'す': 'せ', 'ぬ': 'ね', 'ぶ': 'べ', 'む': 'め', 'る': 'れ', 'つ': 'て', 'う': 'え' };
  // o-stem (for volitional)
  const oStemMap = { 'く': 'こ', 'ぐ': 'ご', 'す': 'そ', 'ぬ': 'の', 'ぶ': 'ぼ', 'む': 'も', 'る': 'ろ', 'つ': 'と', 'う': 'お' };

  switch (form) {
    case 'te': return godanStem + (teMap[lastChar] ? teMap[lastChar].te : 'って');
    case 'ta': return godanStem + (teMap[lastChar] ? teMap[lastChar].ta : 'った');
    case 'nai': return godanStem + (aStemMap[lastChar] || 'あ') + 'ない';
    case 'masu': return godanStem + (iStemMap[lastChar] || 'い') + 'ます';
    case 'mashita': return godanStem + (iStemMap[lastChar] || 'い') + 'ました';
    case 'potential': return godanStem + (eStemMap[lastChar] || 'え') + 'る';
    case 'volitional': return godanStem + (oStemMap[lastChar] || 'お') + 'う';
    case 'imperative': return godanStem + (eStemMap[lastChar] || 'え');
  }

  return '???';
}

// ===== GAME STATE =====
let conjGame = {
  active: false,
  difficulty: null, // 'easy', 'normal', 'hard'
  totalQuestions: 0,
  currentQuestion: 0,
  correct: 0,
  wrong: 0,
  currentVerb: null,
  currentForm: null,
  correctAnswer: null,
  questions: [],  // Pre-generated question list
  startTime: null,
};

const DIFFICULTY_CONFIG = {
  easy: { questions: 10, forms: ['te', 'nai', 'masu'], lootTier: 6, moeBucks: 25, label: 'Easy' },
  normal: { questions: 50, forms: ['te', 'nai', 'masu', 'ta', 'mashita', 'potential'], lootTier: 14, moeBucks: 80, label: 'Normal' },
  hard: { questions: 100, forms: ['te', 'nai', 'masu', 'ta', 'mashita', 'potential', 'volitional', 'imperative'], lootTier: 20, moeBucks: 200, label: 'Hard' },
};

function startConjGame(difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty];
  if (!config) return;

  // Generate question list
  const questions = [];
  for (let i = 0; i < config.questions; i++) {
    const verb = VERBS[Math.floor(Math.random() * VERBS.length)];
    const form = config.forms[Math.floor(Math.random() * config.forms.length)];
    const answer = conjugateVerb(verb, form);
    questions.push({ verb, form, answer });
  }

  conjGame = {
    active: true,
    difficulty,
    totalQuestions: config.questions,
    currentQuestion: 0,
    correct: 0,
    wrong: 0,
    currentVerb: null,
    currentForm: null,
    correctAnswer: null,
    questions,
    startTime: Date.now(),
  };

  showNextConjQuestion();
}

function showNextConjQuestion() {
  if (conjGame.currentQuestion >= conjGame.totalQuestions) {
    endConjGame();
    return;
  }

  const q = conjGame.questions[conjGame.currentQuestion];
  conjGame.currentVerb = q.verb;
  conjGame.currentForm = q.form;
  conjGame.correctAnswer = q.answer;

  const formInfo = CONJ_FORMS.find(f => f.id === q.form);

  const display = document.getElementById('conj-game-display');
  if (!display) return;

  display.innerHTML = `
    <div class="conj-question-card">
      <div class="conj-progress">${conjGame.currentQuestion + 1} / ${conjGame.totalQuestions}</div>
      <div class="conj-score">✓ ${conjGame.correct} | ✗ ${conjGame.wrong}</div>
      <div class="conj-verb-display">${q.verb.dict}</div>
      <div class="conj-reading">${q.verb.reading} — ${q.verb.meaning}</div>
      <div class="conj-form-ask">Conjugate to: <span class="conj-form-highlight">${formInfo ? formInfo.name : q.form}</span></div>
      <div class="conj-form-desc">${formInfo ? formInfo.desc : ''}</div>
      <div class="conj-input-row">
        <input type="text" id="conj-answer-input" class="conj-input" placeholder="Type your answer..." autocomplete="off" autofocus>
        <button class="btn-glossy btn-green" onclick="submitConjAnswer()">Submit</button>
      </div>
      <div id="conj-feedback" style="min-height:2em; margin-top:10px;"></div>
    </div>
  `;

  // Focus input and add enter key handler
  const input = document.getElementById('conj-answer-input');
  if (input) {
    input.focus();
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') submitConjAnswer();
    });
  }
}

function submitConjAnswer() {
  const input = document.getElementById('conj-answer-input');
  const feedback = document.getElementById('conj-feedback');
  if (!input || !feedback || !conjGame.active) return;

  const answer = input.value.trim();
  if (!answer) return;

  const isCorrect = answer === conjGame.correctAnswer;

  if (isCorrect) {
    conjGame.correct++;
    feedback.innerHTML = `<span style="color:#a8e84c; font-weight:800;">✓ Correct!</span>`;
  } else {
    conjGame.wrong++;
    feedback.innerHTML = `<span style="color:#ff3c8e; font-weight:800;">✗ Wrong!</span> Correct answer: <span style="color:#ffcc00; font-weight:700;">${conjGame.correctAnswer}</span>`;
  }

  conjGame.currentQuestion++;
  input.disabled = true;

  setTimeout(() => {
    showNextConjQuestion();
  }, isCorrect ? 800 : 2000);
}

function endConjGame() {
  conjGame.active = false;
  const config = DIFFICULTY_CONFIG[conjGame.difficulty];
  const accuracy = conjGame.totalQuestions > 0 ? (conjGame.correct / conjGame.totalQuestions) : 0;
  const elapsed = Math.floor((Date.now() - conjGame.startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  // Calculate rewards based on accuracy
  let moeBucksReward = 0;
  let lootReward = [];
  let grade = '';
  let gradeColor = '#ff3c8e';

  if (accuracy >= 0.9) {
    grade = 'S'; gradeColor = '#FFD700';
    moeBucksReward = config.moeBucks;
    lootReward = rollExpeditionLoot(config.lootTier, Math.ceil(config.questions / 5));
  } else if (accuracy >= 0.75) {
    grade = 'A'; gradeColor = '#a8e84c';
    moeBucksReward = Math.floor(config.moeBucks * 0.7);
    lootReward = rollExpeditionLoot(Math.floor(config.lootTier * 0.8), Math.ceil(config.questions / 8));
  } else if (accuracy >= 0.6) {
    grade = 'B'; gradeColor = '#00e5ff';
    moeBucksReward = Math.floor(config.moeBucks * 0.4);
    lootReward = rollExpeditionLoot(Math.floor(config.lootTier * 0.5), Math.ceil(config.questions / 12));
  } else if (accuracy >= 0.4) {
    grade = 'C'; gradeColor = '#ffcc00';
    moeBucksReward = Math.floor(config.moeBucks * 0.2);
    lootReward = rollExpeditionLoot(Math.floor(config.lootTier * 0.3), 2);
  } else {
    grade = 'F'; gradeColor = '#ff3c8e';
    moeBucksReward = 5;
  }

  // Apply rewards
  const sd = getSlotData();
  sd.moeBucks += moeBucksReward;
  if (lootReward.length > 0) addMaterialsToInventory(lootReward);

  // Track conjugation stats
  if (!data.conjStats) data.conjStats = { totalGames: 0, totalCorrect: 0, totalWrong: 0, bestAccuracy: 0, sRanks: 0 };
  data.conjStats.totalGames++;
  data.conjStats.totalCorrect += conjGame.correct;
  data.conjStats.totalWrong += conjGame.wrong;
  if (accuracy > data.conjStats.bestAccuracy) data.conjStats.bestAccuracy = accuracy;
  if (grade === 'S') data.conjStats.sRanks++;

  saveData();
  updateSlotMoneyDisplay();

  // Show results
  const display = document.getElementById('conj-game-display');
  if (!display) return;

  const lootHtml = lootReward.length > 0 ? `
    <div class="conj-loot-grid">
      ${lootReward.map(item => {
        const mat = MATERIALS.find(m => m.id === item.id);
        if (!mat) return '';
        const tc = TIER_COLORS[mat.tier];
        return `<div class="conj-loot-item" style="border-color:${tc.border}; background:${tc.bg};">
          <span>${mat.emoji}</span> <span style="color:${tc.text};">${mat.name}</span> x${item.qty}
        </div>`;
      }).join('')}
    </div>
  ` : '';

  display.innerHTML = `
    <div class="conj-results-card">
      <div class="conj-grade" style="color:${gradeColor};">${grade}</div>
      <div class="conj-results-title">Game Complete! (${config.label})</div>
      <div class="conj-results-stats">
        <span>✓ ${conjGame.correct}</span>
        <span>✗ ${conjGame.wrong}</span>
        <span>${(accuracy * 100).toFixed(0)}%</span>
        <span>${minutes}:${String(seconds).padStart(2, '0')}</span>
      </div>
      <div class="conj-rewards">
        <div style="color:#a8e84c; font-weight:800; margin-bottom:8px;">💰 +${moeBucksReward} MoeBucks</div>
        ${lootHtml}
      </div>
      <button class="btn-glossy btn-pink" onclick="renderConjMenu()" style="margin-top:16px;">Play Again</button>
    </div>
  `;

  if (typeof renderMaterials === 'function') renderMaterials();
}

function renderConjMenu() {
  const display = document.getElementById('conj-game-display');
  if (!display) return;

  const stats = data.conjStats || { totalGames: 0, totalCorrect: 0, totalWrong: 0, bestAccuracy: 0, sRanks: 0 };

  display.innerHTML = `
    <div class="conj-menu">
      <div class="conj-difficulty-grid">
        <div class="conj-diff-card glass" onclick="startConjGame('easy')">
          <div class="conj-diff-emoji">🌱</div>
          <div class="conj-diff-name">Easy</div>
          <div class="conj-diff-desc">10 questions</div>
          <div class="conj-diff-forms">て, ない, ます</div>
          <div class="conj-diff-reward">25 MB + Common loot</div>
        </div>
        <div class="conj-diff-card glass" onclick="startConjGame('normal')">
          <div class="conj-diff-emoji">⚔️</div>
          <div class="conj-diff-name">Normal</div>
          <div class="conj-diff-desc">50 questions</div>
          <div class="conj-diff-forms">て, ない, ます, た, ました, 可能</div>
          <div class="conj-diff-reward">80 MB + Rare loot</div>
        </div>
        <div class="conj-diff-card glass" onclick="startConjGame('hard')">
          <div class="conj-diff-emoji">🔥</div>
          <div class="conj-diff-name">Hard</div>
          <div class="conj-diff-desc">100 questions</div>
          <div class="conj-diff-forms">All 8 forms</div>
          <div class="conj-diff-reward">200 MB + Legendary loot</div>
        </div>
      </div>
      <div class="conj-stats-bar" style="margin-top:16px;">
        <span>Games: ${stats.totalGames}</span>
        <span>Correct: ${stats.totalCorrect}</span>
        <span>Best: ${(stats.bestAccuracy * 100).toFixed(0)}%</span>
        <span>S-Ranks: ${stats.sRanks}</span>
      </div>
    </div>
  `;
}

function initConjugation() {
  renderConjMenu();
}
