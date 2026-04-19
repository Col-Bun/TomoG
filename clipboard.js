// clipboard.js — Visual Novel Text Hooker Companion

// ===== STATE =====
let clipSessionLines = [];        // All unique lines this session
let clipTotalJPChars = 0;         // Running JP character total (persistent)
let clipSessionJPChars = 0;       // JP chars this session only
let clipPollingActive = false;    // Auto-poll toggle
let clipPollTimer = null;
let clipLastText = '';            // Dedup: last captured string

// ===== FUDOKI MODE (Kuromoji POS tagger in a Web Worker) =====
// Tokenizes each line with kuromoji.js and renders stacked tokens à la Fudoki:
//
//   [カタカナ reading]       ← tok.reading
//   [romaji]                  ← derived from reading
//   原文                      ← tok.surface_form
//   [POS abbrev (名/動/…)]
//   [colored underline by POS]
//
// The heavy dictionary download (~5MB) and tokenizer parse run in a Web Worker,
// so the main thread is never frozen. Browser HTTP cache makes subsequent
// sessions instant.
let fudokiEnabled = false;
let fudokiWorker = null;
let fudokiReady = false;
let fudokiLoadMsg = '';
let fudokiSeq = 0;
const fudokiPending = new Map();       // seq → {resolve,reject}
const fudokiTokenCache = new Map();    // line → tokens[]  (so re-renders are free)

// POS → color (matches the site's general vibe)
const FUDOKI_POS_COLORS = {
  '名詞':      '#a8e84c',  // noun    — green
  '動詞':      '#4ec6ff',  // verb    — cyan
  '形容詞':    '#ffd36a',  // i-adj   — gold
  '形容動詞':  '#ffb86b',  // na-adj  — orange
  '副詞':      '#ff6eaa',  // adverb  — pink-hot
  '助詞':      '#c49bff',  // particle — lavender
  '助動詞':    '#d7b7ff',  // aux verb — light lavender
  '連体詞':    '#7ee6c6',  // adnominal — teal
  '代名詞':    '#ff8fa3',  // pronoun  — pink
  '接続詞':    '#ffb300',  // conj    — amber
  '感動詞':    '#ff9ed1',  // interj  — bubblegum
  '接頭詞':    '#8ddbff',  // prefix  — sky
  '接尾':      '#b0c4ff',  // suffix  — periwinkle
  '記号':      '#666',     // symbol  — grey
  'フィラー':  '#888',
  'その他':    '#bbb',
};

// Japanese POS abbreviations shown under each token (short form like Fudoki)
const FUDOKI_POS_ABBREV = {
  '名詞': '名', '動詞': '動', '形容詞': '形', '形容動詞': '形動',
  '副詞': '副', '助詞': '助', '助動詞': '助動',
  '連体詞': '連体', '代名詞': '代名', '接続詞': '接続',
  '感動詞': '感', '接頭詞': '接頭詞', '接尾': '接尾',
  '記号': '記号', 'フィラー': 'フィラー', 'その他': '他',
};

// ===== KATAKANA → ROMAJI (Hepburn) =====
const KATA_ROMAJI = {
  'ア':'a','イ':'i','ウ':'u','エ':'e','オ':'o',
  'カ':'ka','キ':'ki','ク':'ku','ケ':'ke','コ':'ko',
  'ガ':'ga','ギ':'gi','グ':'gu','ゲ':'ge','ゴ':'go',
  'サ':'sa','シ':'shi','ス':'su','セ':'se','ソ':'so',
  'ザ':'za','ジ':'ji','ズ':'zu','ゼ':'ze','ゾ':'zo',
  'タ':'ta','チ':'chi','ツ':'tsu','テ':'te','ト':'to',
  'ダ':'da','ヂ':'ji','ヅ':'zu','デ':'de','ド':'do',
  'ナ':'na','ニ':'ni','ヌ':'nu','ネ':'ne','ノ':'no',
  'ハ':'ha','ヒ':'hi','フ':'fu','ヘ':'he','ホ':'ho',
  'バ':'ba','ビ':'bi','ブ':'bu','ベ':'be','ボ':'bo',
  'パ':'pa','ピ':'pi','プ':'pu','ペ':'pe','ポ':'po',
  'マ':'ma','ミ':'mi','ム':'mu','メ':'me','モ':'mo',
  'ヤ':'ya','ユ':'yu','ヨ':'yo',
  'ラ':'ra','リ':'ri','ル':'ru','レ':'re','ロ':'ro',
  'ワ':'wa','ヰ':'wi','ヱ':'we','ヲ':'wo','ン':'n',
  'ヴ':'vu',
};
const KATA_SMALL_Y = { 'ャ':'ya','ュ':'yu','ョ':'yo' };

