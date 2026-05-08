import { create } from 'zustand';
import { GameState, GamePhase, CardInstance, CombatContext, StatusEffect, StatusEffectType, MapNode, ShopItem } from '../types';
import { ALL_CARDS, REWARD_CARD_IDS, REWARD_CARD_WEIGHTS } from '../data/cards';
import { ENEMIES } from '../data/enemies';
import { generateMap, markNodeVisited } from '../data/map';
import { shuffle, pickRewardCards, clamp, generateId } from '../utils/gameLogic';

const PLAYER_MAX_HP = 80;
const PLAYER_MAX_ENERGY = 3;
const HAND_SIZE = 6;

function buildStartingDeck(): CardInstance[] {
  const deck: CardInstance[] = [];
  for (let i = 0; i < 5; i++) {
    deck.push({ instanceId: generateId(), definitionId: 'strike' });
    deck.push({ instanceId: generateId(), definitionId: 'defend' });
  }
  return deck;
}

function computeEnemyAction(
  pattern: { type: string; firstTurn?: string },
  turnNumber: number
): 'attack' | 'defend' {
  if (pattern.type === 'consistent' || pattern.type === 'boss_pattern') return 'attack';
  const isEven = turnNumber % 2 === 0;
  const attackOnEven = pattern.firstTurn === 'attack';
  return isEven === attackOnEven ? 'attack' : 'defend';
}

function getStatusStacks(statuses: StatusEffect[], type: StatusEffectType): number {
  return statuses.find((s) => s.type === type)?.stacks ?? 0;
}

function mergeStatuses(existing: StatusEffect[], toApply: StatusEffect[]): StatusEffect[] {
  const result = [...existing];
  for (const effect of toApply) {
    const idx = result.findIndex((s) => s.type === effect.type);
    if (idx >= 0) {
      result[idx] = { ...result[idx], stacks: result[idx].stacks + effect.stacks };
    } else {
      result.push({ ...effect });
    }
  }
  return result;
}

function tickTimedStatuses(statuses: StatusEffect[]): StatusEffect[] {
  return statuses
    .map((s) => {
      if (s.type === 'vulnerable' || s.type === 'weak' || s.type === 'frail') {
        return { ...s, stacks: s.stacks - 1 };
      }
      return s;
    })
    .filter((s) => s.stacks > 0);
}

interface GameActions {
  startGame: () => void;
  drawCards: (n: number) => void;
  playCard: (instanceId: string) => void;
  endTurn: () => void;
  stageWon: () => void;
  selectRewardCard: (cardId: string | null) => void;
  upgradeCard: (instanceId: string) => void;
  travelToNode: (nodeId: string) => void;
  leaveRestSite: () => void;
  buyShopCard: (cardId: string, price: number) => void;
  removeCard: (instanceId: string, price: number) => void;
  leaveShop: () => void;
  restartGame: () => void;
  goToMenu: () => void;
}

type GameStore = GameState & GameActions;

function generateShopInventory(weights: Record<string, 'common' | 'uncommon' | 'rare'>): ShopItem[] {
  const PRICES: Record<string, number> = { common: 50, uncommon: 85, rare: 130 };
  const picked = pickRewardCards(REWARD_CARD_IDS, 4, weights);
  return picked.map((id) => ({
    cardId: id,
    price: PRICES[weights[id] ?? 'common'] + Math.floor(Math.random() * 20) - 10,
    sold: false,
  }));
}

