// clipboard.js — Visual Novel Text Hooker Companion

// ===== STATE =====
let clipSessionLines = [];        // All unique lines this session
let clipTotalJPChars = 0;         // Running JP character total (persistent)
let clipSessionJPChars = 0;       // JP chars this session only
let clipPollingActive = false;    // Auto-poll toggle
let clipPollTimer = null;
let clipLastText = '';            // Dedup: last captured string

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
  if (!displayArea) return;

  // Show newest lines at top
  const reversed = [...clipSessionLines].reverse();
  displayArea.value = reversed.join('\n');

  // Auto-scroll to top (newest)
  displayArea.scrollTop = 0;
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
