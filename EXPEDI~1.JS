// ===== EXPEDITION & MATERIALS SYSTEM =====
// Tamagotchi-style idle system: Moe-chan goes on expeditions and collects materials
// Auto daily expedition + optional timed missions
// 20 material types with ascending rarity
// Flashcard bonus: every 10 min = +0.5x rarity multiplier
// Chimera encounter system: discover creatures during expeditions

// ===== MATERIAL DEFINITIONS (20 types, ascending rarity) =====
const MATERIALS = [
  // Common (Tier 1) - high drop rate
  { id: 'twig',         name: 'Twig',              emoji: '🪵', rarity: 1, tier: 'Common',      color: '#8B7355' },
  { id: 'pebble',       name: 'Pebble',            emoji: '🪨', rarity: 2, tier: 'Common',      color: '#A0A0A0' },
  { id: 'herb',         name: 'Wild Herb',         emoji: '🌿', rarity: 3, tier: 'Common',      color: '#6B8E23' },
  { id: 'clay',         name: 'River Clay',        emoji: '🏺', rarity: 4, tier: 'Common',      color: '#CD853F' },
  // Uncommon (Tier 2)
  { id: 'iron_ore',     name: 'Iron Ore',          emoji: '⛏️', rarity: 5, tier: 'Uncommon',    color: '#708090' },
  { id: 'feather',      name: 'Phoenix Feather',   emoji: '🪶', rarity: 6, tier: 'Uncommon',    color: '#FF6347' },
  { id: 'silk',         name: 'Spider Silk',       emoji: '🕸️', rarity: 7, tier: 'Uncommon',    color: '#E8E8E8' },
  { id: 'amber',        name: 'Amber Chunk',       emoji: '🔶', rarity: 8, tier: 'Uncommon',    color: '#FFB347' },
  // Rare (Tier 3)
  { id: 'silver',       name: 'Silver Ingot',      emoji: '🥈', rarity: 9,  tier: 'Rare',       color: '#C0C0C0' },
  { id: 'moonstone',    name: 'Moonstone',         emoji: '🌙', rarity: 10, tier: 'Rare',       color: '#B0C4DE' },
  { id: 'crystal',      name: 'Spirit Crystal',    emoji: '💎', rarity: 11, tier: 'Rare',       color: '#87CEEB' },
  { id: 'enchanted_wood', name: 'Enchanted Wood',  emoji: '🌳', rarity: 12, tier: 'Rare',       color: '#228B22' },
  // Epic (Tier 4)
  { id: 'gold',         name: 'Gold Ingot',        emoji: '🥇', rarity: 13, tier: 'Epic',       color: '#FFD700' },
  { id: 'dragon_scale', name: 'Dragon Scale',      emoji: '🐉', rarity: 14, tier: 'Epic',       color: '#DC143C' },
  { id: 'void_shard',   name: 'Void Shard',        emoji: '🔮', rarity: 15, tier: 'Epic',       color: '#9370DB' },
  { id: 'starlight',    name: 'Starlight Essence',  emoji: '✨', rarity: 16, tier: 'Epic',       color: '#FFE4B5' },
  // Legendary (Tier 5)
  { id: 'mythril',      name: 'Mythril Ore',       emoji: '💠', rarity: 17, tier: 'Legendary',  color: '#00CED1' },
  { id: 'phoenix_tear', name: 'Phoenix Tear',      emoji: '🔥', rarity: 18, tier: 'Legendary',  color: '#FF4500' },
  { id: 'celestial',    name: 'Celestial Fragment', emoji: '🌟', rarity: 19, tier: 'Legendary',  color: '#E6E6FA' },
  { id: 'philosophers',  name: "Philosopher's Stone", emoji: '⚗️', rarity: 20, tier: 'Legendary',  color: '#FF1493' },
];

const TIER_COLORS = {
  'Common':    { bg: 'rgba(139,115,85,0.2)',  border: 'rgba(139,115,85,0.4)',  text: '#C4A882' },
  'Uncommon':  { bg: 'rgba(0,200,100,0.15)',   border: 'rgba(0,200,100,0.35)', text: '#00C864' },
  'Rare':      { bg: 'rgba(0,153,255,0.15)',   border: 'rgba(0,153,255,0.35)', text: '#0099FF' },
  'Epic':      { bg: 'rgba(163,53,238,0.15)',  border: 'rgba(163,53,238,0.35)', text: '#A335EE' },
  'Legendary': { bg: 'rgba(255,128,0,0.15)',   border: 'rgba(255,128,0,0.4)',  text: '#FF8000' },
};

// ===== CHIMERA DEFINITIONS =====
// Chimeras are creatures Moe-chan can encounter during expeditions.
// Each has a unique appearance, description, habitat, and optional conditions.
// Some chimeras are secret and only appear under specific circumstances.

// ===== PERSONALITY TRAITS (randomized per encounter) =====
const CHIMERA_PERSONALITIES = [
  { trait: 'Friendly', desc: 'approaches Moe-chan with curiosity, nuzzling her hand gently.', emoji: '💛' },
  { trait: 'Shy', desc: 'peeks out from behind cover, watching Moe-chan with wide, nervous eyes before slowly creeping closer.', emoji: '💜' },
  { trait: 'Playful', desc: 'bounces around Moe-chan in circles, clearly wanting to play.', emoji: '💚' },
  { trait: 'Sleepy', desc: 'is curled up dozing and barely cracks one eye open as Moe-chan approaches.', emoji: '💙' },
  { trait: 'Mischievous', desc: 'steals something from Moe-chan\'s pack and runs off with it before dropping it and chittering with laughter.', emoji: '🧡' },
  { trait: 'Regal', desc: 'regards Moe-chan with an air of ancient dignity, as if granting an audience.', emoji: '👑' },
  { trait: 'Hungry', desc: 'sniffs at Moe-chan\'s bag intently, clearly smelling something delicious inside.', emoji: '🍖' },
  { trait: 'Aggressive', desc: 'puffs up and hisses at first, but calms down when Moe-chan holds still and speaks softly.', emoji: '💢' },
  { trait: 'Melancholy', desc: 'sits alone staring at the horizon with an unmistakable sadness. Moe-chan sits with it in silence for a while.', emoji: '🌧️' },
  { trait: 'Ecstatic', desc: 'is practically vibrating with joy at being found, spinning and chirping wildly.', emoji: '🎉' },
  { trait: 'Wise', desc: 'locks eyes with Moe-chan for a long moment, and she feels like it understands something deep about her.', emoji: '🦉' },
  { trait: 'Ghostly', desc: 'flickers in and out of visibility, as though not entirely here. Its presence leaves a chill.', emoji: '👻' },
];

// ===== STAT-REACTIVE FLAVOR TEXT =====
const ENCOUNTER_REACTIONS = {
  highStreak: [
    'It seems drawn to the dedication radiating from Moe-chan. Study streaks attract rare spirits.',
    'The chimera tilts its head, sensing the accumulated discipline of many study days.',
    'Moe-chan\'s long streak has made her aura brighter. The chimera approaches without fear.',
  ],
  lowStreak: [
    'It watches Moe-chan cautiously, as though sensing she has been away for a while.',
    'The chimera seems surprised to see anyone here. It has been quiet lately.',
  ],
  highMaterials: [
    'The chimera eyes Moe-chan\'s bulging pack with interest. A seasoned collector.',
    'It sniffs the air around Moe-chan\'s inventory, recognizing the scent of rare materials.',
  ],
  firstEver: [
    'Moe-chan\'s eyes go wide. She has never seen ANYTHING like this before.',
    'This is the first chimera Moe-chan has ever encountered. She will never forget this moment.',
  ],
  manyEncounters: [
    'An old friend. The chimera recognizes Moe-chan and greets her warmly.',
    'They have met before, many times. There is a comfortable familiarity between them.',
  ],
};

