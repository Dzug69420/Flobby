export type CardCategory = 'attack' | 'defense' | 'combo' | 'status' | 'power';

export type StatusEffectType =
  | 'vulnerable'
  | 'weak'
  | 'frail'
  | 'poison'
  | 'strength'
  | 'dexterity'
  | 'metallicize'
  | 'ritual';

export interface StatusEffect {
  type: StatusEffectType;
  stacks: number;
}

export interface CombatContext {
  playerHP: number;
  playerMaxHP: number;
  playerBlock: number;
  playerEnergy: number;
  enemyHP: number;
  enemyBlock: number;
  cardsInHand: CardInstance[];
  cardsInDiscard: CardInstance[];
  cardsInDeck: CardInstance[];
  turnNumber: number;
  cardsPlayedThisTurn: number;
  playerStatuses: StatusEffect[];
  enemyStatuses: StatusEffect[];
}

export interface CombatDelta {
  playerHPChange?: number;
  playerBlockChange?: number;
  enemyHPChange?: number;
  enemyBlockChange?: number;
  drawCards?: number;
  energyChange?: number;
  applyEnemyStatuses?: StatusEffect[];
  applyPlayerStatuses?: StatusEffect[];
  hits?: number;
  exhaustHand?: boolean;
}

export type CardEffectFn = (ctx: CombatContext) => CombatDelta;

export interface CardDefinition {
  id: string;
  name: string;
  category: CardCategory;
  description: string;
  cost: number;
  effect: CardEffectFn;
  exhaust?: boolean;
  rarity?: 'common' | 'uncommon' | 'rare';
  upgraded?: boolean;
  upgradeId?: string;
  isStatusCard?: boolean;
  isUnplayable?: boolean;
  innate?: boolean;
  retain?: boolean;
}

export interface CardInstance {
  instanceId: string;
  definitionId: string;
}

export type AttackPattern =
  | { type: 'consistent' }
  | { type: 'alternating'; firstTurn: 'attack' | 'defend' }
  | { type: 'cycle'; pattern: Array<'attack' | 'defend'> }
  | { type: 'random'; attackChance: number }
  | { type: 'boss_pattern' };

export type BossMechanic =
  | { type: 'block_reduction'; fraction: number }
  | { type: 'enraged'; attackBonus: number; threshold: number };
export type EliteMechanic =
  | { type: 'enrage'; strengthPerSkill: number }
  | { type: 'wound_on_defend'; wounds: number }
  | { type: 'ritual'; strengthPerTurn: number };

export interface EnemyDefinition {
  id: string;
  name: string;
  maxHP: number;
  baseAttack: number;
  attackPattern: AttackPattern;
  isBoss: boolean;
  isElite?: boolean;
  specialMechanic?: BossMechanic;
  eliteMechanic?: EliteMechanic;
  color: string;
  bodySize: number;
  faceEmoji: string;
  attackStatuses?: StatusEffect[];
  startingBlock?: number;
  startingStatuses?: StatusEffect[];
}

export type RoomType = 'monster' | 'elite' | 'rest' | 'shop' | 'treasure' | 'event' | 'boss';

export interface MapNode {
  id: string;
  floor: number;
  col: number;
  roomType: RoomType;
  connections: string[];
  visited: boolean;
  available: boolean;
  enemyIndex?: number;
}

export type GamePhase = 'start' | 'character_select' | 'blessing' | 'map' | 'combat' | 'reward' | 'rest' | 'shop' | 'event' | 'gameover' | 'victory';

export interface ShopItem {
  cardId: string;
  price: number;
  sold: boolean;
}

export interface GameState {
  phase: GamePhase;
  currentStage: number;
  map: MapNode[];
  currentFloor: number;
  currentAct: number;
  gold: number;
  lastGoldReward: number;
  shopInventory: ShopItem[];
  cardRemovalCost: number;
  relics: string[];
  potions: string[];
  currentEvent: import('../data/events').EventDefinition | null;
  cardsPlayedTotal: number;
  tookDamageThisCombat: boolean;
  restedLastSite: boolean;
  ascensionLevel: number;
  runsCompleted: number;
  selectedCharacter: string;
  currentRunScore: number;
  bestScore: number;
  playerHP: number;
  playerMaxHP: number;
  playerBlock: number;
  playerEnergy: number;
  playerMaxEnergy: number;
  deck: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
  exhaustPile: CardInstance[];
  retainedCards: CardInstance[];
  currentEnemy: EnemyDefinition | null;
  enemyHP: number;
  enemyBlock: number;
  enemyTurnAction: 'attack' | 'defend' | null;
  bossEnraged: boolean;
  activePowers: string[];
  combatLog: string[];
  attackCardsPlayedTotal: number;
  attackPlayedThisTurn: boolean;
  sneckoCosts: Record<string, number>;
  bottledCardId: string | null;
  turnNumber: number;
  cardsPlayedThisTurn: number;
  rewardChoices: CardDefinition[];
  masterCardPool: Record<string, CardDefinition>;
  playerStatuses: StatusEffect[];
  enemyStatuses: StatusEffect[];
}
