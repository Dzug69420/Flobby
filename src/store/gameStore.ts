import { create } from 'zustand';
import { GameState, GamePhase, CardInstance, CombatContext } from '../types';
import { ALL_CARDS, REWARD_CARD_IDS } from '../data/cards';
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
    };

    const delta = def.effect(ctx);

    set((s) => {
      let playerHP = s.playerHP;
      let playerBlock = s.playerBlock;
      let enemyHP = s.enemyHP;
      let enemyBlock = s.enemyBlock;
      let playerEnergy = s.playerEnergy - def.cost;

      if (delta.playerHPChange) {
        playerHP = clamp(playerHP + delta.playerHPChange, 0, s.playerMaxHP);
      }
      if (delta.playerBlockChange) {
        playerBlock = Math.max(0, playerBlock + delta.playerBlockChange);
      }
      if (delta.enemyHPChange) {
        const rawDmg = Math.abs(delta.enemyHPChange);
        const blockAbsorbed = Math.min(enemyBlock, rawDmg);
        enemyBlock = enemyBlock - blockAbsorbed;
        enemyHP = Math.max(0, enemyHP - (rawDmg - blockAbsorbed));
      }
      if (delta.enemyBlockChange) {
        enemyBlock = Math.max(0, enemyBlock + delta.enemyBlockChange);
      }
      if (delta.energyChange) {
        playerEnergy = clamp(playerEnergy + delta.energyChange, 0, s.playerMaxEnergy);
      }

      const newHand = s.hand.filter((c) => c.instanceId !== instanceId);
      const newDiscard = [...s.discard, cardInst];

      return {
        playerHP,
        playerBlock,
        enemyHP,
        enemyBlock,
        hand: newHand,
        discard: newDiscard,
        playerEnergy,
        cardsPlayedThisTurn: s.cardsPlayedThisTurn + 1,
      };
    });

    if (delta.drawCards) {
      get().drawCards(delta.drawCards);
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
      let enemyBlock = state.enemyBlock;
      const action = state.enemyTurnAction;

      if (enemy.isBoss && enemy.specialMechanic?.type === 'block_reduction') {
        playerBlock = Math.floor(playerBlock * (1 - enemy.specialMechanic.fraction));
      }

      if (action === 'attack') {
        enemyBlock = 0; // Enemy's own block resets when they go on offense
        const dmg = Math.max(0, enemy.baseAttack - playerBlock);
        playerHP = Math.max(0, playerHP - dmg);
      } else {
        enemyBlock += Math.floor(enemy.baseAttack * 0.8);
      }
      playerBlock = 0;

      const nextTurn = state.turnNumber + 1;
      const nextAction = computeEnemyAction(enemy.attackPattern, nextTurn);

      return {
        playerHP,
        playerBlock,
        enemyBlock,
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

    get().drawCards(HAND_SIZE);
  },

  stageWon: () => {
    const state = get();
    if (state.currentStage === 11) {
      set({ phase: 'victory' });
      return;
    }
    const choices = pickRewardCards(REWARD_CARD_IDS).map((id) => ALL_CARDS[id]);
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

    // Resting (skipping the card) restores 25 bonus HP on top of the stage-clear heal
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
    });
  },

  restartGame: () => {
    set(initialState);
    get().startGame();
  },

  goToMenu: () => set({ ...initialState }),
}));
