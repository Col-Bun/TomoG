// ===== ASCII CATS =====
// 《虚数猫計画 · Gatos Imaginarios》
// 2chan-flavored wandering cats. Spawn every few minutes. Lucky ones
// trigger a JP/ES dialog. Roaming cats are volatile per page-load; only
// captured cats persist in data.cats.collection.

// ---------- DATA SHAPE ----------
function getCatData() {
  if (!data.cats) {
    data.cats = {
      collection: [],       // array of captured cats { id, face, kanji, color, lucky, capturedAt, lang }
      totalCaptured: 0,
      totalSpawnedEver: 0,  // lifetime stat (optional)
      lastLang: null,       // 'jp' | 'es' — alternates roughly
    };
    saveData();
  }
  if (!Array.isArray(data.cats.collection)) data.cats.collection = [];
  return data.cats;
}

// ---------- CAT TEMPLATES ----------
// Popular 2chan-style kaomoji cat faces
const CAT_FACES = [
  '(=^・ω・^=)', '(=^･ｪ･^=)', '(=ＴェＴ=)', '(=ФェФ=)',
  '(=ↀωↀ=)',   '(=^‥^=)',   '(=｀ェ´=)',   '(=ΦᆺΦ=)',
  '(=οωο=)',    '(=^皿^=)',   '(=✪ω✪=)',   '(=˘ω˘=)',
  '(=ΦｴΦ=)ﾉ',  'ヾ(=ﾟ･ﾟ=)ﾉ', '(^・ω・^ )',  'ᓚ₍ ^. .^₎'
];
const LUCKY_FACES = ['(=✧ω✧=)', '(=★ω★=)', '₍^ >ヮ<^₎', '(=✨ω✨=)'];

const CAT_COLORS = [
  '#ff6ea8', '#a8e84c', '#66ccff', '#ffb86c',
  '#c792ea', '#82e9de', '#f78fb3', '#f6e58d',
  '#7bed9f', '#ff7979', '#e056fd', '#74b9ff'
];
const LUCKY_COLOR = '#ffd700';

const CAT_KANJI = [
  '猫','夢','風','光','影','静','狂','空','水','火','森','雪','桜','鏡','刻',
  '雲','月','星','霧','雷','花','海','山','道','音','色','紅','碧','黒','白',
  '鬼','龍','鳳','虎','魚','鳥','翼','牙','爪','瞳','魂','縁','運','禅','無'
];

// ===== SECRET PERSONALITIES (hidden trait, revealed on capture) =====
// Each roaming cat secretly carries one of these. Drives behavior quirks.
// `weight` biases rarity; `secret: true` personalities are extra-rare easter eggs.
const CAT_PERSONALITIES = [
  { id: 'philosopher', jp: '哲学者',   es: 'Filósofo',    weight: 12,
    speedMult: 0.75, chatMult: 4.0,  buildMult: 0.2, jobMult: 0.5, matMult: 0.3, mateMult: 0.5, chimMult: 0.3,
    hint: '考え込んでいる · lost in thought',
    lines: ['…存在とは？','…我猫故に我あり','¿y si todo es un sueño?','夢は夢を見る','el tiempo no existe, parce','無、という概念について…'] },
  { id: 'architect',   jp: '建築家',   es: 'Arquitecta',  weight: 7,
    speedMult: 0.85, chatMult: 0.8,  buildMult: 12.0, jobMult: 0.5, matMult: 3.0, mateMult: 0.3, chimMult: 0.4,
    hint: '何かを測っている · measuring something',
    lines: ['ここに何か建てるにゃ','柱は此処','plano perfecto','もっと素材が要る','necesito más clay','図面、図面…'] },
  { id: 'sloth',       jp: '怠け者',   es: 'Vago',        weight: 10,
    speedMult: 0.18, chatMult: 0.8,  buildMult: 0.05, jobMult: 0.1, matMult: 0.3, mateMult: 0.2, chimMult: 0.3,
    hint: 'あくびをする · keeps yawning',
    lines: ['……zzz','ねむいにゃ','mañana lo hago','……','qué pereza tenaz','5分……あと5分…'] },
  { id: 'lover',       jp: '恋猫',     es: 'Enamorada',   weight: 5,
    speedMult: 1.05, chatMult: 1.8,  buildMult: 0.2, jobMult: 0.5, matMult: 0.5, mateMult: 14.0, chimMult: 0.5,
    hint: '誰かを探している · looking for someone',
    lines: ['運命の猫はどこ…','¿dónde estás, mi amor?','キミに会いたい','el corazón me late','にゃん💕','ti amo…… no, esa no es mi idioma'] },
  { id: 'grifter',     jp: '詐欺師',   es: 'Estafador',   weight: 6,
    speedMult: 1.10, chatMult: 2.2,  buildMult: 0.3, jobMult: 9.0, matMult: 1.0, mateMult: 0.4, chimMult: 0.5,
    hint: '何かを企んでいる · plotting something',
    lines: ['名刺はあるにゃ','confíe en mí, caballero','社長、ちょっと…','solo una firma aquí','書類は後で送るにゃ','100% legal, ¿oís?'] },
  { id: 'mystic',      jp: '神秘',     es: 'Místico',     weight: 3,
    speedMult: 0.70, chatMult: 1.5,  buildMult: 0.4, jobMult: 0.7, matMult: 0.8, mateMult: 0.3, chimMult: 10.0,
    hint: '気配を感じる · senses something uncanny',
    lines: ['気……漂う…','algo se acerca…','キマイラの匂い','las estrellas hablan, sumercé','別の次元の猫が来る','…呼ぶ声がする'] },
  { id: 'merchant',    jp: '商人',     es: 'Mercader',    weight: 9,
    speedMult: 1.00, chatMult: 1.5,  buildMult: 0.5, jobMult: 2.5, matMult: 7.0, mateMult: 0.5, chimMult: 0.8,
    hint: '何か担いでいる · carrying something',
    lines: ['いらっしゃいにゃ！','oferta especial hoy','掘り出し物あるよ','2x1 hermano','値段交渉OK','buen precio, parce'] },
  { id: 'samurai',     jp: '武士',     es: 'Samurái',     weight: 6,
    speedMult: 1.70, chatMult: 0.9,  buildMult: 0.3, jobMult: 0.7, matMult: 0.5, mateMult: 0.4, chimMult: 1.2,
    hint: '背筋が伸びている · stands tall',
    lines: ['拙者、参る','honor ante todo','斬る……','¡en guardia, miau!','風林火山','la senda del gato'] },
  { id: 'poet',        jp: '詩人',     es: 'Poeta',       weight: 8,
    speedMult: 0.95, chatMult: 3.2,  buildMult: 0.2, jobMult: 0.8, matMult: 0.5, mateMult: 1.3, chimMult: 0.6,
    hint: '何か呟いている · muttering verses',
    lines: ['古池や……猫飛び込む…','bajo la luna, miau','五七五にゃ','mi corazón es un haiku','風が肌を撫でる','el aire sabe a pescado'] },
  { id: 'adventurer',  jp: '冒険者',   es: 'Aventurera',  weight: 8,
    speedMult: 1.45, chatMult: 1.2,  buildMult: 0.4, jobMult: 0.8, matMult: 2.0, mateMult: 0.6, chimMult: 2.0,
    hint: '落ち着きがない · restless',
    lines: ['次の冒険はどこ？','¡vamos a explorar!','宝の匂いがする','mapa nuevo, ¿oís?','あの先に何かある','la aventura no espera'] },
  { id: 'kitten',      jp: '子猫',     es: 'Gatita',      weight: 10,
    speedMult: 1.25, chatMult: 1.6,  buildMult: 0.1, jobMult: 0.2, matMult: 0.4, mateMult: 0.0, chimMult: 0.8,
    hint: 'とても小さい · very small',
    lines: ['にゃ！にゃ！','¡juguemos!','きゃっきゃっ','¡pum pum pum!','ぽてぽて','¿jugamos, porfa?'] },
  { id: 'sage',        jp: '賢猫',     es: 'Sabio',       weight: 5,
    speedMult: 0.55, chatMult: 2.5,  buildMult: 0.6, jobMult: 0.6, matMult: 0.7, mateMult: 0.4, chimMult: 3.5,
    hint: '目が深い · deep-eyed',
    lines: ['ふむ。理は其処に','todo vuelve al inicio','見えぬものを見る','escuche al silencio','答えは内にあり','la paciencia, joven'] },
  // secret / ultra-rare easter eggs
  { id: 'shadow',      jp: '影',       es: 'Sombra',      weight: 2, secret: true,
    speedMult: 1.30, chatMult: 0.4,  buildMult: 0.3, jobMult: 0.3, matMult: 0.8, mateMult: 0.2, chimMult: 2.5,
    hint: 'すり抜けるような存在 · slips through vision',
    lines: ['…','……','.　.　.','誰も見ていない時に','cuando nadie mira','…影にゃ'] },
  { id: 'king',        jp: '王',       es: 'Rey',         weight: 1, secret: true,
    speedMult: 0.70, chatMult: 1.5,  buildMult: 0.8, jobMult: 1.2, matMult: 1.5, mateMult: 0.8, chimMult: 4.0,
    hint: '気品が漂う · air of nobility',
    lines: ['朕、満足じゃ','el reino es mío','跪け、臣よ','súbditos, escuchen','王冠が重い','soy el gato supremo'] },
  { id: 'chef',        jp: '料理猫',   es: 'Chef',        weight: 6,
    speedMult: 0.95, chatMult: 1.6,  buildMult: 0.3, jobMult: 3.0, matMult: 2.0, mateMult: 0.8, chimMult: 0.6,
    hint: '何か作っている · cooking something',
    lines: ['出汁が命','el sofrito es sagrado','魚を捌く','ajo, cebolla, miau','味見にゃ','¡pruebe, parce!'] },
  { id: 'bureaucrat',  jp: '役人',     es: 'Burócrata',   weight: 5,
    speedMult: 0.45, chatMult: 1.8,  buildMult: 0.2, jobMult: 4.0, matMult: 0.5, mateMult: 0.4, chimMult: 0.4,
    hint: '書類を持っている · clutching forms',
    lines: ['印鑑お願いします','necesita tres firmas','書類三枚','vuelva el lunes','規則は規則','sin el sello, no'] },
];

