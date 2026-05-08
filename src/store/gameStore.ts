import { create } from 'zustand';
import { GameState, GamePhase, CardInstance, CombatContext, StatusEffect, StatusEffectType } from '../types';
import { ALL_CARDS, REWARD_CARD_IDS, REWARD_CARD_WEIGHTS } from '../data/cards';
import { ENEMIES } from '../data/enemies';
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
  restartGame: () => void;
  goToMenu: () => void;
}

type GameStore = GameState & GameActions;

const initialState: GameState = {
  phase: 'start' as GamePhase,
  currentStage: 1,
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
    const enemy = ENEMIES[0];
    const deck = shuffle(buildStartingDeck());
    const hand = deck.slice(0, HAND_SIZE);
    const remaining = deck.slice(HAND_SIZE);
    set({
      phase: 'combat',
      currentStage: 1,
      playerHP: PLAYER_MAX_HP,
      playerMaxHP: PLAYER_MAX_HP,
      playerBlock: 0,
      playerEnergy: PLAYER_MAX_ENERGY,
      deck: remaining,
      hand,
      discard: [],
      currentEnemy: enemy,
      enemyHP: enemy.maxHP,
      enemyBlock: 0,
      enemyTurnAction: computeEnemyAction(enemy.attackPattern, 0),
      turnNumber: 0,
      cardsPlayedThisTurn: 0,
      rewardChoices: [],
      playerStatuses: [],
      enemyStatuses: [],
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
    if (state.currentStage === 11) {
      set({ phase: 'victory' });
      return;
    }
    const choices = pickRewardCards(REWARD_CARD_IDS, 3, REWARD_CARD_WEIGHTS).map((id) => ALL_CARDS[id]);
    const healedHP = Math.min(state.playerHP + 10, state.playerMaxHP);
    set({ phase: 'reward', rewardChoices: choices, playerHP: healedHP });
  },

  selectRewardCard: (cardId: string | null) => {
    const state = get();
    const nextStage = state.currentStage + 1;
    const nextEnemy = ENEMIES[nextStage - 1];

    let allCards = [...state.deck, ...state.hand, ...state.discard];
    if (cardId) {
      allCards.push({ instanceId: generateId(), definitionId: cardId });
    }
    const shuffledDeck = shuffle(allCards);
    const newHand = shuffledDeck.slice(0, HAND_SIZE);
    const remaining = shuffledDeck.slice(HAND_SIZE);

    const restBonus = cardId === null ? 25 : 0;
    const restoredHP = Math.min(state.playerHP + restBonus, state.playerMaxHP);

    set({
      phase: 'combat',
      currentStage: nextStage,
      currentEnemy: nextEnemy,
      enemyHP: nextEnemy.maxHP,
      enemyBlock: 0,
      playerBlock: 0,
      playerEnergy: PLAYER_MAX_ENERGY,
      deck: remaining,
      hand: newHand,
      discard: [],
      turnNumber: 0,
      cardsPlayedThisTurn: 0,
      enemyTurnAction: computeEnemyAction(nextEnemy.attackPattern, 0),
      rewardChoices: [],
      playerHP: restoredHP,
      playerStatuses: [],
      enemyStatuses: [],
    });
  },

  restartGame: () => {
    set(initialState);
    get().startGame();
  },

  goToMenu: () => set({ ...initialState }),
}));
