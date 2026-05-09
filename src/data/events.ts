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
  {
    id: 'vampires',
    title: 'Vampires',
    description: 'Three vampires offer a pact of blood and power.',
    emoji: '🧛',
    choices: [
      { label: 'Accept pact', description: 'Lose 3 max HP. All your Strikes become Fangs (deal 12 dmg, heal 3 HP).', hpCost: 3, effect: 'nothing', emoji: '🩸' },
      { label: 'Decline', description: 'You value your health too much.', effect: 'nothing', emoji: '🚪' },
    ],
  },
  {
    id: 'knowing_skull',
    title: 'The Knowing Skull',
    description: 'A floating skull claims to see your future.',
    emoji: '💀',
    choices: [
      { label: 'Ask about strength', description: 'Pay 6 HP to gain 2 Strength this run.', hpCost: 6, effect: 'nothing', emoji: '💪' },
      { label: 'Ask about gold', description: 'Pay 6 HP to gain 100 gold.', hpCost: 6, effect: 'gold', effectValue: 100, emoji: '🪙' },
      { label: 'Leave it', description: 'The skull\'s predictions are too costly.', effect: 'nothing', emoji: '🚪' },
    ],
  },
  {
    id: 'ssss',
    title: 'Scrap Ooze',
    description: 'A scrap ooze blocks your path, but has a relic stuck inside.',
    emoji: '🟢',
    choices: [
      { label: 'Try (5 HP)', description: 'Pay 5 HP. 50% chance: get relic. Otherwise, retry costs +5 HP.', hpCost: 5, effect: 'relic', emoji: '🎲' },
      { label: 'Ignore it', description: 'Step around the ooze.', effect: 'nothing', emoji: '🚪' },
    ],
  },
  {
    id: 'winding_halls',
    title: 'Winding Halls',
    description: 'The halls wind endlessly. Your mind begins to slip.',
    emoji: '🌀',
    choices: [
      { label: 'Press on', description: 'Take 12 damage. Add a Madness to your deck.', hpCost: 12, effect: 'nothing', emoji: '🧠' },
      { label: 'Turn back', description: 'You lose 3 max HP from the confusion.', effect: 'max_hp_up', effectValue: -3, emoji: '↩️' },
    ],
  },
  {
    id: 'the_mausoleum',
    title: 'The Mausoleum',
    description: 'A crypt filled with ancient power. Disturb the dead?',
    emoji: '⚰️',
    choices: [
      { label: 'Open a coffin', description: '50%: gain a Rare relic. 50%: gain a Curse.', effect: 'relic', emoji: '🎲' },
      { label: 'Leave', description: 'Respect the dead.', effect: 'nothing', emoji: '🚪' },
    ],
  },
  {
    id: 'upgrade_shrine',
    title: 'Upgrade Shrine',
    description: 'A glowing shrine offers to enhance one of your cards.',
    emoji: '⬆️',
    choices: [
      { label: 'Upgrade', description: 'Upgrade a random card in your deck.', effect: 'upgrade_card', effectValue: 1, emoji: '⚒️' },
      { label: 'Ignore', description: 'Leave the shrine untouched.', effect: 'nothing', emoji: '🚪' },
    ],
  },
  {
    id: 'gold_shrine',
    title: 'Gold Shrine',
    description: 'A pile of gold glitters before you, seemingly free for the taking.',
    emoji: '💰',
    choices: [
      { label: 'Take it!', description: 'Gain 80 gold.', effect: 'gold', effectValue: 80, emoji: '🪙' },
      { label: 'Leave it', description: 'Something feels off about this.', effect: 'nothing', emoji: '🚪' },
    ],
  },
  {
    id: 'golden_wing',
    title: 'Golden Wing',
    description: 'A golden feather floats before you. Taking it seems too easy.',
    emoji: '🪶',
    choices: [
      { label: 'Take it', description: 'Gain 150 gold. Your max HP is reduced by 5.', effect: 'gold', effectValue: 150, emoji: '🪙' },
      { label: 'Leave it', description: 'Some prices are too high.', effect: 'nothing', emoji: '🚪' },
    ],
  },
];

export function pickRandomEvent(): EventDefinition {
  return ALL_EVENTS[Math.floor(Math.random() * ALL_EVENTS.length)];
}
