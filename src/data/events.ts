export interface EventChoice {
  label: string;
  description: string;
  cost?: number;
  goldCost?: number;
  hpCost?: number;
  effect: 'heal' | 'gold' | 'relic' | 'card' | 'remove_card' | 'upgrade_card' | 'add_wounds' | 'nothing' | 'max_hp_up' | 'add_potion';
  effectValue?: number;
  emoji: string;
}

export interface EventDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  choices: EventChoice[];
}

export const ALL_EVENTS: EventDefinition[] = [
  {
    id: 'cleric',
    title: 'The Cleric',
    description: 'A wandering cleric offers their services.',
    emoji: '🧙‍♂️',
    choices: [
      { label: 'Heal', description: 'Pay 35 gold to heal 20% HP.', goldCost: 35, effect: 'heal', effectValue: 20, emoji: '❤️' },
      { label: 'Purify', description: 'Pay 50 gold to remove a card from your deck.', goldCost: 50, effect: 'remove_card', emoji: '✨' },
      { label: 'Leave', description: 'Continue on your way.', effect: 'nothing', emoji: '🚪' },
    ],
  },
  {
    id: 'wheel_of_change',
    title: 'Wheel of Change',
    description: 'A mysterious spinning wheel. Will you spin it?',
    emoji: '🎡',
    choices: [
      { label: 'Spin!', description: 'Gain 50 gold... or lose 20 HP. 50/50.', effect: 'gold', effectValue: 50, emoji: '🎲' },
      { label: 'Walk Away', description: 'Not worth the risk.', effect: 'nothing', emoji: '🚪' },
    ],
  },
  {
    id: 'mysterious_chest',
    title: 'Mysterious Chest',
    description: 'A chest with a strange lock. Breaking it open might hurt.',
    emoji: '📦',
    choices: [
      { label: 'Open it', description: 'Take 15 damage and gain a rare relic.', hpCost: 15, effect: 'relic', emoji: '💎' },
      { label: 'Leave it', description: 'Some things are better left alone.', effect: 'nothing', emoji: '🚪' },
    ],
  },
  {
    id: 'shining_light',
    title: 'Shining Light',
    description: 'A bright light from above offers to upgrade cards.',
    emoji: '✨',
    choices: [
      { label: 'Accept', description: 'Upgrade 2 random cards. Take 20 damage.', hpCost: 20, effect: 'upgrade_card', effectValue: 2, emoji: '⬆️' },
      { label: 'Decline', description: 'The light fades.', effect: 'nothing', emoji: '🚪' },
    ],
  },
  {
    id: 'dead_adventurer',
    title: 'Dead Adventurer',
    description: 'A fallen hero lies on the ground. They have a relic...',
    emoji: '💀',
    choices: [
      { label: 'Take relic', description: 'Take the relic but shuffle 2 Wounds into your deck.', effect: 'relic', emoji: '🎒' },
      { label: 'Pay respects', description: 'Leave without disturbing them.', effect: 'nothing', emoji: '🕯️' },
    ],
  },
  {
    id: 'old_beggar',
    title: 'Old Beggar',
    description: 'An old beggar needs help desperately.',
    emoji: '🧓',
    choices: [
      { label: 'Give gold (75)', description: 'Pay 75 gold to gain a potion and 20 gold back.', goldCost: 75, effect: 'add_potion', effectValue: 20, emoji: '💰' },
      { label: 'Keep walking', description: 'You have your own problems.', effect: 'nothing', emoji: '🚪' },
    ],
  },
  {
    id: 'library',
    title: 'The Library',
    description: 'A vast library filled with ancient tomes.',
    emoji: '📚',
    choices: [
      { label: 'Study', description: 'Take 10 damage to upgrade a card.', hpCost: 10, effect: 'upgrade_card', effectValue: 1, emoji: '📖' },
      { label: 'Rest', description: 'Rest among the books. Heal 10 HP.', effect: 'heal', effectValue: 10, emoji: '💤' },
    ],
  },
  {
    id: 'cursed_tome',
    title: 'Cursed Tome',
    description: 'A tome radiates dark energy.',
    emoji: '📕',
    choices: [
      { label: 'Read it', description: 'Gain 25 gold but add 1 Wound to your deck.', effect: 'gold', effectValue: 25, emoji: '📖' },
      { label: 'Burn it', description: 'Destroy the tome.', effect: 'nothing', emoji: '🔥' },
    ],
  },
  {
    id: 'forge',
    title: 'Abandoned Forge',
    description: 'A working forge with no smith in sight.',
    emoji: '⚒️',
    choices: [
      { label: 'Use it', description: 'Upgrade any card. Takes 10 HP.', hpCost: 10, effect: 'upgrade_card', effectValue: 1, emoji: '⬆️' },
      { label: 'Ignore', description: 'Press forward.', effect: 'nothing', emoji: '🚪' },
    ],
  },
  {
    id: 'merchant_ambush',
    title: 'Traveling Merchant',
    description: 'A merchant with peculiar wares blocks the path.',
    emoji: '🧟',
    choices: [
      { label: 'Trade', description: 'Gain a free potion in exchange for 30 gold.', goldCost: 30, effect: 'add_potion', emoji: '🍶' },
      { label: 'Push past', description: 'You don\'t have time for this.', effect: 'nothing', emoji: '🚪' },
    ],
  },
  {
    id: 'metamorphosis',
    title: 'Strange Alchemy',
    description: 'A glowing pool shimmers. Cards thrown in emerge changed.',
    emoji: '🌀',
    choices: [
      { label: 'Transform a card', description: 'A random card in your deck becomes a different random card.', effect: 'nothing', emoji: '✨' },
      { label: 'Leave', description: 'Some changes cannot be undone.', effect: 'nothing', emoji: '🚪' },
    ],
  },
  {
    id: 'bonfire',
    title: 'The Bonfire',
    description: 'Warm flames offer rejuvenation.',
    emoji: '🏕️',
    choices: [
      { label: 'Warm yourself', description: 'Heal 15 HP.', effect: 'heal', effectValue: 15, emoji: '❤️' },
      { label: 'Gain power', description: 'Take 8 damage to gain a random uncommon relic.', hpCost: 8, effect: 'relic', emoji: '✨' },
    ],
  },
  {
    id: 'armory',
    title: 'The Armory',
    description: 'An armory full of weapons and shields.',
    emoji: '⚔️',
    choices: [
      { label: 'Take a weapon', description: 'Add a random Attack card to your deck.', effect: 'card', emoji: '⚔️' },
      { label: 'Take a shield', description: 'Add a random Defense card to your deck.', effect: 'card', emoji: '🛡️' },
    ],
  },
];

export function pickRandomEvent(): EventDefinition {
  return ALL_EVENTS[Math.floor(Math.random() * ALL_EVENTS.length)];
}
