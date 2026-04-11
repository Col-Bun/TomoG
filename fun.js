// ===== FUN WITH MOE-CHAN =====
// Interactive play area with tappable Moe-chan and graphics effects

function getFunData() {
  if (!data.fun) {
    data.fun = {
      totalTaps: 0,
      totalHeadpats: 0,
      totalPokes: 0,
      highScore: 0,       // tap speed challenge
      mood: 'happy',
      particles: true,
      bgEffect: 'none',   // none, stars, sakura, rain, snow, matrix, fireflies
      spriteFilter: 'none', // none, pixel, glow, rainbow, invert, sepia, hue-rotate
      spriteSize: 100,     // percent
      bgSpeed: 50,
      particleCount: 30,
      screenShake: false,
      crtEffect: false,
      scanlines: false,
      vignette: false,
    };
    saveData();
  }
  return data.fun;
}

// ===== TAP / INTERACTION SYSTEM =====
let funTapCount = 0;
let funTapTimer = null;
let funComboCount = 0;
let funLastTapTime = 0;
let funParticles = [];
let funBgParticles = [];
let funAnimFrame = null;
let funCanvas = null;
let funCtx = null;

const MOE_REACTIONS = [
  { min: 0, text: 'Hehe~ ♡', emoji: '😊' },
  { min: 5, text: 'That tickles!', emoji: '😆' },
  { min: 10, text: 'Kyaa~!', emoji: '🥰' },
  { min: 20, text: 'S-stop it~!', emoji: '😳' },
  { min: 30, text: 'Waaah!!', emoji: '🤯' },
  { min: 50, text: 'COMBO!!', emoji: '🔥' },
  { min: 75, text: 'ULTRA!!', emoji: '⚡' },
  { min: 100, text: 'LEGENDARY!!', emoji: '🌟' },
];

const BG_EFFECTS = {
  none: { label: 'None', icon: '⬛' },
  stars: { label: 'Starfield', icon: '⭐' },
  sakura: { label: 'Sakura', icon: '🌸' },
  rain: { label: 'Rain', icon: '🌧️' },
  snow: { label: 'Snow', icon: '❄️' },
  matrix: { label: 'Matrix', icon: '💻' },
  fireflies: { label: 'Fireflies', icon: '✨' },
  bubbles: { label: 'Bubbles', icon: '🫧' },
};

const SPRITE_FILTERS = {
  none: { label: 'Normal', css: 'none' },
  pixel: { label: 'Pixel', css: 'contrast(1.4) saturate(1.3)' },
  glow: { label: 'Glow', css: 'brightness(1.3) drop-shadow(0 0 12px rgba(255,200,255,0.8))' },
  rainbow: { label: 'Rainbow', css: 'hue-rotate(VAR_DEGdeg) saturate(1.5)' }, // animated
  invert: { label: 'Inverted', css: 'invert(1) hue-rotate(180deg)' },
  sepia: { label: 'Sepia', css: 'sepia(0.8) brightness(1.1)' },
  hueshift: { label: 'Hue Shift', css: 'hue-rotate(180deg) saturate(1.3)' },
  blur: { label: 'Dreamy', css: 'blur(1.5px) brightness(1.2)' },
};

