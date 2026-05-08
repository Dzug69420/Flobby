import { CardDefinition } from '../types';

export const ALL_CARDS: Record<string, CardDefinition> = {
  // ── STARTING CARDS ──────────────────────────────────────────────────────────
  strike: {
    id: 'strike',
    name: 'Bonk',
    category: 'attack',
    description: 'Deal 6 damage.',
    cost: 1,
    rarity: 'common',
    upgradeId: 'strike_plus',
    effect: () => ({ enemyHPChange: -6 }),
  },
  defend: {
    id: 'defend',
    name: 'Blogg',
    category: 'defense',
    description: 'Gain 5 block.',
    cost: 1,
    rarity: 'common',
    upgradeId: 'defend_plus',
    effect: () => ({ playerBlockChange: 5 }),
  },

  // ── COMMON ATTACKS ───────────────────────────────────────────────────────────
  heavy_blow: {
    id: 'heavy_blow',
    name: 'The Big Bonk',
    category: 'attack',
    description: 'Deal 15 damage.',
    cost: 2,
    rarity: 'common',
    upgradeId: 'heavy_blow_plus',
    effect: () => ({ enemyHPChange: -15 }),
  },
  twin_strike: {
    id: 'twin_strike',
    name: 'Double Bop',
    category: 'attack',
    description: 'Deal 4 damage twice.',
    cost: 1,
    rarity: 'common',
    upgradeId: 'twin_strike_plus',
    effect: () => ({ enemyHPChange: -9 }),
  },
  cleave: {
    id: 'cleave',
    name: 'Swoosh',
    category: 'attack',
    description: 'Deal 8 damage.',
    cost: 1,
    rarity: 'common',
    upgradeId: 'cleave_plus',
    effect: () => ({ enemyHPChange: -8 }),
  },
  mob_rule: {
    id: 'mob_rule',
    name: 'Mob Rule',
    category: 'attack',
    description: 'Deal 2 dmg per other card in hand.',
    cost: 1,
    rarity: 'common',
    effect: (ctx) => ({ enemyHPChange: -(2 * Math.max(0, ctx.cardsInHand.length - 1)) }),
  },

  // ── UNCOMMON ATTACKS ─────────────────────────────────────────────────────────
  armor_break: {
    id: 'armor_break',
    name: 'Can Opener',
    category: 'attack',
    description: 'Deal 10 dmg. Remove all enemy block.',
    cost: 2,
    rarity: 'uncommon',
    effect: (ctx) => ({ enemyHPChange: -10, enemyBlockChange: -ctx.enemyBlock }),
  },
  flurry: {
    id: 'flurry',
    name: 'Tickle Storm',
    category: 'attack',
    description: 'Deal 4 damage three times.',
    cost: 2,
    rarity: 'uncommon',
    effect: () => ({ enemyHPChange: -12 }),
  },
  execute: {
    id: 'execute',
    name: 'Pile On',
    category: 'attack',
    description: 'Deal 4 + N dmg (N = discard size).',
    cost: 2,
    rarity: 'uncommon',
    effect: (ctx) => ({ enemyHPChange: -(4 + ctx.cardsInDiscard.length) }),
  },
  bash: {
    id: 'bash',
    name: 'Bash',
    category: 'attack',
    description: 'Deal 8 dmg. Apply 2 Vulnerable.',
    cost: 2,
    rarity: 'uncommon',
    upgradeId: 'bash_plus',
    effect: () => ({
      enemyHPChange: -8,
      applyEnemyStatuses: [{ type: 'vulnerable', stacks: 2 }],
    }),
  },
  weaken_strike: {
    id: 'weaken_strike',
    name: 'Soggy Slap',
    category: 'attack',
    description: 'Deal 7 dmg. Apply 2 Weak.',
    cost: 1,
    rarity: 'uncommon',
    effect: () => ({
      enemyHPChange: -7,
      applyEnemyStatuses: [{ type: 'weak', stacks: 2 }],
    }),
  },
  poison_blade: {
    id: 'poison_blade',
    name: 'Gooey Stab',
    category: 'attack',
    description: 'Deal 6 dmg. Apply 3 Poison.',
    cost: 1,
    rarity: 'uncommon',
    effect: () => ({
      enemyHPChange: -6,
      applyEnemyStatuses: [{ type: 'poison', stacks: 3 }],
    }),
  },

  // ── RARE ATTACKS ─────────────────────────────────────────────────────────────
  power_surge: {
    id: 'power_surge',
    name: 'YEET',
    category: 'attack',
    description: 'Deal 22 damage.',
    cost: 3,
    rarity: 'rare',
    effect: () => ({ enemyHPChange: -22 }),
  },
  combo_strike: {
    id: 'combo_strike',
    name: 'Combo Strike',
    category: 'attack',
    description: 'Deal 8 dmg. 16 if 2+ cards played.',
    cost: 1,
    rarity: 'rare',
    effect: (ctx) => ({ enemyHPChange: ctx.cardsPlayedThisTurn >= 2 ? -16 : -8 }),
  },

  // ── COMMON DEFENSE ───────────────────────────────────────────────────────────
  iron_wave: {
    id: 'iron_wave',
    name: "Big Ol' Shield",
    category: 'defense',
    description: 'Gain 10 block.',
    cost: 1,
    rarity: 'common',
    upgradeId: 'iron_wave_plus',
    effect: () => ({ playerBlockChange: 10 }),
  },
  fortify: {
    id: 'fortify',
    name: 'Bunker Down',
    category: 'defense',
    description: 'Gain 8 block. Draw 1 card.',
    cost: 1,
    rarity: 'common',
    upgradeId: 'fortify_plus',
    effect: () => ({ playerBlockChange: 8, drawCards: 1 }),
  },
  double_up: {
    id: 'double_up',
    name: 'Shield Goes Brrr',
    category: 'defense',
    description: 'Double your block (min +4).',
    cost: 1,
    rarity: 'common',
    effect: (ctx) => ({ playerBlockChange: Math.max(4, ctx.playerBlock) }),
  },

  // ── UNCOMMON DEFENSE ─────────────────────────────────────────────────────────
  barrier: {
    id: 'barrier',
    name: 'Shield Party',
    category: 'defense',
    description: 'Gain 3 block per Blogg in hand.',
    cost: 1,
    rarity: 'uncommon',
    effect: (ctx) => ({
      playerBlockChange: ctx.cardsInHand.filter((c) => c.definitionId === 'defend').length * 3,
    }),
  },

  // ── RARE DEFENSE ─────────────────────────────────────────────────────────────
  turtle_up: {
    id: 'turtle_up',
    name: 'Turtle Up',
    category: 'defense',
    description: 'Gain 20 block.',
    cost: 3,
    rarity: 'rare',
    effect: () => ({ playerBlockChange: 20 }),
  },

  // ── COMMON COMBO ─────────────────────────────────────────────────────────────
  retaliate: {
    id: 'retaliate',
    name: "Ow, That's Mine",
    category: 'combo',
    description: 'Deal 5 dmg. Gain 5 block.',
    cost: 1,
    rarity: 'common',
    effect: () => ({ enemyHPChange: -5, playerBlockChange: 5 }),
  },
  war_cry: {
    id: 'war_cry',
    name: 'Grrrrr',
    category: 'combo',
    description: 'Deal 4 dmg. Gain 6 block.',
    cost: 1,
    rarity: 'common',
    effect: () => ({ enemyHPChange: -4, playerBlockChange: 6 }),
  },
  zoom_bonk: {
    id: 'zoom_bonk',
    name: 'Zoom Bonk',
    category: 'combo',
    description: 'Deal 6 dmg. Draw 1 card.',
    cost: 1,
    rarity: 'common',
    effect: () => ({ enemyHPChange: -6, drawCards: 1 }),
  },

  // ── UNCOMMON COMBO ───────────────────────────────────────────────────────────
  slash_and_guard: {
    id: 'slash_and_guard',
    name: "Bonk 'n' Block",
    category: 'combo',
    description: 'Deal 10 dmg. Gain 6 block.',
    cost: 2,
    rarity: 'uncommon',
    effect: () => ({ enemyHPChange: -10, playerBlockChange: 6 }),
  },
  counter: {
    id: 'counter',
    name: 'No U',
    category: 'combo',
    description: 'Deal 12 dmg. Gain 5 block.',
    cost: 2,
    rarity: 'uncommon',
    effect: () => ({ enemyHPChange: -12, playerBlockChange: 5 }),
  },
  shield_bash: {
    id: 'shield_bash',
    name: 'Shield Slam',
    category: 'combo',
    description: 'Deal damage equal to your block (min 3).',
    cost: 1,
    rarity: 'uncommon',
    effect: (ctx) => ({ enemyHPChange: -Math.max(3, ctx.playerBlock) }),
  },

  // ── COMMON STATUS / UTILITY ──────────────────────────────────────────────────
  adrenaline: {
    id: 'adrenaline',
    name: 'Sugar Rush',
    category: 'status',
    description: 'Draw 2 extra cards.',
    cost: 1,
    rarity: 'common',
    effect: () => ({ drawCards: 2 }),
  },
  hyper: {
    id: 'hyper',
    name: 'Hyper',
    category: 'status',
    description: 'Gain 1 energy.',
    cost: 0,
    rarity: 'common',
    effect: () => ({ energyChange: 1 }),
  },
  gobble_up: {
    id: 'gobble_up',
    name: 'Gobble Up',
    category: 'status',
    description: 'Restore 8 HP.',
    cost: 2,
    rarity: 'common',
    effect: () => ({ playerHPChange: 8 }),
  },

  // ── UNCOMMON STATUS / UTILITY ────────────────────────────────────────────────
  rage: {
    id: 'rage',
    name: 'Tantrum',
    category: 'status',
    description: 'Deal 2 dmg per card in discard.',
    cost: 1,
    rarity: 'uncommon',
    effect: (ctx) => ({ enemyHPChange: -(2 * ctx.cardsInDiscard.length) }),
  },
  desperation: {
    id: 'desperation',
    name: 'Last Resort',
    category: 'status',
    description: 'Deal 12 dmg (only 4 if HP > 75%).',
    cost: 1,
    rarity: 'uncommon',
    effect: (ctx) => ({
      enemyHPChange: ctx.playerHP <= ctx.playerMaxHP * 0.75 ? -12 : -4,
    }),
  },
  last_stand: {
    id: 'last_stand',
    name: 'Nope.',
    category: 'status',
    description: 'Gain 14 block (only 4 if HP > 75%).',
    cost: 1,
    rarity: 'uncommon',
    effect: (ctx) => ({
      playerBlockChange: ctx.playerHP <= ctx.playerMaxHP * 0.75 ? 14 : 4,
    }),
  },
  second_wind: {
    id: 'second_wind',
    name: 'Second Wind',
    category: 'status',
    description: 'Draw 3 cards.',
    cost: 2,
    rarity: 'uncommon',
    effect: () => ({ drawCards: 3 }),
  },

  // ── RARE STATUS / UTILITY ────────────────────────────────────────────────────

  // ── POWER CARDS ──────────────────────────────────────────────────────────────
  inflame: {
    id: 'inflame',
    name: 'Inflame',
    category: 'power',
    description: 'Gain 2 Strength for the rest of combat.',
    cost: 1,
    rarity: 'uncommon',
    upgradeId: 'inflame_plus',
    effect: () => ({
      applyPlayerStatuses: [{ type: 'strength', stacks: 2 }],
    }),
  },
  flex: {
    id: 'flex',
    name: 'Flex',
    category: 'power',
    description: 'Gain 4 Strength. Lose it at turn end.',
    cost: 0,
    rarity: 'common',
    effect: () => ({
      applyPlayerStatuses: [{ type: 'strength', stacks: 4 }],
    }),
  },
  entrench: {
    id: 'entrench',
    name: 'Entrench',
    category: 'power',
    description: 'Gain 5 block. Gain 1 Dexterity.',
    cost: 2,
    rarity: 'uncommon',
    effect: () => ({
      playerBlockChange: 5,
      applyPlayerStatuses: [{ type: 'dexterity', stacks: 1 }],
    }),
  },
  metallicize: {
    id: 'metallicize',
    name: 'Metallicize',
    category: 'power',
    description: 'Gain 3 Block at the start of each turn.',
    cost: 1,
    rarity: 'uncommon',
    effect: () => ({
      applyPlayerStatuses: [{ type: 'metallicize', stacks: 3 }],
    }),
  },
  toxic_cloud: {
    id: 'toxic_cloud',
    name: 'Toxic Cloud',
    category: 'power',
    description: 'Apply 5 Poison to the enemy.',
    cost: 2,
    rarity: 'rare',
    effect: () => ({
      applyEnemyStatuses: [{ type: 'poison', stacks: 5 }],
    }),
  },

  // ── UPGRADED CARDS (+ variants) ──────────────────────────────────────────────
  strike_plus: {
    id: 'strike_plus', name: 'Bonk+', category: 'attack',
    description: 'Deal 9 damage.', cost: 1, rarity: 'common', upgraded: true,
    effect: () => ({ enemyHPChange: -9 }),
  },
  defend_plus: {
    id: 'defend_plus', name: 'Blogg+', category: 'defense',
    description: 'Gain 8 block.', cost: 1, rarity: 'common', upgraded: true,
    effect: () => ({ playerBlockChange: 8 }),
  },
  heavy_blow_plus: {
    id: 'heavy_blow_plus', name: 'The Big Bonk+', category: 'attack',
    description: 'Deal 20 damage.', cost: 2, rarity: 'common', upgraded: true,
    effect: () => ({ enemyHPChange: -20 }),
  },
  twin_strike_plus: {
    id: 'twin_strike_plus', name: 'Double Bop+', category: 'attack',
    description: 'Deal 6 damage twice.', cost: 1, rarity: 'common', upgraded: true,
    effect: () => ({ enemyHPChange: -13 }),
  },
  cleave_plus: {
    id: 'cleave_plus', name: 'Swoosh+', category: 'attack',
    description: 'Deal 11 damage.', cost: 1, rarity: 'common', upgraded: true,
    effect: () => ({ enemyHPChange: -11 }),
  },
  iron_wave_plus: {
    id: 'iron_wave_plus', name: "Big Ol' Shield+", category: 'defense',
    description: 'Gain 14 block.', cost: 1, rarity: 'common', upgraded: true,
    effect: () => ({ playerBlockChange: 14 }),
  },
  fortify_plus: {
    id: 'fortify_plus', name: 'Bunker Down+', category: 'defense',
    description: 'Gain 11 block. Draw 1 card.', cost: 1, rarity: 'common', upgraded: true,
    effect: () => ({ playerBlockChange: 11, drawCards: 1 }),
  },
  bash_plus: {
    id: 'bash_plus', name: 'Bash+', category: 'attack',
    description: 'Deal 10 dmg. Apply 3 Vulnerable.', cost: 2, rarity: 'uncommon', upgraded: true,
    effect: () => ({
      enemyHPChange: -10,
      applyEnemyStatuses: [{ type: 'vulnerable', stacks: 3 }],
    }),
  },
  inflame_plus: {
    id: 'inflame_plus', name: 'Inflame+', category: 'power',
    description: 'Gain 3 Strength for the rest of combat.', cost: 1, rarity: 'uncommon', upgraded: true,
    effect: () => ({ applyPlayerStatuses: [{ type: 'strength', stacks: 3 }] }),
  },
  poison_blade_plus: {
    id: 'poison_blade_plus', name: 'Gooey Stab+', category: 'attack',
    description: 'Deal 8 dmg. Apply 5 Poison.', cost: 1, rarity: 'uncommon', upgraded: true,
    effect: () => ({
      enemyHPChange: -8,
      applyEnemyStatuses: [{ type: 'poison', stacks: 5 }],
    }),
  },
  retaliate_plus: {
    id: 'retaliate_plus', name: "Ow, That's Mine+", category: 'combo',
    description: 'Deal 8 dmg. Gain 8 block.', cost: 1, rarity: 'common', upgraded: true,
    effect: () => ({ enemyHPChange: -8, playerBlockChange: 8 }),
  },
  war_cry_plus: {
    id: 'war_cry_plus', name: 'Grrrrr+', category: 'combo',
    description: 'Deal 6 dmg. Gain 8 block.', cost: 1, rarity: 'common', upgraded: true,
    effect: () => ({ enemyHPChange: -6, playerBlockChange: 8 }),
  },
  slash_and_guard_plus: {
    id: 'slash_and_guard_plus', name: "Bonk 'n' Block+", category: 'combo',
    description: 'Deal 13 dmg. Gain 8 block.', cost: 2, rarity: 'uncommon', upgraded: true,
    effect: () => ({ enemyHPChange: -13, playerBlockChange: 8 }),
  },
};