function katakanaToRomaji(k) {
  if (!k) return '';
  const chars = Array.from(k);
  let out = '';
  for (let i = 0; i < chars.length; i++) {
    const c  = chars[i];
    const nx = chars[i + 1];
    // Small tsu → double next consonant
    if (c === 'ッ') {
      if (nx && KATA_ROMAJI[nx]) {
        const r = KATA_ROMAJI[nx];
        out += r[0] === 'c' ? 't' : r[0];   // "chi" doubles to "tchi"
      }
      continue;
    }
    // Long vowel dash → extend previous vowel
    if (c === 'ー') {
      const last = out.slice(-1);
      if (/[aeiou]/.test(last)) out += last;
      continue;
    }
    // Digraph: C + small y = CyX mutation (kya/sha/cho/…)
    if (nx && KATA_SMALL_Y[nx] && KATA_ROMAJI[c] && KATA_ROMAJI[c].endsWith('i')) {
      const base = KATA_ROMAJI[c];
      const stem = base.slice(0, -1);           // "ki" → "k", "shi" → "sh", "chi" → "ch"
      const y = KATA_SMALL_Y[nx];               // "ya"
      // Special cases: shi+ya → sha (drop y), chi+ya → cha, ji+ya → ja
      if (stem === 'sh' || stem === 'ch' || stem === 'j') out += stem + y[1];
      else out += stem + 'y' + y[1];
      i++;  // consume small y
      continue;
    }
    if (KATA_ROMAJI[c]) { out += KATA_ROMAJI[c]; continue; }
    if (KATA_SMALL_Y[c]) { out += KATA_SMALL_Y[c]; continue; }
    // Hiragana fallback — convert to katakana then map
    const code = c.codePointAt(0);
    if (code >= 0x3041 && code <= 0x3096) {
      const kata = String.fromCodePoint(code + 0x60);
      if (KATA_ROMAJI[kata]) { out += KATA_ROMAJI[kata]; continue; }
    }
    out += c;
  }
  return out;
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  clipTotalJPChars = parseInt(localStorage.getItem('studyBuddyClipJPTotal') || '0', 10);
  updateClipStats();
});

// ===== JAPANESE CHARACTER HELPERS =====

// Counts only meaningful Japanese characters (kanji, hiragana, katakana, CJK)
// Skips ASCII, punctuation, whitespace, and JP punctuation like 「」、。
function countJPChars(str) {
  let count = 0;
  for (const ch of str) {
    const code = ch.codePointAt(0);
    if (
      (code >= 0x3040 && code <= 0x309F) ||  // Hiragana
      (code >= 0x30A0 && code <= 0x30FF) ||  // Katakana
      (code >= 0x4E00 && code <= 0x9FFF) ||  // CJK Unified Ideographs (common kanji)
      (code >= 0x3400 && code <= 0x4DBF) ||  // CJK Extension A
      (code >= 0xF900 && code <= 0xFAFF) ||  // CJK Compatibility Ideographs
      (code >= 0x20000 && code <= 0x2A6DF)   // CJK Extension B (rare kanji)
    ) {
      count++;
    }
  }
  return count;
}

// Counts all characters minus whitespace (for a "raw" count)
function countReadableChars(str) {
  return [...str].filter(ch => !/\s/.test(ch)).length;
}

// ===== STATS =====
function updateClipStats() {
  const jpTotal = document.getElementById('clip-jp-total');
  const jpSession = document.getElementById('clip-jp-session');
  const lineCount = document.getElementById('clip-line-count');
  const charCount = document.getElementById('clip-char-count');

  if (jpTotal) jpTotal.textContent = clipTotalJPChars.toLocaleString();
  if (jpSession) jpSession.textContent = clipSessionJPChars.toLocaleString();
  if (lineCount) lineCount.textContent = clipSessionLines.length.toLocaleString();
  if (charCount) charCount.textContent = clipTotalJPChars.toLocaleString();

  // Persist lifetime total
  try {
    localStorage.setItem('studyBuddyClipJPTotal', clipTotalJPChars.toString());
  } catch (e) { console.error('Clip stats save failed:', e); }
}