function tapMoeChan(event) {
  const fd = getFunData();
  fd.totalTaps++;
  funTapCount++;

  const now = Date.now();
  if (now - funLastTapTime < 500) {
    funComboCount++;
  } else {
    funComboCount = 1;
  }
  funLastTapTime = now;

  // Spawn tap particles
  if (fd.particles) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    spawnTapParticles(x, y, funComboCount);
  }

  // Screen shake
  if (fd.screenShake && funComboCount > 10) {
    const el = document.getElementById('fun-moe-area');
    if (el) {
      el.style.animation = 'none';
      el.offsetHeight; // reflow
      el.style.animation = 'fun-shake 0.15s ease';
    }
  }

  // Update reaction
  const reaction = [...MOE_REACTIONS].reverse().find(r => funComboCount >= r.min) || MOE_REACTIONS[0];
  const reactionEl = document.getElementById('fun-reaction');
  if (reactionEl) {
    reactionEl.innerHTML = `<span class="fun-reaction-emoji">${reaction.emoji}</span> ${reaction.text}`;
    reactionEl.classList.remove('fun-reaction-pop');
    reactionEl.offsetHeight;
    reactionEl.classList.add('fun-reaction-pop');
  }

  // Combo display
  const comboEl = document.getElementById('fun-combo');
  if (comboEl) {
    if (funComboCount >= 5) {
      comboEl.textContent = `${funComboCount}x COMBO!`;
      comboEl.style.display = 'block';
      comboEl.style.fontSize = Math.min(1 + funComboCount * 0.05, 3) + 'rem';
    } else {
      comboEl.style.display = 'none';
    }
  }

  // Sprite bounce
  const sprite = document.getElementById('fun-sprite');
  if (sprite) {
    sprite.classList.remove('fun-sprite-bounce');
    sprite.offsetHeight;
    sprite.classList.add('fun-sprite-bounce');
  }

  // Update tap counter
  const tapEl = document.getElementById('fun-tap-counter');
  if (tapEl) tapEl.textContent = fd.totalTaps;

  // High score (taps in 10 seconds)
  if (!funTapTimer) {
    funTapCount = 1;
    funTapTimer = setTimeout(() => {
      if (funTapCount > fd.highScore) {
        fd.highScore = funTapCount;
        const hsEl = document.getElementById('fun-high-score');
        if (hsEl) hsEl.textContent = fd.highScore;
      }
      funTapCount = 0;
      funTapTimer = null;
    }, 10000);
  }

  // MoeBucks for milestones
  if (fd.totalTaps % 100 === 0 && typeof getSlotData === 'function') {
    const sd = getSlotData();
    sd.moeBucks += 5;
    if (typeof updateSlotMoneyDisplay === 'function') updateSlotMoneyDisplay();
    const reactionEl2 = document.getElementById('fun-reaction');
    if (reactionEl2) reactionEl2.innerHTML += ' <span style="color:#ffd700;">+5 MB!</span>';
  }

  saveData();
}

function headpatMoeChan() {
  const fd = getFunData();
  fd.totalHeadpats++;
  const reactionEl = document.getElementById('fun-reaction');
  const expressions = ['Purrrr~ ♡', 'Mmmm~ so nice~', '*happy noises*', 'Ehehe~ more please!', 'Nyaa~ ♡♡♡'];
  if (reactionEl) {
    reactionEl.innerHTML = `<span class="fun-reaction-emoji">🥰</span> ${expressions[fd.totalHeadpats % expressions.length]}`;
    reactionEl.classList.remove('fun-reaction-pop');
    reactionEl.offsetHeight;
    reactionEl.classList.add('fun-reaction-pop');
  }
  const sprite = document.getElementById('fun-sprite');
  if (sprite) {
    sprite.classList.remove('fun-sprite-headpat');
    sprite.offsetHeight;
    sprite.classList.add('fun-sprite-headpat');
  }
  saveData();
  const hpEl = document.getElementById('fun-headpat-counter');
  if (hpEl) hpEl.textContent = fd.totalHeadpats;
}

function pokeMoeChan() {
  const fd = getFunData();
  fd.totalPokes++;
  const reactionEl = document.getElementById('fun-reaction');
  const expressions = ['Hey!', 'Ow!', 'What was that for?!', 'Mou~!', 'Stop poking me!!'];
  if (reactionEl) {
    reactionEl.innerHTML = `<span class="fun-reaction-emoji">😤</span> ${expressions[fd.totalPokes % expressions.length]}`;
    reactionEl.classList.remove('fun-reaction-pop');
    reactionEl.offsetHeight;
    reactionEl.classList.add('fun-reaction-pop');
  }
  const sprite = document.getElementById('fun-sprite');
  if (sprite) {
    sprite.classList.remove('fun-sprite-poke');
    sprite.offsetHeight;
    sprite.classList.add('fun-sprite-poke');
  }
  saveData();
}

// ===== TAP PARTICLES =====
function spawnTapParticles(x, y, combo) {
  const canvas = funCanvas;
  if (!canvas) return;
  const count = Math.min(3 + combo, 15);
  const emojis = ['💖', '✨', '⭐', '💫', '🌟', '♡', '❤️', '💕'];
  for (let i = 0; i < count; i++) {
    funParticles.push({
      x, y,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 6 - 2,
      life: 1.0,
      decay: 0.015 + Math.random() * 0.01,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      size: 12 + Math.random() * 12,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
    });
  }
}

