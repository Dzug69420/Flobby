export type RelicRarity = 'starter' | 'common' | 'uncommon' | 'rare' | 'boss';

export type RelicTrigger =
  | 'combat_start'
  | 'turn_start'
  | 'card_play'
  | 'attack_played'
  | 'block_played'
  | 'combat_end'
  | 'passive';

export interface RelicDefinition {
  id: string;
  name: string;
  description: string;
  rarity: RelicRarity;
  trigger: RelicTrigger;
  emoji: string;
}

export const ALL_RELICS: Record<string, RelicDefinition> = {
  burning_blood: {
    id: 'burning_blood',
    name: 'Burning Blood',
    description: 'Heal 6 HP after each combat.',
    rarity: 'starter',
    trigger: 'combat_end',
    emoji: '🩸',
  },
  anchor: {
    id: 'anchor',
    name: 'Anchor',
    description: 'Start each combat with 10 Block.',
    rarity: 'common',
    trigger: 'combat_start',
    emoji: '⚓',
  },
  bag_of_preparation: {
    id: 'bag_of_preparation',
    name: 'Bag of Prep',
    description: 'Draw 2 extra cards at the start of combat.',
    rarity: 'common',
    trigger: 'combat_start',
    emoji: '🎒',
  },
  bronze_scales: {
    id: 'bronze_scales',
    name: 'Bronze Scales',
    description: 'Whenever you take damage, deal 3 damage back.',
    rarity: 'common',
    trigger: 'passive',
    emoji: '🐉',
  },
  vajra: {
    id: 'vajra',
    name: 'Vajra',
    description: 'Start each combat with 1 Strength.',
    rarity: 'common',
    trigger: 'combat_start',
    emoji: '⚡',
  },
  lantern: {
    id: 'lantern',
    name: 'Lantern',
    description: 'Gain 1 extra energy on the first turn.',
    rarity: 'common',
    trigger: 'combat_start',
    emoji: '🏮',
  },
  nunchaku: {
    id: 'nunchaku',
    name: 'Nunchaku',
    description: 'Every 10 cards played, gain 1 energy.',
    rarity: 'common',
    trigger: 'card_play',
    emoji: '🥊',
  },
  orichalcum: {
    id: 'orichalcum',
    name: 'Orichalcum',
    description: 'If you end your turn with no Block, gain 6 Block.',
    rarity: 'common',
    trigger: 'turn_start',
    emoji: '🥇',
  },
  centennial_puzzle: {
    id: 'centennial_puzzle',
    name: 'Centennial Puzzle',
    description: 'The first time you lose HP in combat, draw 3 cards.',
    rarity: 'uncommon',
    trigger: 'passive',
    emoji: '🧩',
  },
  calipers: {
    id: 'calipers',
    name: 'Calipers',
    description: 'At turn end, retain 15 Block instead of losing all.',
    rarity: 'uncommon',
    trigger: 'turn_start',
    emoji: '📐',
  },
  pen_nib: {
    id: 'pen_nib',
    name: 'Pen Nib',
    description: 'Every 10th attack you play deals double damage.',
    rarity: 'uncommon',
    trigger: 'attack_played',
    emoji: '🖊️',
  },
  red_skull: {
    id: 'red_skull',
    name: 'Red Skull',
    description: 'While at or below 50% HP, gain 3 Strength.',
    rarity: 'uncommon',
    trigger: 'combat_start',
    emoji: '💀',
  },
  ancient_tea_set: {
    id: 'ancient_tea_set',
    name: 'Ancient Tea Set',
    description: 'After a Rest Site, start next combat with +2 Energy first turn.',
    rarity: 'uncommon',
    trigger: 'combat_start',
    emoji: '🫖',
  },
  regal_pillow: {
    id: 'regal_pillow',
    name: 'Regal Pillow',
    description: 'Heal an extra 15 HP when you rest.',
    rarity: 'uncommon',
    trigger: 'passive',
    emoji: '🛌',
  },
  dead_branch: {
    id: 'dead_branch',
    name: 'Dead Branch',
    description: 'When you exhaust a card, add a random card to your hand.',
    rarity: 'rare',
    trigger: 'passive',
    emoji: '🌿',
  },
  tough_bandages: {
    id: 'tough_bandages',
    name: 'Tough Bandages',
    description: 'When you discard a card, gain 3 Block.',
    rarity: 'uncommon',
    trigger: 'passive',
    emoji: '🩹',
  },
  horn_cleat: {
    id: 'horn_cleat',
    name: 'Horn Cleat',
    description: 'At the start of your 2nd turn, gain 14 Block.',
    rarity: 'uncommon',
    trigger: 'turn_start',
    emoji: '⚓',
  },
  strange_spoon: {
    id: 'strange_spoon',
    name: 'Strange Spoon',
    description: '50% chance to not exhaust cards that exhaust.',
    rarity: 'uncommon',
    trigger: 'passive',
    emoji: '🥄',
  },
  ornamental_fan: {
    id: 'ornamental_fan',
    name: 'Ornamental Fan',
    description: 'Every time you play 3 Attacks in a turn, gain 4 Block.',
    rarity: 'common',
    trigger: 'passive',
    emoji: '🪭',
  },
  art_of_war: {
    id: 'art_of_war',
    name: 'Art of War',
    description: 'If you did not play an Attack last turn, gain 1 extra Energy this turn.',
    rarity: 'rare',
    trigger: 'turn_start',
    emoji: '📜',
  },
  talisman: {
    id: 'talisman',
    name: 'Talisman',
    description: 'Whenever you play a Power card, gain 1 Energy.',
    rarity: 'uncommon',
    trigger: 'card_play',
    emoji: '🔱',
  },
  gremlin_horn: {
    id: 'gremlin_horn',
    name: 'Gremlin Horn',
    description: 'Whenever an enemy dies, gain 1 Energy and draw 1 card.',
    rarity: 'rare',
    trigger: 'combat_end',
    emoji: '📯',
  },
  thread_and_needle: {
    id: 'thread_and_needle',
    name: 'Thread and Needle',
    description: 'At the start of combat, gain 4 Plated Armor.',
    rarity: 'rare',
    trigger: 'combat_start',
    emoji: '🧵',
  },
  bottled_flame: {
    id: 'bottled_flame',
    name: 'Bottled Flame',
    description: 'Upon pickup, choose an Attack card. It starts in your hand each combat.',
    rarity: 'uncommon',
    trigger: 'combat_start',
    emoji: '🔥',
  },
  bottled_tornado: {
    id: 'bottled_tornado',
    name: 'Bottled Tornado',
    description: 'Upon pickup, choose a Skill card. It starts in your hand each combat.',
    rarity: 'uncommon',
    trigger: 'combat_start',
    emoji: '🌪️',
  },
  philosophers_stone: {
    id: 'philosophers_stone',
    name: "Philosopher's Stone",
    description: 'Gain 1 extra energy each turn. Enemies start with 1 Strength.',
    rarity: 'boss',
    trigger: 'passive',
    emoji: '🔮',
  },
  fusion_hammer: {
    id: 'fusion_hammer',
    name: 'Fusion Hammer',
    description: 'Gain 1 extra energy each turn. You can no longer Smith at rest sites.',
    rarity: 'boss',
    trigger: 'passive',
    emoji: '🔨',
  },
  snecko_eye: {
    id: 'snecko_eye',
    name: 'Snecko Eye',
    description: 'Draw 2 extra cards each turn. Card costs are randomized.',
    rarity: 'boss',
    trigger: 'passive',
    emoji: '👁️',
  },
};

export const COMMON_RELICS = Object.values(ALL_RELICS).filter((r) => r.rarity === 'common').map((r) => r.id);
export const UNCOMMON_RELICS = Object.values(ALL_RELICS).filter((r) => r.rarity === 'uncommon').map((r) => r.id);
export const RARE_RELICS = Object.values(ALL_RELICS).filter((r) => r.rarity === 'rare').map((r) => r.id);
export const BOSS_RELICS = Object.values(ALL_RELICS).filter((r) => r.rarity === 'boss').map((r) => r.id);

export function pickRandomRelic(
  owned: string[],
  rarity?: RelicRarity
): string | null {
  const pool = Object.values(ALL_RELICS)
    .filter((r) => !owned.includes(r.id) && (!rarity || r.rarity === rarity))
    .map((r) => r.id);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
