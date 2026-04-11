// commissions.js — Art Commission Tracker for Moe-Chan

// ===== INITIALIZATION =====
// Wait for the main app to load first, then render these cards
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(renderCommissions, 100); // Small delay to ensure script.js finishes loading
});

// ===== UTILITIES (Renamed to avoid colliding with script.js) =====
function commEscHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.innerText = str;
  return div.innerHTML;
}

function commFormatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// ===== CONSTANTS =====
const COMM_STAGES = [
  { key: 'early_sketch', label: 'Early Sketch',  short: 'E.Sk' },
  { key: 'sketch',       label: 'Sketch Phase',  short: 'Sktch' },
  { key: 'lineart',      label: 'Lineart',       short: 'Line' },
  { key: 'color',        label: 'Color',         short: 'Color' },
  { key: 'shade',        label: 'Shade',         short: 'Shade' },
  { key: 'shade_fx',     label: 'Shade+Effects', short: 'Sh+FX' }
];

const COMM_FINAL_STAGE = {
  sketch:    1,
  colored:   3,
  grayscale: 4,
  shaded:    5
};

const COMM_TYPE_LABELS = {
  sketch:    '✏️ Sketch',
  colored:   '🎨 Colored',
  grayscale: '🩶 Grayscale',
  shaded:    '✨ Full Shaded'
};

// ===== FILTER STATE =====
let commFilterMode = 'active';

function setCommFilter(mode) {
  commFilterMode = mode;
  document.querySelectorAll('.comm-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === mode);
  });
  renderCommissions();
}

// ===== SAVE / ADD / EDIT =====
function saveCommission() {
  // 1. Check if global data exists yet
  if (typeof data === 'undefined' || !data) {
    alert('Error: System data not loaded yet. Please wait a moment or reload.');
    return;
  }

  const editId = document.getElementById('comm-edit-id').value;
  const client = document.getElementById('comm-client').value.trim();
  if (!client) return alert('Enter the client name!');

  const entry = {
    id:              editId ? parseInt(editId) : Date.now(),
    client:          client,
    socials: {
      twitter:       document.getElementById('comm-twitter').value.trim(),
      bluesky:       document.getElementById('comm-bluesky').value.trim(),
      furaffinity:   document.getElementById('comm-fa').value.trim()
    },
    characters:      Math.max(1, parseInt(document.getElementById('comm-chars').value) || 1),
    type:            document.getElementById('comm-type').value,
    hasColoredLineart: document.getElementById('comm-lineart').checked,
    hasBackground:   document.getElementById('comm-bg').checked,
    price:           parseFloat(document.getElementById('comm-price').value) || 0,
    timeSpent:       parseFloat(document.getElementById('comm-time').value) || 0,
    dateAccepted:    document.getElementById('comm-date-accepted').value || '',
    datePayment:     document.getElementById('comm-date-payment').value || '',
    stage:           0,
    finished:        false
  };

  if (!data.commissions || !Array.isArray(data.commissions)) {
    data.commissions = [];
  }

  if (editId) {
    const idx = data.commissions.findIndex(c => c.id === parseInt(editId));
    if (idx !== -1) {
      entry.stage = data.commissions[idx].stage;
      entry.finished = data.commissions[idx].finished;
      data.commissions[idx] = entry;
    }
  } else {
    data.commissions.push(entry);
  }

  // 2. Call the master save function from script.js
  if (typeof saveData === 'function') {
    saveData(); 
  } else {
    alert('Error: Could not find the master save function!');
    return;
  }
  
  clearCommForm();
  renderCommissions();
}

function clearCommForm() {
  document.getElementById('comm-edit-id').value = '';
  document.getElementById('comm-client').value = '';
  document.getElementById('comm-twitter').value = '';
  document.getElementById('comm-bluesky').value = '';
  document.getElementById('comm-fa').value = '';
  document.getElementById('comm-chars').value = '1';
  document.getElementById('comm-type').value = 'sketch';
  document.getElementById('comm-lineart').checked = false;
  document.getElementById('comm-bg').checked = false;
  document.getElementById('comm-price').value = '';
  document.getElementById('comm-time').value = '';
  document.getElementById('comm-date-accepted').value = '';
  document.getElementById('comm-date-payment').value = '';
  document.getElementById('comm-form-title').textContent = 'New Commission';
  document.getElementById('comm-cancel-btn').style.display = 'none';
}

function cancelCommEdit() {
  clearCommForm();
}