// Build a weighted pool once
const _catPersonalityPool = (() => {
  const out = [];
  CAT_PERSONALITIES.forEach(p => { for (let i = 0; i < p.weight; i++) out.push(p); });
  return out;
})();
function pickCatPersonality() { return _catPersonalityPool[Math.floor(Math.random() * _catPersonalityPool.length)]; }
function personalityById(id) { return CAT_PERSONALITIES.find(p => p.id === id) || null; }

// ===== FAKE JOBS (rotating pretend occupations) =====
const CAT_JOBS = [
  { id: 'shopkeep',   emoji: '🏪', jp: '店主',       es: 'Tendero'     },
  { id: 'sushi',      emoji: '🍣', jp: '寿司職人',   es: 'Sushi-chef'  },
  { id: 'salaryman',  emoji: '💼', jp: '会社員',     es: 'Oficinista'  },
  { id: 'idol',       emoji: '🎤', jp: 'アイドル',   es: 'Ídolo'       },
  { id: 'programmer', emoji: '💻', jp: 'プログラマ', es: 'Dev'         },
  { id: 'delivery',   emoji: '🛵', jp: '出前',       es: 'Mensajero'   },
  { id: 'oracle',     emoji: '🔮', jp: '占い師',     es: 'Adivina'     },
  { id: 'priest',     emoji: '⛩️', jp: '神主',       es: 'Sacerdote'   },
  { id: 'detective',  emoji: '🕵️', jp: '探偵',       es: 'Detective'   },
  { id: 'bartender',  emoji: '🍺', jp: 'バーテン',   es: 'Bartender'   },
  { id: 'streetvendor', emoji: '🌮', jp: '屋台',     es: 'Vendedor'    },
  { id: 'librarian',  emoji: '📚', jp: '司書',       es: 'Bibliotecaria' },
  { id: 'pachinko',   emoji: '🎰', jp: 'パチンコ店員', es: 'Casinero'  },
];

// ===== CAT-TO-CAT CHIT-CHAT FALLBACK LINES =====
const CAT_CHATTER_JP = ['にゃー','ふむ','……','あ、どうも','お魚？','なるほどにゃ','元気？','眠いにゃ','ん〜','そうですか','また会ったにゃ','ご機嫌麗しゅう'];
const CAT_CHATTER_ES = ['miau','¿qué hubo?','bueno bueno','ajá','che, vos','¿oís?','qué jartera','eso sí que no','buena, parce','ni idea','ay no…','hermano'];

// ===== STRUCTURES (what Architect cats rarely build) =====
const CAT_STRUCTURES = [
  { id: 'torii',    label: '⛩️',  name: '鳥居',   desc: 'a small torii gate' },
  { id: 'shrine',   label: '🏯',  name: '社',     desc: 'a pocket shrine' },
  { id: 'house',    label: '🏠',  name: '家',     desc: 'a tiny house' },
  { id: 'hut',      label: '🛖',  name: '小屋',   desc: 'a grass hut' },
  { id: 'tower',    label: '🗼',  name: '塔',     desc: 'a lookout tower' },
  { id: 'kotatsu',  label: '🟫',  name: '炬燵',   desc: 'a cozy kotatsu' },
  { id: 'cairn',    label: '▲',   name: '石塚',   desc: 'a stone cairn' },
  { id: 'fountain', label: '⛲',   name: '泉',     desc: 'a fountain' },
  { id: 'lantern',  label: '🏮',  name: '提灯',   desc: 'a paper lantern' },
  { id: 'urn',      label: '⚱️',  name: '壺',     desc: 'a curious urn' },
];

// ===== CAT-DROPPED INGREDIENTS (separate from expedition materials) =====
const CAT_INGREDIENTS = [
  { id: 'onigiri', emoji: '🍙', name: 'Onigiri'    },
  { id: 'sushi',   emoji: '🍣', name: 'Sushi'      },
  { id: 'dango',   emoji: '🍡', name: 'Dango'      },
  { id: 'ramen',   emoji: '🍜', name: 'Ramen'      },
  { id: 'fish',    emoji: '🐟', name: 'Fresh Fish' },
  { id: 'arepa',   emoji: '🫓', name: 'Arepa'      },
  { id: 'tamal',   emoji: '🫔', name: 'Tamal'      },
  { id: 'milk',    emoji: '🥛', name: 'Milk'       },
  { id: 'mochi',   emoji: '🍥', name: 'Mochi'      },
];

// ===== WEEKDAY LAYOUT THEMES (Sun=0 … Sat=6) =====
const CAT_WEEKDAY_LAYOUTS = [
  { id: 'shrine-sun',  name: '日曜・神社',       es: 'Domingo · Santuario',
    grad: 'linear-gradient(135deg,#2a1020 0%,#4a2a45 45%,#5a3260 100%)',
    props: ['⛩️','🌸','🌸','⛩️','🏮','🌸','🐦'] },
  { id: 'office-mon',  name: '月曜・オフィス',   es: 'Lunes · Oficina',
    grad: 'linear-gradient(135deg,#0a1828 0%,#12304a 45%,#1a3c5a 100%)',
    props: ['🏢','🏢','🏬','💼','📎','☕','🖥️'] },
  { id: 'market-tue',  name: '火曜・市場',       es: 'Martes · Mercado',
    grad: 'linear-gradient(135deg,#3a1a0a 0%,#5a2a15 45%,#6a3a1a 100%)',
    props: ['🛒','🥕','🐟','🍅','🧅','🏮','🍜'] },
  { id: 'library-wed', name: '水曜・図書館',     es: 'Miércoles · Biblioteca',
    grad: 'linear-gradient(135deg,#1a1a2a 0%,#2a2a45 45%,#3a3555 100%)',
    props: ['📚','📖','📕','📘','🕯️','🪑','🔖'] },
  { id: 'forest-thu',  name: '木曜・森',         es: 'Jueves · Bosque',
    grad: 'linear-gradient(135deg,#0a2a18 0%,#1a4028 45%,#255a36 100%)',
    props: ['🌳','🌲','🍄','🌿','🦋','🌳','🌸'] },
  { id: 'izakaya-fri', name: '金曜・居酒屋',     es: 'Viernes · Izakaya',
    grad: 'linear-gradient(135deg,#3a0a1a 0%,#5a1830 45%,#752040 100%)',
    props: ['🏮','🍶','🍣','🍢','🍺','🎌','🏮'] },
  { id: 'arcade-sat',  name: '土曜・アーケード', es: 'Sábado · Arcade',
    grad: 'linear-gradient(135deg,#1a0040 0%,#300070 45%,#4a0090 100%)',
    props: ['🎰','👾','🕹️','🎮','🎆','💿','🟣'] },
];
function currentWeekdayLayout() { return CAT_WEEKDAY_LAYOUTS[new Date().getDay()]; }