// ===== BG PARTICLE SYSTEM =====
function initBgParticles(effect, count) {
  funBgParticles = [];
  if (effect === 'none') return;
  const canvas = funCanvas;
  if (!canvas) return;
  const w = canvas.width;
  const h = canvas.height;

  for (let i = 0; i < count; i++) {
    const p = { x: Math.random() * w, y: Math.random() * h, life: 1 };

    switch (effect) {
      case 'stars':
        p.size = 1 + Math.random() * 3;
        p.brightness = 0.3 + Math.random() * 0.7;
        p.twinkleSpeed = 0.02 + Math.random() * 0.03;
        p.twinklePhase = Math.random() * Math.PI * 2;
        break;
      case 'sakura':
        p.vy = 0.5 + Math.random() * 1.5;
        p.vx = (Math.random() - 0.5) * 0.5;
        p.rotation = Math.random() * 360;
        p.rotSpeed = (Math.random() - 0.5) * 3;
        p.size = 10 + Math.random() * 10;
        p.wobble = Math.random() * Math.PI * 2;
        break;
      case 'rain':
        p.vy = 6 + Math.random() * 8;
        p.vx = -1 + Math.random() * 0.5;
        p.length = 10 + Math.random() * 15;
        break;
      case 'snow':
        p.vy = 0.3 + Math.random() * 1;
        p.vx = (Math.random() - 0.5) * 0.3;
        p.size = 2 + Math.random() * 4;
        p.wobble = Math.random() * Math.PI * 2;
        break;
      case 'matrix':
        p.vy = 2 + Math.random() * 4;
        p.char = String.fromCharCode(0x30A0 + Math.random() * 96); // katakana
        p.size = 10 + Math.random() * 8;
        p.brightness = 0.3 + Math.random() * 0.7;
        break;
      case 'fireflies':
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = (Math.random() - 0.5) * 0.5;
        p.size = 2 + Math.random() * 4;
        p.glowPhase = Math.random() * Math.PI * 2;
        p.glowSpeed = 0.02 + Math.random() * 0.03;
        break;
      case 'bubbles':
        p.vy = -(0.3 + Math.random() * 1);
        p.vx = (Math.random() - 0.5) * 0.3;
        p.size = 5 + Math.random() * 15;
        p.wobble = Math.random() * Math.PI * 2;
        break;
    }
    funBgParticles.push(p);
  }
}

function updateBgParticles(effect) {
  const canvas = funCanvas;
  if (!canvas) return;
  const w = canvas.width;
  const h = canvas.height;

  funBgParticles.forEach(p => {
    switch (effect) {
      case 'stars':
        p.twinklePhase += p.twinkleSpeed;
        break;
      case 'sakura':
        p.x += p.vx + Math.sin(p.wobble) * 0.3;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.wobble += 0.02;
        if (p.y > h + 20) { p.y = -20; p.x = Math.random() * w; }
        break;
      case 'rain':
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > h) { p.y = -10; p.x = Math.random() * w; }
        break;
      case 'snow':
        p.x += p.vx + Math.sin(p.wobble) * 0.3;
        p.y += p.vy;
        p.wobble += 0.01;
        if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
        break;
      case 'matrix':
        p.y += p.vy;
        if (p.y > h) {
          p.y = -10;
          p.x = Math.random() * w;
          p.char = String.fromCharCode(0x30A0 + Math.random() * 96);
        }
        break;
      case 'fireflies':
        p.x += p.vx + Math.sin(p.glowPhase * 3) * 0.2;
        p.y += p.vy + Math.cos(p.glowPhase * 2) * 0.2;
        p.glowPhase += p.glowSpeed;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        break;
      case 'bubbles':
        p.x += p.vx + Math.sin(p.wobble) * 0.3;
        p.y += p.vy;
        p.wobble += 0.02;
        if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
        break;
    }
  });
}

