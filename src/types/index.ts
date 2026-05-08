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
}

export interface CardInstance {
  instanceId: string;
  definitionId: string;
}

export type AttackPattern =
  | { type: 'consistent' }
  | { type: 'alternating'; firstTurn: 'attack' | 'defend' }
  | { type: 'boss_pattern' };

export type BossMechanic = { type: 'block_reduction'; fraction: number };

export interface EnemyDefinition {
  id: string;
  name: string;
  maxHP: number;
  baseAttack: number;
  attackPattern: AttackPattern;
  isBoss: boolean;
  specialMechanic?: BossMechanic;
  color: string;
  bodySize: number;
  faceEmoji: string;
  attackStatuses?: StatusEffect[];
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

export type GamePhase = 'start' | 'map' | 'combat' | 'reward' | 'rest' | 'gameover' | 'victory';

export interface GameState {
  phase: GamePhase;
  currentStage: number;
  map: MapNode[];
  currentFloor: number;
  currentAct: number;
  playerHP: number;
  playerMaxHP: number;
  playerBlock: number;
  playerEnergy: number;
  playerMaxEnergy: number;
  deck: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
  currentEnemy: EnemyDefinition | null;
  enemyHP: number;
  enemyBlock: number;
  enemyTurnAction: 'attack' | 'defend' | null;
  turnNumber: number;
  cardsPlayedThisTurn: number;
  rewardChoices: CardDefinition[];
  masterCardPool: Record<string, CardDefinition>;
  playerStatuses: StatusEffect[];
  enemyStatuses: StatusEffect[];
}