// ===== PERSONALITY → PROP / BUILDING AFFINITY =====
// What emojis each personality is drawn to in the background (weekday props).
// Falls back to "any" if no match exists in current layout.
const CAT_BUILDING_AFFINITY = {
  philosopher: ['📚','📖','📕','📘','🕯️','⛩️','🌳','🌲'],
  architect:   ['🏢','🏬','🏯','🗼','⛩️','🛒','🏠'],
  sloth:       ['🟫','🪑','🏠','🛖','☕','🍶'],
  lover:       ['🌸','🏮','🍣','🍶','🎌','🍺'],
  grifter:     ['🎰','🎮','🎰','💼','🛒','🍺'],
  mystic:      ['⛩️','🏮','🕯️','🦋','🌸','🌳','🍄'],
  merchant:    ['🛒','🏪','🏬','🥕','🐟','🍅','🧅','🍜'],
  samurai:     ['⛩️','🏯','🌸','🎌','🗼'],
  poet:        ['📚','📖','🌸','🕯️','🌳','🍶'],
  adventurer:  ['🌳','🌲','🍄','🏯','🗼','🎮','👾'],
  kitten:      ['🦋','🌸','🍄','🎮','🍡','🍥','🛒'],
  sage:        ['📚','📖','📕','📘','🕯️','⛩️','🌳'],
  shadow:      ['🕯️','📚','🏮','⛩️','🌲'],
  king:        ['🏯','🗼','⛩️','🏬','🎌','🏮'],
  chef:        ['🍣','🍢','🍜','🥕','🐟','🍅','🧅'],
  bureaucrat:  ['💼','🏢','📎','☕','🖥️','🏬'],
};

// Picks a building target inside the current props for `cat`.
// Returns null if nothing suitable in the layout.
function pickTargetProp(cat) {
  const stage = catRuntime.stageEl;
  if (!stage) return null;
  const props = catRuntime.propsCache;
  if (!props || props.length === 0) return null;
  const w = stage.clientWidth || 600;
  const h = stage.clientHeight || 320;

  const personalityId = cat.personality && cat.personality.id;
  const wanted = CAT_BUILDING_AFFINITY[personalityId] || [];
  // 70% of the time prefer a wanted prop, else pick any prop
  let pool = (Math.random() < 0.7 && wanted.length)
    ? props.filter(p => wanted.indexOf(p.emoji) >= 0)
    : [];
  if (pool.length === 0) pool = props.slice();
  if (pool.length === 0) return null;

  const chosen = pool[Math.floor(Math.random() * pool.length)];
  // Convert percent positions → pixel center
  const px = (chosen.leftPct / 100) * w;
  const py = (chosen.topPct  / 100) * h;
  // Strength of attraction depends on how loved the prop is
  const loved = wanted.indexOf(chosen.emoji) >= 0;
  return {
    x: px,
    y: py,
    emoji: chosen.emoji,
    loved,
    arriveDist: 30,
    lingerMs: loved ? (12000 + Math.random() * 18000) : (4000 + Math.random() * 6000),
    travelUntil: performance.now() + 30000,  // give up after 30s if blocked
    arrivedAt: 0,
    propRef: chosen,
  };
}

// ===== BEHAVIOR BASE RATES (per second; tick scales by dt) =====
const CAT_RATE_CHAT     = 0.012;     // near another cat: ~1.2%/sec
const CAT_RATE_BUILD    = 0.00015;   // VERY rare — architect-biased
const CAT_RATE_JOB      = 0.0012;    // ~0.12%/sec per cat
const CAT_RATE_MATERIAL = 0.0008;
const CAT_RATE_CHIMERA  = 0.00008;   // rare
const CAT_RATE_MATE     = 0.0000022; // truly rare (needs two lovers nearby)

// Bogotá-flavored dialog prompts. Roughly alternate JP / ES per lucky spawn.
const LUCKY_DIALOGS_JP = [
  { prompt: '「お魚、くれる？」',        correct: 'あげる',   wrong: ['いらない','食べない'] },
  { prompt: '「撫でて欲しいにゃ……」',   correct: '撫でる',   wrong: ['無視する','蹴る'] },
  { prompt: '「お腹すいた……」',         correct: 'ご飯あげる', wrong: ['ダイエット','寝る'] },
  { prompt: '「こっちおいで？」',         correct: 'はい',     wrong: ['怖い','逃げる'] },
  { prompt: '「友達になる？」',           correct: 'なる',     wrong: ['いや','知らない'] },
];
const LUCKY_DIALOGS_ES = [
  { prompt: '«¿Me das un pescado, parce?»',    correct: 'Claro, toma', wrong: ['Qué jartera','No tengo'] },
  { prompt: '«Hágame cariñitos, sumercé.»',    correct: 'Ven acá',     wrong: ['No me moleste','Quieto'] },
  { prompt: '«Tengo un filo tenaz, ¿oís?»',    correct: 'Te doy comida', wrong: ['Aguántate','Chao'] },
  { prompt: '«¿Querés ser mi amigo, chino?»',  correct: 'Dale pues',   wrong: ['Qué pereza','Bájese'] },
  { prompt: '«Rasque atrás de la oreja, porfa.»', correct: 'Listo',   wrong: ['Ni de riesgos','No'] },
];

// ---------- RUNTIME STATE (volatile) ----------
const catRuntime = {
  nextId: 1,                 // starts at 1 every page load — per spec
  roaming: [],               // { id, face, kanji, color, lucky, x, y, vx, vy, el, wiggle, personality, job, bubble, bubbleEl }
  spawnInterval: null,
  animFrame: null,
  lastTs: 0,
  stageEl: null,
  countEl: null,
  dialogOpen: false,
  bgCharsEl: null,
  structures: [],            // { id, name, label, x, y, builtBy, el }
  drops: [],                 // { kind:'material'|'ingredient', id, emoji, x, y, el }
  weekdayLayoutId: null,
  logEl: null,
  logBuffer: [],
};

// Spawn cadence
const CAT_SPAWN_MS = 3 * 60 * 1000;  // every 3 minutes while tab is open
const CAT_MAX_ROAMING = 14;          // soft cap
const LUCKY_CHANCE = 0.05;           // 5% per spawn

// ---------- HELPERS ----------
function catPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function makeCatEntity(opts = {}) {
  const cd = getCatData();
  cd.totalSpawnedEver++;

  const lucky = opts.forceLucky === true ? true :
               (opts.forceLucky === false ? false : Math.random() < LUCKY_CHANCE);

  const id = catRuntime.nextId++;
  const face = lucky ? catPick(LUCKY_FACES) : catPick(CAT_FACES);
  const kanji = catPick(CAT_KANJI);
  const color = lucky ? LUCKY_COLOR : catPick(CAT_COLORS);

  // Secret personality
  const personality = opts.personality || pickCatPersonality();

  const stage = catRuntime.stageEl;
  if (!stage) return null;
  const w = stage.clientWidth || 600;
  const h = stage.clientHeight || 320;
  const x = typeof opts.x === 'number' ? opts.x : Math.random() * Math.max(1, w - 90);
  const y = typeof opts.y === 'number' ? opts.y : Math.random() * Math.max(1, h - 70);
  const baseSpeed = (lucky ? 0.55 : 0.35) * (personality.speedMult || 1);
  const angle = Math.random() * Math.PI * 2;

  const cat = {
    id, face, kanji, color, lucky,
    x, y,
    vx: Math.cos(angle) * baseSpeed,
    vy: Math.sin(angle) * baseSpeed,
    wiggle: Math.random() * Math.PI * 2,
    el: null,
    personality,                 // secret trait (revealed on capture)
    job: null,                   // {id, emoji, jp, es, until}
    bubble: null,                // active speech-bubble { text, until, el }
    buildCooldown: 0,            // seconds until next build attempt allowed
    lastChatMs: 0,               // throttle chit-chat
    isKitten: opts.isKitten === true,
    parents: opts.parents || null, // if born from mating
    targetProp: null,            // {x, y, emoji, loved, arriveDist, lingerMs, travelUntil, arrivedAt}
    lastSeekRoll: 0,             // throttle for targetProp rolls
  };

  cat.el = renderCatDom(cat);
  stage.appendChild(cat.el);
  catRuntime.roaming.push(cat);

  // Soft-cap: evict the oldest non-lucky if we're over the limit
  if (catRuntime.roaming.length > CAT_MAX_ROAMING) {
    const victimIdx = catRuntime.roaming.findIndex(c => !c.lucky);
    if (victimIdx >= 0) {
      const victim = catRuntime.roaming[victimIdx];
      if (victim.el && victim.el.parentNode) victim.el.parentNode.removeChild(victim.el);
      catRuntime.roaming.splice(victimIdx, 1);
    }
  }

  updateCatHud();
  saveData();
  return cat;
}

