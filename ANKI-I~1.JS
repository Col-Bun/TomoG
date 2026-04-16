// ===================================================================
// ANKI DECK IMPORTER for TomoG
// -------------------------------------------------------------------
// Supports two formats:
//   1. .apkg  — Anki deck package (zipped SQLite). Auto-reads field names.
//   2. Text   — Plain-text / TSV export ("Notes in Plain Text" in Anki)
//
// All libraries (JSZip, sql.js) are lazy-loaded from cdnjs on first use,
// so the main page stays light until the user actually clicks Import.
// ===================================================================

(function(){
  'use strict';

  // ---------- Lazy loaders ----------
  let _jszipPromise = null;
  let _sqljsPromise = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  function loadJSZip() {
    if (_jszipPromise) return _jszipPromise;
    _jszipPromise = (async () => {
      if (window.JSZip) return window.JSZip;
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
      return window.JSZip;
    })();
    return _jszipPromise;
  }

  function loadSqlJs() {
    if (_sqljsPromise) return _sqljsPromise;
    _sqljsPromise = (async () => {
      if (!window.initSqlJs) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js');
      }
      return await window.initSqlJs({
        locateFile: f => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/' + f
      });
    })();
    return _sqljsPromise;
  }

  // ---------- Text sanitizers ----------
  function stripHtml(raw) {
    if (raw == null) return '';
    let s = String(raw);
    // Strip Anki sound/image refs
    s = s.replace(/\[sound:[^\]]+\]/gi, '');
    s = s.replace(/<img[^>]*>/gi, '');
    // Strip cloze deletions → keep answer text only
    s = s.replace(/\{\{c\d+::([^:}]*?)(::[^}]*)?\}\}/g, '$1');
    // Strip other {{...}} fields
    s = s.replace(/\{\{[^}]*\}\}/g, '');
    // Strip HTML tags
    s = s.replace(/<[^>]+>/g, ' ');
    // Decode common entities
    s = s.replace(/&nbsp;/g, ' ')
         .replace(/&amp;/g, '&')
         .replace(/&lt;/g, '<')
         .replace(/&gt;/g, '>')
         .replace(/&quot;/g, '"')
         .replace(/&#39;/g, "'");
    // Collapse whitespace
    s = s.replace(/\s+/g, ' ').trim();
    return s;
  }

  // Ruby / furigana: "食[た]べる" → "食べる" (keep base, drop bracketed reading)
  // If you'd rather keep the reading, swap the replace arg to "$1[$2]".
  function stripFurigana(s) {
    return String(s || '').replace(/ ?([一-龠々〆ヵヶ])\[([^\]]+)\]/g, '$1');
  }

  function cleanField(raw) {
    return stripFurigana(stripHtml(raw));
  }

  // ---------- Heuristic: detect language of a field ----------
  // Returns 'jp', 'en', 'es', or 'unknown'
  function detectLang(s) {
    if (!s) return 'unknown';
    const text = String(s);
    // Japanese: any hiragana / katakana / CJK
    if (/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/.test(text)) return 'jp';
    // Spanish vs English heuristic: presence of ñ, accented vowels, or ¿¡
    if (/[ñáéíóúü¿¡]/i.test(text)) return 'es';
    // Spanish very-common words
    if (/\b(el|la|los|las|de|que|y|un|una|por|para|con|es|está|tengo|eres|soy)\b/i.test(text)) {
      // also check for typical English words; pick whichever is more common
      const esHits = (text.match(/\b(el|la|los|las|de|que|y|un|una|por|para|con|es|está)\b/gi) || []).length;
      const enHits = (text.match(/\b(the|and|is|are|was|were|you|that|have|with|this|for)\b/gi) || []).length;
      return esHits > enHits ? 'es' : 'en';
    }
    // Default: assume English / Latin
    return /[A-Za-z]/.test(text) ? 'en' : 'unknown';
  }

  // Guess best mapping given field sample values
  function guessMapping(fieldNames, sampleRows) {
    const guess = { en: -1, jp: -1, es: -1, tags: -1 };
    const colLangs = fieldNames.map((_, i) => {
      const samples = sampleRows.slice(0, 10).map(r => r.fields[i] || '');
      const tally = { jp:0, en:0, es:0, unknown:0 };
      for (const s of samples) tally[detectLang(cleanField(s))]++;
      let best = 'unknown', bestCount = 0;
      for (const k of ['jp','en','es','unknown']) {
        if (tally[k] > bestCount) { best = k; bestCount = tally[k]; }
      }
      return best;
    });
    // Also consider field names
    fieldNames.forEach((name, i) => {
      const n = String(name || '').toLowerCase();
      if (/tag/.test(n)) guess.tags = i;
      else if (/(japan|jp|kanji|reading|expression|front)/.test(n) && guess.jp < 0) guess.jp = i;
      else if (/(english|en|meaning|translation|back|definition)/.test(n) && guess.en < 0) guess.en = i;
      else if (/(spanish|es|español|espanol)/.test(n) && guess.es < 0) guess.es = i;
    });
    // Fill in from lang detection
    colLangs.forEach((lang, i) => {
      if (lang === 'jp' && guess.jp < 0) guess.jp = i;
      else if (lang === 'en' && guess.en < 0) guess.en = i;
      else if (lang === 'es' && guess.es < 0) guess.es = i;
    });
    // Fallback: fill remaining slots with unassigned columns
    // (two "Latin-letter" columns will both look like 'en' but second one is
    // probably ES — a common pattern in bilingual decks)
    const assigned = new Set([guess.en, guess.jp, guess.es, guess.tags].filter(x => x >= 0));
    const order = ['jp', 'en', 'es', 'tags'];
    for (const key of order) {
      if (guess[key] >= 0) continue;
      for (let i = 0; i < fieldNames.length; i++) {
        if (!assigned.has(i)) {
          // Skip empty columns
          const hasData = sampleRows.some(r => r.fields[i] && r.fields[i].trim());
          if (!hasData) continue;
          guess[key] = i;
          assigned.add(i);
          break;
        }
      }
    }
    return guess;
  }

  // ---------- .apkg parser ----------
  async function parseApkg(file) {
    const JSZip = await loadJSZip();
    const SQL = await loadSqlJs();

    const zip = await JSZip.loadAsync(file);
    // Anki writes collection.anki21 (newer) and/or collection.anki2 (legacy).
    // Some .apkg ship collection.anki21b (compressed) — fallback gracefully.
    const dbEntry = zip.file('collection.anki21')
                 || zip.file('collection.anki2')
                 || zip.file('collection.anki21b');
    if (!dbEntry) throw new Error('No collection.anki2(1) found inside .apkg — is this a valid deck?');

    let bytes = await dbEntry.async('uint8array');
    // anki21b is zstd-compressed; we can't handle that client-side without another lib
    if (dbEntry.name.endsWith('b')) {
      throw new Error('This .apkg uses the new compressed format (anki21b). In Anki, File → Export → choose "Anki 2.1 compatible" and re-export.');
    }

    const db = new SQL.Database(bytes);
    let modelMap = {};
    try {
      const colRes = db.exec('SELECT models FROM col');
      if (colRes[0] && colRes[0].values[0]) {
        modelMap = JSON.parse(colRes[0].values[0][0]);
      }
    } catch (e) { /* ignore — notes query below will still work with generic field names */ }

    const noteRes = db.exec('SELECT id, mid, flds, tags FROM notes');
    const notes = [];
    let canonicalFieldNames = null;
    if (noteRes[0]) {
      for (const row of noteRes[0].values) {
        const [id, mid, flds, tagsStr] = row;
        const fields = String(flds).split('\x1f');
        const model = modelMap[String(mid)] || modelMap[mid];
        let fieldNames;
        if (model && Array.isArray(model.flds)) {
          fieldNames = model.flds.map(f => f.name || 'Field');
        } else {
          fieldNames = fields.map((_, i) => 'Field ' + (i + 1));
        }
        // Use the FIRST model's field names as the canonical header
        if (!canonicalFieldNames) canonicalFieldNames = fieldNames.slice();
        // Pad row to canonical length
        while (fields.length < canonicalFieldNames.length) fields.push('');
        const tags = String(tagsStr || '').trim().split(/\s+/).filter(Boolean);
        notes.push({ fields, tags });
      }
    }
    db.close();
    return {
      fieldNames: canonicalFieldNames || ['Field 1'],
      notes
    };
  }

  // ---------- Text / TSV parser ----------
  function parseText(text) {
    // Split into lines; drop Anki comment lines (# ...)
    const lines = text.split(/\r?\n/).filter(l => l.length > 0 && !l.startsWith('#'));
    if (lines.length === 0) return { fieldNames: [], notes: [] };
    // Detect delimiter: tab wins if any tabs present; else comma; else semicolon
    const delim = lines[0].includes('\t') ? '\t'
                : lines[0].includes('|')  ? '|'
                : lines[0].includes(';')  ? ';'
                : lines[0].includes(',')  ? ','
                : '\t';

    const rows = lines.map(l => l.split(delim));
    const maxCols = Math.max(...rows.map(r => r.length));
    const fieldNames = Array.from({length: maxCols}, (_, i) => 'Column ' + (i + 1));
    const notes = rows.map(r => {
      const fields = r.slice();
      while (fields.length < maxCols) fields.push('');
      // Anki text exports sometimes put tags in the LAST column. We don't assume that.
      return { fields, tags: [] };
    });
    return { fieldNames, notes };
  }

  // ---------- Modal UI ----------
  let _currentNotes = null;
  let _currentFieldNames = null;
  let _currentMapping = null;

  function ensureStyles() {
    if (document.getElementById('anki-import-styles')) return;
    const css = `
      .anki-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
      .anki-modal { background: linear-gradient(145deg, #1e1e2e, #2a2a3e); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; width: 100%; max-width: 640px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5); color: #e9ebf0; }
      .anki-modal h3 { font-family: 'Baloo 2', cursive; padding: 16px 20px 0; margin: 0; color: #a8e84c; font-size: 1.2rem; display: flex; justify-content: space-between; align-items: center; }
      .anki-modal h3 .anki-close { background: rgba(255,255,255,0.08); border: none; color: #fff; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 1rem; line-height: 1; }
      .anki-modal h3 .anki-close:hover { background: rgba(255,90,90,0.35); }
      .anki-body { padding: 16px 20px 20px; }
      .anki-tabrow { display: flex; gap: 6px; margin-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px; }
      .anki-tabbtn { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.65); border: none; padding: 8px 14px; border-radius: 8px 8px 0 0; cursor: pointer; font-size: 0.85rem; }
      .anki-tabbtn.active { background: rgba(168,232,76,0.2); color: #a8e84c; }
      .anki-panel { display: none; }
      .anki-panel.active { display: block; }
      .anki-drop { border: 2px dashed rgba(255,255,255,0.15); border-radius: 12px; padding: 28px 16px; text-align: center; color: rgba(255,255,255,0.6); cursor: pointer; transition: all 0.2s; }
      .anki-drop:hover, .anki-drop.dragover { border-color: #a8e84c; background: rgba(168,232,76,0.05); color: #a8e84c; }
      .anki-drop input[type=file] { display: none; }
      .anki-textarea { width: 100%; min-height: 160px; padding: 10px; border-radius: 10px; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); color: #e9ebf0; font-family: monospace; font-size: 0.82rem; resize: vertical; }
      .anki-btn { background: #a8e84c; color: #111; border: none; padding: 9px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; margin-top: 10px; font-size: 0.88rem; }
      .anki-btn:hover { background: #b9f06a; }
      .anki-btn.secondary { background: rgba(255,255,255,0.08); color: #fff; }
      .anki-btn.secondary:hover { background: rgba(255,255,255,0.15); }
      .anki-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .anki-status { margin: 10px 0; font-size: 0.85rem; color: rgba(255,255,255,0.7); }
      .anki-status.err { color: #ff7e7e; }
      .anki-mapper { display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px 12px; align-items: center; margin: 8px 0; }
      .anki-mapper label { font-size: 0.82rem; color: rgba(255,255,255,0.75); }
      .anki-mapper select { width: 100%; padding: 6px 8px; border-radius: 8px; background: rgba(0,0,0,0.3); color: #fff; border: 1px solid rgba(255,255,255,0.12); font-size: 0.82rem; }
      .anki-mapper .arrow { color: rgba(168,232,76,0.7); font-weight: 700; }
      .anki-preview { margin-top: 12px; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 8px; max-height: 220px; overflow-y: auto; background: rgba(0,0,0,0.18); font-size: 0.78rem; }
      .anki-preview table { width: 100%; border-collapse: collapse; }
      .anki-preview th, .anki-preview td { padding: 4px 8px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top; }
      .anki-preview th { color: rgba(168,232,76,0.8); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; }
      .anki-preview td { color: rgba(255,255,255,0.8); }
      .anki-preview td.dim { color: rgba(255,255,255,0.35); font-style: italic; }
      .anki-summary { background: rgba(168,232,76,0.08); border: 1px solid rgba(168,232,76,0.25); border-radius: 10px; padding: 10px 14px; margin: 10px 0; font-size: 0.85rem; color: #cdf28a; }
      .anki-row { display: flex; gap: 8px; align-items: center; margin: 8px 0; flex-wrap: wrap; }
      .anki-row label { font-size: 0.82rem; color: rgba(255,255,255,0.7); min-width: 80px; }
      .anki-row input[type=text], .anki-row select { padding: 6px 8px; border-radius: 8px; background: rgba(0,0,0,0.25); color: #fff; border: 1px solid rgba(255,255,255,0.1); font-size: 0.82rem; flex: 1; }
      .anki-dict-import-btn { background: linear-gradient(135deg, #5865f2, #7289da); color: white; border: none; padding: 8px 14px; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 0.82rem; white-space: nowrap; }
      .anki-dict-import-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(88,101,242,0.4); }
    `;
    const tag = document.createElement('style');
    tag.id = 'anki-import-styles';
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  function closeModal() {
    const bg = document.getElementById('anki-modal-bg');
    if (bg) bg.remove();
    _currentNotes = null;
    _currentFieldNames = null;
    _currentMapping = null;
  }

  function openModal() {
    ensureStyles();
    closeModal();
    const bg = document.createElement('div');
    bg.id = 'anki-modal-bg';
    bg.className = 'anki-modal-bg';
    bg.innerHTML = `
      <div class="anki-modal" onclick="event.stopPropagation()">
        <h3>📦 Anki Deck Import <button class="anki-close" onclick="AnkiImport.close()">×</button></h3>
        <div class="anki-body">
          <div class="anki-tabrow">
            <button class="anki-tabbtn active" data-panel="panel-apkg" onclick="AnkiImport.switchTab('panel-apkg', this)">.apkg File</button>
            <button class="anki-tabbtn" data-panel="panel-text" onclick="AnkiImport.switchTab('panel-text', this)">Plain Text / TSV</button>
          </div>

          <div id="panel-apkg" class="anki-panel active">
            <p style="font-size:0.82rem;color:rgba(255,255,255,0.65);margin:0 0 10px;">
              Drop your Anki deck (<code>.apkg</code>) below. Field names will be auto-detected.
              <br><b>Note:</b> Use Anki's "Support older Anki versions" export option if the import fails.
            </p>
            <label class="anki-drop" id="anki-drop-apkg">
              <input type="file" accept=".apkg,.zip" id="anki-file-apkg">
              <div>📁 Click or drop a <b>.apkg</b> file here</div>
              <div style="font-size:0.72rem;margin-top:6px;opacity:0.6;">parsed locally — nothing leaves your browser</div>
            </label>
            <div id="anki-status-apkg" class="anki-status"></div>
          </div>

          <div id="panel-text" class="anki-panel">
            <p style="font-size:0.82rem;color:rgba(255,255,255,0.65);margin:0 0 10px;">
              Paste an Anki plain-text export (tab-separated) or click "📁 Load .txt". In Anki: <b>File → Export → Notes in Plain Text</b>.
            </p>
            <textarea class="anki-textarea" id="anki-text-input" placeholder="例: 食べる&#9;to eat&#9;comer&#10;水&#9;water&#9;agua"></textarea>
            <div class="anki-row">
              <button class="anki-btn secondary" onclick="document.getElementById('anki-file-text').click()">📁 Load .txt / .csv</button>
              <input type="file" accept=".txt,.csv,.tsv" id="anki-file-text" style="display:none;">
              <button class="anki-btn" onclick="AnkiImport.parseTextBox()">▶ Parse</button>
            </div>
            <div id="anki-status-text" class="anki-status"></div>
          </div>

          <div id="anki-mapper-section" style="display:none;"></div>
        </div>
      </div>
    `;
    bg.addEventListener('click', (e) => { if (e.target === bg) closeModal(); });
    document.body.appendChild(bg);

    // Wire up apkg file input
    const apkgInput = document.getElementById('anki-file-apkg');
    const apkgDrop  = document.getElementById('anki-drop-apkg');
    apkgInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) await handleApkg(file);
    });
    apkgDrop.addEventListener('dragover', (e) => { e.preventDefault(); apkgDrop.classList.add('dragover'); });
    apkgDrop.addEventListener('dragleave', () => apkgDrop.classList.remove('dragover'));
    apkgDrop.addEventListener('drop', async (e) => {
      e.preventDefault();
      apkgDrop.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) await handleApkg(file);
    });

    // Wire up text file input
    document.getElementById('anki-file-text').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      document.getElementById('anki-text-input').value = text;
      handleText(text);
    });
  }

  async function handleApkg(file) {
    const status = document.getElementById('anki-status-apkg');
    status.textContent = '⏳ Loading parser libraries + reading deck...';
    status.classList.remove('err');
    try {
      const result = await parseApkg(file);
      status.textContent = `✅ Parsed ${result.notes.length.toLocaleString()} notes from ${file.name}`;
      showMapper(result.fieldNames, result.notes);
    } catch (e) {
      status.textContent = '❌ ' + e.message;
      status.classList.add('err');
      console.error(e);
    }
  }

  function handleText(text) {
    const status = document.getElementById('anki-status-text');
    status.classList.remove('err');
    try {
      const result = parseText(text);
      if (result.notes.length === 0) {
        status.textContent = '❌ No rows detected.';
        status.classList.add('err');
        return;
      }
      status.textContent = `✅ Parsed ${result.notes.length.toLocaleString()} rows.`;
      showMapper(result.fieldNames, result.notes);
    } catch (e) {
      status.textContent = '❌ ' + e.message;
      status.classList.add('err');
    }
  }

  function parseTextBox() {
    const txt = document.getElementById('anki-text-input').value;
    if (!txt.trim()) {
      const status = document.getElementById('anki-status-text');
      status.textContent = '❌ Textarea is empty.';
      status.classList.add('err');
      return;
    }
    handleText(txt);
  }

  function switchTab(panelId, btn) {
    document.querySelectorAll('.anki-tabbtn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.anki-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(panelId).classList.add('active');
  }

  // ---------- Field-mapper UI ----------
  function showMapper(fieldNames, notes) {
    _currentFieldNames = fieldNames;
    _currentNotes = notes;
    _currentMapping = guessMapping(fieldNames, notes);

    const section = document.getElementById('anki-mapper-section');
    section.style.display = 'block';

    const mkOptions = (selected) => {
      let out = '<option value="-1">— skip —</option>';
      fieldNames.forEach((name, i) => {
        const sel = (i === selected) ? ' selected' : '';
        out += `<option value="${i}"${sel}>${i+1}. ${escapeHtml(name)}</option>`;
      });
      return out;
    };

    section.innerHTML = `
      <hr style="border-color:rgba(255,255,255,0.08);margin:16px 0;">
      <h4 style="margin:0 0 10px;color:#a8e84c;font-size:0.95rem;">🎯 Map Anki fields → TomoG</h4>
      <p style="font-size:0.78rem;color:rgba(255,255,255,0.55);margin:0 0 10px;">
        Best guess below. Tweak if needed — columns marked "skip" won't be imported.
      </p>
      <div class="anki-mapper">
        <label>🇬🇧 English</label><span class="arrow">←</span>
        <select id="map-en" onchange="AnkiImport.updateMapping()">${mkOptions(_currentMapping.en)}</select>

        <label>🇯🇵 Japanese</label><span class="arrow">←</span>
        <select id="map-jp" onchange="AnkiImport.updateMapping()">${mkOptions(_currentMapping.jp)}</select>

        <label>🇪🇸 Spanish</label><span class="arrow">←</span>
        <select id="map-es" onchange="AnkiImport.updateMapping()">${mkOptions(_currentMapping.es)}</select>

        <label>🏷️ Tags column</label><span class="arrow">←</span>
        <select id="map-tags" onchange="AnkiImport.updateMapping()">${mkOptions(_currentMapping.tags)}</select>
      </div>

      <div class="anki-row">
        <label>Word type:</label>
        <select id="map-type">
          <option value="noun">🌸 noun</option>
          <option value="verb">⚡ verb</option>
          <option value="adj">🎨 adjective</option>
          <option value="adv">💨 adverb</option>
          <option value="phrase">💬 phrase</option>
          <option value="other" selected>❓ mixed / other</option>
        </select>
      </div>
      <div class="anki-row">
        <label>Extra tag:</label>
        <input type="text" id="map-extra-tag" placeholder="e.g. core6k, n5, kana — applied to all imports" maxlength="40">
      </div>

      <div class="anki-preview" id="anki-preview"></div>
      <div class="anki-summary" id="anki-summary"></div>

      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px;">
        <button class="anki-btn secondary" onclick="AnkiImport.close()">Cancel</button>
        <button class="anki-btn" id="anki-commit-btn" onclick="AnkiImport.commit()">✨ Import to Dictionary</button>
      </div>
    `;

    renderPreview();
  }

  function updateMapping() {
    if (!_currentMapping) return;
    _currentMapping.en   = parseInt(document.getElementById('map-en').value, 10);
    _currentMapping.jp   = parseInt(document.getElementById('map-jp').value, 10);
    _currentMapping.es   = parseInt(document.getElementById('map-es').value, 10);
    _currentMapping.tags = parseInt(document.getElementById('map-tags').value, 10);
    renderPreview();
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function renderPreview() {
    const preview = document.getElementById('anki-preview');
    const summary = document.getElementById('anki-summary');
    const m = _currentMapping;
    const notes = _currentNotes || [];
    // Count importable
    let importable = 0;
    for (const n of notes) {
      const en = m.en >= 0 ? cleanField(n.fields[m.en]) : '';
      const jp = m.jp >= 0 ? cleanField(n.fields[m.jp]) : '';
      const es = m.es >= 0 ? cleanField(n.fields[m.es]) : '';
      if (en || jp || es) importable++;
    }

    const rows = notes.slice(0, 5).map(n => {
      const en = m.en >= 0 ? cleanField(n.fields[m.en]) : '';
      const jp = m.jp >= 0 ? cleanField(n.fields[m.jp]) : '';
      const es = m.es >= 0 ? cleanField(n.fields[m.es]) : '';
      const extraTags = m.tags >= 0 ? String(n.fields[m.tags] || '').split(/[\s,;]+/).filter(Boolean) : [];
      const tags = [...n.tags, ...extraTags].join(' ');
      return `<tr>
        <td>${en ? escapeHtml(en) : '<span class="dim">—</span>'}</td>
        <td>${jp ? escapeHtml(jp) : '<span class="dim">—</span>'}</td>
        <td>${es ? escapeHtml(es) : '<span class="dim">—</span>'}</td>
        <td>${escapeHtml(tags) || '<span class="dim">—</span>'}</td>
      </tr>`;
    }).join('');

    preview.innerHTML = `
      <table>
        <thead><tr><th>EN</th><th>JP</th><th>ES</th><th>Tags</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${notes.length > 5 ? `<div style="padding:6px 8px;font-size:0.72rem;color:rgba(255,255,255,0.4);">…and ${(notes.length-5).toLocaleString()} more</div>` : ''}
    `;
    summary.textContent = `📊 ${importable.toLocaleString()} of ${notes.length.toLocaleString()} rows will be imported (non-empty).`;
    document.getElementById('anki-commit-btn').disabled = importable === 0;
  }

  function commit() {
    const m = _currentMapping;
    const notes = _currentNotes || [];
    const typeEl = document.getElementById('map-type');
    const extraTagEl = document.getElementById('map-extra-tag');
    const type = typeEl ? typeEl.value : 'other';
    const extraTag = extraTagEl ? extraTagEl.value.trim().toLowerCase() : '';

    // Defensive: the global ensureDictShape & data objects come from script.js
    if (typeof ensureDictShape === 'function') ensureDictShape();
    if (!window.data || !Array.isArray(window.data.dictionary)) {
      alert('Dictionary data not ready — reload and try again.');
      return;
    }

    let added = 0, skipped = 0;
    const today = (typeof todayStr === 'function') ? todayStr() : new Date().toISOString().slice(0,10);

    for (const n of notes) {
      const en = m.en >= 0 ? cleanField(n.fields[m.en]) : '';
      const jp = m.jp >= 0 ? cleanField(n.fields[m.jp]) : '';
      const es = m.es >= 0 ? cleanField(n.fields[m.es]) : '';
      if (!en && !jp && !es) { skipped++; continue; }

      const tagsFromColumn = m.tags >= 0
        ? String(n.fields[m.tags] || '').split(/[\s,;]+/).map(t => t.trim().toLowerCase()).filter(Boolean)
        : [];
      const rawTags = [...n.tags, ...tagsFromColumn, ...(extraTag ? [extraTag] : [])]
        .map(t => t.toLowerCase().replace(/[^a-z0-9_-]/g, '').trim())
        .filter(Boolean);
      // Dedup
      const tags = Array.from(new Set(rawTags)).slice(0, 12);

      window.data.dictionary.push({
        en: en || '—',
        jp: jp || '—',
        es: es || '—',
        addedDate: today,
        type: type,
        tags: tags,
        uses: 0,
        correct: 0
      });
      added++;
    }

    if (typeof saveData === 'function') saveData();
    if (typeof renderDictionary === 'function') renderDictionary();
    if (typeof updateStats === 'function') updateStats();
    if (typeof updateLevelDisplay === 'function') updateLevelDisplay();

    const summary = document.getElementById('anki-summary');
    summary.innerHTML = `🎉 Imported <b>${added.toLocaleString()}</b> words! (${skipped.toLocaleString()} skipped as empty)<br>
      <span style="font-size:0.78rem;opacity:0.8;">Dictionary tab will refresh automatically.</span>`;
    document.getElementById('anki-commit-btn').disabled = true;
    document.getElementById('anki-commit-btn').textContent = '✅ Done';
    // Auto-close after a beat
    setTimeout(() => closeModal(), 2200);
  }

  // ---------- Expose & attach button ----------
  window.AnkiImport = {
    open: openModal,
    close: closeModal,
    switchTab: switchTab,
    parseTextBox: parseTextBox,
    updateMapping: updateMapping,
    commit: commit
  };

  function attachButton() {
    // Look for the dictionary header and pin the import button there
    const header = document.querySelector('#tab-dictionary .dict-header');
    if (!header || document.getElementById('anki-import-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'anki-import-btn';
    btn.className = 'anki-dict-import-btn';
    btn.textContent = '📦 Import Anki';
    btn.onclick = () => openModal();
    btn.style.marginLeft = 'auto';
    btn.title = 'Import an Anki .apkg deck or plain-text export';
    // Header is flex; ensure our button sits at the far right
    header.style.alignItems = 'center';
    header.style.gap = '10px';
    header.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachButton);
  } else {
    attachButton();
  }
})();
