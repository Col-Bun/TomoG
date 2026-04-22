// ===== AUTO-TAGGER =====
// 『自動分類』 Given a dictionary entry {en, jp, es}, returns the preset-category
// tags that match its meaning. Used by addWord(), the Anki importer, and the
// bundled deck installer so the RPG's room-theming system can pick real themes
// without the user hand-tagging every entry.
//
// Strategy: per-tag keyword matcher over the combined text of the three
// languages. A match is a whole-word hit (word boundaries on the English
// side, substring elsewhere to cope with Japanese / inflections).
// Order is: check every tag, allow multiple matches, return unique list.

const AUTO_TAG_RULES = {
  // ---------- PLACE ----------
  'kitchen':    ['kitchen','cook','cooking','stove','oven','pantry','counter','chef','chopping','cocina','台所','厨房','キッチン'],
  'bedroom':    ['bedroom','bed','mattress','pillow','blanket','sheet','pajama','comforter','dormitorio','recámara','寝室','ベッド','布団'],
  'bathroom':   ['bathroom','shower','toilet','bathtub','bath','lavatory','restroom','baño','ducha','風呂','浴室','トイレ'],
  'livingroom': ['living room','livingroom','lounge','sofa','couch','parlour','sala','salón','居間','リビング'],
  'garden':     ['garden','backyard','yard','lawn','patio','jardín','庭','園'],
  'school':     ['school','classroom','lecture','student','teacher','academy','university','college','escuela','colegio','学校','教室','大学'],
  'office':     ['office','desk','workplace','cubicle','oficina','despacho','事務所','会社','オフィス'],
  'shop':       ['shop','store','market','boutique','mall','supermarket','shopkeeper','tienda','mercado','店','商店','スーパー'],
  'street':     ['street','road','avenue','sidewalk','alley','highway','lane','calle','avenida','道','通り','街'],
  'park':       ['park','playground','plaza','parque','公園','広場'],
  'temple':     ['temple','shrine','church','chapel','cathedral','mosque','templo','iglesia','santuario','寺','神社','教会'],
  'beach':      ['beach','coast','seaside','shore','playa','costa','海岸','浜','ビーチ'],
  'mountain':   ['mountain','hill','peak','summit','cliff','montaña','monte','山','岳','丘'],
  'forest':     ['forest','woods','jungle','grove','bosque','selva','森','林','ジャングル'],
  'river':      ['river','stream','creek','brook','río','arroyo','川','河'],
  'cafe':       ['cafe','café','coffeehouse','tea house','teahouse','cafetería','喫茶店','カフェ'],
  'station':    ['station','platform','terminal','depot','estación','駅','ホーム'],
  'library':    ['library','archive','biblioteca','図書館'],
  // ---------- NATURE ----------
  'plant':      ['plant','herb','moss','fern','vine','botanical','planta','hierba','植物','草木'],
  'flower':     ['flower','blossom','bloom','petal','bouquet','flor','ramo','花','華','蕾'],
  'tree':       ['tree','forest','trunk','branch','árbol','tronco','木','樹','枝'],
  'animal':     ['animal','beast','cat','dog','horse','cow','pig','sheep','rabbit','mouse','wolf','fox','deer','bear','lion','tiger','monkey','elephant','creature','mammal','猫','犬','馬','牛','豚','羊','兎','鼠','狼','狐','鹿','熊','獣','動物','gato','perro','caballo','vaca','cerdo','oveja','conejo','rat','ratón','lobo','zorro','ciervo','oso'],
  'bird':       ['bird','hawk','sparrow','crow','owl','eagle','pigeon','swallow','鳥','雀','烏','鷹','梟','ave','pájaro','águila','cuervo','búho','gorrión'],
  'fish':       ['fish','salmon','tuna','shark','whale','dolphin','squid','octopus','eel','shrimp','魚','鮭','鮪','鯨','鮫','蛸','烏賊','蝦','pez','pescado','atún','salmón','tiburón','ballena','pulpo'],
  'insect':     ['insect','bug','beetle','butterfly','bee','ant','spider','cicada','moth','mosquito','fly','虫','蝶','蜂','蟻','蜘蛛','蝉','蛾','蚊','蠅','insecto','abeja','hormiga','araña','mariposa','mosquito'],
  'weather':    ['weather','rain','snow','storm','thunder','lightning','wind','cloud','fog','mist','drizzle','tiempo','clima','lluvia','nieve','tormenta','trueno','relámpago','niebla','neblina','雨','雪','嵐','雷','雲','霧','天気'],
  'sky':        ['sky','heaven','celestial','cosmic','universe','galaxy','star','moon','sun','cielo','estrella','luna','sol','universo','galaxia','空','天','星','月','太陽','宇宙'],
  'stone':      ['stone','rock','boulder','pebble','gem','mineral','jewel','piedra','roca','gema','joya','石','岩','宝石','鉱物'],
  'water':      ['water','liquid','ocean','sea','lake','pond','pool','wave','tide','agua','líquido','océano','mar','lago','ola','marea','水','液','海','湖','池','波'],
  'fire':       ['fire','flame','ember','blaze','burn','spark','torch','fuego','llama','brasa','quemar','antorcha','火','炎','焔','焚'],
  'wind':       ['wind','breeze','gale','gust','viento','brisa','ráfaga','風','暴風','そよ風'],
  'earth':      ['earth','ground','soil','dirt','mud','dust','tierra','suelo','polvo','lodo','土','地','泥','砂','埃'],
  // ---------- FOOD ----------
  'food':       ['food','meal','dish','cuisine','dinner','lunch','breakfast','snack','comida','almuerzo','cena','desayuno','食事','料理','食'],
  'drink':      ['drink','beverage','juice','milk','tea','coffee','water','soda','wine','beer','sake','bebida','jugo','leche','té','café','vino','cerveza','飲','酒','茶','コーヒー','ジュース'],
  'fruit':      ['fruit','apple','orange','banana','strawberry','grape','peach','cherry','pear','melon','lemon','lime','fresa','manzana','naranja','plátano','uva','melocotón','cereza','pera','melón','limón','果物','林檎','蜜柑','苺','葡萄','桃','梨','西瓜','檸檬'],
  'vegetable':  ['vegetable','veggie','carrot','onion','potato','tomato','cabbage','lettuce','cucumber','spinach','verdura','vegetal','zanahoria','cebolla','papa','patata','tomate','lechuga','pepino','野菜','人参','玉葱','じゃが芋','トマト','キャベツ','胡瓜','ほうれん草'],
  'sweet':      ['sweet','candy','sugar','chocolate','cake','dessert','pastry','pie','cookie','caramel','dulce','azúcar','torta','pastel','postre','galleta','甘','砂糖','菓子','ケーキ','チョコ','デザート'],
  'meat':       ['meat','beef','pork','chicken','lamb','fish','bacon','sausage','ham','steak','carne','res','cerdo','pollo','cordero','tocino','salchicha','jamón','bistec','肉','牛肉','豚肉','鶏肉','ハム','ベーコン'],
  'grain':      ['grain','rice','bread','wheat','cereal','noodle','pasta','barley','flour','arroz','pan','trigo','cebada','fideo','harina','米','飯','麦','麺','パン','うどん','蕎麦','粉'],
  'spice':      ['spice','salt','pepper','garlic','ginger','herb','seasoning','sauce','vinegar','sal','pimienta','ajo','jengibre','condimento','salsa','vinagre','塩','胡椒','にんにく','生姜','醤油','味噌','香辛料'],
  // ---------- BODY/SELF ----------
  'body':       ['body','torso','chest','back','shoulder','waist','hip','stomach','belly','cuerpo','pecho','hombro','cintura','cadera','vientre','体','身体','胴','胸','背','肩','腰','腹'],
  'face':       ['face','eye','nose','mouth','ear','lip','cheek','forehead','chin','cara','ojo','nariz','boca','oreja','labio','mejilla','frente','barbilla','顔','目','鼻','口','耳','唇','頬','額','顎'],
  'hand':       ['hand','finger','palm','fist','wrist','thumb','mano','dedo','palma','puño','muñeca','pulgar','手','指','掌','拳','腕','親指'],
  'emotion':    ['emotion','feeling','love','hate','anger','joy','sadness','fear','happy','sad','angry','jealous','emoción','amor','odio','ira','alegría','tristeza','miedo','feliz','triste','enojado','celoso','感情','愛','憎','怒','喜','悲','恐','嫉妬','嬉','淋'],
  'feeling':    ['feeling','sensation','mood','impression','sentimiento','sensación','ánimo','impresión','気持','感じ','気分','心地'],
  'health':     ['health','medicine','hospital','doctor','nurse','disease','illness','wound','injury','salud','medicina','hospital','doctor','enfermera','enfermedad','herida','lesión','健康','医者','医学','病院','病','傷','怪我','薬','看護'],
  'mind':       ['mind','thought','thinking','memory','dream','consciousness','idea','brain','reason','mente','pensamiento','memoria','sueño','conciencia','idea','cerebro','razón','心','思','考','記憶','夢','意識','頭','脳','理性'],
  'clothing':   ['clothing','clothes','shirt','pants','trousers','jacket','coat','dress','skirt','sweater','suit','uniform','ropa','camisa','pantalón','chaqueta','abrigo','vestido','falda','suéter','traje','uniforme','服','衣','着物','シャツ','ズボン','上着','コート','ドレス','スカート'],
  'accessory':  ['accessory','bag','wallet','belt','hat','cap','glasses','scarf','ring','necklace','earring','watch','accesorio','bolso','cartera','cinturón','sombrero','gorra','gafas','bufanda','anillo','collar','pendiente','reloj','鞄','財布','帯','帽子','眼鏡','マフラー','指輪','首飾','イヤリング','時計'],
  // ---------- OBJECTS ----------
  'tool':       ['tool','hammer','screwdriver','wrench','saw','axe','instrument','utensil','herramienta','martillo','destornillador','llave','sierra','hacha','instrumento','道具','工具','金槌','鋸','斧'],
  'furniture':  ['furniture','chair','table','desk','sofa','shelf','cabinet','drawer','bookshelf','mueble','silla','mesa','escritorio','sillón','estante','armario','cajón','家具','椅子','机','卓','棚','箪笥','ソファ','本棚'],
  'container':  ['container','box','bottle','jar','can','basket','crate','bucket','bag','contenedor','caja','botella','frasco','lata','cesta','cubo','bolso','bolsa','容器','箱','瓶','壺','缶','籠','袋','樽'],
  'utensil':    ['utensil','fork','spoon','knife','chopstick','plate','bowl','cup','glass','cutlery','tenedor','cuchara','cuchillo','palillo','plato','tazón','taza','vaso','cubierto','箸','皿','茶碗','椀','碗','杯','フォーク','スプーン','ナイフ'],
  'book':       ['book','novel','textbook','manga','comic','manual','dictionary','libro','novela','cómic','manual','diccionario','本','書','本屋','小説','漫画','辞書','教科書'],
  'paper':      ['paper','letter','note','document','newspaper','magazine','envelope','papel','carta','documento','periódico','revista','sobre','紙','手紙','便箋','新聞','雑誌','封筒'],
  'technology': ['technology','computer','phone','screen','machine','device','robot','electronic','software','tecnología','computadora','teléfono','pantalla','máquina','dispositivo','electrónico','機械','機器','コンピュータ','電話','画面','ロボット','電子'],
  'vehicle':    ['vehicle','car','truck','bus','train','bike','bicycle','ship','boat','plane','airplane','subway','vehículo','coche','camión','autobús','tren','bicicleta','barco','avión','metro','車','自動車','列車','自転車','船','飛行機','地下鉄','バス'],
  'toy':        ['toy','doll','plushie','puzzle','game','juguete','muñeca','peluche','rompecabezas','juego','玩具','人形','ぬいぐるみ','おもちゃ','パズル','ゲーム'],
  // ---------- SOCIAL ----------
  'family':     ['family','mother','father','parent','brother','sister','son','daughter','uncle','aunt','cousin','grandparent','grandmother','grandfather','relative','familia','madre','padre','hermano','hermana','hijo','hija','tío','tía','primo','abuela','abuelo','pariente','家族','母','父','兄','弟','姉','妹','息子','娘','叔父','叔母','従兄','祖母','祖父','親戚'],
  'friend':     ['friend','buddy','pal','companion','classmate','amigo','compañero','colega','友達','仲間','親友','同級生','友人'],
  'profession': ['profession','job','work','career','occupation','teacher','doctor','nurse','soldier','police','farmer','merchant','artist','writer','profesión','trabajo','empleo','carrera','ocupación','maestro','doctor','soldado','policía','granjero','comerciante','artista','escritor','仕事','職業','先生','医者','看護師','兵士','警官','農家','商人','芸術家','作家'],
  'greeting':   ['hello','hi','goodbye','farewell','welcome','greet','greeting','thanks','thank','please','sorry','apology','apologize','hola','adiós','bienvenido','saludar','saludo','gracias','por favor','lo siento','disculpa','こんにちは','さよなら','ありがとう','すみません','ようこそ','お願い'],
  'question':   ['ask','question','query','inquire','inquiry','preguntar','pregunta','cuestionar','interrogar','質問','尋ね','問う'],
  // ---------- ABSTRACT ----------
  'time':       ['time','hour','minute','second','morning','noon','evening','night','today','tomorrow','yesterday','week','month','year','tiempo','hora','minuto','segundo','mañana','tarde','noche','hoy','ayer','semana','mes','año','時','分','秒','朝','昼','夕','夜','今日','明日','昨日','週','月','年','時間'],
  'season':     ['season','spring','summer','autumn','fall','winter','estación','primavera','verano','otoño','invierno','季節','春','夏','秋','冬'],
  'color':      ['color','colour','red','blue','green','yellow','black','white','pink','purple','orange','brown','gray','grey','rojo','azul','verde','amarillo','negro','blanco','rosa','morado','naranja','café','gris','色','赤','青','緑','黄','黒','白','桃','紫','橙','茶','灰'],
  'shape':      ['shape','round','square','triangle','circle','sphere','cube','line','curve','forma','redondo','cuadrado','triángulo','círculo','esfera','cubo','línea','curva','形','円','四角','三角','丸','角','球','線'],
  'size':       ['size','big','small','large','tiny','huge','enormous','minuscule','tamaño','grande','pequeño','enorme','minúsculo','大','小','巨','微','大きい','小さい'],
  'number':     ['number','count','digit','amount','quantity','one','two','three','four','five','six','seven','eight','nine','ten','hundred','thousand','million','número','cantidad','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','cien','mil','millón','数','一','二','三','四','五','六','七','八','九','十','百','千','万'],
  'direction':  ['direction','north','south','east','west','left','right','up','down','front','back','dirección','norte','sur','este','oeste','izquierda','derecha','arriba','abajo','frente','atrás','方向','北','南','東','西','左','右','上','下','前','後'],
  // ---------- ACTION ----------
  'motion':     ['walk','run','jump','move','travel','leap','sprint','crawl','climb','fly','swim','caminar','correr','saltar','mover','viajar','volar','nadar','trepar','歩','走','跳','動','飛','泳','登'],
  'cooking':    ['cook','bake','fry','boil','roast','grill','simmer','steam','chop','cocinar','hornear','freír','hervir','asar','guisar','cortar','料理','焼','煮','炒','揚','蒸','切'],
  'cleaning':   ['clean','wash','wipe','scrub','sweep','mop','dust','rinse','limpiar','lavar','barrer','fregar','enjuagar','洗','掃','拭','磨'],
  'communication': ['say','speak','talk','tell','call','shout','whisper','chat','discuss','converse','communicate','decir','hablar','llamar','gritar','susurrar','conversar','discutir','comunicar','言','話','語','叫','呼','囁','述','喋'],
  'study':      ['study','learn','read','write','memorize','practice','research','estudiar','aprender','leer','escribir','memorizar','practicar','investigar','勉強','学ぶ','読','書','覚','練習','研究'],
  'rest':       ['rest','sleep','nap','relax','repose','descansar','dormir','siesta','relajar','reposar','休','寝','眠','寛ぐ','昼寝'],
  'play':       ['play','game','fun','entertain','amuse','jugar','juego','divertir','entretener','遊','楽','娯楽'],
  'work':       ['work','labor','job','employ','task','trabajar','laborar','emplear','tarea','働','仕事','労働','職'],
  'create':     ['create','make','build','construct','craft','invent','design','produce','crear','hacer','construir','inventar','diseñar','producir','作','造','創','建','設計','発明'],
  'destroy':    ['destroy','break','smash','demolish','ruin','wreck','shatter','destruir','romper','demoler','arruinar','despedazar','壊','破','砕','滅','潰'],
  'perception': ['see','look','watch','observe','hear','listen','smell','taste','feel','touch','sense','ver','mirar','observar','oír','escuchar','oler','saborear','sentir','tocar','見','観','視','聞','嗅','味','触','感'],
};

