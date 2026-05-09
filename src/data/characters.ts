export interface CharacterDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  maxHP: number;
  startingRelic: string;
  startingDeck: Array<{ cardId: string; count: number }>;
  specialty: string;
}

export const ALL_CHARACTERS: Record<string, CharacterDefinition> = {
  blobguard: {
    id: 'blobguard',
    name: 'Blobguard',
    emoji: '🧙',
    description: 'The classic blob warrior. Strong defense, reliable damage.',
    color: '#e74c3c',
    maxHP: 80,
    startingRelic: 'burning_blood',
    startingDeck: [
      { cardId: 'strike', count: 5 },
      { cardId: 'defend', count: 5 },
    ],
    specialty: 'Defense & Strength scaling',
  },
  shadowblob: {
    id: 'shadowblob',
    name: 'Shadowblob',
    emoji: '🐱‍👤',
    description: 'Quick and toxic. Synergizes poison with weak and draw.',
    color: '#27ae60',
    maxHP: 70,
    startingRelic: 'bag_of_preparation',
    startingDeck: [
      { cardId: 'strike', count: 2 },
      { cardId: 'defend', count: 3 },
      { cardId: 'poison_blade', count: 2 },
      { cardId: 'zoom_bonk', count: 2 },
      { cardId: 'weaken_strike', count: 1 },
    ],
    specialty: 'Poison & Weak synergy',
  },
  arcanoblob: {
    id: 'arcanoblob',
    name: 'Arcanoblob',
    emoji: '🔮',
    description: 'Power through relics and powers. High risk, high reward.',
    color: '#8e44ad',
    maxHP: 72,
    startingRelic: 'centennial_puzzle',
    startingDeck: [
      { cardId: 'strike', count: 4 },
      { cardId: 'defend', count: 3 },
      { cardId: 'inflame', count: 1 },
      { cardId: 'metallicize', count: 1 },
      { cardId: 'miracle', count: 1 },
    ],
    specialty: 'Power cards & Ethereal',
  },
};

export const CHARACTER_IDS = Object.keys(ALL_CHARACTERS);