// ===== CORE PASTE LOGIC =====
function processClipboardText(text) {
  if (!text || !text.trim()) return false;

  const trimmed = text.trim();

  // Dedup: skip if identical to last captured text
  if (trimmed === clipLastText) return false;
  clipLastText = trimmed;

  // Split multi-line pastes into individual lines (text hookers sometimes batch)
  const rawLines = trimmed.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);
  let newLinesAdded = 0;

  rawLines.forEach(line => {
    // Skip exact duplicate lines already in session
    if (clipSessionLines.length > 0 && clipSessionLines[clipSessionLines.length - 1] === line) return;

    const jpCount = countJPChars(line);
    clipSessionLines.push(line);
    clipSessionJPChars += jpCount;
    clipTotalJPChars += jpCount;
    newLinesAdded++;
  });

  if (newLinesAdded === 0) return false;

  // Render to display
  renderClipboardDisplay();
  updateClipStats();
  return true;
}

function renderClipboardDisplay() {
  const displayArea = document.getElementById('clipboard-area');
  if (displayArea) {
    // Show newest lines at bottom (chat-style)
    displayArea.value = clipSessionLines.join('\n');
    // Auto-scroll to bottom (newest)
    displayArea.scrollTop = displayArea.scrollHeight;
  }

  // Also render into Fudoki view if active
  if (fudokiEnabled) renderFudokiView();
}

// ===== MANUAL PASTE =====
async function autoPaste() {
  try {
    const text = await navigator.clipboard.readText();

    if (!text || !text.trim()) {
      alert('Clipboard is empty!');
      return;
    }

    const added = processClipboardText(text);
    if (!added) {
      // Flash the button to indicate duplicate
      const btn = document.querySelector('.huge-btn');
      if (btn) {
        btn.textContent = '⚡ DUPLICATE — SKIPPED';
        setTimeout(() => { btn.textContent = '📋 AUTO-PASTE'; }, 1200);
      }
    }
  } catch (err) {
    console.error('Clipboard read failed:', err);
    alert('Unable to paste! Grant Clipboard permissions and use HTTPS/localhost.');
  }
}

// ===== AUTO-POLL (watches clipboard on interval) =====
function toggleAutoPoll() {
  clipPollingActive = !clipPollingActive;
  const btn = document.getElementById('clip-poll-btn');

  if (clipPollingActive) {
    if (btn) {
      btn.textContent = '⏸ STOP AUTO-CAPTURE';
      btn.classList.add('polling-active');
    }
    pollClipboard(); // immediate first poll
    clipPollTimer = setInterval(pollClipboard, 500); // poll every 500ms
  } else {
    if (btn) {
      btn.textContent = '▶ START AUTO-CAPTURE';
      btn.classList.remove('polling-active');
    }
    clearInterval(clipPollTimer);
    clipPollTimer = null;
  }
}

async function pollClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    processClipboardText(text);
  } catch (e) {
    // Silently fail during polling — permission issues will show on manual paste
  }
}

// ===== CLEAR SESSION =====
function clearClipSession() {
  if (!confirm('Clear this session\'s lines? (Lifetime JP count is kept)')) return;
  clipSessionLines = [];
  clipSessionJPChars = 0;
  clipLastText = '';
  const displayArea = document.getElementById('clipboard-area');
  if (displayArea) displayArea.value = '';
  updateClipStats();
}

// ===== RESET LIFETIME TOTAL =====
function resetClipLifetime() {
  if (!confirm('Reset your ALL-TIME Japanese character count to 0?')) return;
  clipTotalJPChars = 0;
  clipSessionJPChars = 0;
  updateClipStats();
}