export const STARTING_CARD_IDS = ['strike', 'defend'] as const;

export const REWARD_CARD_IDS = [
  // Common
  'heavy_blow', 'twin_strike', 'cleave', 'mob_rule',
  'iron_wave', 'fortify', 'double_up',
  'retaliate', 'war_cry', 'zoom_bonk',
  'adrenaline', 'hyper', 'gobble_up',
  'flex',
  // Uncommon
  'armor_break', 'flurry', 'execute', 'bash', 'weaken_strike', 'poison_blade',
  'barrier',
  'slash_and_guard', 'counter', 'shield_bash',
  'rage', 'desperation', 'last_stand', 'second_wind',
  'inflame', 'entrench', 'metallicize',
  // Rare
  'power_surge', 'combo_strike',
  'turtle_up',
  'toxic_cloud',
];

// Weighted reward pool by rarity
export const REWARD_CARD_WEIGHTS: Record<string, 'common' | 'uncommon' | 'rare'> = {
  heavy_blow: 'common', twin_strike: 'common', cleave: 'common', mob_rule: 'common',
  iron_wave: 'common', fortify: 'common', double_up: 'common',
  retaliate: 'common', war_cry: 'common', zoom_bonk: 'common',
  adrenaline: 'common', hyper: 'common', gobble_up: 'common', flex: 'common',
  armor_break: 'uncommon', flurry: 'uncommon', execute: 'uncommon',
  bash: 'uncommon', weaken_strike: 'uncommon', poison_blade: 'uncommon',
  barrier: 'uncommon', slash_and_guard: 'uncommon', counter: 'uncommon',
  shield_bash: 'uncommon', rage: 'uncommon', desperation: 'uncommon',
  last_stand: 'uncommon', second_wind: 'uncommon', inflame: 'uncommon',
  entrench: 'uncommon', metallicize: 'uncommon',
  power_surge: 'rare', combo_strike: 'rare', turtle_up: 'rare', toxic_cloud: 'rare',
};
