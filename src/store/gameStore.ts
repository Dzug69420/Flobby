import { create } from 'zustand';
import { GameState, GamePhase, CardInstance, CombatContext, StatusEffect, StatusEffectType, MapNode, ShopItem } from '../types';
import { ALL_CARDS, REWARD_CARD_IDS, REWARD_CARD_WEIGHTS } from '../data/cards';
import { ENEMIES, ELITE_ENEMIES } from '../data/enemies';
import { generateMap, markNodeVisited } from '../data/map';
import { ALL_RELICS, pickRandomRelic } from '../data/relics';
import { pickRandomPotion } from '../data/potions';
import { pickRandomEvent } from '../data/events';
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

function hasRelic(relics: string[], id: string): boolean {
  return relics.includes(id);
}

function ascensionMaxHP(base: number, level: number): number {
  if (level >= 7) return base - 5;
  return base;
}

function ascensionHealMultiplier(level: number): number {
  if (level >= 2) return 0.9;
  return 1.0;
}

function ascensionEnemyHPMultiplier(level: number): number {
  if (level >= 4) return 1.1;
  return 1.0;
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
  leaveRestSite: (didRest?: boolean) => void;
  buyShopCard: (cardId: string, price: number) => void;
  removeCard: (instanceId: string, price: number) => void;
  leaveShop: () => void;
  gainRelic: (relicId: string) => void;
  usePotion: (potionId: string) => void;
  gainPotion: (potionId: string) => void;
  addStatusCardsToDeck: (cardDefId: string, count: number) => void;
  resolveEvent: (choiceIndex: number) => void;
  restartGame: () => void;
  setAscensionLevel: (level: number) => void;
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
  relics: ['burning_blood'],
  potions: [],
  currentEvent: null,
  cardsPlayedTotal: 0,
  tookDamageThisCombat: false,
  restedLastSite: false,
  ascensionLevel: 0,
  runsCompleted: 0,
  playerHP: PLAYER_MAX_HP,
  playerMaxHP: PLAYER_MAX_HP,
  playerBlock: 0,
  playerEnergy: PLAYER_MAX_ENERGY,
  playerMaxEnergy: PLAYER_MAX_ENERGY,
  deck: [],
  hand: [],
  discard: [],
  exhaustPile: [],
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
    const { ascensionLevel, runsCompleted } = get();
    const map = generateMap();
    const deck = shuffle(buildStartingDeck());
    const maxHP = ascensionMaxHP(PLAYER_MAX_HP, ascensionLevel);
    set({
      phase: 'map',
      currentStage: 1,
      currentFloor: 0,
      currentAct: 1,
      playerHP: maxHP,
      playerMaxHP: maxHP,
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
    if (def.isUnplayable) return;
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

      // Enrage: enemy gains Strength when player plays a non-attack card
      if (
        s.currentEnemy?.eliteMechanic?.type === 'enrage' &&
        def.category !== 'attack'
      ) {
        const strengthGain = s.currentEnemy.eliteMechanic.strengthPerSkill;
        enemyStatuses = mergeStatuses(enemyStatuses, [{ type: 'strength', stacks: strengthGain }]);
      }

      const newHand = s.hand.filter((c) => c.instanceId !== instanceId);
      const newDiscard = def.exhaust ? s.discard : [...s.discard, cardInst];
      const newExhaustPile = def.exhaust ? [...s.exhaustPile, cardInst] : s.exhaustPile;
      const newCardsPlayedTotal = s.cardsPlayedTotal + 1;

      // Nunchaku: every 10th card gives +1 energy
      if (hasRelic(s.relics, 'nunchaku') && newCardsPlayedTotal % 10 === 0) {
        playerEnergy = Math.min(playerEnergy + 1, s.playerMaxEnergy + 3);
      }

      // Pen Nib: every 10th attack deals double damage (we already doubled in modifiedDelta)
      // Track for Pen Nib: if this was an attack card and 10th attack, it was already handled

      // Centennial Puzzle: first time taking damage this combat, draw 3
      const justTookDamage = modifiedDelta.playerHPChange && modifiedDelta.playerHPChange < 0;
      const newTookDamage = s.tookDamageThisCombat || !!justTookDamage;

      return {
        playerHP,
        playerBlock,
        enemyHP,
        enemyBlock,
        hand: newHand,
        discard: newDiscard,
        playerEnergy,
        cardsPlayedThisTurn: s.cardsPlayedThisTurn + 1,
        cardsPlayedTotal: newCardsPlayedTotal,
        tookDamageThisCombat: newTookDamage,
        playerStatuses,
        enemyStatuses,
        exhaustPile: newExhaustPile,
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

      const relics = state.relics;

      // Orichalcum: if no block at turn end, gain 6
      if (hasRelic(relics, 'orichalcum') && playerBlock === 0) {
        playerBlock = 6;
      }

      // Calipers: retain up to 15 block at turn end instead of losing all
      if (hasRelic(relics, 'calipers') && playerBlock > 0) {
        playerBlock = Math.min(playerBlock, 15);
      }

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

      // Apply Burn damage before enemy turn
      const burnCards = state.discard.filter((c) => c.definitionId === 'burn').length
        + state.hand.filter((c) => c.definitionId === 'burn').length
        + state.deck.filter((c) => c.definitionId === 'burn').length;
      if (burnCards > 0) {
        playerHP = Math.max(0, playerHP - burnCards * 2);
      }

      // Ritual: enemy gains Strength each turn
      if (enemy.eliteMechanic?.type === 'ritual') {
        enemyStatuses = mergeStatuses(enemyStatuses, [{ type: 'strength', stacks: enemy.eliteMechanic.strengthPerTurn }]);
      }

      // Enemy action
      const enemyStrength = getStatusStacks(enemyStatuses, 'strength');
      if (action === 'attack') {
        enemyBlock = 0;
        const rawAttack = enemy.baseAttack + enemyStrength;
        const dmg = Math.max(0, rawAttack - playerBlock);
        if (dmg > 0) {
          playerHP = Math.max(0, playerHP - dmg);
          // Bronze Scales: deal 3 thorns damage back when hit
          if (hasRelic(relics, 'bronze_scales')) {
            enemyHP = Math.max(0, enemyHP - 3);
          }
        }
        // Apply enemy attack statuses to player
        if (enemy.attackStatuses && enemy.attackStatuses.length > 0) {
          playerStatuses = mergeStatuses(playerStatuses, enemy.attackStatuses);
        }
      } else {
        enemyBlock += Math.floor(enemy.baseAttack * 0.8);
        // Wound-on-defend: add Wound cards to player deck
        // (handled after set via addStatusCardsToDeck call)
      }
      // Calipers: block was already handled above; now reset
      if (!hasRelic(relics, 'calipers')) {
        playerBlock = 0;
      } else {
        playerBlock = 0; // calipers only retains at START of next turn (applied above)
      }

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

    // Enemy may have died from poison or thorns
    if (get().enemyHP <= 0) {
      get().stageWon();
      return;
    }

    // Wound-on-defend: add Wound cards when enemy defends
    const afterState = get();
    if (
      afterState.enemyTurnAction === 'defend' &&
      afterState.currentEnemy?.eliteMechanic?.type === 'wound_on_defend'
    ) {
      get().addStatusCardsToDeck('wound', afterState.currentEnemy.eliteMechanic.wounds);
    }

    get().drawCards(HAND_SIZE);

    // Dazed cards: auto-exhaust when drawn
    set((s) => {
      const dazed = s.hand.filter((c) => c.definitionId === 'dazed');
      if (dazed.length === 0) return {};
      return {
        hand: s.hand.filter((c) => c.definitionId !== 'dazed'),
      };
    });
  },

  stageWon: () => {
    const state = get();
    // Burning Blood: heal 6 HP after every combat
    const burningBloodHeal = hasRelic(state.relics, 'burning_blood') ? 6 : 0;

    if (state.currentEnemy?.isBoss) {
      const bossGold = 50;
      const bossRelic = pickRandomRelic(state.relics, 'boss');
      const newAscension = Math.min(state.ascensionLevel + 1, 10);
      set({
        phase: 'victory',
        gold: state.gold + bossGold,
        lastGoldReward: bossGold,
        playerHP: Math.min(state.playerHP + burningBloodHeal, state.playerMaxHP),
        relics: bossRelic ? [...state.relics, bossRelic] : state.relics,
        ascensionLevel: newAscension,
        runsCompleted: state.runsCompleted + 1,
      });
      return;
    }
    const isElite = state.map.find(
      (n) => n.floor === state.currentFloor && n.roomType === 'elite'
    );
    const goldMin = isElite ? 25 : 10;
    const goldMax = isElite ? 35 : 20;
    const goldGained = goldMin + Math.floor(Math.random() * (goldMax - goldMin + 1));

    // Elite rooms give a relic reward
    const eliteRelic = isElite ? pickRandomRelic(state.relics, 'common') : null;

    const choices = pickRewardCards(REWARD_CARD_IDS, 3, REWARD_CARD_WEIGHTS).map((id) => ALL_CARDS[id]);
    const healedHP = Math.min(state.playerHP + 10 + burningBloodHeal, state.playerMaxHP);
    set({
      phase: 'reward',
      rewardChoices: choices,
      playerHP: healedHP,
      gold: state.gold + goldGained,
      lastGoldReward: goldGained,
      relics: eliteRelic ? [...state.relics, eliteRelic] : state.relics,
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
        // Elite: pick from dedicated elite pool
        const elitePool = ELITE_ENEMIES;
        enemy = elitePool[Math.floor(Math.random() * elitePool.length)];
      } else {
        // Regular monster: scale difficulty by floor
        const floorRatio = node.floor / 14;
        const maxIdx = Math.min(Math.floor(floorRatio * enemyPool.length) + 2, enemyPool.length - 1);
        const minIdx = Math.max(0, maxIdx - 3);
        const idx = minIdx + Math.floor(Math.random() * (maxIdx - minIdx + 1));
        enemy = enemyPool[Math.min(idx, enemyPool.length - 1)];
      }

      const relics = state.relics;

      // Combat start relic effects
      let startBlock = 0;
      let startExtraCards = 0;
      let startStatuses: StatusEffect[] = [];
      let enemyStartStatuses: StatusEffect[] = [];
      let startEnergy = PLAYER_MAX_ENERGY;

      if (hasRelic(relics, 'anchor')) startBlock += 10;
      if (hasRelic(relics, 'bag_of_preparation')) startExtraCards += 2;
      if (hasRelic(relics, 'vajra')) startStatuses = mergeStatuses(startStatuses, [{ type: 'strength', stacks: 1 }]);
      if (hasRelic(relics, 'lantern')) startEnergy += 1;
      if (hasRelic(relics, 'ancient_tea_set') && state.restedLastSite) startEnergy += 2;
      if (hasRelic(relics, 'red_skull') && state.playerHP <= state.playerMaxHP / 2) {
        startStatuses = mergeStatuses(startStatuses, [{ type: 'strength', stacks: 3 }]);
      }
      if (hasRelic(relics, 'philosophers_stone')) {
        startEnergy += 1;
        enemyStartStatuses = mergeStatuses(enemyStartStatuses, [{ type: 'strength', stacks: 1 }]);
      }
      if (hasRelic(relics, 'fusion_hammer')) startEnergy += 1;
      const sneckoExtraCards = hasRelic(relics, 'snecko_eye') ? 2 : 0;

      const drawCount = HAND_SIZE + startExtraCards + sneckoExtraCards;
      const shuffledDeck = shuffle([...state.deck]);
      const newHand = shuffledDeck.slice(0, drawCount);
      const remaining = shuffledDeck.slice(drawCount);

      const ascHP = Math.floor(enemy.maxHP * ascensionEnemyHPMultiplier(state.ascensionLevel));
      set({
        phase: 'combat',
        currentFloor: node.floor,
        currentStage: node.floor + 1,
        map: updatedMap,
        currentEnemy: enemy,
        enemyHP: ascHP,
        enemyBlock: 0,
        playerBlock: startBlock,
        playerEnergy: startEnergy,
        deck: remaining,
        hand: newHand,
        discard: [],
        turnNumber: 0,
        cardsPlayedThisTurn: 0,
        cardsPlayedTotal: 0,
        tookDamageThisCombat: false,
        enemyTurnAction: computeEnemyAction(enemy.attackPattern, 0),
        playerStatuses: startStatuses,
        enemyStatuses: enemyStartStatuses,
        exhaustPile: [],
      });
    } else if (node.roomType === 'rest') {
      set({ phase: 'rest', currentFloor: node.floor, map: updatedMap });
    } else if (node.roomType === 'treasure') {
      // Treasure: 3 rare-weighted cards + a free potion
      const choices = pickRewardCards(REWARD_CARD_IDS, 3, REWARD_CARD_WEIGHTS).map((id) => ALL_CARDS[id]);
      const treasurePotion = pickRandomPotion(state.potions);
      const newPotions = state.potions.length < 3 ? [...state.potions, treasurePotion] : state.potions;
      set({ phase: 'reward', currentFloor: node.floor, map: updatedMap, rewardChoices: choices, potions: newPotions });
    } else if (node.roomType === 'shop') {
      const shopInventory = generateShopInventory(REWARD_CARD_WEIGHTS);
      set({ phase: 'shop', currentFloor: node.floor, map: updatedMap, shopInventory });
    } else if (node.roomType === 'event') {
      const event = pickRandomEvent();
      set({ phase: 'event', currentFloor: node.floor, map: updatedMap, currentEvent: event });
    } else {
      set({ currentFloor: node.floor, map: updatedMap, phase: 'map' });
    }
  },

  leaveRestSite: (didRest?: boolean) => {
    set({ phase: 'map', restedLastSite: didRest === true });
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

  gainRelic: (relicId: string) => {
    set((state) => {
      if (state.relics.includes(relicId)) return {};
      return { relics: [...state.relics, relicId] };
    });
  },

  usePotion: (potionId: string) => {
    set((state) => {
      if (!state.potions.includes(potionId)) return {};
      const updates: Partial<GameState> = {
        potions: state.potions.filter((p) => p !== potionId),
      };
      let playerHP = state.playerHP;
      let playerBlock = state.playerBlock;
      let enemyHP = state.enemyHP;
      let enemyBlock = state.enemyBlock;
      let playerEnergy = state.playerEnergy;
      let playerStatuses = [...state.playerStatuses];
      let enemyStatuses = [...state.enemyStatuses];
      let drawCards = 0;

      switch (potionId) {
        case 'health_potion':
          playerHP = Math.min(playerHP + Math.floor(state.playerMaxHP * 0.2), state.playerMaxHP);
          break;
        case 'block_potion':
          playerBlock += 12;
          break;
        case 'attack_potion':
          { const dmg = Math.max(0, 10 - enemyBlock); enemyBlock = Math.max(0, enemyBlock - 10); enemyHP = Math.max(0, enemyHP - dmg); }
          break;
        case 'fire_potion':
          { const dmg = Math.max(0, 20 - enemyBlock); enemyBlock = Math.max(0, enemyBlock - 20); enemyHP = Math.max(0, enemyHP - dmg); }
          break;
        case 'energy_potion':
          playerEnergy = Math.min(playerEnergy + 2, state.playerMaxEnergy + 3);
          break;
        case 'card_draw_potion':
          drawCards = 3;
          break;
        case 'strength_potion':
          playerStatuses = mergeStatuses(playerStatuses, [{ type: 'strength', stacks: 3 }]);
          break;
        case 'dexterity_potion':
          playerStatuses = mergeStatuses(playerStatuses, [{ type: 'dexterity', stacks: 3 }]);
          break;
        case 'poison_potion':
          enemyStatuses = mergeStatuses(enemyStatuses, [{ type: 'poison', stacks: 6 }]);
          break;
        case 'vulnerable_potion':
          enemyStatuses = mergeStatuses(enemyStatuses, [{ type: 'vulnerable', stacks: 3 }]);
          break;
      }

      return {
        ...updates,
        playerHP, playerBlock, enemyHP, enemyBlock, playerEnergy, playerStatuses, enemyStatuses,
      };
    });

    // Handle draw cards after state update
    const drawN = (() => {
      switch (potionId) {
        case 'card_draw_potion': return 3;
        default: return 0;
      }
    })();
    if (drawN > 0) get().drawCards(drawN);

    // Check if enemy died from potion damage
    if (get().enemyHP <= 0 && get().phase === 'combat') {
      get().stageWon();
    }
  },

  gainPotion: (potionId: string) => {
    set((state) => {
      const maxSlots = 3;
      if (state.potions.length >= maxSlots) return {};
      return { potions: [...state.potions, potionId] };
    });
  },

  resolveEvent: (choiceIndex: number) => {
    const state = get();
    const event = state.currentEvent;
    if (!event) return;
    const choice = event.choices[choiceIndex];
    if (!choice) return;

    set((s) => {
      let playerHP = s.playerHP;
      let gold = s.gold;
      let relics = [...s.relics];
      let potions = [...s.potions];

      // Gold cost
      if (choice.goldCost && gold < choice.goldCost) return {};
      if (choice.goldCost) gold -= choice.goldCost;

      // HP cost
      if (choice.hpCost) playerHP = Math.max(1, playerHP - choice.hpCost);

      // Effect
      switch (choice.effect) {
        case 'heal': {
          const healAmt = choice.effectValue && choice.effectValue <= 30
            ? Math.floor(s.playerMaxHP * choice.effectValue / 100)
            : (choice.effectValue ?? 0);
          playerHP = Math.min(playerHP + healAmt, s.playerMaxHP);
          break;
        }
        case 'gold':
          // Wheel of change: 50/50
          if (event.id === 'wheel_of_change') {
            if (Math.random() < 0.5) gold += choice.effectValue ?? 0;
            else playerHP = Math.max(1, playerHP - 20);
          } else {
            gold += choice.effectValue ?? 0;
          }
          break;
        case 'relic': {
          const newRelic = pickRandomRelic(relics, 'uncommon');
          if (newRelic) relics.push(newRelic);
          // Dead adventurer: add wounds
          if (event.id === 'dead_adventurer') {
            const woundCards: CardInstance[] = [
              { instanceId: generateId(), definitionId: 'wound' },
              { instanceId: generateId(), definitionId: 'wound' },
            ];
            return { playerHP, gold, relics, potions, currentEvent: null, phase: 'map' as GamePhase,
              deck: shuffle([...s.deck, ...woundCards]) };
          }
          break;
        }
        case 'add_potion': {
          const newPotion = pickRandomPotion(s.potions);
          if (s.potions.length < 3) potions.push(newPotion);
          if (choice.effectValue) gold += choice.effectValue;
          break;
        }
        case 'nothing':
          break;
        case 'add_wounds': {
          const n = choice.effectValue ?? 1;
          const wounds: CardInstance[] = Array.from({ length: n }, () => ({
            instanceId: generateId(), definitionId: 'wound',
          }));
          return { playerHP, gold, relics, potions, currentEvent: null, phase: 'map' as GamePhase,
            deck: shuffle([...s.deck, ...wounds]) };
        }
      }

      return { playerHP, gold, relics, potions, currentEvent: null, phase: 'map' as GamePhase };
    });

    // Handle upgrade_card effect separately (requires showing a picker)
    if (choice.effect === 'upgrade_card') {
      const count = choice.effectValue ?? 1;
      // Auto-upgrade random upgradable cards
      const state2 = get();
      const allCards = [...state2.deck, ...state2.hand, ...state2.discard];
      const upgradable = allCards.filter((c) => {
        const def = state2.masterCardPool[c.definitionId];
        return def?.upgradeId;
      });
      const toUpgrade = shuffle(upgradable).slice(0, count);
      for (const card of toUpgrade) {
        get().upgradeCard(card.instanceId);
      }
      set({ currentEvent: null, phase: 'map' });
    }
    // Handle remove_card (auto-remove weakest card)
    if (choice.effect === 'remove_card') {
      const state2 = get();
      const allCards = [...state2.deck, ...state2.hand, ...state2.discard];
      const strikes = allCards.filter((c) => c.definitionId === 'strike' || c.definitionId === 'defend');
      const toRemove = strikes[0] ?? allCards[0];
      if (toRemove) get().removeCard(toRemove.instanceId, 0);
      set({ currentEvent: null, phase: 'map' });
    }
  },

  addStatusCardsToDeck: (cardDefId: string, count: number) => {
    set((state) => {
      const newCards: CardInstance[] = Array.from({ length: count }, () => ({
        instanceId: generateId(),
        definitionId: cardDefId,
      }));
      // Shuffle status cards into the draw deck
      const newDeck = shuffle([...state.deck, ...newCards]);
      return { deck: newDeck };
    });
  },

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

  setAscensionLevel: (level: number) => {
    set({ ascensionLevel: Math.max(0, Math.min(10, level)) });
  },

  restartGame: () => {
    const { ascensionLevel, runsCompleted } = get();
    set({ ...initialState, ascensionLevel, runsCompleted });
    get().startGame();
  },

  goToMenu: () => {
    const { ascensionLevel, runsCompleted } = get();
    set({ ...initialState, ascensionLevel, runsCompleted });
  },
}));