const CHIMERAS = [
  // ============================================
  // === MEADOW CHIMERAS (Common, rarity 1-4) ===
  // ============================================
  {
    id: 'puffmoth', name: 'Puffmoth', emoji: '🦋',
    tier: 'Common', rarity: 2,
    habitats: ['meadow'],
    appearance: 'A plump, cotton-ball-sized moth with iridescent pastel wings that shimmer between lavender and gold. Its fuzzy antennae curl like tiny ferns, and it trails a faint sparkle of pollen wherever it drifts.',
    description: 'Puffmoths gather in sleepy clouds above wildflower patches at dawn. They are harmless and surprisingly warm to the touch, like holding a tiny, breathing pillow. Moe-chan loves chasing them.'
  },
  {
    id: 'pebblejaw', name: 'Pebblejaw', emoji: '🪨',
    tier: 'Common', rarity: 3,
    habitats: ['meadow'],
    appearance: 'A squat, tortoise-like creature whose shell is made of smooth river stones fused together. Its stubby legs are mossy green and its eyes are two chips of amber that blink very slowly.',
    description: 'Pebblejaws lumber through meadow grass munching on clover. Their stone shells rattle softly as they move, sounding like a gentle rain on a tin roof. They are incredibly patient and will let you pet them if you sit still long enough.'
  },
  {
    id: 'honeywisp', name: 'Honeywisp', emoji: '🐝',
    tier: 'Common', rarity: 1,
    habitats: ['meadow', 'forest'],
    appearance: 'A tiny luminous sprite shaped like a teardrop of golden honey. It has two translucent dragonfly wings and a single bright eye that glows like a candle flame. It hums at a perfect middle C.',
    description: 'Honeywisps are the most common chimeras in the wild. They cluster around sweet-smelling flowers and leave trails of sticky golden light. Moe-chan says they taste like warm caramel when they land on your hand (she licked one once).'
  },
  {
    id: 'dandelion_knight', name: 'Dandelion Knight', emoji: '🌼',
    tier: 'Common', rarity: 2,
    habitats: ['meadow'],
    appearance: 'A tiny armored insect the size of a thumb, wearing a helmet made from a dandelion seed head. It carries a thorn as a lance and rides atop a drowsy ladybug mount. Its armor is woven from dried flower petals lacquered with morning dew.',
    description: 'Dandelion Knights patrol the meadow in solemn formations of one. They challenge anything that threatens wildflowers, which mostly means sneezing. They are absurdly brave and will charge at creatures a thousand times their size. Moe-chan finds their tiny battle cries adorable.'
  },
  {
    id: 'paddlepod', name: 'Paddle Pod', emoji: '🐸',
    tier: 'Common', rarity: 3,
    habitats: ['meadow', 'forest'],
    appearance: 'A round, bean-shaped amphibian with skin like a ripe avocado and oversized webbed feet that slap the ground comically as it walks. Its enormous eyes take up half its face, and it inflates to twice its size when startled, floating gently upward like a balloon.',
    description: 'Paddle Pods are the comedians of the meadow. They have no survival instincts whatsoever, relying entirely on being too ridiculous for predators to take seriously. When they inflate, they drift on the breeze making a soft "pbbbt" sound that makes Moe-chan laugh every time.'
  },
  {
    id: 'dustbunny', name: 'Dust Bunny', emoji: '🐇',
    tier: 'Common', rarity: 1,
    habitats: ['meadow', 'cave'],
    appearance: 'A perfectly spherical ball of soft grey dust with two long ears made of cobweb silk and tiny pink eyes. It rolls instead of hopping, picking up more dust as it goes, growing slightly larger throughout the day before sneezing itself back to normal size at sunset.',
    description: 'Dust Bunnies are found literally everywhere. They are born from accumulated dust in quiet corners and gain sentience after approximately three undisturbed weeks. They are harmless, affectionate, and slightly allergenic. Every explorer has one stuck to their clothes without knowing it.'
  },

  // ==============================================
  // === FOREST CHIMERAS (Uncommon, rarity 5-8) ===
  // ==============================================
  {
    id: 'mossback', name: 'Mossback Elk', emoji: '🦌',
    tier: 'Uncommon', rarity: 5,
    habitats: ['forest', 'meadow'],
    appearance: 'A tall, graceful elk with antlers that branch into living oak limbs, complete with rustling leaves. Its coat is deep emerald dappled with patches of real moss, and tiny mushrooms grow along its spine.',
    description: 'Mossback Elk are the silent guardians of old-growth forests. They move without a sound despite their size, and where they sleep, medicinal herbs sprout overnight. Spotting one is considered very good luck among forest travelers.'
  },
  {
    id: 'silkweaver', name: 'Silkweaver', emoji: '🕷️',
    tier: 'Uncommon', rarity: 6,
    habitats: ['forest'],
    appearance: 'An elegant spider the size of a house cat, with a body like polished obsidian and legs banded in silver and violet. Its eight eyes glow a soft lilac, and the silk it produces catches light like fiber-optic threads.',
    description: 'Silkweavers are surprisingly gentle despite their intimidating size. They build elaborate geometric webs between ancient trees that hum musically in the wind. Their silk is prized for its unbreakable strength and is one of the rarest crafting materials in the land.'
  },
  {
    id: 'hollowhorn', name: 'Hollowhorn Fox', emoji: '🦊',
    tier: 'Uncommon', rarity: 7,
    habitats: ['forest'],
    appearance: 'A sleek fox with fur the color of autumn twilight, shifting between burnt orange and deep purple. Two hollow, crystalline horns sprout from its head, and when wind passes through them, they produce haunting flute-like melodies.',
    description: 'Hollowhorn Foxes are nocturnal tricksters who lead travelers in circles for fun. Despite this, they never cause real harm, they just enjoy the confusion. If you offer one a sweet fruit, it may play a song for you through its horns before vanishing into the mist.'
  },
  {
    id: 'loglurker', name: 'Log Lurker', emoji: '🪵',
    tier: 'Uncommon', rarity: 5,
    habitats: ['forest'],
    appearance: 'What appears to be a fallen log suddenly sprouts six stubby legs and a pair of bark-textured eyes on stalks. Its body is covered in real lichen and shelf fungi, and small ferns grow from cracks in its back. When it yawns, the inside of its mouth glows warm amber.',
    description: 'Log Lurkers are ambush feeders that eat fallen leaves by lying motionless for weeks and letting the leaves pile on top of them. They are the reason hikers sometimes swear a log moved. They are completely harmless unless you try to sit on one, in which case they will give you the fright of your life.'
  },
  {
    id: 'inkfox', name: 'Ink Fox', emoji: '🖋️',
    tier: 'Uncommon', rarity: 7,
    habitats: ['forest', 'ruins'],
    appearance: 'A fox made entirely of flowing black ink, leaving calligraphic brushstrokes in the air behind it as it runs. Its eyes are two drops of white ink, and when it shakes, droplets of black scatter and briefly form kanji characters before evaporating.',
    description: 'Ink Foxes are said to be the ghosts of unfinished stories. Each one carries a different tale that was never completed, and the characters they scatter are fragments of those lost narratives. Scholars believe catching and reading all the characters from a single Ink Fox would reveal a complete forgotten masterpiece.'
  },
  {
    id: 'bellsnail', name: 'Bell Snail', emoji: '🔔',
    tier: 'Uncommon', rarity: 6,
    habitats: ['forest', 'meadow'],
    appearance: 'A large snail whose shell is a perfectly formed bronze bell, green with patina. As it moves, the bell chimes softly with each ripple of its muscular foot. Its eyestalks end in tiny glowing lanterns, and its slime trail hardens into a thin line of copper.',
    description: 'Bell Snails were once used by monks to mark meditation hours in forest temples. The temples are gone, but the snails remember the schedule and still chime at the old prayer times. Following the sound of a Bell Snail will always lead you to a place of peace.'
  },

  // === CLASSIC GAME REFERENCE: Meadow/Forest ===
  {
    id: 'paddle_specter', name: 'Paddle Specter', emoji: '🏓',
    tier: 'Uncommon', rarity: 8,
    habitats: ['meadow', 'forest'],
    appearance: 'A flat, rectangular phantom that slides back and forth between two invisible boundaries, deflecting anything that comes near it. It is pure white, featureless, and moves with mechanical precision. A faint square dot of light bounces eternally in its vicinity.',
    description: 'Paddle Specters are remnants of an ancient game played by forgotten gods. They exist only to deflect and redirect, endlessly volleying a tiny mote of light that never touches the ground. If you stand in its path, it will simply phase through you and keep playing. It has been doing this since before the meadow existed.'
  },
  {
    id: 'centipixel', name: 'Centipixel', emoji: '🐛',
    tier: 'Common', rarity: 4,
    habitats: ['meadow'],
    appearance: 'A segmented insect made of chunky, low-resolution blocks, each segment a different bright color. It moves in sharp right angles, never curves, and leaves a trail of blocky mushrooms in its wake. When it turns, there is an audible "boop" sound.',
    description: 'Centipixels descend in zigzag patterns from the canopy, getting faster as they approach the ground. They eat the blocky mushrooms that mysteriously grow in geometric grids throughout certain meadow clearings. Nobody knows where the mushrooms come from. Nobody questions it.'
  },

  // ==========================================
  // === CAVE CHIMERAS (Rare, rarity 9-12) ===
  // ==========================================
  {
    id: 'crystalcrab', name: 'Crystal Crab', emoji: '🦀',
    tier: 'Rare', rarity: 9,
    habitats: ['cave'],
    appearance: 'A large crab with a shell made entirely of interlocking amethyst and quartz crystals. Its claws are translucent rose quartz, and bioluminescent fluid pulses through visible channels in its legs, casting purple-pink light on cave walls.',
    description: 'Crystal Crabs are the jewelers of the underground. They carefully arrange mineral deposits into elaborate nests, essentially building tiny crystal palaces. They are fiercely territorial about their collections but can be pacified with offerings of moonstone.'
  },
  {
    id: 'echoveil', name: 'Echoveil Bat', emoji: '🦇',
    tier: 'Rare', rarity: 10,
    habitats: ['cave'],
    appearance: 'A bat with wings like translucent stained glass, each membrane displaying a shifting kaleidoscope of deep blues and golds. Its fur is midnight black with silver-tipped ears, and its echolocation pulses are visible as faint rings of pale blue light.',
    description: 'Echoveil Bats navigate not just by sound but by a form of sonic memory. They can replay echoes of things that happened in a cave days or even weeks ago. Scholars seek them out to literally listen to the past. Their wings are said to contain maps of every cave they have ever visited.'
  },
  {
    id: 'geodeturtle', name: 'Geode Turtle', emoji: '🐢',
    tier: 'Rare', rarity: 11,
    habitats: ['cave', 'ruins'],
    appearance: 'An ancient turtle whose shell, when cracked open (naturally, over centuries), reveals a dazzling interior of amethyst, citrine, and opal formations. Its skin is slate-grey and rough like sandpaper, and its eyes are deep amber with flecks of gold.',
    description: 'Geode Turtles are among the oldest living chimeras, some estimated at over a thousand years old. They move imperceptibly slowly, and entire stalagmites may grow around a sleeping one. The crystals inside their shells are said to record the dreams of the earth itself.'
  },
  {
    id: 'gloomjelly', name: 'Gloom Jelly', emoji: '🪼',
    tier: 'Rare', rarity: 9,
    habitats: ['cave', 'abyss'],
    appearance: 'A luminous jellyfish that floats through cave air instead of water, its bell pulsing with slow waves of turquoise and magenta bioluminescence. Trailing tentacles of light brush against stalactites, leaving brief glowing handprints. Its body is almost entirely transparent except for a small, dark core that looks like a sleeping eye.',
    description: 'Gloom Jellies are the lanterns of the deep caves. They drift in slow processions through pitch-black passages, and experienced cavers follow their light to find safe routes. They feed on ambient darkness itself, growing dimmer in well-lit areas and blazing brilliantly in the deepest shadows.'
  },
  {
    id: 'mirrorslime', name: 'Mirror Slime', emoji: '🪞',
    tier: 'Rare', rarity: 10,
    habitats: ['cave'],
    appearance: 'A puddle of mercury-like fluid that moves with purpose, its surface a perfect mirror reflecting everything around it with uncanny clarity. When it encounters a living creature, it briefly reshapes itself into a perfect metallic copy before melting back into a puddle and slithering away.',
    description: 'Mirror Slimes are thought to be a form of liquid memory. They copy everything they encounter, storing the reflections somewhere inside their impossible geometry. If you look into one long enough, you might see reflections of people who stood in that spot years ago. Moe-chan saw herself, but older, and it freaked her out a little.'
  },
  {
    id: 'ore_chomper', name: 'Ore Chomper', emoji: '⛏️',
    tier: 'Rare', rarity: 12,
    habitats: ['cave'],
    appearance: 'A stocky, barrel-chested creature with a massive underbite full of diamond teeth. Its body is dense and metallic, with visible veins of raw ore running through its rocky hide. It waddles on two thick legs, and its stubby arms end in pick-shaped claws.',
    description: 'Ore Chompers literally eat minerals, processing raw stone in their guts and excreting refined metal ingots. Miners both love and hate them. Love, because following one leads to rich veins. Hate, because they eat the veins. An Ore Chomper once ate an entire mine cart. It seemed pleased with itself.'
  },

  // === CLASSIC GAME REFERENCES: Cave ===
  {
    id: 'dig_phantom', name: 'Dig Phantom', emoji: '⬛',
    tier: 'Rare', rarity: 11,
    habitats: ['cave'],
    appearance: 'A round, goggle-wearing creature that phases through solid rock as though it were water. Its body inflates and deflates rhythmically, and it wears what appears to be a tiny white spacesuit. When threatened, it swells to enormous size before popping harmlessly and reassembling elsewhere.',
    description: 'Dig Phantoms tunnel through the earth in perfectly horizontal and vertical lines, never diagonals. They inflate creatures that annoy them until those creatures float away. Nobody knows where the floated creatures go. The Dig Phantoms do not seem concerned about this.'
  },
  {
    id: 'boulder_dasher', name: 'Boulder Dasher', emoji: '🪨',
    tier: 'Rare', rarity: 12,
    habitats: ['cave', 'ruins'],
    appearance: 'A perfectly spherical boulder with a single large eye and a wide grin carved into its face. It sits perfectly still until something moves nearby, then chases at alarming speed with a thunderous rumble. Despite appearances, it always stops just short of hitting anything, then wobbles smugly.',
    description: 'Boulder Dashers live for the chase. They position themselves at the tops of slopes and wait, sometimes for months, for someone to walk below. The pursuit is purely recreational and they have never actually hit anyone. They are, however, responsible for approximately 90% of all adventurer cardio. Some spelunkers swear one winked at them.'
  },

  // ============================================
  // === RUINS CHIMERAS (Epic, rarity 13-16) ===
  // ============================================
  {
    id: 'glyphserpent', name: 'Glyph Serpent', emoji: '🐍',
    tier: 'Epic', rarity: 13,
    habitats: ['ruins'],
    appearance: 'A sinuous serpent with scales of burnished bronze, each one inscribed with a tiny, glowing glyph from a forgotten language. Its eyes are molten gold, and when it moves, the glyphs on its body rearrange themselves, as though composing new sentences.',
    description: 'Glyph Serpents are living libraries. Each one carries fragments of a dead civilization written on its body. Linguists and archaeologists have spent lifetimes trying to decode a single serpent. They are non-venomous but profoundly intelligent, and some say they understand every language ever spoken.'
  },
  {
    id: 'phantomstag', name: 'Phantom Stag', emoji: '🫎',
    tier: 'Epic', rarity: 14,
    habitats: ['ruins', 'forest'],
    appearance: 'A majestic stag that flickers between solid and translucent, as though it exists in two places at once. Its antlers are made of pale blue spirit-flame, and ghostly afterimages trail behind it as it moves. Flowers of light bloom briefly in its hoofprints.',
    description: 'Phantom Stags are guardians of places where the boundary between worlds is thin. They are rarely seen by the living, appearing only to those who carry a deep question in their heart. It is said that meeting one means you are on the verge of a great revelation.'
  },
  {
    id: 'irongolem', name: 'Rusted Golem', emoji: '🤖',
    tier: 'Epic', rarity: 15,
    habitats: ['ruins'],
    appearance: 'A hulking humanoid figure cobbled together from ancient armor plates, corroded gears, and vine-wrapped stone. One eye socket holds a flickering emerald flame, the other is dark and hollow. Moss and small flowers grow in the joints of its limbs.',
    description: 'Rusted Golems are the remnants of an ancient civilization\'s guardians, still patrolling halls that crumbled centuries ago. They are not hostile but confused, endlessly searching for masters who will never return. Occasionally one will gently place a wildflower in your path, an old greeting protocol corrupted into something oddly tender.'
  },
  {
    id: 'pagoda_cat', name: 'Pagoda Cat', emoji: '🐱',
    tier: 'Epic', rarity: 13,
    habitats: ['ruins', 'forest'],
    appearance: 'A serene calico cat with a tiny multi-tiered pagoda balanced perfectly on its head. Paper lanterns dangle from the pagoda eaves, glowing softly, and a wisp of incense smoke curls from the top floor. Its eyes are gold coins, and it walks with the measured grace of a temple guardian.',
    description: 'Pagoda Cats are the keepers of abandoned shrines. Each one adopted a crumbling temple and maintains it through sheer spiritual stubbornness. The pagoda on its head is a functioning shrine in miniature, and if you leave a tiny offering, the cat will purr a blessing that brings good fortune for exactly one day.'
  },
  {
    id: 'karakuri', name: 'Karakuri Dancer', emoji: '🎭',
    tier: 'Epic', rarity: 15,
    habitats: ['ruins'],
    appearance: 'A wooden automaton in the style of a traditional Japanese mechanical doll, with painted porcelain face, silk robes now faded and torn, and visible clockwork gears in its joints. It moves with fluid, rehearsed grace, performing an endless tea ceremony for an audience that left centuries ago.',
    description: 'Karakuri Dancers are the last functioning machines of a lost artisan class. Each one was built to perform a single task perfectly: pour tea, write calligraphy, shoot a tiny bow. They have been performing their task without interruption for hundreds of years. They do not understand that their audience is gone. Please clap for them. They deserve it.'
  },
  {
    id: 'tome_mimic', name: 'Tome Mimic', emoji: '📖',
    tier: 'Epic', rarity: 14,
    habitats: ['ruins', 'cave'],
    appearance: 'A leather-bound book with an ornate gold clasp that, upon closer inspection, has tiny teeth. When opened, instead of pages there is a wet, pink interior with a single eye that blinks up at you. Its bookmark is actually a tongue, and it growls softly when you reach for it.',
    description: 'Tome Mimics disguise themselves as valuable ancient texts in ruin libraries. They are not dangerous so much as deeply annoying. They eat other books and grow thicker. The oldest known Tome Mimic is disguised as an encyclopedia and weighs over 200 pounds. It has eaten an estimated 10,000 books and shows no signs of stopping.'
  },

  // === CLASSIC GAME REFERENCES: Ruins ===
  {
    id: 'triangle_shade', name: 'Triangle Shade', emoji: '🔺',
    tier: 'Epic', rarity: 16,
    habitats: ['ruins', 'abyss'],
    appearance: 'A flat, wireframe pyramid that rotates slowly in midair, casting no shadow despite glowing with an inner green light. When viewed from different angles, its geometry seems impossible, with more faces than a triangle should have. A low digital hum emanates from its core.',
    description: 'Triangle Shades are living geometry from a reality where math works differently. They appear in ancient ruins that contain star maps or astronomical instruments, hovering silently and rotating in patterns that, if recorded and graphed, produce coordinates to places that do not exist on any known map. Early explorers called them "Tempests" and learned to navigate by their glow.'
  },
  {
    id: 'shadow_colossus', name: 'Moss Colossus', emoji: '🗿',
    tier: 'Epic', rarity: 16,
    habitats: ['ruins'],
    appearance: 'An enormous stone figure, easily thirty feet tall, covered in thick moss and climbing vines. Its joints are visible seams in the rock, and glowing sigils trace paths up its limbs like circuit boards. It moves with agonizing slowness, each step taking minutes, and birds nest in its shoulders. A faint glowing weak point pulses on its back.',
    description: 'Moss Colossi were built as monuments, not machines, but something woke them. They walk predetermined paths through the ruins, retracing routes their builders once walked. They are not hostile but are so large that their footsteps reshape the terrain. Climbing one is technically possible but universally considered a terrible idea. The view from the top is supposedly unforgettable.'
  },

  // =============================================
  // === ABYSS CHIMERAS (Legendary, rarity 17-20) ===
  // =============================================
  {
    id: 'voidwhale', name: 'Void Whale', emoji: '🐋',
    tier: 'Legendary', rarity: 17,
    habitats: ['abyss'],
    appearance: 'An immense whale that swims through the air of the deepest caverns, its body a silhouette of pure starfield, as though a window into deep space was cut in the shape of a leviathan. Tiny galaxies swirl in its eyes, and its song reverberates through dimensions.',
    description: 'Void Whales migrate through the spaces between realities, and the Starlit Abyss is one of their resting stops. Seeing one is a once-in-a-lifetime event. Their songs can heal old wounds and are said to contain the fundamental frequencies of creation itself. Moe-chan cried the first time she heard one.'
  },
  {
    id: 'solphoenix', name: 'Sol Phoenix', emoji: '🔥',
    tier: 'Legendary', rarity: 18,
    habitats: ['abyss', 'ruins'],
    appearance: 'A radiant bird wreathed in plasma-white flames that shift through every color of the visible spectrum. Its tail feathers are streamers of concentrated sunrise, each one a different dawn from a different world. Its eyes are twin stars, calm and impossibly ancient.',
    description: 'The Sol Phoenix is said to be the original source of all fire in the world. It nests at the bottom of the Abyss, where its heat keeps the deep waters warm and the underground ecosystems alive. Every thousand years it dies and is reborn, and the burst of energy creates new mineral veins throughout the earth.'
  },
  {
    id: 'dreameater', name: 'Dream Eater', emoji: '🌀',
    tier: 'Legendary', rarity: 19,
    habitats: ['abyss'],
    appearance: 'A shapeless, undulating mass of soft indigo mist with dozens of gently blinking eyes scattered across its form like stars in a nebula. Tendrils of lavender smoke curl from it, carrying the faint scent of rain and old books. It has no fixed shape, only suggestions of one.',
    description: 'Dream Eaters feed on nightmares, drawn to sleeping creatures plagued by bad dreams. Far from malicious, they are compassionate devourers of fear. After a Dream Eater visits, you wake feeling lighter, as though a weight you did not know you carried has been lifted. They are the reason the deepest caves feel strangely peaceful.'
  },
  {
    id: 'worldturtle', name: 'World Turtle', emoji: '🌍',
    tier: 'Legendary', rarity: 20,
    habitats: ['abyss'],
    appearance: 'A turtle of incomprehensible scale, its shell a living landscape of miniature mountains, forests, rivers, and clouds. Tiny civilizations flicker in and out of existence on its back. Its skin is the deep blue of ocean trenches, and its eyes hold the patient wisdom of geological time.',
    description: 'The World Turtle is more myth than chimera, glimpsed only in the deepest reaches of the Starlit Abyss. Those who have seen it describe the overwhelming sensation that the ground itself is alive and breathing. It is said to be the foundation upon which the world was built, and that its heartbeat is the turning of the seasons.'
  },
  {
    id: 'save_idol', name: 'Save Idol', emoji: '💾',
    tier: 'Legendary', rarity: 17,
    habitats: ['abyss', 'ruins'],
    appearance: 'A small, ornate stone statue that glows with warm golden light. It resembles a seated figure with hands clasped in prayer, but its face is a smooth, featureless screen that displays a single blinking cursor. Touching it fills you with an overwhelming sense of safety and the certainty that everything will be okay.',
    description: 'Save Idols are found in the most dangerous places, always positioned just before a point of no return. They radiate a field of calm that temporarily freezes all hostile chimeras in the area. Resting near one restores your energy completely and fills you with inexplicable confidence. Moe-chan hugs every single one she finds.'
  },
  {
    id: 'polygon_wyrm', name: 'Polygon Wyrm', emoji: '🐲',
    tier: 'Legendary', rarity: 19,
    habitats: ['abyss'],
    appearance: 'A massive dragon rendered in low-polygon geometry, its body made of flat-shaded triangles in deep crimson and black. Vertices jut at sharp angles, and its texture occasionally "pops" to a higher resolution before snapping back. Its eyes are solid white with no pupils, and when it roars, the sound has a faint digital compression artifact.',
    description: 'The Polygon Wyrm is a creature from an earlier version of reality, before the world was fully rendered. It exists in a state of permanent graphical compromise, terrifying in concept but oddly endearing in its jagged execution. It guards the Abyss with genuine menace undercut by the fact that its wings clip through its own body when it tries to fly.'
  },

  // =============================================
  // === SECRET / CONDITIONAL CHIMERAS =====
  // =============================================
  {
    id: 'study_spirit', name: 'Study Spirit', emoji: '📚',
    tier: 'Legendary', rarity: 18,
    habitats: ['meadow', 'forest', 'cave', 'ruins', 'abyss'],
    appearance: 'A translucent, glowing figure seated cross-legged in midair, surrounded by floating books and scrolls that orbit it like planets. Its form shifts between that of a student, a scholar, a monk, and a child, as though it is every learner who ever lived, compressed into one being. Light radiates from its eyes like reading lamps.',
    description: 'The Study Spirit appears only to those who have maintained a study streak of 7 days or more. It is the patron chimera of dedicated learners, and its presence dramatically increases the rarity of all items found during the expedition. It speaks in every language simultaneously, and every word it says is something you needed to hear.',
    condition: 'streak7'
  },
  {
    id: 'midnight_kitsune', name: 'Midnight Kitsune', emoji: '🌑',
    tier: 'Epic', rarity: 16,
    habitats: ['forest', 'ruins', 'abyss'],
    appearance: 'A nine-tailed fox made of compressed darkness, each tail tipped with a different colored foxfire flame. Its eyes are crescent moons, and it leaves no footprints. Cherry blossom petals materialize and disintegrate in the air around it, despite there being no trees nearby.',
    description: 'The Midnight Kitsune only appears between 10 PM and 4 AM. It is a yokai of immense age and cunning, said to have once served as advisor to an emperor who was himself a dream. Each of its nine tails represents a century of accumulated wisdom, and it will share one secret with anyone bold enough to ask.',
    condition: 'nighttime'
  },
  {
    id: 'golden_tanuki', name: 'Golden Tanuki', emoji: '🦝',
    tier: 'Rare', rarity: 12,
    habitats: ['forest', 'meadow', 'ruins'],
    appearance: 'A rotund raccoon dog with fur of polished gold and a belly like a lucky cat statue. It wears a straw hat and carries a sake bottle that never empties. Its tail is a massive golden leaf, and coins fall from its fur when it shakes.',
    description: 'The Golden Tanuki appears only on weekends. It is a creature of leisure and celebration, rewarding those who balance work and rest. Finding one is said to bring financial good luck, though the coins it drops are made of chocolate wrapped in gold foil. Still delicious. Still lucky.',
    condition: 'weekend'
  },
  {
    id: 'aurora_moth', name: 'Aurora Moth', emoji: '🦚',
    tier: 'Epic', rarity: 14,
    habitats: ['meadow', 'abyss'],
    appearance: 'An enormous moth with wings that display the full aurora borealis, rippling curtains of green, violet, and pink light that extend far beyond its physical wingspan. Its body is white as fresh snow, and its antennae are made of pure crystallized starlight.',
    description: 'Aurora Moths only appear during winter months (December through February). They are migratory chimeras that follow the magnetic field lines of the earth, and their wings broadcast the northern lights to places that would never otherwise see them. Standing beneath one feels like being inside a snow globe filled with light.',
    condition: 'winter'
  },
  {
    id: 'sakura_dragon', name: 'Sakura Dragon', emoji: '🌸',
    tier: 'Epic', rarity: 15,
    habitats: ['forest', 'meadow', 'ruins'],
    appearance: 'A sinuous eastern dragon whose body is made entirely of intertwined cherry blossom branches in full bloom. Petals constantly fall from it like pink snow, and its eyes are deep pools of spring rain. It smells overwhelmingly of flowers, and the air around it is always exactly the perfect temperature.',
    description: 'The Sakura Dragon appears only in spring (March through May). It heralds renewal and new beginnings, and its presence causes dormant seeds to sprout instantly. Students who encounter one before exams are said to always pass. Moe-chan tried to ride one once. It politely declined.',
    condition: 'spring'
  },
  {
    id: 'harvest_golem', name: 'Harvest Golem', emoji: '🎃',
    tier: 'Rare', rarity: 11,
    habitats: ['meadow', 'forest'],
    appearance: 'A shambling figure made of bundled wheat, corn husks, and autumn leaves, with a carved pumpkin for a head. Warm candlelight flickers behind its carved eyes, and it carries a cornucopia overflowing with glowing fruits that do not exist in nature. Crows perch on its shoulders companionably.',
    description: 'The Harvest Golem appears only in autumn (September through November). It walks the fields gathering the last of the season\'s energy before winter. Encountering one guarantees bonus materials from the expedition. It communicates by rearranging the fruits in its cornucopia into expressive still-life tableaux.',
    condition: 'autumn'
  },
  {
    id: 'glitch_cat', name: 'Glitch Cat', emoji: '🐈‍⬛',
    tier: 'Legendary', rarity: 20,
    habitats: ['meadow', 'forest', 'cave', 'ruins', 'abyss'],
    appearance: 'A black cat that is visibly broken. Parts of its body stretch into infinity before snapping back. It walks through walls, phases through the floor, and occasionally duplicates itself into 255 identical copies that stack on top of each other before collapsing back into one. Its meow is a sound that should not be possible.',
    description: 'The Glitch Cat exists at the seams of reality where the rules break down. It can only be found when you have collected at least 15 unique materials and discovered at least 10 chimeras. It is the rarest chimera in existence, not because it hides, but because it literally does not exist most of the time. Petting it causes mild visual artifacts in your peripheral vision for approximately six hours.',
    condition: 'collector'
  },

  // =============================================
  // === YOKAI & JAPANESE HISTORY CHIMERAS ===
  // =============================================
  // Each has element tags matching the Japanese weekday system (日月火水木金土)
  // On matching days, these chimeras get a rarity boost

  // --- Common Yokai ---
  {
    id: 'kodama', name: 'Kodama', nameJP: '木霊（こだま）', emoji: '🌳',
    tier: 'Common', rarity: 2,
    habitats: ['forest', 'meadow'],
    element: 'wood', // Thursday (木)
    appearance: 'A tiny, pale humanoid figure no bigger than a fist, with a rattling head that bobs like a dashboard ornament. Its body is smooth and white like a peeled egg, and it glows faintly with a soft green phosphorescence. When it moves, it makes a hollow clicking sound.',
    description: 'Kodama are the spirits of old trees. Cutting down a tree inhabited by a kodama brings misfortune, but befriending one ensures the forest provides for you. They communicate by tilting their heads at various angles, each tilt meaning something different. Moe-chan learned that a 45-degree left tilt means "I like you."'
  },
  {
    id: 'hitotsume_kozo', name: 'Hitotsume-kozou', nameJP: '一つ目小僧（ひとつめこぞう）', emoji: '👁️',
    tier: 'Common', rarity: 3,
    habitats: ['forest', 'ruins'],
    element: 'moon', // Monday (月)
    appearance: 'A child-sized monk with a single enormous eye in the center of its bald head. It wears a tattered miniature robe and wooden sandals that clatter as it runs. Its tongue is perpetually sticking out, and it giggles constantly, a sound like wind chimes in a storm.',
    description: 'Hitotsume-kozou are prank-playing yokai that love to startle travelers. Their scares are completely harmless. They jump out from behind trees, yell "BOO!", then collapse into fits of giggles. They are essentially the class clowns of the spirit world. Moe-chan pretends to be scared for them because they try so hard.'
  },
  {
    id: 'tanuki_spirit', name: 'Bake-danuki', nameJP: '化け狸（ばけだぬき）', emoji: '🍃',
    tier: 'Common', rarity: 4,
    habitats: ['meadow', 'forest'],
    element: 'earth', // Saturday (土)
    appearance: 'A rotund raccoon dog with a leaf balanced on its head, perpetually mid-transformation. One paw is a teapot, its tail is currently a broom, and its belly is shaped like a drum that it pounds rhythmically. It has a wide, jolly grin and smells faintly of sake and pine needles.',
    description: 'Bake-danuki are masters of shapeshifting, but not very good at it. Their transformations always have something obviously wrong, a teakettle with a tail, a monk with paw prints. They are good-natured tricksters who value laughter above all else. Offering one sake guarantees a friend for life, albeit an unreliable one.'
  },

  // --- Uncommon Yokai ---
  {
    id: 'kappa', name: 'Kappa', nameJP: '河童（かっぱ）', emoji: '🥒',
    tier: 'Uncommon', rarity: 6,
    habitats: ['meadow', 'forest', 'cave'],
    element: 'water', // Wednesday (水)
    appearance: 'A child-sized amphibian with green, scaly skin, a turtle shell on its back, and a shallow dish on top of its head filled with water. Its beak-like mouth and webbed hands give it a froggy elegance. It smells strongly of fresh cucumber and river mud.',
    description: 'Kappa are water spirits bound by an absurd code of politeness. If you bow to a kappa, it MUST bow back, spilling the water from its head-dish and losing its power. They are obsessed with cucumbers and sumo wrestling, in that order. Writing your name on a cucumber and throwing it in a river is said to earn a kappa\'s protection.'
  },
  {
    id: 'jorogumo', name: 'Jorou-gumo', nameJP: '絡新婦（じょろうぐも）', emoji: '🕸️',
    tier: 'Uncommon', rarity: 8,
    habitats: ['forest', 'cave'],
    element: 'fire', // Tuesday (火)
    appearance: 'A spider the size of a large dog with the face of a beautiful woman emerging from its cephalothorax. Her hair is long, black, and woven with silk threads. Her eight legs are lacquered like traditional furniture, and she plays a biwa lute with two of her front legs while walking with the other six.',
    description: 'Jorou-gumo are ancient spiders who gained the ability to take on beautiful forms. Unlike the legends, this one is mostly harmless and deeply artistic. She weaves elaborate tapestries that tell stories of the Heian period and plays hauntingly beautiful music. She just wants someone to appreciate her art. Moe-chan sat for hours listening.'
  },
  {
    id: 'tengu_crow', name: 'Karasu-tengu', nameJP: '烏天狗（からすてんぐ）', emoji: '🐦‍⬛',
    tier: 'Uncommon', rarity: 7,
    habitats: ['forest', 'ruins'],
    element: 'wood', // Thursday (木)
    appearance: 'A tall, lean figure with the head of a crow, glossy black feathers, and a warrior\'s bearing. It wears battered samurai armor and carries a tachi sword that gleams with blue foxfire. Its wings are enormous and blacker than midnight, and it moves with a swordsman\'s precision.',
    description: 'Karasu-tengu are warrior spirits of the mountain forests. They are said to have taught swordsmanship to Minamoto no Yoshitsune himself. This one practices kata endlessly among the trees, its blade whistling through bamboo. It ignores most travelers but will nod respectfully to anyone who has studied diligently. Moe-chan got a nod once and still talks about it.'
  },
  {
    id: 'tsukumogami', name: 'Tsukumogami', nameJP: '付喪神（つくもがみ）', emoji: '🏮',
    tier: 'Uncommon', rarity: 5,
    habitats: ['ruins', 'cave'],
    element: 'sun', // Sunday (日)
    appearance: 'A paper lantern with a single eye, a lolling tongue, and two stubby feet poking out from underneath. It hops around leaving small scorch marks, flickering between terrifying and adorable. Other objects nearby, an umbrella, a sandal, a teacup, have also sprouted eyes and seem to be following it.',
    description: 'Tsukumogami are objects that have existed for 100 years and gained a soul. This paper lantern, called a chouchin-obake, leads a little parade of awakened objects through the ruins. The umbrella keeps trying to open dramatically. The teacup just wants to be held. They are the ultimate argument against throwing things away.'
  },

  // --- Rare Yokai ---
  {
    id: 'nekomata', name: 'Nekomata', nameJP: '猫又（ねこまた）', emoji: '🐱',
    tier: 'Rare', rarity: 10,
    habitats: ['ruins', 'forest'],
    element: 'fire', // Tuesday (火)
    appearance: 'An enormous cat with two tails that fork like serpents, each tip burning with pale blue foxfire. Its eyes are gold with slit pupils, and it walks upright on its hind legs when it thinks nobody is watching. It wears a tiny kimono sash tied around its neck and speaks in riddles.',
    description: 'Nekomata are cats that lived so long their tails split in two and they gained supernatural powers, including human speech, necromancy, and an even more intense sense of superiority than regular cats. This one has been alive for 300 years and is not impressed by anything, but secretly loves head scratches. It will deny this under oath.'
  },
  {
    id: 'onibi', name: 'Onibi', nameJP: '鬼火（おにび）', emoji: '🔵',
    tier: 'Rare', rarity: 9,
    habitats: ['cave', 'ruins', 'abyss'],
    element: 'fire', // Tuesday (火)
    appearance: 'A cluster of floating flames in impossible colors: deep blue, pale green, and ghostly white. They drift in a loose formation, each flame containing a tiny face with closed eyes, as though sleeping. The temperature drops sharply in their presence, despite them being fire.',
    description: 'Onibi are the soul-flames of the dead, but don\'t let that scare you. These particular onibi are benign, the remnants of scholars who died mid-thought and couldn\'t let go of their ideas. Each flame whispers fragments of unfinished theories. If you listen closely, you might learn something no living person knows. Or you might hear someone\'s unfinished grocery list.'
  },
  {
    id: 'yuki_onna', name: 'Yuki-onna', nameJP: '雪女（ゆきおんな）', emoji: '❄️',
    tier: 'Rare', rarity: 12,
    habitats: ['cave', 'abyss'],
    element: 'water', // Wednesday (水)
    appearance: 'A tall woman with skin as white as fresh snow, wearing a flowing white kimono that dissolves into mist at the hem. Her hair is long and black with frost crystals woven through it, and her breath is visible even in warm caves. Her eyes are pale blue and ancient, and snowflakes materialize around her in a gentle permanent flurry.',
    description: 'Yuki-onna is a snow spirit of profound beauty and melancholy. Unlike the terrifying legends, this one guards lost travelers in caves, breathing warmth into hypothermic hands (her cold breath is actually thermoregulating). She collects snowflakes that have never been duplicated and keeps them in a crystal vial. She has been alone for a very long time and appreciates company.',
    condition: 'winter'
  },

  // --- Epic Yokai ---
  {
    id: 'oni_general', name: 'Oni Taishou', nameJP: '鬼大将（おにたいしょう）', emoji: '👹',
    tier: 'Epic', rarity: 14,
    habitats: ['ruins', 'cave', 'abyss'],
    element: 'sun', // Sunday (日)
    appearance: 'A massive red-skinned oni standing eight feet tall, with two curved horns, wild white hair, and tiger-skin loincloth. It carries an iron kanabo club studded with iron spikes, each spike engraved with a kanji. Despite its fearsome appearance, it is currently trying to arrange wildflowers in a vase and getting increasingly frustrated with the aesthetic composition.',
    description: 'Oni Taishou was once a fearsome demon general who terrorized entire provinces. After several centuries of retirement, it took up ikebana (flower arrangement) and discovered it was far more challenging than conquest. It is deeply philosophical about this career change. If you compliment its arrangements, it will cry enormous tears of gratitude and give you a rare material.'
  },
  {
    id: 'kirin', name: 'Kirin', nameJP: '麒麟（きりん）', emoji: '🦄',
    tier: 'Epic', rarity: 16,
    habitats: ['meadow', 'forest', 'ruins'],
    element: 'wood', // Thursday (木)
    appearance: 'A magnificent beast with the body of a deer, the tail of an ox, scales like a dragon, and a single horn wreathed in ethereal flame. Its hooves never touch the ground, floating a hair\'s breadth above so as not to crush a single blade of grass. Its mane flows like golden smoke, and every living thing near it stands a little straighter.',
    description: 'The Kirin appears only in times of great wisdom or before the arrival of a benevolent leader. It is so gentle that it will not step on living grass or eat living plants. Its appearance during an expedition means you are on the right path in life. Legends say it only shows itself to the pure of heart, but Moe-chan thinks it just likes the forest vibes.',
    condition: 'streak7'
  },
  {
    id: 'shuten_doji', name: 'Shuten-douji', nameJP: '酒呑童子（しゅてんどうじ）', emoji: '🍶',
    tier: 'Epic', rarity: 15,
    habitats: ['ruins', 'cave'],
    element: 'gold', // Friday (金)
    appearance: 'A massive figure with the body of a young man and the presence of a mountain. His skin shifts between human pale and demon crimson, his hair is wild and red, and he carries a gourd of sake the size of a barrel. Golden ornaments adorn his horns and he radiates an aura of terrifying charisma. His eyes are the amber of aged rice wine.',
    description: 'Shuten-douji was the king of all oni, legendary for his love of sake and his fearsome power. In this form he has mellowed considerably and mostly wants to share a drink and tell stories about the old days. His sake gourd is enchanted and never empties. He rates every expedition\'s loot out of ten and is a surprisingly harsh but fair critic.'
  },
  {
    id: 'nue', name: 'Nue', nameJP: '鵺（ぬえ）', emoji: '⚡',
    tier: 'Epic', rarity: 16,
    habitats: ['ruins', 'abyss'],
    element: 'fire', // Tuesday (火)
    appearance: 'A chimera in the original sense: the head of a monkey, the body of a tanuki, the legs of a tiger, and the tail of a serpent. Storm clouds gather above it permanently, and its cry sounds like the call of a scops owl mixed with rolling thunder. Lightning flickers in its eyes.',
    description: 'The Nue is the creature that terrorized Emperor Konoe in the 12th century, causing illness with its mere presence. This one has reformed somewhat and now only causes mild headaches and a vague sense of unease. It is embarrassed about its historical reputation and has been trying to rebrand as a "weather chimera" with limited success. It can actually predict storms with perfect accuracy.'
  },

  // --- Legendary Yokai ---
  {
    id: 'ryuujin', name: 'Ryuu-jin', nameJP: '龍神（りゅうじん）', emoji: '🐉',
    tier: 'Legendary', rarity: 19,
    habitats: ['abyss', 'cave'],
    element: 'water', // Wednesday (水)
    appearance: 'An enormous eastern dragon coiled in an underground lake, its body stretching hundreds of meters, covered in scales of lapis lazuli and pearl. Its whiskers trail like rivers, its eyes are twin whirlpools of deep blue intelligence, and the water around it flows upward in defiance of gravity. On its head sits a crown of living coral.',
    description: 'Ryuu-jin is the Dragon King of the Sea, ruler of tides and keeper of the Tide Jewels. Finding him in the Abyss means you have reached a place connected to the ocean\'s deepest heart. He speaks in the sound of waves and can grant mastery over water, though his gifts come with responsibilities measured in centuries. Moe-chan asked him for a glass of water once and he found this incredibly funny.'
  },
  {
    id: 'amaterasu_mirror', name: 'Yata no Kagami', nameJP: '八咫鏡（やたのかがみ）', emoji: '☀️',
    tier: 'Legendary', rarity: 20,
    habitats: ['ruins', 'abyss'],
    element: 'sun', // Sunday (日)
    appearance: 'Not a creature but a sentient mirror hovering in midair, its bronze surface depicting a sunrise that moves in real time. Looking into it, you see not your reflection but your best possible self, the version of you that made every right choice. It radiates warmth like standing in morning sunlight, and everything it illuminates becomes briefly perfect.',
    description: 'The Yata no Kagami is one of the three Imperial Regalia of Japan, the mirror used to lure Amaterasu from her cave and return sunlight to the world. This manifestation appears only on Sundays, the day of the sun, and only to those who have been diligent in their studies. Gazing into it fills you with the absolute certainty that your effort matters. Moe-chan looked in it and saw herself graduating.',
    condition: 'sunday'
  },
  {
    id: 'shinigami', name: 'Shinigami', nameJP: '死神（しにがみ）', emoji: '💀',
    tier: 'Legendary', rarity: 18,
    habitats: ['abyss', 'ruins'],
    element: 'moon', // Monday (月)
    appearance: 'A skeletal figure in a tattered black kimono, carrying an enormous hourglass instead of a scythe. Sand flows upward in the hourglass. Its skull-face has two ember-red eyes that are somehow kind, and cherry blossom petals fall from its sleeves endlessly. A faint scent of incense follows it everywhere.',
    description: 'Shinigami are death spirits, but this one is more of a cosmic accountant than a reaper. It keeps meticulous records of all living things and is genuinely fascinated by how people choose to spend their finite time. It approves deeply of studying and will quietly extend the hourglass of anyone it catches learning. It communicates through haiku written in falling petals.'
  },
  {
    id: 'fujin_raijin', name: 'Fuujin & Raijin', nameJP: '風神雷神（ふうじんらいじん）', emoji: '🌪️',
    tier: 'Legendary', rarity: 17,
    habitats: ['abyss', 'ruins', 'meadow'],
    element: 'gold', // Friday (金)
    appearance: 'Two figures locked in eternal playful combat. Fuujin is green-skinned with wild hair, carrying a bag of winds that whips and billows. Raijin is red-skinned and muscular, surrounded by a ring of drums that he strikes to create thunder. Between them, a perpetual storm rages in miniature, no bigger than a room, complete with tiny lightning and rain.',
    description: 'Fuujin and Raijin, the gods of wind and thunder, are inseparable rivals who have been wrestling since the beginning of time. They always appear together and cannot be catalogued separately (scholars have tried). Their fights generate weather patterns for the entire region. They stop fighting only to eat rice balls, which they both agree are perfect. They are the subjects of one of Japan\'s most famous paintings.'
  },
];