function renderCatDom(cat) {
  const el = document.createElement('div');
  el.className = 'ascii-cat' + (cat.lucky ? ' ascii-cat-lucky' : '') +
    (cat.isKitten ? ' ascii-cat-kitten' : '') +
    (cat.personality && cat.personality.secret ? ' ascii-cat-secret' : '');
  el.dataset.personality = cat.personality ? cat.personality.id : '';
  el.style.position = 'absolute';
  el.style.color = cat.color;
  el.style.left = cat.x + 'px';
  el.style.top = cat.y + 'px';
  el.style.cursor = 'pointer';
  el.style.whiteSpace = 'pre';
  el.style.textAlign = 'center';
  el.style.fontFamily = "'Courier New', 'MS Gothic', monospace";
  el.style.fontSize = cat.isKitten ? '10px' : '13px';
  el.style.lineHeight = '1.15';
  el.style.userSelect = 'none';
  el.style.textShadow = cat.lucky
    ? '0 0 8px rgba(255,215,0,0.9), 0 0 14px rgba(255,215,0,0.5)'
    : '0 1px 2px rgba(0,0,0,0.45)';
  el.style.transition = 'transform 0.15s';
  el.innerHTML =
    '<div class="ascii-cat-bubble" style="display:none;"></div>' +
    '<div class="ascii-cat-job" style="display:none;"></div>' +
    '<div style="font-size:10px;opacity:0.8;">[' + cat.id + ']</div>' +
    '<div class="ascii-cat-face">' + cat.face + '</div>' +
    '<div style="font-size:' + (cat.isKitten ? '13px' : '16px') + ';font-weight:700;">' + cat.kanji + '</div>';

  el.addEventListener('mouseenter', () => { el.style.transform = 'scale(' + (cat.isKitten ? 1.25 : 1.15) + ')'; });
  el.addEventListener('mouseleave', () => { el.style.transform = 'scale(' + (cat.isKitten ? 0.82 : 1) + ')'; });
  el.addEventListener('click', () => onCatClick(cat));
  if (cat.isKitten) el.style.transform = 'scale(0.82)';
  return el;
}

// ---------- BACKGROUND (ascii field + weekday props) ----------
function buildCatBackground() {
  const bg = catRuntime.bgCharsEl;
  if (!bg) return;
  const CHARS = ['·','∴','∵','.','⋅','⁘','⁙','•','·','·','.'];
  const COLORS = ['#3a2e4d','#2e3a4d','#4d3a2e','#2e4d3a','#4d2e3a'];
  let html = '';
  const count = 180;
  for (let i = 0; i < count; i++) {
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
    const cl = COLORS[Math.floor(Math.random() * COLORS.length)];
    const op = (0.25 + Math.random() * 0.5).toFixed(2);
    html += '<span style="position:absolute;top:' + top.toFixed(1) + '%;left:' + left.toFixed(1) +
            '%;color:' + cl + ';opacity:' + op + ';font-size:' +
            (10 + Math.floor(Math.random()*6)) + 'px;">' + ch + '</span>';
  }
  // Weekday-themed large prop emojis scattered behind the cats
  const layout = currentWeekdayLayout();
  catRuntime.propsCache = [];
  (layout.props || []).forEach((emoji, i) => {
    const top = 8 + (i * 13 + Math.random() * 10) % 80;
    const left = 5 + (i * 17 + Math.random() * 12) % 88;
    const size = 28 + Math.floor(Math.random() * 18);
    const op = (0.20 + Math.random() * 0.22).toFixed(2);
    html += '<span class="cat-prop" data-prop-idx="' + i + '" style="position:absolute;top:' + top.toFixed(1) +
            '%;left:' + left.toFixed(1) + '%;opacity:' + op +
            ';font-size:' + size + 'px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">' + emoji + '</span>';
    catRuntime.propsCache.push({ emoji, topPct: top, leftPct: left, idx: i });
  });
  bg.innerHTML = html;
}

function applyWeekdayLayout() {
  const layout = currentWeekdayLayout();
  catRuntime.weekdayLayoutId = layout.id;
  const stage = catRuntime.stageEl;
  if (stage) stage.style.background = layout.grad;
  const label = document.getElementById('cat-weekday-label');
  if (label) label.textContent = layout.name + ' · ' + layout.es;
  buildCatBackground();
}

// ---------- LOG ----------
function catLog(line) {
  catRuntime.logBuffer.unshift('[' + new Date().toLocaleTimeString() + '] ' + line);
  if (catRuntime.logBuffer.length > 40) catRuntime.logBuffer.length = 40;
  if (catRuntime.logEl) catRuntime.logEl.textContent = catRuntime.logBuffer.join('\n');
}

// ---------- ANIMATION LOOP ----------
function catAnimateTick(ts) {
  if (!catRuntime.stageEl) return;
  if (!catRuntime.lastTs) catRuntime.lastTs = ts;
  const dtMs = Math.min(50, ts - catRuntime.lastTs);
  catRuntime.lastTs = ts;
  const dtSec = dtMs / 1000;

  const w = catRuntime.stageEl.clientWidth || 600;
  const h = catRuntime.stageEl.clientHeight || 320;
  const now = ts;

  // Boss collision / timeout first so cats get knocked before moving this frame
  tickBossCollision(now);

  catRuntime.roaming.forEach(c => {
    c.wiggle += 0.04;
    const wob = Math.sin(c.wiggle) * 0.15;

    // ==== BUILDING ATTRACTION ====
    // Low-chance roll to pick a target prop.
    if (!c.targetProp && !c.isKitten && now - c.lastSeekRoll > 1200) {
      c.lastSeekRoll = now;
      const p = c.personality || {};
      // Weight: philosophers, sage, sloth, bureaucrat love hanging around.
      const affinityBias =
        (p.id === 'sloth' || p.id === 'philosopher' || p.id === 'sage' || p.id === 'bureaucrat') ? 2.2 :
        (p.id === 'shadow' || p.id === 'king' || p.id === 'poet') ? 1.6 :
        (p.id === 'samurai' || p.id === 'adventurer') ? 0.6 :
        1.0;
      const seekRate = 0.0015 * affinityBias * dtSec * 1000; // per 1.2s window
      if (Math.random() < seekRate) {
        c.targetProp = pickTargetProp(c);
      }
    }

    if (c.targetProp) {
      const t = c.targetProp;
      const dx = t.x - c.x;
      const dy = t.y - c.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= t.arriveDist) {
        // Arrived! Linger.
        if (!t.arrivedAt) {
          t.arrivedAt = now;
          c.el && c.el.classList.add('ascii-cat-anchored');
          // Highlight the prop while loved
          if (t.loved) {
            const propEl = catRuntime.bgCharsEl && catRuntime.bgCharsEl.querySelector('.cat-prop[data-prop-idx="' + t.propRef.idx + '"]');
            if (propEl) propEl.classList.add('cat-prop-wanted');
          }
          // Speech line
          if (t.loved) {
            const lines = ['ここが好き…','居心地がいい','me gusta aquí','mi lugar favorito','…落ち着く','aquí me quedo, parce'];
            setCatBubble(c, catPick(lines), 2200);
          }
        }
        // Gentle idle jitter while at the prop
        c.vx *= 0.88;
        c.vy *= 0.88;
        c.vx += (Math.random() - 0.5) * 0.02;
        c.vy += (Math.random() - 0.5) * 0.02;
        // Done lingering → release
        if (now - t.arrivedAt >= t.lingerMs) {
          c.el && c.el.classList.remove('ascii-cat-anchored');
          if (t.loved && t.propRef) {
            const propEl = catRuntime.bgCharsEl && catRuntime.bgCharsEl.querySelector('.cat-prop[data-prop-idx="' + t.propRef.idx + '"]');
            if (propEl) propEl.classList.remove('cat-prop-wanted');
          }
          // Kick off with a random nudge so it wanders again
          const a = Math.random() * Math.PI * 2;
          const base = (c.lucky ? 0.55 : 0.35) * ((c.personality && c.personality.speedMult) || 1);
          c.vx = Math.cos(a) * base;
          c.vy = Math.sin(a) * base;
          c.targetProp = null;
        }
      } else {
        // Steer toward target (blend with current velocity)
        const base = (c.lucky ? 0.55 : 0.35) * ((c.personality && c.personality.speedMult) || 1);
        const steerStrength = t.loved ? 0.08 : 0.05;
        const nx = dx / dist, ny = dy / dist;
        c.vx = c.vx * (1 - steerStrength) + nx * base * (t.loved ? 1.2 : 1.0) * steerStrength * 10;
        c.vy = c.vy * (1 - steerStrength) + ny * base * (t.loved ? 1.2 : 1.0) * steerStrength * 10;
        // Clamp speed
        const sp = Math.hypot(c.vx, c.vy);
        const max = base * 1.6;
        if (sp > max) { c.vx = c.vx / sp * max; c.vy = c.vy / sp * max; }
        // Give up if it takes too long
        if (now > t.travelUntil) {
          c.targetProp = null;
          c.el && c.el.classList.remove('ascii-cat-anchored');
        }
      }
    }

    c.x += (c.vx + wob) * (dtMs / 16);
    c.y += (c.vy - wob * 0.5) * (dtMs / 16);
    if (c.x < 0) { c.x = 0; c.vx = Math.abs(c.vx); }
    if (c.x > w - 80) { c.x = w - 80; c.vx = -Math.abs(c.vx); }
    if (c.y < 0) { c.y = 0; c.vy = Math.abs(c.vy); }
    if (c.y > h - 60) { c.y = h - 60; c.vy = -Math.abs(c.vy); }
    if (c.el) {
      c.el.style.left = c.x.toFixed(1) + 'px';
      c.el.style.top = c.y.toFixed(1) + 'px';
    }

    // Bubble expiry
    if (c.bubble && now > c.bubble.until) clearCatBubble(c);

    // Job expiry
    if (c.job && now > c.job.until) clearCatJob(c);

    // Building cooldown tick-down
    if (c.buildCooldown > 0) c.buildCooldown -= dtSec;

    // ==== BEHAVIOR ROLLS (scaled by dt, personality multipliers) ====
    const p = c.personality || {};

    // Chat with nearby cat
    const neighbor = nearestCatWithin(c, 110);
    if (neighbor && now - c.lastChatMs > 2500) {
      const r = CAT_RATE_CHAT * (p.chatMult || 1) * dtSec;
      if (Math.random() < r) catChatWith(c, neighbor);
    }

    // Rarely take a fake job
    if (!c.job && Math.random() < CAT_RATE_JOB * (p.jobMult || 1) * dtSec) {
      catTakeJob(c);
    }

    // Rarely drop a material (merchant-biased)
    if (Math.random() < CAT_RATE_MATERIAL * (p.matMult || 1) * dtSec) {
      catDropMaterial(c);
    }

    // Rarely build a structure (architect-biased, extra cooldown)
    if (c.buildCooldown <= 0 &&
        Math.random() < CAT_RATE_BUILD * (p.buildMult || 1) * dtSec) {
      catBuildStructure(c);
    }

    // Rarely summon a chimera (mystic/sage/adventurer-biased)
    if (Math.random() < CAT_RATE_CHIMERA * (p.chimMult || 1) * dtSec) {
      catSummonChimera(c);
    }

    // VERY rarely mate (needs a nearby partner with lover bias)
    if (neighbor && (p.mateMult || 0) > 0 && (neighbor.personality && (neighbor.personality.mateMult || 0) > 0) && !c.isKitten && !neighbor.isKitten) {
      const combined = (p.mateMult || 1) * (neighbor.personality.mateMult || 1);
      if (Math.random() < CAT_RATE_MATE * combined * dtSec) {
        catMate(c, neighbor);
      }
    }
  });

  catRuntime.animFrame = requestAnimationFrame(catAnimateTick);
}