function drawBgParticles(ctx, effect) {
  funBgParticles.forEach(p => {
    switch (effect) {
      case 'stars': {
        const alpha = p.brightness * (0.5 + 0.5 * Math.sin(p.twinklePhase));
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'sakura': {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.font = p.size + 'px serif';
        ctx.fillText('🌸', -p.size / 2, p.size / 2);
        ctx.restore();
        break;
      }
      case 'rain':
        ctx.strokeStyle = 'rgba(180,210,255,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 2, p.y + p.length);
        ctx.stroke();
        break;
      case 'snow':
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'matrix':
        ctx.fillStyle = `rgba(0,255,65,${p.brightness})`;
        ctx.font = p.size + 'px monospace';
        ctx.fillText(p.char, p.x, p.y);
        break;
      case 'fireflies': {
        const glow = 0.3 + 0.7 * Math.abs(Math.sin(p.glowPhase));
        ctx.fillStyle = `rgba(255,255,100,${glow})`;
        ctx.shadowColor = 'rgba(255,255,100,0.6)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * glow, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      }
      case 'bubbles': {
        ctx.strokeStyle = 'rgba(200,220,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(200,220,255,0.05)';
        ctx.fill();
        break;
      }
    }
  });
}

// ===== MAIN RENDER LOOP =====
let funHueRotation = 0;

function funRenderLoop() {
  if (!funCanvas || !funCtx) { funAnimFrame = requestAnimationFrame(funRenderLoop); return; }
  const ctx = funCtx;
  const w = funCanvas.width;
  const h = funCanvas.height;
  const fd = getFunData();

  ctx.clearRect(0, 0, w, h);

  // BG particles
  if (fd.bgEffect !== 'none') {
    updateBgParticles(fd.bgEffect);
    drawBgParticles(ctx, fd.bgEffect);
  }

  // Tap particles
  funParticles = funParticles.filter(p => p.life > 0);
  funParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15; // gravity
    p.life -= p.decay;
    p.rotation += p.rotSpeed;

    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation * Math.PI / 180);
    ctx.font = p.size + 'px serif';
    ctx.fillText(p.emoji, -p.size / 2, p.size / 2);
    ctx.restore();
  });

  // CRT overlay
  if (fd.crtEffect) {
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }
  }

  // Scanlines
  if (fd.scanlines) {
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (let y = 0; y < h; y += 2) {
      ctx.fillRect(0, y, w, 1);
    }
  }

  // Vignette
  if (fd.vignette) {
    const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // Rainbow filter animation
  funHueRotation = (funHueRotation + 2) % 360;
  const spriteEl = document.getElementById('fun-sprite');
  if (spriteEl && fd.spriteFilter === 'rainbow') {
    spriteEl.style.filter = `hue-rotate(${funHueRotation}deg) saturate(1.5)`;
  }

  funAnimFrame = requestAnimationFrame(funRenderLoop);
}

// ===== SETTINGS CONTROLS =====
function setFunBgEffect(effect) {
  const fd = getFunData();
  fd.bgEffect = effect;
  initBgParticles(effect, fd.particleCount);
  saveData();
  renderFunSettings();
}

function setFunSpriteFilter(filter) {
  const fd = getFunData();
  fd.spriteFilter = filter;
  const spriteEl = document.getElementById('fun-sprite');
  if (spriteEl) {
    const filterInfo = SPRITE_FILTERS[filter];
    if (filter !== 'rainbow') {
      spriteEl.style.filter = filterInfo ? filterInfo.css : 'none';
    }
  }
  saveData();
  renderFunSettings();
}

function setFunSpriteSize(val) {
  const fd = getFunData();
  fd.spriteSize = parseInt(val);
  const spriteEl = document.getElementById('fun-sprite');
  if (spriteEl) spriteEl.style.transform = `scale(${fd.spriteSize / 100})`;
  saveData();
}

function setFunParticleCount(val) {
  const fd = getFunData();
  fd.particleCount = parseInt(val);
  initBgParticles(fd.bgEffect, fd.particleCount);
  saveData();
}

function toggleFunOption(key) {
  const fd = getFunData();
  fd[key] = !fd[key];
  saveData();
  renderFunSettings();
}