// ===== EXPORT SESSION LOG =====
function exportClipLog() {
  if (clipSessionLines.length === 0) return alert('Nothing to export!');
  const header = `// VN Text Log — ${new Date().toLocaleDateString()} — ${clipSessionJPChars} JP chars\n\n`;
  const blob = new Blob([header + clipSessionLines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vn-log-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ===== EXIT =====
function exitClipboardMode() {
  // Stop polling if active
  if (clipPollingActive) toggleAutoPoll();
  const homeBtn = document.querySelector('[data-tab="home"]');
  if (homeBtn) homeBtn.click();
}

// ===== FUDOKI MODE ==========================================================
// Real Kuromoji POS tagger, fully off the main thread (Web Worker), with a
// stacked Fudoki-style render: katakana reading + romaji + surface + POS
// abbreviation + colored underline. Inspired by https://github.com/iamcheyan/fudoki

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---- WORKER --------------------------------------------------------------
// We build the worker as an inline Blob so no extra files need to ship to
// GitHub Pages. The worker itself imports kuromoji.js from jsDelivr, then
// loads dictionary files from the same CDN. All on a separate thread, so
// the UI never freezes.
const FUDOKI_WORKER_SRC = `
  let tokenizer = null;
  let buildPromise = null;
  const KUROMOJI_SRC  = 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/build/kuromoji.js';
  const DICT_PATH     = 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/';

  function ready(){
    if (tokenizer) return Promise.resolve();
    if (buildPromise) return buildPromise;
    buildPromise = new Promise((resolve, reject) => {
      try {
        importScripts(KUROMOJI_SRC);
      } catch (e) { reject(e); return; }
      postMessage({type:'progress', msg:'kuromoji.js loaded · downloading dictionary…'});
      kuromoji.builder({ dicPath: DICT_PATH }).build((err, t) => {
        if (err) { reject(err); return; }
        tokenizer = t;
        postMessage({type:'ready'});
        resolve();
      });
    });
    return buildPromise;
  }

  self.onmessage = async (ev) => {
    const msg = ev.data || {};
    if (msg.type === 'init') {
      try { await ready(); }
      catch (err) { postMessage({type:'error', msg: err && err.message || 'load failed'}); }
      return;
    }
    if (msg.type === 'tokenize') {
      try {
        await ready();
        const tokens = tokenizer.tokenize(String(msg.text || ''));
        // Strip down so we don't transfer fields we don't need
        const slim = tokens.map(t => ({
          surface_form: t.surface_form,
          pos: t.pos,
          pos_detail_1: t.pos_detail_1,
          basic_form: t.basic_form,
          reading: t.reading,
          pronunciation: t.pronunciation,
        }));
        postMessage({type:'tokens', seq: msg.seq, tokens: slim});
      } catch (err) {
        postMessage({type:'tokens-error', seq: msg.seq, msg: err && err.message || 'tokenize failed'});
      }
    }
  };
`;

function ensureFudokiWorker() {
  if (fudokiWorker) return fudokiWorker;
  const blob = new Blob([FUDOKI_WORKER_SRC], { type: 'application/javascript' });
  const url  = URL.createObjectURL(blob);
  fudokiWorker = new Worker(url);
  fudokiWorker.onmessage = (ev) => {
    const m = ev.data || {};
    if (m.type === 'progress') {
      fudokiLoadMsg = m.msg || '';
      if (!fudokiReady) renderFudokiLoadingState();
    } else if (m.type === 'ready') {
      fudokiReady = true;
      const btn = document.getElementById('clip-fudoki-btn');
      if (btn) { btn.textContent = '📖 FUDOKI ON · click to exit'; btn.disabled = false; }
      renderFudokiView();   // process all current lines
    } else if (m.type === 'error') {
      fudokiReady = false;
      const view = document.getElementById('clipboard-fudoki-view');
      if (view) view.innerHTML = '<span style="color:#ff7a7a;">Failed to load Kuromoji: ' + escapeHtml(m.msg) + '</span>';
      const btn = document.getElementById('clip-fudoki-btn');
      if (btn) { btn.textContent = '📚 FUDOKI MODE (retry)'; btn.disabled = false; }
    } else if (m.type === 'tokens') {
      const p = fudokiPending.get(m.seq);
      if (p) { fudokiPending.delete(m.seq); p.resolve(m.tokens); }
    } else if (m.type === 'tokens-error') {
      const p = fudokiPending.get(m.seq);
      if (p) { fudokiPending.delete(m.seq); p.reject(new Error(m.msg)); }
    }
  };
  return fudokiWorker;
}

function fudokiTokenize(text) {
  return new Promise((resolve, reject) => {
    const seq = ++fudokiSeq;
    fudokiPending.set(seq, { resolve, reject });
    ensureFudokiWorker().postMessage({ type: 'tokenize', seq, text });
  });
}

// ---- RENDER ---------------------------------------------------------------
function renderFudokiLoadingState() {
  const view = document.getElementById('clipboard-fudoki-view');
  if (!view) return;
  view.innerHTML =
    '<div style="text-align:center; padding:24px; color:rgba(255,255,255,0.7); font-family:\'Noto Sans JP\',sans-serif;">' +
    '<div style="font-size:1.4rem; margin-bottom:8px;">📚 風土記モード起動中…</div>' +
    '<div style="font-size:0.85rem; opacity:0.75; margin-bottom:14px;">' + escapeHtml(fudokiLoadMsg || 'loading kuromoji.js …') + '</div>' +
    '<div class="fudoki-spinner"></div>' +
    '<div style="font-size:0.7rem; margin-top:14px; opacity:0.55;">First time only — ~5MB dictionary is cached for next time.</div>' +
    '</div>';
}

// ---- MERGE (ported from iamcheyan/fudoki mergeTokensForDisplay) -----------
// Fudoki post-processes kuromoji's raw output so that verb-conjugation
// particles (て, で, た) don't appear as standalone tokens — e.g. "して" and
// "いって" stay as a single 動詞 token instead of split "し+て" / "いっ+て".
// Also merges digit-runs with 年 / 月 / 日 so "2026年" is one token.
function mergeTokensForDisplay(tokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) return tokens || [];

  // --- Step 1: digit + 年/月/日 ---
  const isDigitRun = (s) => /^[0-9０-９]+$/.test(s || '');
  const withYMD = [];
  for (let i = 0; i < tokens.length; i++) {
    const cur = tokens[i];
    const next = tokens[i + 1];
    const curSurf = cur.surface_form || '';
    if (next && isDigitRun(curSurf)) {
      const ns = next.surface_form || '';
      if (ns === '年' || ns === '月' || ns === '日') {
        const readingMap = { '年': 'ネン', '月': 'ガツ', '日': 'ニチ' };
        const merged = {
          surface_form: curSurf + ns,
          pos: '名詞',
          pos_detail_1: cur.pos_detail_1 || '',
          basic_form: (cur.basic_form && cur.basic_form !== '*' ? cur.basic_form : curSurf) + ns,
          reading: (cur.reading && cur.reading !== '*' ? cur.reading : curSurf) + (readingMap[ns] || ns),
          pronunciation: (cur.pronunciation || curSurf) + (readingMap[ns] || ns),
        };
        withYMD.push(merged);
        i++;
        continue;
      }
    }
    withYMD.push(cur);
  }

  // --- Step 2: verb/adj + て/で (助詞) or た (助動詞) ---
  // Uses a while loop so merged tokens can chain-merge (e.g. 行っ+て → 行って,
  // then 行って + しまっ won't chain because しまっ is 動詞 not 助詞/助動詞,
  // but 行って + ください etc. stay separate as intended by Fudoki).
  const out = [];
  let i = 0;
  while (i < withYMD.length) {
    const cur = withYMD[i];
    const next = withYMD[i + 1];
    if (next) {
      const curPos  = cur.pos  || '';
      const nextPos = next.pos || '';
      const nextSurf = next.surface_form || '';
      const isVerbOrAdj = (curPos === '動詞' || curPos === '形容詞');
      const ruleTeDe = isVerbOrAdj && nextPos === '助詞'   && (nextSurf === 'て' || nextSurf === 'で');
      const ruleTa   = isVerbOrAdj && nextPos === '助動詞' &&  nextSurf === 'た';
      if (ruleTeDe || ruleTa) {
        const curSurf = cur.surface_form || '';
        const curRead = (cur.reading && cur.reading !== '*') ? cur.reading : curSurf;
        const nextRead = (next.reading && next.reading !== '*') ? next.reading : nextSurf;
        const merged = {
          surface_form: curSurf + nextSurf,
          pos: '動詞',
          pos_detail_1: cur.pos_detail_1 || '',
          basic_form: (cur.basic_form && cur.basic_form !== '*') ? cur.basic_form : curSurf,
          reading: curRead + nextRead,
          pronunciation: (cur.pronunciation || curRead) + (next.pronunciation || nextRead),
        };
        withYMD[i + 1] = merged;   // overwrite next, re-examine on the following iter
        i += 1;                    // advance to the merged slot → becomes next cur
        continue;
      }
    }
    out.push(cur);
    i += 1;
  }
  return out;
}

// Build one stacked-token block (Fudoki-style)
function renderFudokiToken(tok) {
  const surface = tok.surface_form || '';
  const pos     = tok.pos || 'その他';
  const color   = FUDOKI_POS_COLORS[pos] || '#ddd';
  const abbrev  = FUDOKI_POS_ABBREV[pos] || pos;
  const reading = (tok.reading && tok.reading !== '*') ? tok.reading : '';
  const romaji  = reading ? katakanaToRomaji(reading).toLowerCase() : '';
  const base    = (tok.basic_form && tok.basic_form !== '*') ? tok.basic_form : surface;
  const tooltip = pos + (reading ? '\u3000' + reading : '') + (base !== surface ? '\u3000(' + base + ')' : '');

  // Symbols / spaces don't deserve the full stack
  if (pos === '記号' || /^\s+$/.test(surface)) {
    return '<span class="fudoki-tok fudoki-symbol" style="color:' + color + ';">' + escapeHtml(surface) + '</span>';
  }

  return (
    '<span class="fudoki-tok" title="' + escapeHtml(tooltip) + '" data-pos="' + escapeHtml(pos) + '">' +
      '<span class="fudoki-kata"  >' + escapeHtml(reading) + '</span>' +
      '<span class="fudoki-romaji">' + escapeHtml(romaji)  + '</span>' +
      '<span class="fudoki-surface" style="color:' + color + ';">' + escapeHtml(surface) + '</span>' +
      '<span class="fudoki-pos"   style="color:' + color + ';">'  + escapeHtml(abbrev)   + '</span>' +
      '<span class="fudoki-bar"   style="background:' + color + ';"></span>' +
    '</span>'
  );
}

async function renderFudokiView() {
  const view = document.getElementById('clipboard-fudoki-view');
  if (!view) return;
  if (!fudokiReady) { renderFudokiLoadingState(); return; }
  if (clipSessionLines.length === 0) {
    view.innerHTML = '<span style="color:rgba(255,255,255,0.4);font-style:italic;">何もなし · nothing captured yet</span>';
    return;
  }

  // Tokenize each line (cached)
  const lineHtml = await Promise.all(clipSessionLines.map(async (line) => {
    let tokens = fudokiTokenCache.get(line);
    if (!tokens) {
      try { tokens = await fudokiTokenize(line); fudokiTokenCache.set(line, tokens); }
      catch (e) { tokens = null; }
    }
    if (!tokens || tokens.length === 0) {
      return '<div class="fudoki-line">' + escapeHtml(line) + '</div>';
    }
    // Merge verb-conjugation particles (て/で/た) and digit+年/月/日
    // into single display tokens — matches iamcheyan/fudoki's tokenization.
    const merged = mergeTokensForDisplay(tokens);
    const inner = merged.map(renderFudokiToken).join('');
    return '<div class="fudoki-line">' + inner + '</div>';
  }));

  view.innerHTML = lineHtml.join('');
  view.scrollTop = view.scrollHeight;
}

function toggleFudokiMode() {
  const btn      = document.getElementById('clip-fudoki-btn');
  const legend   = document.getElementById('clip-fudoki-legend');
  const textarea = document.getElementById('clipboard-area');
  const view     = document.getElementById('clipboard-fudoki-view');
  if (!btn || !textarea || !view) return;

  fudokiEnabled = !fudokiEnabled;

  if (fudokiEnabled) {
    textarea.style.display = 'none';
    view.style.display = 'block';
    if (legend) legend.style.display = 'flex';
    if (!fudokiReady) {
      btn.textContent = '⏳ LOADING…';
      btn.disabled = true;
      fudokiLoadMsg = 'spawning worker · loading kuromoji.js…';
      renderFudokiLoadingState();
      ensureFudokiWorker().postMessage({ type: 'init' });
    } else {
      btn.textContent = '📖 FUDOKI ON · click to exit';
      renderFudokiView();
    }
  } else {
    textarea.style.display = '';
    view.style.display = 'none';
    if (legend) legend.style.display = 'none';
    btn.textContent = '📚 FUDOKI MODE';
    btn.disabled = false;
  }
}