// ---------- BEHAVIOR HELPERS ----------
function nearestCatWithin(cat, maxDist) {
  let best = null;
  let bestD = maxDist;
  for (const other of catRuntime.roaming) {
    if (other === cat) continue;
    const dx = other.x - cat.x;
    const dy = other.y - cat.y;
    const d = Math.hypot(dx, dy);
    if (d < bestD) { bestD = d; best = other; }
  }
  return best;
}

function setCatBubble(cat, text, ms) {
  if (!cat.el) return;
  cat.bubble = { text, until: performance.now() + (ms || 2800) };
  const slot = cat.el.querySelector('.ascii-cat-bubble');
  if (slot) {
    slot.textContent = text;
    slot.style.display = 'block';
  }
  cat.el.classList.add('ascii-cat-talking');
}
function clearCatBubble(cat) {
  cat.bubble = null;
  if (cat.el) {
    const slot = cat.el.querySelector('.ascii-cat-bubble');
    if (slot) slot.style.display = 'none';
    cat.el.classList.remove('ascii-cat-talking');
  }
}

function catChatWith(cat, other) {
  const now = performance.now();
  cat.lastChatMs = now;
  other.lastChatMs = now;
  const useJP = Math.random() < 0.5;
  const pool = useJP ? CAT_CHATTER_JP : CAT_CHATTER_ES;
  // Personality lines weight in
  const a = (cat.personality && cat.personality.lines) ? cat.personality.lines : pool;
  const b = (other.personality && other.personality.lines) ? other.personality.lines : pool;
  setCatBubble(cat,   catPick(Math.random() < 0.65 ? a : pool), 2200);
  setCatBubble(other, catPick(Math.random() < 0.65 ? b : pool), 2200);
  catLog('💬 #' + cat.id + ' ↔ #' + other.id + ' : ' + (cat.bubble ? cat.bubble.text : ''));
}

function catTakeJob(cat) {
  const job = catPick(CAT_JOBS);
  cat.job = { ...job, until: performance.now() + (30 + Math.random() * 60) * 1000 };
  if (cat.el) {
    const slot = cat.el.querySelector('.ascii-cat-job');
    if (slot) {
      slot.textContent = job.emoji;
      slot.style.display = 'block';
      slot.title = job.jp + ' · ' + job.es;
    }
  }
  catLog('🎭 #' + cat.id + ' pretends to be a ' + job.jp + ' / ' + job.es);
}
function clearCatJob(cat) {
  cat.job = null;
  if (cat.el) {
    const slot = cat.el.querySelector('.ascii-cat-job');
    if (slot) slot.style.display = 'none';
  }
}

function catBuildStructure(cat) {
  const stage = catRuntime.stageEl;
  if (!stage) return;
  // Try to consume a material first (from expeditions inventory) — makes structure richer
  let usedMaterial = null;
  if (window.data && data.materials) {
    const owned = Object.keys(data.materials).filter(k => data.materials[k] > 0);
    if (owned.length > 0) {
      const pick = owned[Math.floor(Math.random() * owned.length)];
      data.materials[pick]--;
      if (data.materials[pick] <= 0) delete data.materials[pick];
      usedMaterial = pick;
      if (typeof saveData === 'function') saveData();
    }
  }

  const struct = catPick(CAT_STRUCTURES);
  const w = stage.clientWidth || 600;
  const h = stage.clientHeight || 320;
  const x = Math.max(10, Math.min(w - 40, cat.x + 40));
  const y = Math.max(10, Math.min(h - 40, cat.y + 10));

  const el = document.createElement('div');
  el.className = 'cat-structure';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.title = struct.name + ' (' + struct.desc + ') — built by #' + cat.id +
             (usedMaterial ? ' using ' + usedMaterial : '');
  el.innerHTML =
    '<div class="cat-structure-icon">' + struct.label + '</div>' +
    '<div class="cat-structure-name">' + struct.name + '</div>';
  stage.appendChild(el);
  catRuntime.structures.push({ ...struct, x, y, builtBy: cat.id, el });

  cat.buildCooldown = 60 * 8; // cat won't build again for ~8 min
  setCatBubble(cat, '建築完了！ · ¡listo!', 2600);
  catLog('🏗️ #' + cat.id + ' built ' + struct.label + ' ' + struct.name +
         (usedMaterial ? ' (used 1 ' + usedMaterial + ')' : ''));
}

function catDropMaterial(cat) {
  const stage = catRuntime.stageEl;
  if (!stage) return;

  // 50/50: drop an expedition MATERIAL (if MATERIALS defined) or a cat ingredient
  let kind, id, emoji, name;
  if (Math.random() < 0.5 && typeof MATERIALS !== 'undefined' && MATERIALS && MATERIALS.length) {
    const m = MATERIALS[Math.floor(Math.random() * Math.min(8, MATERIALS.length))]; // bias toward common
    kind = 'material'; id = m.id; emoji = m.emoji; name = m.name;
  } else {
    const ing = catPick(CAT_INGREDIENTS);
    kind = 'ingredient'; id = ing.id; emoji = ing.emoji; name = ing.name;
  }

  const el = document.createElement('div');
  el.className = 'cat-drop';
  el.style.left = Math.max(4, cat.x + 10) + 'px';
  el.style.top  = Math.max(4, cat.y + 40) + 'px';
  el.textContent = emoji;
  el.title = 'Click to pick up: ' + name;
  el.addEventListener('click', () => pickupDrop({ kind, id, name, emoji, el }));
  stage.appendChild(el);
  catRuntime.drops.push({ kind, id, emoji, name, el });
  catLog('🎁 #' + cat.id + ' dropped ' + emoji + ' ' + name + ' (click to grab)');
}

function pickupDrop(drop) {
  if (drop.el && drop.el.parentNode) drop.el.parentNode.removeChild(drop.el);
  catRuntime.drops = catRuntime.drops.filter(d => d.el !== drop.el);

  if (drop.kind === 'material') {
    if (!window.data) return;
    if (!data.materials) data.materials = {};
    data.materials[drop.id] = (data.materials[drop.id] || 0) + 1;
    if (typeof saveData === 'function') saveData();
    catLog('＋1 ' + drop.emoji + ' ' + drop.name + ' (→ materials)');
  } else {
    const cd = getCatData();
    if (!cd.ingredients) cd.ingredients = {};
    cd.ingredients[drop.id] = (cd.ingredients[drop.id] || 0) + 1;
    saveData();
    catLog('＋1 ' + drop.emoji + ' ' + drop.name + ' (→ cat pantry)');
  }
  if (typeof renderCatCollection === 'function') renderCatCollection();
}