const initialState: GameState = {
  phase: 'start' as GamePhase,
  currentStage: 1,
  map: [],
  currentFloor: 0,
  currentAct: 1,
  gold: 99,
  lastGoldReward: 0,
  shopInventory: [],
  cardRemovalCost: 75,
  playerHP: PLAYER_MAX_HP,
  playerMaxHP: PLAYER_MAX_HP,
  playerBlock: 0,
  playerEnergy: PLAYER_MAX_ENERGY,
  playerMaxEnergy: PLAYER_MAX_ENERGY,
  deck: [],
  hand: [],
  discard: [],
  currentEnemy: null,
  enemyHP: 0,
  enemyBlock: 0,
  enemyTurnAction: 'attack',
  turnNumber: 0,
  cardsPlayedThisTurn: 0,
  rewardChoices: [],
  masterCardPool: ALL_CARDS,
  playerStatuses: [],
  enemyStatuses: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startGame: () => {
    const map = generateMap();
    const deck = shuffle(buildStartingDeck());
    set({
      phase: 'map',
      currentStage: 1,
      currentFloor: 0,
      currentAct: 1,
      playerHP: PLAYER_MAX_HP,
      playerMaxHP: PLAYER_MAX_HP,
      playerBlock: 0,
      playerEnergy: PLAYER_MAX_ENERGY,
      deck,
      hand: [],
      discard: [],
      currentEnemy: null,
      enemyHP: 0,
      enemyBlock: 0,
      enemyTurnAction: 'attack',
      turnNumber: 0,
      cardsPlayedThisTurn: 0,
      rewardChoices: [],
      playerStatuses: [],
      enemyStatuses: [],
      map,
    });
  },

  drawCards: (n: number) => {
    set((state) => {
      let deck = [...state.deck];
      let discard = [...state.discard];
      const hand = [...state.hand];

      for (let i = 0; i < n; i++) {
        if (deck.length === 0) {
          if (discard.length === 0) break;
          deck = shuffle(discard);
          discard = [];
        }
        hand.push(deck.shift()!);
      }

      return { deck, discard, hand };
    });
  },

  playCard: (instanceId: string) => {
    const state = get();
    const cardInst = state.hand.find((c) => c.instanceId === instanceId);
    if (!cardInst) return;

    const def = state.masterCardPool[cardInst.definitionId];
    if (!def) return;
    if (state.playerEnergy < def.cost) return;

    const ctx: CombatContext = {
      playerHP: state.playerHP,
      playerMaxHP: state.playerMaxHP,
      playerBlock: state.playerBlock,
      playerEnergy: state.playerEnergy,
      enemyHP: state.enemyHP,
      enemyBlock: state.enemyBlock,
      cardsInHand: state.hand,
      cardsInDiscard: state.discard,
      cardsInDeck: state.deck,
      turnNumber: state.turnNumber,
      cardsPlayedThisTurn: state.cardsPlayedThisTurn,
      playerStatuses: state.playerStatuses,
      enemyStatuses: state.enemyStatuses,
    };

    const rawDelta = def.effect(ctx);

    // Apply status modifiers to the delta
    let modifiedDelta = { ...rawDelta };

    if (modifiedDelta.enemyHPChange && modifiedDelta.enemyHPChange < 0) {
      let dmg = Math.abs(modifiedDelta.enemyHPChange);
      // Strength: flat damage bonus
      const strength = getStatusStacks(state.playerStatuses, 'strength');
      dmg += strength;
      // Vulnerable: enemy takes 50% more damage
      if (getStatusStacks(state.enemyStatuses, 'vulnerable') > 0) {
        dmg = Math.floor(dmg * 1.5);
      }
      // Weak: player deals 25% less damage
      if (getStatusStacks(state.playerStatuses, 'weak') > 0) {
        dmg = Math.floor(dmg * 0.75);
      }
      modifiedDelta.enemyHPChange = -dmg;
    }

    if (modifiedDelta.playerBlockChange && modifiedDelta.playerBlockChange > 0) {
      let block = modifiedDelta.playerBlockChange;
      // Dexterity: flat block bonus
      const dex = getStatusStacks(state.playerStatuses, 'dexterity');
      block += dex;
      // Frail: player gains 25% less block
      if (getStatusStacks(state.playerStatuses, 'frail') > 0) {
        block = Math.floor(block * 0.75);
      }
      modifiedDelta.playerBlockChange = block;
    }

    set((s) => {
      let playerHP = s.playerHP;
      let playerBlock = s.playerBlock;
      let enemyHP = s.enemyHP;
      let enemyBlock = s.enemyBlock;
      let playerEnergy = s.playerEnergy - def.cost;
      let playerStatuses = [...s.playerStatuses];
      let enemyStatuses = [...s.enemyStatuses];

      if (modifiedDelta.playerHPChange) {
        playerHP = clamp(playerHP + modifiedDelta.playerHPChange, 0, s.playerMaxHP);
      }
      if (modifiedDelta.playerBlockChange) {
        playerBlock = Math.max(0, playerBlock + modifiedDelta.playerBlockChange);
      }
      if (modifiedDelta.enemyHPChange) {
        const rawDmg = Math.abs(modifiedDelta.enemyHPChange);
        const blockAbsorbed = Math.min(enemyBlock, rawDmg);
        enemyBlock = enemyBlock - blockAbsorbed;
        enemyHP = Math.max(0, enemyHP - (rawDmg - blockAbsorbed));
      }
      if (modifiedDelta.enemyBlockChange) {
        enemyBlock = Math.max(0, enemyBlock + modifiedDelta.enemyBlockChange);
      }
      if (modifiedDelta.energyChange) {
        playerEnergy = clamp(playerEnergy + modifiedDelta.energyChange, 0, s.playerMaxEnergy);
      }
      if (modifiedDelta.applyEnemyStatuses) {
        enemyStatuses = mergeStatuses(enemyStatuses, modifiedDelta.applyEnemyStatuses);
      }
      if (modifiedDelta.applyPlayerStatuses) {
        playerStatuses = mergeStatuses(playerStatuses, modifiedDelta.applyPlayerStatuses);
      }

      const newHand = s.hand.filter((c) => c.instanceId !== instanceId);
      const newDiscard = def.exhaust ? s.discard : [...s.discard, cardInst];

      return {
        playerHP,
        playerBlock,
        enemyHP,
        enemyBlock,
        hand: newHand,
        discard: newDiscard,
        playerEnergy,
        cardsPlayedThisTurn: s.cardsPlayedThisTurn + 1,
        playerStatuses,
        enemyStatuses,
      };
    });

    if (modifiedDelta.drawCards) {
      get().drawCards(modifiedDelta.drawCards);
    }

    if (get().enemyHP <= 0) {
      get().stageWon();
    }
  },

  endTurn: () => {
    set((state) => {
      const enemy = state.currentEnemy!;
      let playerHP = state.playerHP;
      let playerBlock = state.playerBlock;
      let enemyHP = state.enemyHP;
      let enemyBlock = state.enemyBlock;
      let playerStatuses = [...state.playerStatuses];
      let enemyStatuses = [...state.enemyStatuses];
      const action = state.enemyTurnAction;

      // Boss block reduction
      if (enemy.isBoss && enemy.specialMechanic?.type === 'block_reduction') {
        playerBlock = Math.floor(playerBlock * (1 - enemy.specialMechanic.fraction));
      }

      // Poison tick on enemy
      const enemyPoison = getStatusStacks(enemyStatuses, 'poison');
      if (enemyPoison > 0) {
        enemyHP = Math.max(0, enemyHP - enemyPoison);
        enemyStatuses = enemyStatuses
          .map((s) => (s.type === 'poison' ? { ...s, stacks: s.stacks - 1 } : s))
          .filter((s) => s.stacks > 0);
      }

      // Enemy action
      if (action === 'attack') {
        enemyBlock = 0;
        const dmg = Math.max(0, enemy.baseAttack - playerBlock);
        playerHP = Math.max(0, playerHP - dmg);
        // Apply enemy attack statuses to player
        if (enemy.attackStatuses && enemy.attackStatuses.length > 0) {
          playerStatuses = mergeStatuses(playerStatuses, enemy.attackStatuses);
        }
      } else {
        enemyBlock += Math.floor(enemy.baseAttack * 0.8);
      }
      playerBlock = 0;

      // Decrement timed statuses at end of turn
      playerStatuses = tickTimedStatuses(playerStatuses);
      enemyStatuses = tickTimedStatuses(enemyStatuses);

      // Metallicize: gain block at start of next turn
      const metallicize = getStatusStacks(playerStatuses, 'metallicize');
      if (metallicize > 0) {
        playerBlock = metallicize;
      }

      const nextTurn = state.turnNumber + 1;
      const nextAction = computeEnemyAction(enemy.attackPattern, nextTurn);

      return {
        playerHP,
        playerBlock,
        enemyHP,
        enemyBlock,
        playerStatuses,
        enemyStatuses,
        turnNumber: nextTurn,
        enemyTurnAction: nextAction,
        hand: [],
        discard: [...state.discard, ...state.hand],
        playerEnergy: PLAYER_MAX_ENERGY,
        cardsPlayedThisTurn: 0,
      };
    });

    if (get().playerHP <= 0) {
      set({ phase: 'gameover' });
      return;
    }

    // Enemy may have died from poison
    if (get().enemyHP <= 0) {
      get().stageWon();
      return;
    }

    get().drawCards(HAND_SIZE);
  },

  stageWon: () => {
    const state = get();
    if (state.currentEnemy?.isBoss) {
      const bossGold = 50;
      set({ phase: 'victory', gold: state.gold + bossGold, lastGoldReward: bossGold });
      return;
    }
    const isElite = state.map.find(
      (n) => n.floor === state.currentFloor && n.roomType === 'elite'
    );
    const goldMin = isElite ? 25 : 10;
    const goldMax = isElite ? 35 : 20;
    const goldGained = goldMin + Math.floor(Math.random() * (goldMax - goldMin + 1));
    const choices = pickRewardCards(REWARD_CARD_IDS, 3, REWARD_CARD_WEIGHTS).map((id) => ALL_CARDS[id]);
    const healedHP = Math.min(state.playerHP + 10, state.playerMaxHP);
    set({
      phase: 'reward',
      rewardChoices: choices,
      playerHP: healedHP,
      gold: state.gold + goldGained,
      lastGoldReward: goldGained,
    });
  },

  selectRewardCard: (cardId: string | null) => {
    const state = get();
    let allCards = [...state.deck, ...state.hand, ...state.discard];
    if (cardId) {
      allCards.push({ instanceId: generateId(), definitionId: cardId });
    }
    const shuffledDeck = shuffle(allCards);

    set({
      deck: shuffledDeck,
      hand: [],
      discard: [],
      phase: 'map',
      rewardChoices: [],
    });
  },

  travelToNode: (nodeId: string) => {
    const state = get();
    const node = state.map.find((n) => n.id === nodeId);
    if (!node || !node.available) return;

    const updatedMap = markNodeVisited(state.map, nodeId);
    const enemyPool = ENEMIES.filter((e) => !e.isBoss);
    const bossEnemy = ENEMIES.find((e) => e.isBoss)!;

    if (node.roomType === 'monster' || node.roomType === 'elite' || node.roomType === 'boss') {
      // Pick enemy based on floor progression
      let enemy;
      if (node.roomType === 'boss') {
        enemy = bossEnemy;
      } else if (node.roomType === 'elite') {
        // Elite: pick from upper half of enemy pool
        const elitePool = enemyPool.slice(Math.floor(enemyPool.length / 2));
        enemy = elitePool[Math.floor(Math.random() * elitePool.length)];
      } else {
        // Regular monster: scale difficulty by floor
        const floorRatio = node.floor / 14;
        const maxIdx = Math.min(Math.floor(floorRatio * enemyPool.length) + 2, enemyPool.length - 1);
        const minIdx = Math.max(0, maxIdx - 3);
        const idx = minIdx + Math.floor(Math.random() * (maxIdx - minIdx + 1));
        enemy = enemyPool[Math.min(idx, enemyPool.length - 1)];
      }

      const shuffledDeck = shuffle([...state.deck]);
      const newHand = shuffledDeck.slice(0, HAND_SIZE);
      const remaining = shuffledDeck.slice(HAND_SIZE);

      set({
        phase: 'combat',
        currentFloor: node.floor,
        currentStage: node.floor + 1,
        map: updatedMap,
        currentEnemy: enemy,
        enemyHP: enemy.maxHP,
        enemyBlock: 0,
        playerBlock: 0,
        playerEnergy: PLAYER_MAX_ENERGY,
        deck: remaining,
        hand: newHand,
        discard: [],
        turnNumber: 0,
        cardsPlayedThisTurn: 0,
        enemyTurnAction: computeEnemyAction(enemy.attackPattern, 0),
        playerStatuses: [],
        enemyStatuses: [],
      });
    } else if (node.roomType === 'rest') {
      set({ phase: 'rest', currentFloor: node.floor, map: updatedMap });
    } else if (node.roomType === 'treasure') {
      // Treasure: pick 1 of 3 rare-weighted cards, no HP heal
      const choices = pickRewardCards(REWARD_CARD_IDS, 3, REWARD_CARD_WEIGHTS).map((id) => ALL_CARDS[id]);
      set({ phase: 'reward', currentFloor: node.floor, map: updatedMap, rewardChoices: choices });
    } else if (node.roomType === 'shop') {
      const shopInventory = generateShopInventory(REWARD_CARD_WEIGHTS);
      set({ phase: 'shop', currentFloor: node.floor, map: updatedMap, shopInventory });
    } else {
      // event — stub: advance floor, return to map
      set({ currentFloor: node.floor, map: updatedMap, phase: 'map' });
    }
  },

  leaveRestSite: () => {
    set({ phase: 'map' });
  },

  buyShopCard: (cardId: string, price: number) => {
    set((state) => {
      if (state.gold < price) return {};
      const newCard: CardInstance = { instanceId: generateId(), definitionId: cardId };
      return {
        gold: state.gold - price,
        deck: [...state.deck, newCard],
        shopInventory: state.shopInventory.map((item) =>
          item.cardId === cardId ? { ...item, sold: true } : item
        ),
      };
    });
  },

  removeCard: (instanceId: string, price: number) => {
    set((state) => {
      if (state.gold < price) return {};
      const allPiles = ['deck', 'hand', 'discard'] as const;
      const updates: Partial<GameState> = { gold: state.gold - price, cardRemovalCost: price + 25 };
      for (const pile of allPiles) {
        if (state[pile].some((c) => c.instanceId === instanceId)) {
          (updates as Record<string, unknown>)[pile] = state[pile].filter((c) => c.instanceId !== instanceId);
        }
      }
      return updates;
    });
  },

  leaveShop: () => set({ phase: 'map' }),

  upgradeCard: (instanceId: string) => {
    set((state) => {
      const upgradeInPile = (pile: CardInstance[]) =>
        pile.map((c) => {
          if (c.instanceId !== instanceId) return c;
          const def = state.masterCardPool[c.definitionId];
          if (!def?.upgradeId) return c;
          return { ...c, definitionId: def.upgradeId };
        });
      return {
        deck: upgradeInPile(state.deck),
        hand: upgradeInPile(state.hand),
        discard: upgradeInPile(state.discard),
      };
    });
  },

  restartGame: () => {
    set(initialState);
    get().startGame();
  },

  goToMenu: () => set({ ...initialState }),
}));