const CHIMERA_TIER_COLORS = TIER_COLORS; // Reuse material tier colors

// ===== JAPANESE WEEKDAY ELEMENT SYSTEM =====
// Maps day of week to element: 日(Sun)=sun, 月(Mon)=moon, 火(Tue)=fire, 水(Wed)=water, 木(Thu)=wood, 金(Fri)=gold, 土(Sat)=earth
const WEEKDAY_ELEMENTS = ['sun', 'moon', 'fire', 'water', 'wood', 'gold', 'earth'];
const WEEKDAY_KANJI = ['日', '月', '火', '水', '木', '金', '土'];
const WEEKDAY_NAMES = ['Sunday (日曜日)', 'Monday (月曜日)', 'Tuesday (火曜日)', 'Wednesday (水曜日)', 'Thursday (木曜日)', 'Friday (金曜日)', 'Saturday (土曜日)'];

function getTodayElement() {
  return WEEKDAY_ELEMENTS[new Date().getDay()];
}

// ===== I-CHING RARITY MODIFIER =====
// The daily hexagram influences chimera encounters
// Certain hexagram numbers boost certain tiers
function getIChingModifier() {
  const today = todayStr();
  const td = data.days[today];
  if (!td || !td.iching || !td.iching.primary) return { boost: 1.0, affinity: null, hexName: null };

  const hexNum = td.iching.primary.num;
  const hexName = td.iching.primary.name;

  // Hexagrams grouped by elemental affinity and rarity influence
  // Heaven/Creative trigrams (1,2,11,12) boost Legendary encounters
  // Mountain/Lake trigrams (31,41,52,53) boost Rare encounters
  // Fire/Water trigrams (29,30,63,64) boost Epic encounters
  // Wind/Thunder trigrams (3,4,21,42,51) boost Uncommon encounters
  // Earth trigrams (7,8,15,16,23,24) boost Common encounters (higher quantity)
  let boost = 1.0;
  let affinity = null;

  if ([1, 2, 11, 12, 25, 44].includes(hexNum)) {
    boost = 2.0; affinity = 'Legendary';
  } else if ([29, 30, 49, 50, 63, 64].includes(hexNum)) {
    boost = 1.8; affinity = 'Epic';
  } else if ([31, 33, 39, 41, 52, 53, 56, 62].includes(hexNum)) {
    boost = 1.6; affinity = 'Rare';
  } else if ([3, 4, 21, 27, 32, 42, 51, 57].includes(hexNum)) {
    boost = 1.4; affinity = 'Uncommon';
  } else if ([7, 8, 15, 16, 19, 23, 24, 36, 46].includes(hexNum)) {
    boost = 1.2; affinity = 'Common';
  } else {
    boost = 1.1; affinity = null; // Minor general boost
  }

  return { boost, affinity, hexName };
}

