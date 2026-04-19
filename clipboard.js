// clipboard.js — Visual Novel Text Hooker Companion

// ===== STATE =====
let clipSessionLines = [];        // All unique lines this session
let clipTotalJPChars = 0;         // Running JP character total (persistent)
let clipSessionJPChars = 0;       // JP chars this session only
let clipPollingActive = false;    // Auto-poll toggle
let clipPollTimer = null;
let clipLastText = '';            // Dedup: last captured string

// ===== FUDOKI MODE (lightweight script-class highlighter) =====
// Previously used kuromoji.js — its 5MB dictionary download would freeze the
// page. Fudoki (the site that inspired this) just colors tokens by script
// class, so we do the same: purely local, zero network, instant.
let fudokiEnabled = false;

// Unicode script class → color palette
// Each glyph is grouped by its Unicode range and colored accordingly.
const FUDOKI_CLASS_COLORS = {
  kanji:      '#ffd36a',  // 漢字 · gold
  hiragana:   '#ff8fa3',  // ひらがな · soft pink
  katakana:   '#8ddbff',  // カタカナ · cyan
  halfkana:   '#8ddbff',  // half-width katakana
  bopomofo:   '#8ddbff',
  latin:      '#c6f27a',  // A–Z a–z · green
  digit:      '#c49bff',  // 0–9 · lavender
  punct:      '#808080',  // ，。、「」 etc · grey
  space:      'transparent',
  other:      '#bbbbbb',
};

const FUDOKI_CLASS_LABELS = {
  kanji: '漢字', hiragana: 'ひらがな', katakana: 'カタカナ',
  halfkana: '半角カナ', latin: 'ローマ字', digit: '数字',
  punct: '記号', space: '空白', other: 'その他',
};

// Classify a single character by Unicode code point.
function fudokiClassOf(ch) {
  if (!ch) return 'other';
  const code = ch.codePointAt(0);
  if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\u3000') return 'space';
  // Kanji (CJK Unified + extensions + compat)
  if ((code >= 0x4E00 && code <= 0x9FFF) ||
      (code >= 0x3400 && code <= 0x4DBF) ||
      (code >= 0xF900 && code <= 0xFAFF) ||
      (code >= 0x20000 && code <= 0x2A6DF)) return 'kanji';
  if (code >= 0x3040 && code <= 0x309F) return 'hiragana';
  if (code >= 0x30A0 && code <= 0x30FF) return 'katakana';
  if (code >= 0xFF66 && code <= 0xFF9F) return 'halfkana'; // half-width katakana
  // Latin letters (basic + full-width)
  if ((code >= 0x0041 && code <= 0x005A) ||
      (code >= 0x0061 && code <= 0x007A) ||
      (code >= 0xFF21 && code <= 0xFF3A) ||
      (code >= 0xFF41 && code <= 0xFF5A)) return 'latin';
  // Digits (basic + full-width)
  if ((code >= 0x0030 && code <= 0x0039) ||
      (code >= 0xFF10 && code <= 0xFF19)) return 'digit';
  // Japanese punctuation + CJK symbols + general punctuation + ASCII punct
  if ((code >= 0x3000 && code <= 0x303F) ||
      (code >= 0xFF00 && code <= 0xFF0F) ||
      (code >= 0xFF1A && code <= 0xFF20) ||
      (code >= 0xFF3B && code <= 0xFF40) ||
      (code >= 0xFF5B && code <= 0xFF65) ||
      (code >= 0x2000 && code <= 0x206F) ||
      (code >= 0x0021 && code <= 0x002F) ||
      (code >= 0x003A && code <= 0x0040) ||
      (code >= 0x005B && code <= 0x0060) ||
      (code >= 0x007B && code <= 0x007E)) return 'punct';
  return 'other';
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
// Lightweight, dictionary-free script-class highlighter (no network).
// Each character is colored by its Unicode script class — kanji, hiragana,
// katakana, romaji, digits, punctuation. Inspired by https://github.com/iamcheyan/fudoki
// (we skip the full POS tokenizer to avoid the ~5MB dictionary download.)

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Splits a line into runs of consecutive same-class characters,
// then wraps each run in a colored span. Cheap, instant, no dictionary.
function fudokiHighlightLine(line) {
  if (!line) return '';
  let out = '';
  let runClass = null;
  let runStart = 0;
  const flush = (endExclusive) => {
    if (runClass === null || endExclusive <= runStart) return;
    const text = line.slice(runStart, endExclusive);
    const color = FUDOKI_CLASS_COLORS[runClass] || '#ddd';
    const label = FUDOKI_CLASS_LABELS[runClass] || runClass;
    if (runClass === 'space') {
      out += escapeHtml(text);
    } else {
      out += '<span class="fudoki-tok fudoki-' + runClass +
             '" style="color:' + color +
             ';border-bottom:2px solid ' + color + '55;" title="' + label + '">' +
             escapeHtml(text) + '</span>';
    }
  };
  // Iterate by code-point so surrogate pairs (rare kanji) aren't split.
  const chars = Array.from(line);
  let cursor = 0;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const cls = fudokiClassOf(ch);
    if (cls !== runClass) {
      flush(cursor);
      runClass = cls;
      runStart = cursor;
    }
    cursor += ch.length;
  }
  flush(cursor);
  return out;
}

function renderFudokiView() {
  const view = document.getElementById('clipboard-fudoki-view');
  if (!view) return;
  if (clipSessionLines.length === 0) {
    view.innerHTML = '<span style="color:rgba(255,255,255,0.4);font-style:italic;">何もなし · nothing captured yet</span>';
    return;
  }
  const fragments = clipSessionLines.map(line =>
    '<div class="fudoki-line">' + fudokiHighlightLine(line) + '</div>'
  );
  view.innerHTML = fragments.join('');
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
    if (legend) legend.style.display = 'block';
    btn.textContent = '📖 FUDOKI ON · click to exit';
    renderFudokiView();
  } else {
    textarea.style.display = '';
    view.style.display = 'none';
    if (legend) legend.style.display = 'none';
    btn.textContent = '📚 FUDOKI MODE';
  }
}