function catSummonChimera(cat) {
  // If the expedition catching system exists, grant a random chimera encounter
  let chimera = null;
  if (typeof CHIMERAS !== 'undefined' && CHIMERAS && CHIMERAS.length) {
    chimera = CHIMERAS[Math.floor(Math.random() * CHIMERAS.length)];
  }
  if (!chimera) return;

  // Small chance to actually add it to caughtChimeras (only for mystic/sage)
  const p = cat.personality;
  const magical = p && (p.id === 'mystic' || p.id === 'sage' || p.id === 'king');
  if (magical && Math.random() < 0.4 && typeof CHIMERA_PERSONALITIES !== 'undefined') {
    try {
      if (!data.caughtChimeras) data.caughtChimeras = [];
      const perso = CHIMERA_PERSONALITIES[Math.floor(Math.random() * CHIMERA_PERSONALITIES.length)];
      data.caughtChimeras.push({
        id: chimera.id,
        name: chimera.name,
        emoji: chimera.emoji,
        tier: chimera.tier,
        nickname: null,
        caughtDate: new Date().toISOString(),
        personality: perso,
      });
      if (typeof saveData === 'function') saveData();
      catLog('✨ #' + cat.id + ' summoned ' + chimera.emoji + ' ' + chimera.name + ' (+1 to your chimera inventory)');
    } catch (e) {
      console.error('chimera summon failed', e);
    }
  } else {
    // Visual-only — a ghostly chimera sigil blips on the stage briefly
    const stage = catRuntime.stageEl;
    if (!stage) return;
    const el = document.createElement('div');
    el.className = 'cat-chimera-blip';
    el.style.left = Math.max(10, cat.x - 10) + 'px';
    el.style.top  = Math.max(10, cat.y - 30) + 'px';
    el.textContent = chimera.emoji;
    stage.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1800);
    catLog('👻 #' + cat.id + ' glimpses ' + chimera.emoji + ' ' + chimera.name);
  }
}

function catMate(a, b) {
  const stage = catRuntime.stageEl;
  if (!stage) return;
  // Hearts effect
  for (let i = 0; i < 6; i++) {
    const h = document.createElement('div');
    h.className = 'cat-heart';
    h.textContent = ['💕','💗','♡','❤','💞'][Math.floor(Math.random() * 5)];
    h.style.left = ((a.x + b.x) / 2 + (Math.random() - 0.5) * 40) + 'px';
    h.style.top  = ((a.y + b.y) / 2 - 10 - i * 6) + 'px';
    stage.appendChild(h);
    setTimeout(() => { if (h.parentNode) h.parentNode.removeChild(h); }, 2200 + i * 80);
  }

  // Blend traits: child inherits one parent's face, the other's kanji, blended color,
  // and a personality from either parent (slight lean toward 'kitten' naturally).
  const mom = Math.random() < 0.5 ? a : b;
  const dad = (mom === a) ? b : a;
  const childPerso = Math.random() < 0.30
    ? personalityById('kitten')
    : (Math.random() < 0.5 ? mom.personality : dad.personality);
  const x = (a.x + b.x) / 2;
  const y = (a.y + b.y) / 2 + 20;
  const child = makeCatEntity({
    forceLucky: false,
    personality: childPerso || personalityById('kitten'),
    x, y,
    isKitten: true,
    parents: [a.id, b.id],
  });
  if (child) {
    catLog('💕 #' + a.id + ' × #' + b.id + ' → kitten #' + child.id +
           ' (' + (child.personality ? child.personality.jp : '?') + ')');
  }
}

// ===== CHIMERA BOSS BATTLES =====
// Every ~hour a giant chimera descends on the stage. Roaming cats that bounce
// into it deal damage on contact. Lucky / samurai / king cats hit harder.
const CAT_BOSS_INTERVAL_MS = 60 * 60 * 1000;     // 1 hour
const CAT_BOSS_GRACE_MS    = 30 * 60 * 1000;     // first boss appears 30 min after cats tab opens (cozy)
const CAT_BOSS_MAX_LIFE_MS = 45 * 60 * 1000;     // boss gives up & flees after 45 min

// --- persistent boss schedule anchor ---
function getBossSchedule() {
  const cd = getCatData();
  if (!cd.bossSchedule) {
    cd.bossSchedule = {
      firstInitMs: Date.now(),
      nextBossAtMs: Date.now() + CAT_BOSS_GRACE_MS,
      defeated: 0,
      fled: 0,
    };
    saveData();
  }
  return cd.bossSchedule;
}

function maybeSpawnChimeraBoss() {
  const stage = catRuntime.stageEl;
  if (!stage) return;
  if (catRuntime.boss) return;
  const sched = getBossSchedule();
  if (Date.now() < sched.nextBossAtMs) return;
  spawnChimeraBoss();
}

function pickBossChimera() {
  if (typeof CHIMERAS !== 'undefined' && CHIMERAS && CHIMERAS.length) {
    // Favor uncommon+ tiers so bosses feel meaningful
    const pool = CHIMERAS.filter(c => c.tier !== 'Common');
    const arr = pool.length ? pool : CHIMERAS;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  // Fallback if expeditions.js wasn't loaded for some reason
  return { id: 'voidcat', name: 'Voidcat',  emoji: '🐲', tier: 'Rare' };
}

function spawnChimeraBoss() {
  const stage = catRuntime.stageEl;
  if (!stage) return;
  const chimera = pickBossChimera();
  const sched = getBossSchedule();

  // Scale HP by number already defeated so it ramps
  const tierMul = { 'Common': 0.8, 'Uncommon': 1.0, 'Rare': 1.4, 'Epic': 1.9, 'Legendary': 2.6 };
  const baseHp = 120;
  const mult = tierMul[chimera.tier] || 1;
  const hp = Math.round((baseHp + sched.defeated * 20) * mult);

  const w = stage.clientWidth || 600;
  const h = stage.clientHeight || 320;
  const x = w / 2 - 30;
  const y = 24;

  const el = document.createElement('div');
  el.className = 'cat-boss cat-boss-' + (chimera.tier || 'Common').toLowerCase();
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.innerHTML =
    '<div class="cat-boss-hpbar"><div class="cat-boss-hpfill" style="width:100%"></div></div>' +
    '<div class="cat-boss-emoji">' + chimera.emoji + '</div>' +
    '<div class="cat-boss-name">' + (chimera.name || '???') +
      ' <span class="cat-boss-tier">' + (chimera.tier || '') + '</span></div>';
  stage.appendChild(el);

  catRuntime.boss = {
    chimera,
    hp,
    hpMax: hp,
    x, y,
    w: 84, // collision box
    h: 84,
    el,
    spawnMs: performance.now(),
    lastHitById: {},  // throttle per-cat hit cadence
  };
  updateBossChip();
  catLog('⚔️ BOSS APPEARS: ' + chimera.emoji + ' ' + chimera.name +
         ' (' + chimera.tier + ') · HP ' + hp);
}

function updateBossChip() {
  const chip = document.getElementById('cat-boss-chip');
  if (!chip) return;
  const b = catRuntime.boss;
  if (!b) {
    chip.style.display = 'none';
    const sched = getBossSchedule();
    const mins = Math.max(0, Math.ceil((sched.nextBossAtMs - Date.now()) / 60000));
    chip.title = 'Next boss in ~' + mins + ' min';
    return;
  }
  chip.style.display = 'inline-block';
  chip.textContent = '⚔️ ' + b.chimera.emoji + ' ' + b.chimera.name + ' · ' + b.hp + '/' + b.hpMax + ' HP';
}

function damageBoss(amount, byCat) {
  const b = catRuntime.boss;
  if (!b) return;
  b.hp = Math.max(0, b.hp - amount);
  const fill = b.el.querySelector('.cat-boss-hpfill');
  if (fill) fill.style.width = (100 * b.hp / b.hpMax).toFixed(1) + '%';
  // flash
  b.el.classList.add('cat-boss-hit');
  setTimeout(() => b.el && b.el.classList.remove('cat-boss-hit'), 120);
  updateBossChip();
  if (b.hp <= 0) defeatBoss(byCat);
}

function defeatBoss(byCat) {
  const b = catRuntime.boss;
  if (!b) return;
  const chimera = b.chimera;
  const sched = getBossSchedule();
  sched.defeated++;
  sched.nextBossAtMs = Date.now() + CAT_BOSS_INTERVAL_MS;

  // Reward MoeBucks
  const tierReward = { 'Common': 25, 'Uncommon': 35, 'Rare': 50, 'Epic': 75, 'Legendary': 120 };
  const reward = tierReward[chimera.tier] || 30;
  if (typeof getSlotData === 'function') {
    const sd = getSlotData();
    sd.moeBucks = (sd.moeBucks || 0) + reward;
    if (typeof updateSlotMoneyDisplay === 'function') updateSlotMoneyDisplay();
  }

  // Add the chimera to the catch inventory (a rare pity guarantee)
  try {
    if (typeof CHIMERA_PERSONALITIES !== 'undefined') {
      if (!data.caughtChimeras) data.caughtChimeras = [];
      const perso = CHIMERA_PERSONALITIES[Math.floor(Math.random() * CHIMERA_PERSONALITIES.length)];
      data.caughtChimeras.push({
        id: chimera.id,
        name: chimera.name,
        emoji: chimera.emoji,
        tier: chimera.tier,
        nickname: null,
        caughtDate: new Date().toISOString(),
        personality: perso,
        defeatedAs: 'boss',
      });
    }
  } catch (e) { console.error('chimera boss reward failed', e); }
  saveData();

  // Visual: explosion of sparks, boss fades
  const stage = catRuntime.stageEl;
  if (stage) {
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('div');
      s.className = 'cat-spark';
      s.textContent = ['✦','✧','⋆','✨','💥'][Math.floor(Math.random() * 5)];
      s.style.left = (b.x + 30 + (Math.random() - 0.5) * 60) + 'px';
      s.style.top = (b.y + 30 + (Math.random() - 0.5) * 60) + 'px';
      stage.appendChild(s);
      setTimeout(() => { if (s.parentNode) s.parentNode.removeChild(s); }, 1600);
    }
  }
  if (b.el && b.el.parentNode) b.el.parentNode.removeChild(b.el);
  catRuntime.boss = null;
  updateBossChip();
  catLog('🏆 Boss defeated by #' + (byCat ? byCat.id : '?') + ' → +' + reward +
         ' MB + ' + chimera.emoji + ' ' + chimera.name + ' to inventory');
}