// ===== CHIMERA CONDITION CHECKS =====
function checkChimeraCondition(chimera) {
  if (!chimera.condition) return true; // No condition = always available

  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0=Sun, 6=Sat
  const month = now.getMonth(); // 0=Jan, 11=Dec

  switch (chimera.condition) {
    case 'streak7':
      return (data.streak || 0) >= 7;
    case 'nighttime':
      return hour >= 22 || hour < 4;
    case 'weekend':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'sunday':
      return dayOfWeek === 0;
    case 'winter':
      return month === 11 || month === 0 || month === 1;
    case 'spring':
      return month >= 2 && month <= 4;
    case 'autumn':
      return month >= 8 && month <= 10;
    case 'collector': {
      const uniqueMats = Object.keys(data.materials || {}).filter(k => data.materials[k] > 0).length;
      const uniqueChimeras = Object.keys(data.bestiary || {}).length;
      return uniqueMats >= 15 && uniqueChimeras >= 10;
    }
    default:
      return true;
  }
}

// ===== GENERATE DYNAMIC ENCOUNTER TEXT =====
function generateEncounterFlavor(chimera) {
  // Pick a random personality
  const personality = CHIMERA_PERSONALITIES[Math.floor(Math.random() * CHIMERA_PERSONALITIES.length)];

  // Pick a stat-reactive line
  let reactionPool = [];
  const streak = data.streak || 0;
  const totalMats = Object.values(data.materials || {}).reduce((a, b) => a + b, 0);
  const timesSeen = data.bestiary && data.bestiary[chimera.id] ? data.bestiary[chimera.id].timesSeen : 0;

  if (timesSeen === 0) {
    reactionPool = ENCOUNTER_REACTIONS.firstEver;
  } else if (timesSeen >= 5) {
    reactionPool = ENCOUNTER_REACTIONS.manyEncounters;
  } else if (streak >= 5) {
    reactionPool = ENCOUNTER_REACTIONS.highStreak;
  } else if (streak <= 1) {
    reactionPool = ENCOUNTER_REACTIONS.lowStreak;
  } else if (totalMats >= 50) {
    reactionPool = ENCOUNTER_REACTIONS.highMaterials;
  }

  const reaction = reactionPool.length > 0 ? reactionPool[Math.floor(Math.random() * reactionPool.length)] : '';

  // Element/I-Ching flavor
  let cosmicFlavor = '';
  const todayElement = getTodayElement();
  const dayIdx = new Date().getDay();
  if (chimera.element && chimera.element === todayElement) {
    cosmicFlavor = `${WEEKDAY_KANJI[dayIdx]} Today is ${chimera.element} day (${WEEKDAY_KANJI[dayIdx]}曜日). This chimera resonates with today's elemental energy!`;
  }
  const ichingMod = getIChingModifier();
  if (ichingMod.affinity && chimera.tier === ichingMod.affinity && ichingMod.hexName) {
    const hexNote = `☯️ Today's hexagram (${ichingMod.hexName}) favors ${ichingMod.affinity}-tier encounters.`;
    cosmicFlavor = cosmicFlavor ? cosmicFlavor + ' ' + hexNote : hexNote;
  }

  return { personality, reaction, cosmicFlavor };
}