// ---------- Pre-compile regex cache ----------
// We build per-tag matchers where Latin keywords match at word boundaries and
// non-Latin keywords (Japanese, etc.) match as substrings.
const _autoTagMatchers = {};
(function buildMatchers() {
  const isLatin = (s) => /^[A-Za-zÀ-ÿ'\s-]+$/.test(s);
  for (const [tag, kws] of Object.entries(AUTO_TAG_RULES)) {
    const latin = kws.filter(isLatin).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const nonLatin = kws.filter(k => !isLatin(k));
    // Latin → whole-word match (case-insensitive)
    const latinRe = latin.length
      ? new RegExp('\\b(' + latin.join('|') + ')\\b', 'i')
      : null;
    _autoTagMatchers[tag] = { latinRe, nonLatin };
  }
})();

// ---------- Public API ----------
function autoTagWord(word) {
  if (!word) return [];
  const en = (word.en || '').toLowerCase();
  const es = (word.es || '').toLowerCase();
  const jp = word.jp || '';
  const latinHay = en + ' | ' + es;
  const found = new Set();
  for (const [tag, m] of Object.entries(_autoTagMatchers)) {
    if (m.latinRe && m.latinRe.test(latinHay)) { found.add(tag); continue; }
    // Non-Latin: substring match on the full hay (includes jp + en + es)
    for (const kw of m.nonLatin) {
      if (jp.includes(kw) || en.includes(kw) || es.includes(kw)) {
        found.add(tag);
        break;
      }
    }
  }
  return Array.from(found);
}

// Merge auto-tags into an existing tag array without duplicates.
function mergeAutoTags(existingTags, word) {
  const tags = Array.isArray(existingTags) ? existingTags.slice() : [];
  const auto = autoTagWord(word);
  for (const t of auto) {
    if (!tags.includes(t)) tags.push(t);
  }
  return tags;
}

// Bulk-apply across the whole dictionary. Returns count of words updated.
function autoTagEntireDictionary() {
  if (!window.data || !Array.isArray(data.dictionary)) return 0;
  let changed = 0;
  for (const w of data.dictionary) {
    const before = (w.tags || []).length;
    w.tags = mergeAutoTags(w.tags, w);
    if (w.tags.length !== before) changed++;
  }
  if (changed > 0 && typeof saveData === 'function') saveData();
  if (changed > 0 && typeof renderDictionary === 'function') renderDictionary();
  console.log('[auto-tag] tagged ' + changed + ' words with category tags');
  return changed;
}

// Expose globally
window.autoTagWord = autoTagWord;
window.mergeAutoTags = mergeAutoTags;
window.autoTagEntireDictionary = autoTagEntireDictionary;
window.AUTO_TAG_RULES = AUTO_TAG_RULES;

// ---------- Auto-run on load ----------
// When the app boots, apply auto-tags to any untagged / lightly-tagged
// existing entries. Does not wipe user-added tags — just augments.
(function autoRunOnce() {
  const go = () => {
    if (typeof data === 'undefined' || !window.data) { setTimeout(go, 300); return; }
    if (window.data.autoTagVersion === 1) return;   // already ran
    // Wait for both default decks to settle so we tag their entries too
    if (!window.data.defaultDeckLoaded) { setTimeout(go, 300); return; }
    autoTagEntireDictionary();
    window.data.autoTagVersion = 1;
    if (typeof saveData === 'function') saveData();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(go, 600));
  } else {
    setTimeout(go, 600);
  }
})();
