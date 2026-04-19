// clipboard.js — Visual Novel Text Hooker Companion

// ===== STATE =====
let clipSessionLines = [];        // All unique lines this session
let clipTotalJPChars = 0;         // Running JP character total (persistent)
let clipSessionJPChars = 0;       // JP chars this session only
let clipPollingActive = false;    // Auto-poll toggle
let clipPollTimer = null;
let clipLastText = '';            // Dedup: last captured string

// ===== FUDOKI MODE (Kuromoji-powered POS tagging) =====
let fudokiEnabled = false;
let fudokiTokenizer = null;       // Kuromoji tokenizer (async-built)
let fudokiLoading = false;
let fudokiLoadPromise = null;
const FUDOKI_KUROMOJI_SRC = 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/build/kuromoji.min.js';
const FUDOKI_DICT_PATH    = 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/';

// Part-of-speech → color palette
const FUDOKI_POS_COLORS = {
  '名詞':   '#ff8fa3',   // noun — pink
  '動詞':   '#8ddbff',   // verb — cyan
  '形容詞': '#c6f27a',   // i-adj — green
  '形容動詞':'#a0f0b5',  // na-adj — minty green
  '副詞':   '#ffd36a',   // adverb — gold
  '助詞':   '#c49bff',   // particle — lavender
  '助動詞': '#a0a0a0',   // aux verb — grey
  '連体詞': '#7ee6c6',   // adnominal — teal
  '代名詞': '#ff6eaa',   // pronoun — hot pink
  '接続詞': '#ffa060',   // conjunction — orange
  '感動詞': '#ffb3ee',   // interjection — pink
  '接頭詞': '#bfd9ff',   // prefix — pale blue
  '記号':   '#6a6a6a',   // symbol — dim
  'フィラー': '#888',    // filler — grey
  'その他': '#bbb',      // other — near-white
};

function fudokiPickColor(pos) {
  if (!pos) return '#ddd';
  return FUDOKI_POS_COLORS[pos] || '#ddd';
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
// Loads kuromoji.js on first toggle and renders every line with colored tokens
// labeled by part of speech. Inspired by https://github.com/iamcheyan/fudoki

function loadFudokiScript() {
  if (window.kuromoji) return Promise.resolve();
  if (fudokiLoadPromise) return fudokiLoadPromise;
  fudokiLoadPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = FUDOKI_KUROMOJI_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load kuromoji.js'));
    document.head.appendChild(s);
  });
  return fudokiLoadPromise;
}

function buildFudokiTokenizer() {
  if (fudokiTokenizer) return Promise.resolve(fudokiTokenizer);
  return new Promise((resolve, reject) => {
    if (!window.kuromoji) {
      reject(new Error('kuromoji global missing'));
      return;
    }
    window.kuromoji
      .builder({ dicPath: FUDOKI_DICT_PATH })
      .build((err, tokenizer) => {
        if (err) { reject(err); return; }
        fudokiTokenizer = tokenizer;
        resolve(tokenizer);
      });
  });
}

async function ensureFudokiReady() {
  if (fudokiTokenizer) return fudokiTokenizer;
  if (fudokiLoading) {
    // Wait for in-flight load
    await new Promise(r => {
      const poll = () => fudokiTokenizer ? r() : setTimeout(poll, 150);
      poll();
    });
    return fudokiTokenizer;
  }
  fudokiLoading = true;
  try {
    await loadFudokiScript();
    await buildFudokiTokenizer();
  } finally {
    fudokiLoading = false;
  }
  return fudokiTokenizer;
}

function renderFudokiView() {
  const view = document.getElementById('clipboard-fudoki-view');
  if (!view) return;
  if (!fudokiTokenizer) {
    view.innerHTML = '<span style="color:rgba(255,255,255,0.5);font-style:italic;">…辞書読み込み中 · loading dictionary …</span>';
    return;
  }
  if (clipSessionLines.length === 0) {
    view.innerHTML = '<span style="color:rgba(255,255,255,0.4);font-style:italic;">何もなし · nothing captured yet</span>';
    return;
  }

  const fragments = clipSessionLines.map(line => {
    let tokens;
    try { tokens = fudokiTokenizer.tokenize(line); }
    catch (_) { tokens = null; }
    if (!tokens || tokens.length === 0) {
      return '<div class="fudoki-line">' + escapeHtml(line) + '</div>';
    }
    const inner = tokens.map(tok => {
      const surface = escapeHtml(tok.surface_form);
      const pos = tok.pos || 'その他';
      const color = fudokiPickColor(pos);
      const reading = tok.reading && tok.reading !== '*' ? tok.reading : '';
      const base = tok.basic_form && tok.basic_form !== '*' ? tok.basic_form : tok.surface_form;
      const title = pos + (reading ? '　' + reading : '') + (base !== tok.surface_form ? '　(' + base + ')' : '');
      // Skip decoration for symbols / whitespace
      if (pos === '記号' || /^\s+$/.test(tok.surface_form)) {
        return '<span style="color:' + color + ';">' + surface + '</span>';
      }
      return '<ruby class="fudoki-tok" style="color:' + color + ';border-bottom:2px solid ' + color + '44;padding:0 1px;margin:0 1px;border-radius:3px;" title="' + escapeHtml(title) + '">' +
             surface +
             (reading && /[\u4E00-\u9FFF]/.test(tok.surface_form) ? '<rt style="color:rgba(255,255,255,0.45);font-size:0.55em;">' + escapeHtml(reading) + '</rt>' : '') +
             '</ruby>';
    }).join('');
    return '<div class="fudoki-line" style="margin-bottom:6px;">' + inner + '</div>';
  });

  view.innerHTML = fragments.join('');
  view.scrollTop = view.scrollHeight;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function toggleFudokiMode() {
  const btn      = document.getElementById('clip-fudoki-btn');
  const legend   = document.getElementById('clip-fudoki-legend');
  const textarea = document.getElementById('clipboard-area');
  const view     = document.getElementById('clipboard-fudoki-view');
  if (!btn || !textarea || !view) return;

  fudokiEnabled = !fudokiEnabled;

  if (fudokiEnabled) {
    btn.textContent = '⏳ LOADING DICT…';
    btn.disabled = true;
    textarea.style.display = 'none';
    view.style.display = 'block';
    if (legend) legend.style.display = 'block';
    view.innerHTML = '<span style="color:rgba(255,255,255,0.6);font-style:italic;">📚 Fudoki tokenizer 起動中… (≈3–5MB dict download, first time only)</span>';

    try {
      await ensureFudokiReady();
      btn.textContent = '📖 FUDOKI ON · click to exit';
      btn.disabled = false;
      renderFudokiView();
    } catch (err) {
      console.error('Fudoki load failed:', err);
      view.innerHTML = '<span style="color:#ff7a7a;">Failed to load Kuromoji dictionary. Check network / CDN access.</span>';
      btn.textContent = '📚 FUDOKI MODE (retry)';
      btn.disabled = false;
      fudokiEnabled = false;
      textarea.style.display = '';
      view.style.display = 'none';
      if (legend) legend.style.display = 'none';
    }
  } else {
    btn.textContent = '📚 FUDOKI MODE';
    btn.disabled = false;
    textarea.style.display = '';
    view.style.display = 'none';
    if (legend) legend.style.display = 'none';
  }
}