// ===== CHIMERA ENCOUNTER LOGIC =====
function rollChimeraEncounter(expeditionId, duration) {
  // Base encounter chance: 30% for timed, 15% for auto daily
  let encounterChance = duration ? 0.30 : 0.15;
  // Longer expeditions = higher chance (up to 60%)
  if (duration) encounterChance = Math.min(0.60, 0.20 + (duration / 480) * 0.40);

  // Flashcard bonus increases encounter chance slightly
  const bonus = getFlashcardRarityBonus();
  if (bonus > 1) encounterChance = Math.min(0.75, encounterChance + (bonus - 1) * 0.05);

  // I-Ching daily hexagram boosts encounter chance
  const ichingMod = getIChingModifier();
  if (ichingMod.boost > 1) encounterChance = Math.min(0.80, encounterChance * (1 + (ichingMod.boost - 1) * 0.15));

  if (Math.random() > encounterChance) return null;

  // Determine which chimeras are eligible based on expedition habitat AND conditions
  const exp = EXPEDITIONS.find(e => e.id === expeditionId);
  const habitat = exp ? exp.id : 'meadow';
  // Fallback mapping: new expedition habitats share chimeras with related biomes
  const HABITAT_FALLBACK = {
    'riverbank': ['meadow', 'forest'],
    'bamboo':    ['forest', 'meadow'],
    'volcano':   ['cave', 'ruins'],
  };
  const habitatSet = new Set([habitat, ...(HABITAT_FALLBACK[habitat] || [])]);
  const eligible = CHIMERAS.filter(c =>
    c.habitats.some(h => habitatSet.has(h)) &&
    c.rarity <= (exp ? exp.maxRarity : 6) &&
    checkChimeraCondition(c)
  );

  if (eligible.length === 0) return null;

  // Get today's elemental affinity from the weekday system
  const todayElement = getTodayElement();

  // Weighted random: rarer chimeras are harder to find
  let weights = eligible.map(c => {
    let w = Math.pow(21 - c.rarity, 2.5);

    // Secret/conditional chimeras get a slight boost when conditions are met
    if (c.condition) w *= 1.5;

    // Flashcard bonus shifts toward rarer
    if (bonus > 1) w *= Math.pow(c.rarity / 20, (bonus - 1) * 0.6);

    // WEEKDAY ELEMENT BOOST: chimeras matching today's element get 3x weight
    if (c.element && c.element === todayElement) w *= 3.0;

    // I-CHING TIER AFFINITY: chimeras matching the hexagram's tier affinity get boosted
    if (ichingMod.affinity && c.tier === ichingMod.affinity) w *= ichingMod.boost;

    return w;
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * totalWeight;
  let chosen = eligible[0];
  for (let j = 0; j < eligible.length; j++) {
    roll -= weights[j];
    if (roll <= 0) { chosen = eligible[j]; break; }
  }

  return chosen;
}

function addToBestiary(chimera) {
  if (!data.bestiary) data.bestiary = {};
  if (!data.bestiary[chimera.id]) {
    data.bestiary[chimera.id] = { firstSeen: todayStr(), timesSeen: 1 };
    return true; // New discovery!
  } else {
    data.bestiary[chimera.id].timesSeen++;
    return false;
  }
}

// ===== EXPEDITION DEFINITIONS =====
// minLevel gates each expedition behind the Moe-chan level (see calculateMoeXP/getMoeLevel in script.js).
// Higher levels unlock longer, more rewarding paths.
const EXPEDITIONS = [
  { id: 'meadow',     name: 'Sunny Meadow',        emoji: '🌻', duration: 30,  maxRarity: 6,  minLevel: 1,  description: 'A peaceful meadow with common herbs and stones.' },
  { id: 'forest',     name: 'Whispering Forest',   emoji: '🌲', duration: 60,  maxRarity: 10, minLevel: 3,  description: 'A dense forest hiding uncommon treasures.' },
  { id: 'riverbank',  name: 'Mirror Riverbank',    emoji: '🏞️', duration: 90,  maxRarity: 12, minLevel: 5,  description: 'A river of liquid silver where memories wash ashore. Moe-chan catches driftwood, river pearls, and the occasional lost haiku.' },
  { id: 'cave',       name: 'Crystal Caverns',     emoji: '🦇', duration: 120, maxRarity: 14, minLevel: 8,  description: 'Deep caves glittering with rare crystals.' },
  { id: 'bamboo',     name: 'Shrouded Bamboo Sea', emoji: '🎋', duration: 180, maxRarity: 16, minLevel: 12, description: 'A swaying ocean of bamboo where time loses meaning. Fox spirits and old poets leave gifts among the stalks.' },
  { id: 'ruins',      name: 'Ancient Ruins',       emoji: '🏛️', duration: 240, maxRarity: 18, minLevel: 16, description: 'Crumbling ruins of a lost civilization.' },
  { id: 'volcano',    name: 'Obsidian Caldera',    emoji: '🌋', duration: 360, maxRarity: 19, minLevel: 22, description: 'A dormant volcano lined with obsidian mirrors. Salamander-kin forge rare metals in pools of fire-glass.' },
  { id: 'abyss',      name: 'The Starlit Abyss',   emoji: '🌌', duration: 480, maxRarity: 20, minLevel: 30, description: 'The deepest reaches, where legends are found.' },
];

// ===== HELPER: current Moe-chan level (falls back to 1 if script.js not yet loaded) =====
function getCurrentMoeLevel() {
  try {
    if (typeof getMoeLevel === 'function') return getMoeLevel().level || 1;
  } catch(e) {}
  return 1;
}

// ===== HELPER: Get flashcard rarity bonus =====
function getFlashcardRarityBonus() {
  const today = todayStr();
  const td = data.days[today];
  if (!td) return 1.0;
  const flashMinutes = td.flash || 0;
  // Every 10 minutes = +0.5x bonus
  const bonus = 1.0 + Math.floor(flashMinutes / 10) * 0.5;
  return bonus;
}

// ===== HELPER: Roll loot from an expedition =====
function rollExpeditionLoot(maxRarity, itemCount) {
  const rarityBonus = getFlashcardRarityBonus();
  const loot = [];
  const eligible = MATERIALS.filter(m => m.rarity <= maxRarity);

  for (let i = 0; i < itemCount; i++) {
    // Weighted random: lower rarity = higher weight, but bonus shifts toward rarer items
    let weights = eligible.map(m => {
      // Base weight: inversely proportional to rarity
      let w = Math.pow(maxRarity - m.rarity + 1, 2);
      // Bonus shifts weight toward rarer items
      if (rarityBonus > 1) {
        w *= Math.pow(m.rarity / maxRarity, (rarityBonus - 1) * 0.8);
      }
      return w;
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalWeight;
    let chosen = eligible[0];
    for (let j = 0; j < eligible.length; j++) {
      roll -= weights[j];
      if (roll <= 0) { chosen = eligible[j]; break; }
    }

    // Find if already in loot
    const existing = loot.find(l => l.id === chosen.id);
    if (existing) { existing.qty++; }
    else { loot.push({ id: chosen.id, qty: 1 }); }
  }

  return loot;
}

// ===== ENSURE expedition data exists =====
function ensureExpeditionData() {
  if (!data.materials) data.materials = {};
  if (!data.expeditions) data.expeditions = { active: null, log: [], lastAutoDate: null };
  if (!data.expeditions.log) data.expeditions.log = [];
  if (!data.expeditions.lastAutoDate) data.expeditions.lastAutoDate = null;
}

// ===== ADD materials to inventory =====
function addMaterialsToInventory(loot) {
  ensureExpeditionData();
  loot.forEach(item => {
    data.materials[item.id] = (data.materials[item.id] || 0) + item.qty;
  });
}

// ===== AUTO DAILY EXPEDITION =====
function checkAutoExpedition() {
  ensureExpeditionData();
  const today = todayStr();

  if (data.expeditions.lastAutoDate === today) return null; // Already ran today

  // Moe-chan goes on an automatic daily expedition (medium difficulty)
  const loot = rollExpeditionLoot(10, 5); // Up to Rare, 5 items
  addMaterialsToInventory(loot);

  // Roll for chimera encounter on daily walk
  const chimera = rollChimeraEncounter('forest', null);
  let chimeraData = null;
  if (chimera) {
    const isNew = addToBestiary(chimera);
    const flavor = generateEncounterFlavor(chimera);
    chimeraData = { id: chimera.id, name: chimera.name, nameJP: chimera.nameJP || null, emoji: chimera.emoji, tier: chimera.tier, isNew: isNew, appearance: chimera.appearance, description: chimera.description, personality: flavor.personality, reaction: flavor.reaction, cosmicFlavor: flavor.cosmicFlavor || null, condition: chimera.condition || null, element: chimera.element || null };
  }

  data.expeditions.lastAutoDate = today;

  const logEntry = {
    type: 'auto',
    date: today,
    loot: loot,
    expedition: 'Daily Adventure',
    rarityBonus: getFlashcardRarityBonus(),
    chimera: chimeraData
  };
  data.expeditions.log.unshift(logEntry);
  if (data.expeditions.log.length > 30) data.expeditions.log.length = 30; // Keep last 30

  saveData();
  return logEntry;
}

// ===== START A TIMED EXPEDITION =====
function startExpedition(expeditionId) {
  ensureExpeditionData();

  if (data.expeditions.active) {
    alert("Moe-chan is already on an expedition! Wait for her to return.");
    return;
  }

  const exp = EXPEDITIONS.find(e => e.id === expeditionId);
  if (!exp) return;

  // Level gate enforcement
  const lvl = getCurrentMoeLevel();
  const needed = exp.minLevel || 1;
  if (lvl < needed) {
    alert(`🔒 ${exp.name} is locked! Reach Moe-chan Level ${needed} (you're ${lvl}) to unlock it.`);
    return;
  }

  data.expeditions.active = {
    expeditionId: exp.id,
    startTime: Date.now(),
    duration: exp.duration, // minutes
    maxRarity: exp.maxRarity
  };

  saveData();
  renderExpeditions();
}

// ===== CHECK IF TIMED EXPEDITION IS DONE =====
function checkActiveExpedition() {
  ensureExpeditionData();
  if (!data.expeditions.active) return null;

  const active = data.expeditions.active;
  const elapsed = (Date.now() - active.startTime) / 60000; // minutes

  if (elapsed >= active.duration) {
    // Expedition complete!
    const exp = EXPEDITIONS.find(e => e.id === active.expeditionId);
    const itemCount = Math.floor(3 + (active.duration / 30) * 2); // More items for longer expeditions
    const loot = rollExpeditionLoot(active.maxRarity, itemCount);
    addMaterialsToInventory(loot);

    // Roll for chimera encounter
    const chimera = rollChimeraEncounter(active.expeditionId, active.duration);
    let chimeraData = null;
    if (chimera) {
      const isNew = addToBestiary(chimera);
      const flavor = generateEncounterFlavor(chimera);
    chimeraData = { id: chimera.id, name: chimera.name, nameJP: chimera.nameJP || null, emoji: chimera.emoji, tier: chimera.tier, isNew: isNew, appearance: chimera.appearance, description: chimera.description, personality: flavor.personality, reaction: flavor.reaction, cosmicFlavor: flavor.cosmicFlavor || null, condition: chimera.condition || null, element: chimera.element || null };
    }

    const logEntry = {
      type: 'mission',
      date: todayStr(),
      loot: loot,
      expedition: exp ? exp.name : 'Unknown',
      duration: active.duration,
      rarityBonus: getFlashcardRarityBonus(),
      chimera: chimeraData
    };
    data.expeditions.log.unshift(logEntry);
    if (data.expeditions.log.length > 30) data.expeditions.log.length = 30;

    data.expeditions.active = null;
    saveData();

    return logEntry;
  }

  return null; // Still in progress
}

// ===== COLLECT (claim) completed expedition =====
function collectExpedition() {
  const result = checkActiveExpedition();
  if (result) {
    showLootPopup(result.loot, result.expedition, result.chimera);
    renderExpeditions();
    renderMaterials();
    if (typeof renderBestiary === 'function') renderBestiary();
    setCreatureState('celebrate');
    setSpeech(result.chimera ? 'chimeraFound' : 'expeditionDone');
  }
}

// ===== LOOT POPUP =====
function showLootPopup(loot, expeditionName, chimeraData) {
  const overlay = document.getElementById('loot-popup-overlay');
  const content = document.getElementById('loot-popup-content');
  if (!overlay || !content) return;

  const bonus = getFlashcardRarityBonus();
  const bonusHtml = bonus > 1 ? `<div class="loot-bonus">📇 Flashcard Bonus: ${bonus.toFixed(1)}x Rarity!</div>` : '';

  let itemsHtml = loot.map(item => {
    const mat = MATERIALS.find(m => m.id === item.id);
    if (!mat) return '';
    const tc = TIER_COLORS[mat.tier];
    return `<div class="loot-item" style="border-color:${tc.border}; background:${tc.bg}">
      <span class="loot-emoji">${mat.emoji}</span>
      <span class="loot-name" style="color:${tc.text}">${mat.name}</span>
      <span class="loot-qty">x${item.qty}</span>
    </div>`;
  }).join('');

  // Chimera encounter section
  let chimeraHtml = '';
  if (chimeraData) {
    const tc = CHIMERA_TIER_COLORS[chimeraData.tier] || CHIMERA_TIER_COLORS['Common'];
    const newBadge = chimeraData.isNew ? '<span class="chimera-new-badge">NEW DISCOVERY!</span>' : '';
    const conditionBadge = chimeraData.condition ? '<span class="chimera-secret-badge">SECRET</span>' : '';
    const elementBadge = chimeraData.element ? `<span class="chimera-element-badge">${chimeraData.element}</span>` : '';
    const jpNameHtml = chimeraData.nameJP ? `<span class="chimera-jp-name">${chimeraData.nameJP}</span>` : '';
    const personalityHtml = chimeraData.personality ? `<div class="chimera-personality">${chimeraData.personality.emoji} <strong>${chimeraData.personality.trait}</strong> — It ${chimeraData.personality.desc}</div>` : '';
    const reactionHtml = chimeraData.reaction ? `<div class="chimera-reaction"><em>${chimeraData.reaction}</em></div>` : '';
    const cosmicHtml = chimeraData.cosmicFlavor ? `<div class="chimera-cosmic-flavor">${chimeraData.cosmicFlavor}</div>` : '';
    chimeraHtml = `
      <div class="chimera-encounter-panel" style="border-color:${tc.border}; background:${tc.bg}">
        <div class="chimera-encounter-header">
          <span class="chimera-encounter-emoji">${chimeraData.emoji}</span>
          <div>
            <span class="chimera-encounter-name" style="color:${tc.text}">${escHtml(chimeraData.name)}</span>
            ${jpNameHtml}
            ${newBadge}${conditionBadge}${elementBadge}
            <span class="chimera-tier-label" style="color:${tc.text}">${chimeraData.tier}</span>
          </div>
        </div>
        ${cosmicHtml}
        ${personalityHtml}
        ${reactionHtml}
        <p class="chimera-encounter-appearance">${escHtml(chimeraData.appearance)}</p>
        <p class="chimera-encounter-desc">${escHtml(chimeraData.description)}</p>
        <button class="btn-glossy btn-pink" style="margin-top:10px; width:100%;" onclick="tryToCatchChimera('${chimeraData.id}')">🥅 Attempt to Catch!</button>
        <div id="catch-attempt-result" style="margin-top:8px; min-height:1.2em; text-align:center; font-weight:700;"></div>
      </div>`;
  }

  content.innerHTML = `
    <h3 class="loot-title">Expedition Complete!</h3>
    <p class="loot-subtitle">${escHtml(expeditionName)}</p>
    ${bonusHtml}
    ${chimeraHtml}
    <div class="loot-items">${itemsHtml}</div>
    <button class="btn-glossy btn-green loot-close-btn" onclick="closeLootPopup()">Collect!</button>
  `;
  overlay.style.display = 'flex';
}

function closeLootPopup() {
  const overlay = document.getElementById('loot-popup-overlay');
  if (overlay) overlay.style.display = 'none';
}

// ===== RENDER: Materials Inventory Page =====
function renderMaterials() {
  const grid = document.getElementById('materials-grid');
  if (!grid) return;
  ensureExpeditionData();

  let html = '';
  const tiers = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  tiers.forEach(tier => {
    const tierMats = MATERIALS.filter(m => m.tier === tier);
    const tc = TIER_COLORS[tier];

    html += `<div class="mat-tier-header" style="color:${tc.text}; border-bottom: 1px solid ${tc.border};">${tier}</div>`;
    html += '<div class="mat-tier-grid">';

    tierMats.forEach(mat => {
      const qty = data.materials[mat.id] || 0;
      const isEmpty = qty === 0;
      html += `<div class="mat-card ${isEmpty ? 'mat-empty' : ''}" style="border-color:${isEmpty ? 'rgba(255,255,255,0.08)' : tc.border}; background:${isEmpty ? 'rgba(0,0,0,0.2)' : tc.bg}">
        <div class="mat-emoji">${mat.emoji}</div>
        <div class="mat-name" style="color:${isEmpty ? 'rgba(255,255,255,0.3)' : tc.text}">${mat.name}</div>
        <div class="mat-qty" style="color:${isEmpty ? 'rgba(255,255,255,0.2)' : '#fff'}">${qty}</div>
        <div class="mat-rarity-stars">${'★'.repeat(Math.ceil(mat.rarity / 4))}${'☆'.repeat(5 - Math.ceil(mat.rarity / 4))}</div>
      </div>`;
    });

    html += '</div>';
  });

  grid.innerHTML = html;

  // Update total count
  const totalEl = document.getElementById('mat-total-count');
  if (totalEl) {
    const total = Object.values(data.materials).reduce((a, b) => a + b, 0);
    totalEl.textContent = total;
  }

  // Update unique count
  const uniqueEl = document.getElementById('mat-unique-count');
  if (uniqueEl) {
    const unique = MATERIALS.filter(m => (data.materials[m.id] || 0) > 0).length;
    uniqueEl.textContent = `${unique}/20`;
  }
}

// ===== RENDER: Expeditions Panel =====
function renderExpeditions() {
  ensureExpeditionData();
  renderExpeditionMissions();
  renderExpeditionStatus();
  renderExpeditionLog();
  updateRarityBonusDisplay();
}

function renderExpeditionMissions() {
  const container = document.getElementById('exp-missions-list');
  if (!container) return;

  const hasActive = !!data.expeditions.active;

  const playerLevel = getCurrentMoeLevel();

  let html = '';
  EXPEDITIONS.forEach(exp => {
    const isActive = hasActive && data.expeditions.active.expeditionId === exp.id;
    const hrs = Math.floor(exp.duration / 60);
    const mins = exp.duration % 60;
    const timeStr = hrs > 0 ? `${hrs}h ${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;
    const maxTier = MATERIALS.find(m => m.rarity === exp.maxRarity);
    const minLvl = exp.minLevel || 1;
    const locked = playerLevel < minLvl;

    let actionHtml;
    if (locked) {
      actionHtml = `<span class="exp-badge-locked">🔒 Lv. ${minLvl} required (you: ${playerLevel})</span>`;
    } else if (hasActive) {
      actionHtml = isActive ? '<span class="exp-badge-active">In Progress...</span>' : '';
    } else {
      actionHtml = `<button class="btn-glossy exp-send-btn" onclick="startExpedition('${exp.id}')">Send Moe-chan!</button>`;
    }

    html += `<div class="exp-mission-card ${isActive ? 'exp-active' : ''} ${hasActive && !isActive ? 'exp-disabled' : ''} ${locked ? 'exp-locked' : ''}">
      <div class="exp-mission-header">
        <span class="exp-mission-emoji">${exp.emoji}</span>
        <span class="exp-mission-name">${exp.name}</span>
        <span class="exp-mission-time">${timeStr}</span>
        <span class="exp-mission-level-badge ${locked ? 'is-locked' : ''}">Lv. ${minLvl}+</span>
      </div>
      <p class="exp-mission-desc">${exp.description}</p>
      <div class="exp-mission-footer">
        <span class="exp-mission-rarity">Max: ${maxTier ? maxTier.name : '???'}</span>
        ${actionHtml}
      </div>
    </div>`;
  });

  container.innerHTML = html;
}

function renderExpeditionStatus() {
  const statusEl = document.getElementById('exp-status');
  if (!statusEl) return;

  if (!data.expeditions.active) {
    statusEl.innerHTML = `<div class="exp-idle">
      <img src="./idle.png" alt="Moe-chan" class="exp-moe-sprite">
      <p>Moe-chan is resting at camp. Send her on an expedition!</p>
    </div>`;
    return;
  }

  const active = data.expeditions.active;
  const exp = EXPEDITIONS.find(e => e.id === active.expeditionId);
  const elapsed = (Date.now() - active.startTime) / 60000;
  const progress = Math.min(100, (elapsed / active.duration) * 100);
  const done = elapsed >= active.duration;

  const remaining = Math.max(0, active.duration - elapsed);
  const rHrs = Math.floor(remaining / 60);
  const rMins = Math.ceil(remaining % 60);
  const timeLeft = done ? 'Complete!' : (rHrs > 0 ? `${rHrs}h ${rMins}m left` : `${rMins}m left`);

  statusEl.innerHTML = `<div class="exp-in-progress">
    <img src="./study.png" alt="Moe-chan" class="exp-moe-sprite ${done ? 'exp-bounce' : ''}">
    <div class="exp-progress-info">
      <h4>${exp ? exp.emoji + ' ' + exp.name : 'Expedition'}</h4>
      <div class="exp-progress-bar"><div class="exp-progress-fill" style="width:${progress}%; background: ${done ? '#a8e84c' : 'linear-gradient(90deg, #0099ff, #00e5ff)'}"></div></div>
      <span class="exp-time-left">${timeLeft}</span>
    </div>
    ${done ? `<button class="btn-glossy btn-green exp-collect-btn" onclick="collectExpedition()">Collect Loot!</button>` : ''}
  </div>`;
}

function renderExpeditionLog() {
  const logEl = document.getElementById('exp-log');
  if (!logEl) return;

  if (!data.expeditions.log || data.expeditions.log.length === 0) {
    logEl.innerHTML = '<p style="color:rgba(255,255,255,0.4); text-align:center; padding:12px;">No expeditions completed yet.</p>';
    return;
  }

  let html = '';
  data.expeditions.log.slice(0, 10).forEach(entry => {
    const lootStr = entry.loot.map(l => {
      const mat = MATERIALS.find(m => m.id === l.id);
      return mat ? `${mat.emoji} ${mat.name} x${l.qty}` : `??? x${l.qty}`;
    }).join(', ');

    const typeIcon = entry.type === 'auto' ? '🌅' : '⚔️';
    const bonusStr = entry.rarityBonus > 1 ? ` (${entry.rarityBonus.toFixed(1)}x bonus)` : '';

    let chimeraLogHtml = '';
    if (entry.chimera) {
      const tc = CHIMERA_TIER_COLORS[entry.chimera.tier] || CHIMERA_TIER_COLORS['Common'];
      chimeraLogHtml = `<div class="exp-log-chimera" style="color:${tc.text}">${entry.chimera.emoji} Encountered: ${escHtml(entry.chimera.name)}${entry.chimera.isNew ? ' (NEW!)' : ''}</div>`;
    }

    html += `<div class="exp-log-entry">
      <div class="exp-log-header">
        <span>${typeIcon} ${escHtml(entry.expedition)}</span>
        <span class="exp-log-date">${formatDate(entry.date)}${bonusStr}</span>
      </div>
      ${chimeraLogHtml}
      <div class="exp-log-loot">${lootStr}</div>
    </div>`;
  });

  logEl.innerHTML = html;
}

function updateRarityBonusDisplay() {
  const el = document.getElementById('exp-rarity-bonus');
  if (!el) return;
  const bonus = getFlashcardRarityBonus();
  const flashMin = (data.days[todayStr()] || {}).flash || 0;

  const todayElement = getTodayElement();
  const dayIdx = new Date().getDay();
  const elementDisplay = `${WEEKDAY_KANJI[dayIdx]} ${todayElement}`;

  const ichingMod = getIChingModifier();
  const ichingDisplay = ichingMod.hexName ? `☯️ ${ichingMod.hexName} (${ichingMod.affinity || 'General'} ${ichingMod.boost.toFixed(1)}x)` : '☯️ No hexagram cast today';

  el.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
      <span class="bonus-label">📇 Flashcards:</span> <span class="bonus-value">${bonus.toFixed(1)}x</span> <span class="bonus-detail">(${flashMin} min)</span>
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-top:4px;">
      <span class="bonus-label">Element:</span> <span class="bonus-value">${elementDisplay}</span>
      <span class="bonus-detail">— ${todayElement}-element chimeras boosted today</span>
    </div>
    <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-top:4px;">
      <span class="bonus-label">I-Ching:</span> <span class="bonus-value" style="font-size:0.8rem;">${ichingDisplay}</span>
    </div>
  `;
}

// ===== Expedition status timer (updates every 30s) =====
let expTimerInterval = null;
function startExpeditionTimer() {
  if (expTimerInterval) clearInterval(expTimerInterval);
  expTimerInterval = setInterval(() => {
    if (data.expeditions && data.expeditions.active) {
      renderExpeditionStatus();
    }
  }, 30000);
}

// ===== Add expedition speech =====
if (typeof speeches !== 'undefined') {
  speeches.expeditionDone = { en: "I found amazing loot!", jp: "すごいアイテムを見つけた！", es: "¡Encontré un tesoro increíble!" };
  speeches.expeditionStart = { en: "I'm heading out! Wish me luck!", jp: "行ってきます！応援してね！", es: "¡Me voy de aventura!" };
  speeches.autoExpedition = { en: "I went on a morning walk and found things!", jp: "朝の散歩で色々見つけたよ！", es: "¡Encontré cosas en mi paseo matutino!" };
  speeches.chimeraFound = { en: "I saw an incredible creature!", jp: "すごい生き物を見つけた！", es: "¡Vi una criatura increíble!" };
  speeches.chimeraNew = { en: "A chimera I've never seen before!!", jp: "見たことない合成獣だ！！", es: "¡¡Una quimera que nunca había visto!!" };
}

// ===== RENDER: Bestiary Page =====
function renderBestiary() {
  const grid = document.getElementById('bestiary-grid');
  if (!grid) return;
  if (!data.bestiary) data.bestiary = {};

  let html = '';
  const tiers = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  tiers.forEach(tier => {
    const tierChimeras = CHIMERAS.filter(c => c.tier === tier);
    const tc = CHIMERA_TIER_COLORS[tier];

    html += `<div class="mat-tier-header" style="color:${tc.text}; border-bottom: 1px solid ${tc.border};">${tier} Chimeras</div>`;
    html += '<div class="bestiary-tier-grid">';

    tierChimeras.forEach(ch => {
      const discovered = data.bestiary[ch.id];
      const isEmpty = !discovered;

      if (isEmpty) {
        const secretHint = ch.condition ? '🔒' : '❓';
        html += `<div class="bestiary-card bestiary-empty" style="border-color:rgba(255,255,255,0.08); background:rgba(0,0,0,0.2)">
          <div class="bestiary-emoji" style="filter:brightness(0.3)">${secretHint}</div>
          <div class="bestiary-name" style="color:rgba(255,255,255,0.2)">${ch.condition ? '??? (Secret)' : '???'}</div>
          <div class="bestiary-rarity">${'★'.repeat(Math.ceil(ch.rarity / 4))}${'☆'.repeat(5 - Math.ceil(ch.rarity / 4))}</div>
        </div>`;
      } else {
        const jpLabel = ch.nameJP ? `<div class="bestiary-jp" style="color:${tc.text}; opacity:0.6;">${ch.nameJP.split('（')[0]}</div>` : '';
        const elemLabel = ch.element ? `<div class="bestiary-element">${ch.element}</div>` : '';
        html += `<div class="bestiary-card" style="border-color:${tc.border}; background:${tc.bg}; cursor:pointer;" onclick="showChimeraDetail('${ch.id}')">
          <div class="bestiary-emoji">${ch.emoji}</div>
          <div class="bestiary-name" style="color:${tc.text}">${ch.name}</div>
          ${jpLabel}
          <div class="bestiary-seen">Seen: ${discovered.timesSeen}x</div>
          ${elemLabel}
          <div class="bestiary-rarity">${'★'.repeat(Math.ceil(ch.rarity / 4))}${'☆'.repeat(5 - Math.ceil(ch.rarity / 4))}</div>
        </div>`;
      }
    });

    html += '</div>';
  });

  grid.innerHTML = html;

  // Update counts
  const totalEl = document.getElementById('bestiary-total-count');
  if (totalEl) {
    const total = Object.values(data.bestiary).reduce((a, b) => a + b.timesSeen, 0);
    totalEl.textContent = total;
  }

  const uniqueEl = document.getElementById('bestiary-unique-count');
  if (uniqueEl) {
    const unique = CHIMERAS.filter(c => data.bestiary[c.id]).length;
    uniqueEl.textContent = `${unique}/${CHIMERAS.length}`;
  }
}

// ===== CHIMERA DETAIL POPUP =====
function showChimeraDetail(chimeraId) {
  const ch = CHIMERAS.find(c => c.id === chimeraId);
  if (!ch) return;
  const disc = data.bestiary[ch.id];
  if (!disc) return;

  const tc = CHIMERA_TIER_COLORS[ch.tier];
  const overlay = document.getElementById('chimera-detail-overlay');
  const content = document.getElementById('chimera-detail-content');
  if (!overlay || !content) return;

  const conditionLabels = {
    'streak7': 'Requires 7+ day study streak',
    'nighttime': 'Appears between 10 PM and 4 AM',
    'weekend': 'Appears on weekends only',
    'sunday': 'Appears on Sundays only (日曜日)',
    'winter': 'Appears in winter (Dec-Feb)',
    'spring': 'Appears in spring (Mar-May)',
    'autumn': 'Appears in autumn (Sep-Nov)',
    'collector': 'Requires 15+ unique materials and 10+ chimera discoveries',
  };
  const condHtml = ch.condition ? `<div class="chimera-detail-section"><h4 class="chimera-detail-label">Appearance Condition</h4><p class="chimera-detail-text" style="color:#ff8000;">${conditionLabels[ch.condition] || 'Special conditions'}</p></div>` : '';

  const elementLabels = { sun: '日 (Sun)', moon: '月 (Moon)', fire: '火 (Fire)', water: '水 (Water)', wood: '木 (Wood)', gold: '金 (Gold)', earth: '土 (Earth)' };
  const elementHtml = ch.element ? `<div class="chimera-detail-section"><h4 class="chimera-detail-label">Element Affinity</h4><p class="chimera-detail-text">${elementLabels[ch.element] || ch.element} — Boosted on ${WEEKDAY_NAMES[WEEKDAY_ELEMENTS.indexOf(ch.element)] || 'matching day'}</p></div>` : '';
  const jpNameHtml = ch.nameJP ? `<div class="chimera-detail-jp-name">${ch.nameJP}</div>` : '';

  content.innerHTML = `
    <div class="chimera-detail-header" style="border-bottom: 2px solid ${tc.border};">
      <span class="chimera-detail-emoji">${ch.emoji}</span>
      <div>
        <h3 class="chimera-detail-name" style="color:${tc.text}">${ch.name}</h3>
        ${jpNameHtml}
        <span class="chimera-detail-tier" style="color:${tc.text}">${ch.tier}</span>
        ${ch.condition ? '<span class="chimera-secret-badge" style="margin-left:6px;">SECRET</span>' : ''}
        ${ch.element ? '<span class="chimera-element-badge" style="margin-left:4px;">' + ch.element + '</span>' : ''}
        <span class="chimera-detail-rarity">${'★'.repeat(Math.ceil(ch.rarity / 4))}${'☆'.repeat(5 - Math.ceil(ch.rarity / 4))}</span>
      </div>
    </div>
    <div class="chimera-detail-section">
      <h4 class="chimera-detail-label">Appearance</h4>
      <p class="chimera-detail-text">${escHtml(ch.appearance)}</p>
    </div>
    <div class="chimera-detail-section">
      <h4 class="chimera-detail-label">Description</h4>
      <p class="chimera-detail-text">${escHtml(ch.description)}</p>
    </div>
    <div class="chimera-detail-section">
      <h4 class="chimera-detail-label">Habitat</h4>
      <p class="chimera-detail-text">${ch.habitats.map(h => { const e = EXPEDITIONS.find(ex => ex.id === h); return e ? e.emoji + ' ' + e.name : h; }).join(', ')}</p>
    </div>
    ${elementHtml}
    ${condHtml}
    <div class="chimera-detail-stats">
      <span>First seen: ${formatDate(disc.firstSeen)}</span>
      <span>Encounters: ${disc.timesSeen}</span>
    </div>
    <button class="btn-glossy btn-green" onclick="closeChimeraDetail()" style="margin-top:16px; width:100%;">Close</button>
  `;
  overlay.style.display = 'flex';
}

function closeChimeraDetail() {
  const overlay = document.getElementById('chimera-detail-overlay');
  if (overlay) overlay.style.display = 'none';
}

// ===== Initialize expeditions on app load =====
function initExpeditions() {
  ensureExpeditionData();

  // Ensure bestiary exists
  if (!data.bestiary) data.bestiary = {};

  // Check auto daily expedition
  const autoResult = checkAutoExpedition();
  if (autoResult) {
    // Show notification of auto expedition results
    setTimeout(() => {
      showLootPopup(autoResult.loot, 'Daily Morning Walk 🌅', autoResult.chimera);
      if (typeof setSpeech === 'function') {
        if (autoResult.chimera && autoResult.chimera.isNew) setSpeech('chimeraNew');
        else if (autoResult.chimera) setSpeech('chimeraFound');
        else setSpeech('autoExpedition');
      }
      if (typeof setCreatureState === 'function') setCreatureState('happy');
    }, 1000);
  }

  // Check if a timed expedition completed while away
  const completedWhileAway = checkActiveExpedition();
  if (completedWhileAway) {
    setTimeout(() => {
      showLootPopup(completedWhileAway.loot, completedWhileAway.expedition, completedWhileAway.chimera);
      if (typeof setSpeech === 'function') {
        if (completedWhileAway.chimera && completedWhileAway.chimera.isNew) setSpeech('chimeraNew');
        else if (completedWhileAway.chimera) setSpeech('chimeraFound');
        else setSpeech('expeditionDone');
      }
      if (typeof setCreatureState === 'function') setCreatureState('celebrate');
    }, autoResult ? 3000 : 1000); // Delay if auto also triggered
  }

  renderExpeditions();
  renderMaterials();
  renderBestiary();
  startExpeditionTimer();
}

// ===== CATCH CHIMERA FROM EXPEDITION POPUP =====
function tryToCatchChimera(chimeraId) {
  if (typeof attemptCatch !== 'function') {
    const el = document.getElementById('catch-attempt-result');
    if (el) el.innerHTML = '<span style="color:#ff3c8e;">Catching system not loaded!</span>';
    return;
  }
  const result = attemptCatch(chimeraId);
  const el = document.getElementById('catch-attempt-result');
  if (el) {
    if (result.success) {
      el.innerHTML = `<span style="color:#a8e84c;">✓ ${result.message}</span>`;
    } else {
      el.innerHTML = `<span style="color:#ff3c8e;">✗ ${result.message}</span>`;
    }
  }
  // Disable catch button after attempt
  const btn = el ? el.previousElementSibling : null;
  if (btn && btn.tagName === 'BUTTON') btn.disabled = true;
  // Refresh inventory if visible
  if (typeof renderChimeraInventory === 'function') renderChimeraInventory();
}