function boredBossFlees() {
  const b = catRuntime.boss;
  if (!b) return;
  const sched = getBossSchedule();
  sched.fled = (sched.fled || 0) + 1;
  sched.nextBossAtMs = Date.now() + CAT_BOSS_INTERVAL_MS;
  saveData();
  if (b.el && b.el.parentNode) b.el.parentNode.removeChild(b.el);
  catLog('💨 ' + b.chimera.emoji + ' ' + b.chimera.name + ' grew bored and vanished');
  catRuntime.boss = null;
  updateBossChip();
}

// Called each tick with the cat list — deals damage on bounce / collision
function tickBossCollision(now) {
  const b = catRuntime.boss;
  if (!b) return;
  // Give up if it's been sitting untouched too long
  if (now - b.spawnMs > CAT_BOSS_MAX_LIFE_MS) { boredBossFlees(); return; }

  // Track AABB
  const bx1 = b.x, by1 = b.y, bx2 = b.x + b.w, by2 = b.y + b.h;
  catRuntime.roaming.forEach(c => {
    const cx1 = c.x, cy1 = c.y, cx2 = c.x + 60, cy2 = c.y + 50;
    const overlap = (cx1 < bx2) && (cx2 > bx1) && (cy1 < by2) && (cy2 > by1);
    if (!overlap) return;

    // Throttle: one hit per cat per ~500ms
    const last = b.lastHitById[c.id] || 0;
    if (now - last < 500) {
      // still bounce the cat off
      c.vx = -c.vx;
      c.vy = -c.vy;
      return;
    }
    b.lastHitById[c.id] = now;

    // Damage scales with speed + personality + lucky
    const speed = Math.hypot(c.vx, c.vy);
    let dmg = Math.round(3 + speed * 4);
    if (c.lucky) dmg *= 2;
    if (c.personality) {
      if (c.personality.id === 'samurai') dmg *= 3;
      if (c.personality.id === 'king')    dmg *= 2;
      if (c.personality.id === 'adventurer') dmg = Math.round(dmg * 1.5);
      if (c.personality.id === 'sloth' || c.personality.id === 'kitten') dmg = Math.max(1, Math.round(dmg * 0.5));
    }
    damageBoss(dmg, c);

    // bounce the cat away from boss
    const cxC = c.x + 30, cyC = c.y + 25;
    const bxC = b.x + b.w / 2, byC = b.y + b.h / 2;
    const dx = cxC - bxC, dy = cyC - byC;
    const d = Math.hypot(dx, dy) || 1;
    const bounce = 0.8 + speed * 0.4;
    c.vx = (dx / d) * bounce * (1 + Math.random() * 0.4);
    c.vy = (dy / d) * bounce * (1 + Math.random() * 0.4);

    // tiny damage number floater
    const stage = catRuntime.stageEl;
    if (stage) {
      const t = document.createElement('div');
      t.className = 'cat-dmg-num';
      t.textContent = '-' + dmg;
      t.style.left = (b.x + b.w / 2 - 10) + 'px';
      t.style.top  = (b.y + b.h / 2 - 10) + 'px';
      stage.appendChild(t);
      setTimeout(() => { if (t.parentNode) t.parentNode.removeChild(t); }, 700);
    }
  });
}

// ---------- CLICK HANDLERS ----------
function onCatClick(cat) {
  if (catRuntime.dialogOpen) return;
  if (cat.lucky) {
    openLuckyDialog(cat);
  } else {
    // Normal cats just give a small peek — display their entry in a flash
    flashCatInfo(cat);
  }
}

function flashCatInfo(cat) {
  const flash = document.getElementById('cat-flash');
  if (!flash) return;
  const hint = cat.personality ? cat.personality.hint : '';
  const jobStr = cat.job ? ' · 職: ' + cat.job.emoji + ' ' + cat.job.jp : '';
  flash.innerHTML = '<span style="color:' + cat.color + '">' + cat.face + '</span> ' +
                    '<b>#' + cat.id + '</b> · ' + cat.kanji + jobStr +
                    ' <span style="color:rgba(255,255,255,0.55);font-size:0.72rem;margin-left:6px;">(' + hint + ')</span>';
  flash.style.opacity = '1';
  clearTimeout(flash._t);
  flash._t = setTimeout(() => { flash.style.opacity = '0.3'; }, 2200);
}

function openLuckyDialog(cat) {
  catRuntime.dialogOpen = true;
  const cd = getCatData();
  const useJP = cd.lastLang === 'es' ? true : (cd.lastLang === 'jp' ? false : Math.random() < 0.5);
  const pool = useJP ? LUCKY_DIALOGS_JP : LUCKY_DIALOGS_ES;
  const dlg = pool[Math.floor(Math.random() * pool.length)];
  cd.lastLang = useJP ? 'jp' : 'es';

  // Scramble answer order
  const options = [dlg.correct, dlg.wrong[0], dlg.wrong[1]].sort(() => Math.random() - 0.5);

  const modal = document.getElementById('cat-dialog');
  if (!modal) { catRuntime.dialogOpen = false; return; }
  modal.style.display = 'flex';
  modal.innerHTML =
    '<div class="cat-dialog-inner">' +
      '<div class="cat-dialog-face" style="color:' + cat.color + ';">' + cat.face + '</div>' +
      '<div class="cat-dialog-kanji" style="color:' + cat.color + ';">' + cat.kanji + '</div>' +
      '<div class="cat-dialog-tag">' + (useJP ? '幸運猫 · Lucky Cat' : 'Gato de la Suerte') + ' · #' + cat.id + '</div>' +
      '<div class="cat-dialog-prompt">' + dlg.prompt + '</div>' +
      '<div class="cat-dialog-options">' +
        options.map(o => '<button class="cat-dialog-btn" data-answer="' + o + '">' + o + '</button>').join('') +
      '</div>' +
    '</div>';

  modal.querySelectorAll('.cat-dialog-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ans = btn.dataset.answer;
      if (ans === dlg.correct) {
        captureCat(cat, useJP ? 'jp' : 'es');
      } else {
        escapeCat(cat);
      }
    });
  });
}

function closeCatDialog() {
  const modal = document.getElementById('cat-dialog');
  if (modal) { modal.style.display = 'none'; modal.innerHTML = ''; }
  catRuntime.dialogOpen = false;
}

function captureCat(cat, lang) {
  const cd = getCatData();
  const personaId = cat.personality ? cat.personality.id : null;
  cd.collection.push({
    id: cat.id,
    face: cat.face,
    kanji: cat.kanji,
    color: cat.color,
    lucky: true,
    lang: lang,
    capturedAt: Date.now(),
    personality: personaId,           // reveal secret trait on capture
    jobWhenCaught: cat.job ? cat.job.id : null,
    parents: cat.parents || null,
  });
  // Track discovered personalities for "dex"-style completion
  if (personaId) {
    if (!Array.isArray(cd.discoveredPersonalities)) cd.discoveredPersonalities = [];
    if (!cd.discoveredPersonalities.includes(personaId)) cd.discoveredPersonalities.push(personaId);
  }
  cd.totalCaptured++;

  // MoeBucks reward for capturing a lucky cat
  if (typeof getSlotData === 'function') {
    const sd = getSlotData();
    sd.moeBucks += 15;
    if (typeof updateSlotMoneyDisplay === 'function') updateSlotMoneyDisplay();
  }

  saveData();

  // Celebrate
  const modal = document.getElementById('cat-dialog');
  if (modal) {
    modal.innerHTML =
      '<div class="cat-dialog-inner cat-dialog-win">' +
        '<div class="cat-dialog-face" style="color:' + cat.color + ';">' + cat.face + '</div>' +
        '<div class="cat-dialog-kanji" style="color:' + cat.color + ';">' + cat.kanji + '</div>' +
        '<div class="cat-dialog-prompt">' +
          (lang === 'jp' ? '仲間になった！ +15 MB' : '¡Se unió a tu colección! +15 MB') +
        '</div>' +
        '<button class="cat-dialog-btn" id="cat-dialog-close">OK</button>' +
      '</div>';
    const btn = document.getElementById('cat-dialog-close');
    if (btn) btn.addEventListener('click', closeCatDialog);
  }

  // Remove from roaming
  if (cat.el && cat.el.parentNode) cat.el.parentNode.removeChild(cat.el);
  catRuntime.roaming = catRuntime.roaming.filter(c => c.id !== cat.id);

  renderCatCollection();
  updateCatHud();
}