function editCommission(id) {
  if (typeof data === 'undefined' || !data || !data.commissions) return;
  const c = data.commissions.find(x => x.id === id);
  if (!c) return;

  document.getElementById('comm-edit-id').value = c.id;
  document.getElementById('comm-client').value = c.client;
  document.getElementById('comm-twitter').value = c.socials?.twitter || '';
  document.getElementById('comm-bluesky').value = c.socials?.bluesky || '';
  document.getElementById('comm-fa').value = c.socials?.furaffinity || '';
  document.getElementById('comm-chars').value = c.characters;
  document.getElementById('comm-type').value = c.type;
  document.getElementById('comm-lineart').checked = c.hasColoredLineart || false;
  document.getElementById('comm-bg').checked = c.hasBackground || false;
  document.getElementById('comm-price').value = c.price || '';
  document.getElementById('comm-time').value = c.timeSpent || '';
  document.getElementById('comm-date-accepted').value = c.dateAccepted || '';
  document.getElementById('comm-date-payment').value = c.datePayment || '';

  document.getElementById('comm-form-title').textContent = 'Edit: ' + c.client;
  document.getElementById('comm-cancel-btn').style.display = 'inline-block';

  document.getElementById('comm-form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== STAGE ADVANCEMENT =====
function advanceStage(id) {
  if (typeof data === 'undefined' || !data || !data.commissions) return;
  const c = data.commissions.find(x => x.id === id);
  if (!c || c.finished) return;

  const finalStage = COMM_FINAL_STAGE[c.type] || 5;
  if (c.stage < finalStage) {
    c.stage++;
    if (c.stage >= finalStage) {
      c.finished = true;
    }
    if (typeof saveData === 'function') saveData();
    renderCommissions();
  }
}

function revertStage(id) {
  if (typeof data === 'undefined' || !data || !data.commissions) return;
  const c = data.commissions.find(x => x.id === id);
  if (!c) return;
  if (c.stage > 0) {
    c.stage--;
    c.finished = false;
    if (typeof saveData === 'function') saveData();
    renderCommissions();
  }
}

function toggleFinished(id) {
  if (typeof data === 'undefined' || !data || !data.commissions) return;
  const c = data.commissions.find(x => x.id === id);
  if (!c) return;
  c.finished = !c.finished;
  if (c.finished) {
    c.stage = COMM_FINAL_STAGE[c.type] || 5;
  }
  if (typeof saveData === 'function') saveData();
  renderCommissions();
}

function deleteCommission(id) {
  if (typeof data === 'undefined' || !data || !data.commissions) return;
  if (!confirm('Delete this commission permanently?')) return;
  data.commissions = data.commissions.filter(c => c.id !== id);
  if (typeof saveData === 'function') saveData();
  renderCommissions();
}

function quickUpdateTime(id) {
  if (typeof data === 'undefined' || !data || !data.commissions) return;
  const c = data.commissions.find(x => x.id === id);
  if (!c) return;
  const val = prompt('Update hours spent:', c.timeSpent || 0);
  if (val === null) return;
  c.timeSpent = parseFloat(val) || 0;
  if (typeof saveData === 'function') saveData();
  renderCommissions();
}

// ===== RENDER =====
function renderCommissions() {
  // Safety checks to prevent crashes
  if (typeof data === 'undefined' || !data) return;
  if (!data.commissions || !Array.isArray(data.commissions)) {
    data.commissions = [];
  }

  const list = document.getElementById('comm-card-list');
  if (!list) return;
  list.innerHTML = '';

  let filtered = data.commissions;
  if (commFilterMode === 'active') filtered = filtered.filter(c => !c.finished);
  else if (commFilterMode === 'done') filtered = filtered.filter(c => c.finished);

  const activeCount = data.commissions.filter(c => !c.finished).length;
  const doneComms = data.commissions.filter(c => c.finished);
  const totalEarned = doneComms.reduce((s, c) => s + (c.price || 0), 0);
  const totalHours = data.commissions.reduce((s, c) => s + (c.timeSpent || 0), 0);

  const elActive = document.getElementById('comm-stat-active');
  const elEarned = document.getElementById('comm-stat-earned');
  const elHours = document.getElementById('comm-stat-hours');
  const elCount = document.getElementById('comm-active-count');
  if (elActive) elActive.textContent = activeCount;
  if (elEarned) elEarned.textContent = '$' + totalEarned.toFixed(0);
  if (elHours) elHours.textContent = totalHours.toFixed(1) + 'h';
  if (elCount) elCount.textContent = '(' + activeCount + ')';

  if (filtered.length === 0) {
    list.innerHTML = `<p style="color:rgba(255,255,255,0.4); text-align:center; padding:30px; font-style:italic;">
      ${commFilterMode === 'done' ? 'No completed commissions yet.' : commFilterMode === 'active' ? 'No active commissions — nice, you\'re all caught up!' : 'No commissions yet. Add one!'}
    </p>`;
    return;
  }

  filtered.sort((a, b) => {
    if (a.finished !== b.finished) return a.finished ? 1 : -1;
    return (b.dateAccepted || '').localeCompare(a.dateAccepted || '');
  });

  filtered.forEach(c => {
    const card = document.createElement('div');
    card.className = 'comm-card' + (c.finished ? ' is-finished' : '');

    const finalStage = COMM_FINAL_STAGE[c.type] || 5;

    let socialsHtml = '';
    const soc = c.socials || {};
    if (soc.twitter) socialsHtml += `<span class="comm-social-link">🐦 ${commEscHtml(soc.twitter)}</span>`;
    if (soc.bluesky) socialsHtml += `<span class="comm-social-link">🦋 ${commEscHtml(soc.bluesky)}</span>`;
    if (soc.furaffinity) socialsHtml += `<span class="comm-social-link">🐾 ${commEscHtml(soc.furaffinity)}</span>`;

    let extrasHtml = '';
    if (c.characters > 1) extrasHtml += `<span class="comm-extra-tag">👥 ${c.characters} chars</span>`;
    if (c.hasColoredLineart) extrasHtml += `<span class="comm-extra-tag">🖊 Colored Lineart</span>`;
    if (c.hasBackground) extrasHtml += `<span class="comm-extra-tag">🏞 Background</span>`;

    let metaHtml = '';
    if (c.dateAccepted) metaHtml += `<span>📥 Accepted: ${commFormatDate(c.dateAccepted)}</span>`;
    if (c.datePayment) metaHtml += `<span>💰 Paid: ${commFormatDate(c.datePayment)}</span>`;
    if (!c.datePayment) metaHtml += `<span style="color:#ff6b6b;">⚠ Unpaid</span>`;

    let pipelineHtml = '<div class="comm-pipeline"><div class="comm-pipeline-track"><div class="comm-pipeline-fill" style="width:' + (finalStage > 0 ? ((c.stage / finalStage) * 100) : 0) + '%"></div></div>';
    COMM_STAGES.forEach((stg, idx) => {
      const pastFinal = idx > finalStage;
      const isReached = idx <= c.stage && !pastFinal;
      const isCurrent = idx === c.stage && !pastFinal;
      const isFinal = idx === finalStage;

      let dotClass = 'comm-stage-dot';
      if (pastFinal) dotClass += ' past-final';
      else if (isCurrent) dotClass += ' current';
      else if (isReached) dotClass += ' reached';
      if (isFinal) dotClass += ' is-final';

      let labelClass = 'comm-stage-label';
      if (isCurrent) labelClass += ' active-label';
      if (pastFinal) labelClass += ' past-final';

      pipelineHtml += `<div class="comm-stage">
        <div class="${dotClass}">${idx + 1}</div>
        <div class="${labelClass}">${stg.short}</div>
      </div>`;
    });
    pipelineHtml += '</div>';

    let moneyTimeHtml = '<div class="comm-money-time">';
    if (c.price) moneyTimeHtml += `<span class="comm-money">$${c.price.toFixed(2)}</span>`;
    if (c.timeSpent) {
      moneyTimeHtml += `<span class="comm-time">⏱ ${c.timeSpent}h</span>`;
      if (c.price && c.timeSpent > 0) {
        moneyTimeHtml += `<span class="comm-hourly">(~$${(c.price / c.timeSpent).toFixed(2)}/hr)</span>`;
      }
    }
    moneyTimeHtml += '</div>';

    let actionsHtml = '<div class="comm-card-actions">';
    if (!c.finished && c.stage < finalStage) {
      actionsHtml += `<button class="comm-act-btn advance-btn" onclick="advanceStage(${c.id})">▶ Advance</button>`;
    }
    if (c.stage > 0) {
      actionsHtml += `<button class="comm-act-btn" onclick="revertStage(${c.id})">◀ Revert</button>`;
    }
    if (c.finished) {
      actionsHtml += `<button class="comm-act-btn done-btn">✅ Complete</button>`;
    } else if (c.stage >= finalStage) {
      actionsHtml += `<button class="comm-act-btn finish-btn" onclick="toggleFinished(${c.id})">✅ Mark Done</button>`;
    }
    actionsHtml += `<button class="comm-act-btn" onclick="quickUpdateTime(${c.id})">⏱ Log Time</button>`;
    actionsHtml += `<button class="comm-act-btn" onclick="editCommission(${c.id})">✏️ Edit</button>`;
    actionsHtml += `<button class="comm-act-btn del-btn" onclick="deleteCommission(${c.id})">🗑</button>`;
    if (c.finished) {
      actionsHtml += `<button class="comm-act-btn" onclick="toggleFinished(${c.id})" style="margin-left:auto;">↩ Reopen</button>`;
    }
    actionsHtml += '</div>';

    card.innerHTML = `
      <div class="comm-card-header">
        <div>
          <div class="comm-client-name">${commEscHtml(c.client)}</div>
          ${socialsHtml ? `<div class="comm-socials">${socialsHtml}</div>` : ''}
        </div>
        <span class="comm-type-badge comm-type-${c.type}">${COMM_TYPE_LABELS[c.type] || c.type}</span>
      </div>
      ${extrasHtml ? `<div class="comm-extras-row">${extrasHtml}</div>` : ''}
      <div class="comm-meta-row">${metaHtml}</div>
      ${pipelineHtml}
      ${moneyTimeHtml}
      ${actionsHtml}
    `;

    list.appendChild(card);
  });
}