function renderFunSettings() {
  const el = document.getElementById('fun-settings-area');
  if (!el) return;
  const fd = getFunData();

  const bgBtns = Object.entries(BG_EFFECTS).map(([k, v]) =>
    `<button class="fun-effect-btn glass ${fd.bgEffect === k ? 'fun-active' : ''}" onclick="setFunBgEffect('${k}')">${v.icon} ${v.label}</button>`
  ).join('');

  const filterBtns = Object.entries(SPRITE_FILTERS).map(([k, v]) =>
    `<button class="fun-effect-btn glass ${fd.spriteFilter === k ? 'fun-active' : ''}" onclick="setFunSpriteFilter('${k}')">${v.label}</button>`
  ).join('');

  const toggleBtn = (key, label, emoji) => {
    const active = fd[key];
    return `<button class="fun-toggle-btn glass ${active ? 'fun-active' : ''}" onclick="toggleFunOption('${key}')">${emoji} ${label} ${active ? 'ON' : 'OFF'}</button>`;
  };

  el.innerHTML = `
    <div class="fun-settings-group">
      <div class="fun-settings-label">Background Effect</div>
      <div class="fun-btn-row">${bgBtns}</div>
    </div>

    <div class="fun-settings-group">
      <div class="fun-settings-label">Sprite Filter</div>
      <div class="fun-btn-row">${filterBtns}</div>
    </div>

    <div class="fun-settings-group">
      <div class="fun-settings-label">Sprite Size: ${fd.spriteSize}%</div>
      <input type="range" min="30" max="250" value="${fd.spriteSize}" class="fun-slider" oninput="setFunSpriteSize(this.value)">
    </div>

    <div class="fun-settings-group">
      <div class="fun-settings-label">Particle Count: ${fd.particleCount}</div>
      <input type="range" min="5" max="100" value="${fd.particleCount}" class="fun-slider" oninput="setFunParticleCount(this.value)">
    </div>

    <div class="fun-settings-group">
      <div class="fun-settings-label">Post-Processing</div>
      <div class="fun-btn-row">
        ${toggleBtn('particles', 'Tap Particles', '🎆')}
        ${toggleBtn('screenShake', 'Screen Shake', '📳')}
        ${toggleBtn('crtEffect', 'CRT Lines', '📺')}
        ${toggleBtn('scanlines', 'Scanlines', '📡')}
        ${toggleBtn('vignette', 'Vignette', '🔲')}
      </div>
    </div>
  `;
}

// ===== RENDER TAB =====
function renderFunTab() {
  const container = document.getElementById('fun-main-content');
  if (!container) return;
  const fd = getFunData();

  container.innerHTML = `
    <div class="fun-stats-bar">
      <span class="fun-stat glass">👆 <span id="fun-tap-counter">${fd.totalTaps}</span> taps</span>
      <span class="fun-stat glass">💆 <span id="fun-headpat-counter">${fd.totalHeadpats}</span> headpats</span>
      <span class="fun-stat glass">🏆 Best: <span id="fun-high-score">${fd.highScore}</span> taps/10s</span>
    </div>

    <div class="fun-play-area" id="fun-moe-area">
      <canvas id="fun-canvas" class="fun-canvas"></canvas>
      <div class="fun-sprite-wrap">
        <img src="./idle.png" id="fun-sprite" class="fun-sprite" onclick="tapMoeChan(event)" alt="Moe-chan"
          style="transform:scale(${fd.spriteSize / 100}); ${fd.spriteFilter !== 'none' && fd.spriteFilter !== 'rainbow' ? 'filter:' + (SPRITE_FILTERS[fd.spriteFilter]?.css || 'none') + ';' : ''}">
      </div>
      <div class="fun-reaction" id="fun-reaction">Tap Moe-chan! ♡</div>
      <div class="fun-combo" id="fun-combo" style="display:none;"></div>
    </div>

    <div class="fun-action-btns">
      <button class="btn-glossy btn-green" onclick="headpatMoeChan()">💆 Headpat</button>
      <button class="btn-glossy" onclick="pokeMoeChan()" style="background:linear-gradient(180deg,#ff6b81,#ff4757);">👉 Poke</button>
    </div>

    <div class="fun-settings-section glass-dark" style="margin-top:18px; padding:18px; border-radius:18px;">
      <h4 style="font-family:'Baloo 2',cursive; color:#ffd700; margin-bottom:14px;">🎨 Graphics Settings</h4>
      <div id="fun-settings-area"></div>
    </div>
  `;

  // Initialize canvas
  funCanvas = document.getElementById('fun-canvas');
  if (funCanvas) {
    const area = document.getElementById('fun-moe-area');
    funCanvas.width = area.offsetWidth || 400;
    funCanvas.height = area.offsetHeight || 400;
    funCtx = funCanvas.getContext('2d');
  }

  initBgParticles(fd.bgEffect, fd.particleCount);
  renderFunSettings();

  // Start render loop if not running
  if (funAnimFrame) cancelAnimationFrame(funAnimFrame);
  funRenderLoop();
}

function initFun() {
  getFunData();
  // Render when tab becomes active (lazy init)
}

// Listen for tab switch to fun tab
document.addEventListener('click', function(e) {
  if (e.target.matches && e.target.matches('[data-tab="fun"]')) {
    setTimeout(renderFunTab, 50);
  }
});