function escapeCat(cat) {
  const modal = document.getElementById('cat-dialog');
  if (modal) {
    modal.innerHTML =
      '<div class="cat-dialog-inner cat-dialog-lose">' +
        '<div class="cat-dialog-face" style="color:#888;">' + cat.face + '</div>' +
        '<div class="cat-dialog-prompt">逃げた · ¡Se fue corriendo!</div>' +
        '<button class="cat-dialog-btn" id="cat-dialog-close">…</button>' +
      '</div>';
    const btn = document.getElementById('cat-dialog-close');
    if (btn) btn.addEventListener('click', closeCatDialog);
  }
  // Cat bolts off-stage
  if (cat.el && cat.el.parentNode) cat.el.parentNode.removeChild(cat.el);
  catRuntime.roaming = catRuntime.roaming.filter(c => c.id !== cat.id);
  updateCatHud();
}

// ---------- HUD / COLLECTION ----------
function updateCatHud() {
  const cd = getCatData();
  if (catRuntime.countEl) {
    catRuntime.countEl.textContent =
      'Roaming: ' + catRuntime.roaming.length +
      ' · Next ID: ' + catRuntime.nextId +
      ' · Collected: ' + cd.collection.length;
  }
}

function renderCatCollection() {
  const host = document.getElementById('cat-collection');
  if (!host) return;
  const cd = getCatData();
  if (cd.collection.length === 0) {
    host.innerHTML = '<div style="padding:20px;text-align:center;color:rgba(255,255,255,0.4);font-size:0.85rem;">' +
                     'No cats collected yet. Catch a LUCKY cat to start your collection.' +
                     '</div>';
    return;
  }
  // Group by face+kanji+color signature
  const groups = {};
  cd.collection.forEach(c => {
    const key = c.face + '|' + c.kanji + '|' + c.color;
    if (!groups[key]) groups[key] = { ...c, count: 0 };
    groups[key].count++;
  });
  const entries = Object.values(groups).sort((a, b) => b.count - a.count);
  host.innerHTML = entries.map(c => {
    const p = c.personality ? personalityById(c.personality) : null;
    const personaChip = p
      ? '<div class="cat-collect-persona"' + (p.secret ? ' data-secret="1"' : '') + '>' +
          p.jp + (p.secret ? ' ✦' : '') +
        '</div>'
      : '';
    return '<div class="cat-collect-card">' +
      '<div class="cat-collect-face" style="color:' + c.color + '">' + c.face + '</div>' +
      '<div class="cat-collect-kanji" style="color:' + c.color + '">' + c.kanji + '</div>' +
      personaChip +
      (c.count > 1 ? '<div class="cat-collect-count">×' + c.count + '</div>' : '') +
      '<div class="cat-collect-lang">' + (c.lang === 'jp' ? '日' : 'ES') + '</div>' +
    '</div>';
  }).join('');
}

// ---------- TAB RENDER ----------
function renderCatsTab() {
  const host = document.getElementById('tab-cats');
  if (!host) return;
  // Only build once — subsequent enters just refresh HUD, collection, and reapply layout
  if (host.dataset.built === '1') {
    updateCatHud();
    renderCatCollection();
    applyWeekdayLayout();  // day may have changed since last visit
    ensureCatSpawner();
    return;
  }
  host.dataset.built = '1';

  host.innerHTML =
    '<div class="glass-dark" style="padding:22px;">' +
      '<h3 style="font-family:\'Baloo 2\', cursive;color:#fff;margin-bottom:4px;font-size:1.4rem;">' +
        '🐈 ASCII Cats · 虚数猫計画' +
      '</h3>' +
      '<p style="color:rgba(255,255,255,0.5);font-size:0.75rem;margin-bottom:10px;">' +
        'A new cat appears every few minutes. Pomodoro sessions also summon them. ' +
        'Catch a ✧LUCKY✧ cat by answering it right. Each cat secretly has a personality — ' +
        'some build things, chat, take pretend jobs, summon chimeras, or (very rarely) mate.' +
      '</p>' +

      '<div class="cat-weekday-banner">' +
        '<span class="cat-weekday-label-chip" id="cat-weekday-label">—</span>' +
        '<span class="cat-weekday-subtitle">曜日で風景が変わる · the stage shifts with the day</span>' +
      '</div>' +

      '<div class="cat-hud" id="cat-hud-row">' +
        '<span id="cat-hud-count">Roaming: 0 · Next ID: 1 · Collected: 0</span>' +
        '<span id="cat-flash" style="opacity:0.3;transition:opacity 0.3s;font-size:0.8rem;"></span>' +
        '<span id="cat-boss-chip" class="cat-boss-chip" style="display:none;"></span>' +
        '<button class="cat-btn" id="cat-btn-layout">↻ Reroll layout</button>' +
      '</div>' +

      '<div class="cat-stage-wrap">' +
        '<div id="cat-stage" class="cat-stage">' +
          '<div id="cat-stage-bg" class="cat-stage-bg"></div>' +
        '</div>' +
      '</div>' +

      '<div class="cat-columns">' +
        '<div class="cat-col-left">' +
          '<h4 class="cat-collect-title">Collection · 収集</h4>' +
          '<div id="cat-collection" class="cat-collection-grid"></div>' +
        '</div>' +
        '<div class="cat-col-right">' +
          '<h4 class="cat-collect-title">Event log · 猫日記</h4>' +
          '<pre id="cat-log" class="cat-log custom-scrollbar"></pre>' +
        '</div>' +
      '</div>' +

      '<div id="cat-dialog" class="cat-dialog-backdrop"></div>' +
    '</div>';

  catRuntime.stageEl = document.getElementById('cat-stage');
  catRuntime.countEl = document.getElementById('cat-hud-count');
  catRuntime.bgCharsEl = document.getElementById('cat-stage-bg');
  catRuntime.logEl = document.getElementById('cat-log');

  applyWeekdayLayout();

  const layoutBtn = document.getElementById('cat-btn-layout');
  if (layoutBtn) layoutBtn.addEventListener('click', () => applyWeekdayLayout());

  renderCatCollection();
  updateCatHud();
  ensureCatSpawner();

  // Seed: two cats on first entry per load, so the stage isn't empty
  if (catRuntime.roaming.length === 0) {
    makeCatEntity({ forceLucky: false });
    makeCatEntity({ forceLucky: false });
  }
}

// ---------- SPAWNER / LIFECYCLE ----------
function ensureCatSpawner() {
  if (!catRuntime.spawnInterval) {
    catRuntime.spawnInterval = setInterval(() => {
      // Only spawn while the cats tab is the active one OR the stage is mounted
      const tab = document.getElementById('tab-cats');
      if (!tab || !catRuntime.stageEl) return;
      makeCatEntity();
    }, CAT_SPAWN_MS);
  }
  // Boss watcher ticks every 60s — cheap
  if (!catRuntime.bossInterval) {
    catRuntime.bossInterval = setInterval(() => {
      if (!catRuntime.stageEl) return;
      maybeSpawnChimeraBoss();
      updateBossChip();
    }, 60 * 1000);
  }
  // Initialize the boss chip with the next-boss countdown immediately
  getBossSchedule();
  updateBossChip();
  if (!catRuntime.animFrame) {
    catRuntime.animFrame = requestAnimationFrame(catAnimateTick);
  }
}

// ---------- POMODORO HOOK ----------
// Exposed globally so pomodoro.js can ping us on session complete.
// One-line addition in pomodoro.js → see instructions.
window.onPomodoroWorkComplete = function () {
  // Always spawn on a pomodoro finish — bonus cat, even if tab not open.
  // (If stage not mounted yet, nextId still advances; when user opens tab
  // it'll seed fresh. We only attempt DOM spawn if stage is live.)
  if (catRuntime.stageEl) {
    // Pomodoro-spawned cat has a slightly higher lucky chance (12%).
    const forceLucky = Math.random() < 0.12;
    makeCatEntity({ forceLucky });
  } else {
    // Still advance the ID and roll lifetime stat so captures feel earned later
    getCatData().totalSpawnedEver++;
    catRuntime.nextId++;
    saveData();
  }
};

// ---------- INIT ----------
// Lazy-init when the tab is first shown (see script.js hook).
// The spawner starts only once the stage is mounted.
