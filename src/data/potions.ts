export interface PotionDefinition {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
}

export const ALL_POTIONS: Record<string, PotionDefinition> = {
  health_potion: {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'Restore 20% max HP.',
    emoji: '❤️',
    color: '#e74c3c',
  },
  block_potion: {
    id: 'block_potion',
    name: 'Block Potion',
    description: 'Gain 12 Block.',
    emoji: '🛡️',
    color: '#4fc3f7',
  },
  attack_potion: {
    id: 'attack_potion',
    name: 'Attack Potion',
    description: 'Deal 10 damage.',
    emoji: '⚔️',
    color: '#e74c3c',
  },
  strength_potion: {
    id: 'strength_potion',
    name: 'Strength Potion',
    description: 'Gain 3 Strength this combat.',
    emoji: '💪',
    color: '#ff8c42',
  },
  dexterity_potion: {
    id: 'dexterity_potion',
    name: 'Dexterity Potion',
    description: 'Gain 3 Dexterity this combat.',
    emoji: '🦋',
    color: '#80deea',
  },
  energy_potion: {
    id: 'energy_potion',
    name: 'Energy Potion',
    description: 'Gain 2 Energy this turn.',
    emoji: '⚡',
    color: '#f9a825',
  },
  card_draw_potion: {
    id: 'card_draw_potion',
    name: 'Clarity Potion',
    description: 'Draw 3 cards.',
    emoji: '🃏',
    color: '#9b59b6',
  },
  fire_potion: {
    id: 'fire_potion',
    name: 'Fire Potion',
    description: 'Deal 20 damage.',
    emoji: '🔥',
    color: '#ff5722',
  },
  poison_potion: {
    id: 'poison_potion',
    name: 'Poison Potion',
    description: 'Apply 6 Poison to the enemy.',
    emoji: '☠️',
    color: '#66bb6a',
  },
  vulnerable_potion: {
    id: 'vulnerable_potion',
    name: 'Weakness Potion',
    description: 'Apply 3 Vulnerable to the enemy.',
    emoji: '💢',
    color: '#ff8f8f',
  },
};

export const POTION_POOL = Object.keys(ALL_POTIONS);

export function pickRandomPotion(exclude: string[] = []): string {
  const pool = POTION_POOL.filter((id) => !exclude.includes(id));
  return pool[Math.floor(Math.random() * pool.length)] ?? POTION_POOL[0];
}
