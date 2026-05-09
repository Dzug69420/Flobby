import { create } from 'zustand';
import { GameState, GamePhase, CardInstance, CombatContext, StatusEffect, StatusEffectType, MapNode, ShopItem, RunRecord } from '../types';
import { ALL_CARDS, REWARD_CARD_IDS, REWARD_CARD_WEIGHTS } from '../data/cards';
import { ENEMIES, ELITE_ENEMIES } from '../data/enemies';
import { generateMap, markNodeVisited } from '../data/map';
import { ALL_RELICS, pickRandomRelic, BOSS_RELICS } from '../data/relics';
import { ALL_CHARACTERS } from '../data/characters';
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
  pattern: { type: string; firstTurn?: string; pattern?: string[]; attackChance?: number; chargeTurns?: number; chargeMultiplier?: number },
  turnNumber: number
): 'attack' | 'defend' {
  if (pattern.type === 'consistent' || pattern.type === 'boss_pattern') return 'attack';
  if (pattern.type === 'cycle' && pattern.pattern) {
    return (pattern.pattern[turnNumber % pattern.pattern.length] ?? 'attack') as 'attack' | 'defend';
  }
  if (pattern.type === 'random') {
    const seed = (turnNumber * 9301 + 49297) % 233280;
    return (seed / 233280) < (pattern.attackChance ?? 0.7) ? 'attack' : 'defend';
  }
  if (pattern.type === 'charge') {
    const chargeTurns = pattern.chargeTurns ?? 2;
    return (turnNumber % (chargeTurns + 1) === chargeTurns) ? 'attack' : 'defend';
  }
  const isEven = turnNumber % 2 === 0;
  const attackOnEven = pattern.firstTurn === 'attack';
  return isEven === attackOnEven ? 'attack' : 'defend';
}

export function previewNextTurns(
  pattern: { type: string; firstTurn?: string; pattern?: string[]; attackChance?: number },
  currentTurnNumber: number,
  count: number
): Array<'attack' | 'defend'> {
  const results: Array<'attack' | 'defend'> = [];
  for (let i = 1; i <= count; i++) {
    results.push(computeEnemyAction(pattern, currentTurnNumber + i));
  }
  return results;
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
  restockShop: () => void;
  gainRelic: (relicId: string) => void;
  usePotion: (potionId: string) => void;
  gainPotion: (potionId: string) => void;
  addStatusCardsToDeck: (cardDefId: string, count: number) => void;
  scry: (amount: number) => void;
  resolveScry: (keepIds: string[]) => void;
  resolveEvent: (choiceIndex: number) => void;
  restartGame: () => void;
  selectBossRelic: (relicId: string) => void;
  selectCharacter: (characterId: string) => void;
  goToCharacterSelect: () => void;
  transformCard: (instanceId: string) => void;
  discardFromHand: (instanceId: string) => void;
  selectBlessing: (blessingId: string) => void;
  setAscensionLevel: (level: number) => void;
  goToMenu: () => void;
}

type GameStore = GameState & GameActions;

function generateShopInventory(weights: Record<string, 'common' | 'uncommon' | 'rare'>): ShopItem[] {
  const PRICES: Record<string, number> = { common: 45, uncommon: 80, rare: 125 };
  const picked = pickRewardCards(REWARD_CARD_IDS, 6, weights); // 6 cards instead of 4
  return picked.map((id) => ({
    cardId: id,
    price: PRICES[weights[id] ?? 'common'] + Math.floor(Math.random() * 15) - 7,
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
  selectedCharacter: 'blobguard',
  currentRunScore: 0,
  bestScore: 0,
  playerHP: PLAYER_MAX_HP,
  playerMaxHP: PLAYER_MAX_HP,
  playerBlock: 0,
  playerEnergy: PLAYER_MAX_ENERGY,
  playerMaxEnergy: PLAYER_MAX_ENERGY,
  deck: [],
  hand: [],
  discard: [],
  exhaustPile: [],
  retainedCards: [],
  currentEnemy: null,
  enemyHP: 0,
  enemyBlock: 0,
  enemyTurnAction: 'attack',
  bossEnraged: false,
  activePowers: [],
  combatLog: [],
  attackCardsPlayedTotal: 0,
  attackPlayedThisTurn: false,
  ritualDaggerBonus: 0,
  burstActive: false,
  doubleTapActive: false,
  charges: 0,
  stance: 'neutral' as const,
  scryCards: [],
  scryAmount: 0,
  orbs: [],
  maxOrbs: 3,
  totalDamageDealt: 0,
  totalDamageTaken: 0,
  totalBlockGained: 0,
  enemiesDefeated: 0,
  necronomiconUsedThisTurn: false,
  firstBlockThisTurn: true,
  sneckoCosts: {},
  bottledCardId: null,
  bossRelicChoices: [],
  runHistory: [],
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
    const { ascensionLevel, runsCompleted, selectedCharacter } = get();
    const charDef = ALL_CHARACTERS[selectedCharacter] ?? ALL_CHARACTERS['blobguard'];
    const map = generateMap();

    // Build character-specific starting deck
    const deckCards: CardInstance[] = [];
    for (const entry of charDef.startingDeck) {
      for (let i = 0; i < entry.count; i++) {
        deckCards.push({ instanceId: generateId(), definitionId: entry.cardId });
      }
    }
    const deck = shuffle(deckCards);

    const baseMaxHP = charDef.maxHP;
    const maxHP = ascensionMaxHP(baseMaxHP, ascensionLevel);
    set({
      phase: 'blessing',
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
      relics: [charDef.startingRelic],
    });
  },

  drawCards: (n: number) => {
    const safeN = Math.min(n, 20); // Prevent infinite loops
    set((state) => {
      const n = safeN;
      let deck = [...state.deck];
      let discard = [...state.discard];
      const hand = [...state.hand];
      const sneckoCosts = { ...state.sneckoCosts };

      for (let i = 0; i < n; i++) {
        if (deck.length === 0) {
          if (discard.length === 0) break;
          deck = shuffle(discard);
          discard = [];
        }
        const drawn = deck.shift()!;
        hand.push(drawn);
        // Snecko Eye: randomize cost of drawn card (0, 1, 2, or 3)
        if (state.relics.includes('snecko_eye')) {
          sneckoCosts[drawn.instanceId] = Math.floor(Math.random() * 4);
        }
      }

      return { deck, discard, hand, sneckoCosts };
    });
  },

  playCard: (instanceId: string) => {
    const state = get();
    const cardInst = state.hand.find((c) => c.instanceId === instanceId);
    if (!cardInst) return;

    const def = state.masterCardPool[cardInst.definitionId];
    if (!def) return;
    if (def.isUnplayable) return;
    const isXCost = def.cost === -1;
    const isSkillCard = def.category === 'defense' || def.category === 'status';
    // Masterful Stab: costs 0 if player has no block
    const isMasterfulFree = def.id === 'masterful_stab' && state.playerBlock === 0;
    // Blood for Blood: costs 1 less per HP lost this combat
    const bloodForBloodDiscount = def.id === 'blood_for_blood'
      ? Math.min(def.cost, state.playerMaxHP - state.playerHP)
      : 0;
    const sneckoCost = isMasterfulFree ? 0 :
      bloodForBloodDiscount > 0 ? Math.max(0, def.cost - bloodForBloodDiscount) :
      state.sneckoCosts[instanceId];
    const baseCost = sneckoCost !== undefined ? sneckoCost : def.cost;
    const effectiveCost = (state.activePowers.includes('corruption') && isSkillCard) ? 0 : baseCost;
    if (!isXCost && state.playerEnergy < effectiveCost) return;
    if (isXCost && state.playerEnergy < 1) return;

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

    // Apply stance-based damage modifiers
    const currentStance = state.stance;

    // Apply charge-based effects before other modifications
    let chargesForCard = state.charges;

    // Apply status modifiers to the delta
    let modifiedDelta = { ...rawDelta };

    // Discharge: damage = charges × 5
    if (def.id === 'discharge') {
      modifiedDelta.enemyHPChange = -(chargesForCard * 5);
    }

    // Lightning Strike: 20 dmg if 3+ charges, else 8
    if (def.id === 'lightning_strike') {
      modifiedDelta.enemyHPChange = chargesForCard >= 3 ? -20 : -8;
    }
    const isAttackCard = def.category === 'attack';
    const newAttackTotal = isAttackCard ? state.attackCardsPlayedTotal + 1 : state.attackCardsPlayedTotal;
    const isPenNibTurn = isAttackCard && hasRelic(state.relics, 'pen_nib') && newAttackTotal % 10 === 0;

    if (modifiedDelta.enemyHPChange && modifiedDelta.enemyHPChange < 0) {
      let dmg = Math.abs(modifiedDelta.enemyHPChange);
      // Strength: flat damage bonus
      const strength = getStatusStacks(state.playerStatuses, 'strength');
      dmg += strength;
      // Wrath stance: double all damage dealt (and double damage taken)
      if (currentStance === 'wrath') dmg = Math.floor(dmg * 2);
      // Ritual Dagger: add accumulated bonus
      if (def.id === 'ritual_dagger') {
        dmg += state.ritualDaggerBonus;
      }
      // Pen Nib: every 10th attack deals double damage
      if (isPenNibTurn) dmg *= 2;
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
      const isSkillForCorruption = def.category === 'defense' || def.category === 'status';
      const sneckoCostVal = s.sneckoCosts[instanceId];
      const resolvedBaseCost = sneckoCostVal !== undefined ? sneckoCostVal : def.cost;
      const actualCost = (s.activePowers.includes('corruption') && isSkillForCorruption)
        ? 0
        : resolvedBaseCost === -1 ? s.playerEnergy : resolvedBaseCost;
      let playerEnergy = s.playerEnergy - actualCost;

      // Clean up snecko cost after playing
      const newSneckoCosts = { ...s.sneckoCosts };
      delete newSneckoCosts[instanceId];
      let playerStatuses = [...s.playerStatuses];
      let enemyStatuses = [...s.enemyStatuses];

      if (modifiedDelta.playerHPChange) {
        playerHP = clamp(playerHP + modifiedDelta.playerHPChange, 0, s.playerMaxHP);
      }
      if (modifiedDelta.playerBlockChange) {
        playerBlock = Math.max(0, playerBlock + modifiedDelta.playerBlockChange);
        // Juggernaut: deal 5 damage when gaining block
        if (modifiedDelta.playerBlockChange > 0 && s.activePowers.includes('juggernaut')) {
          const jugDmg = 5;
          const jugAbsorbed = Math.min(enemyBlock, jugDmg);
          enemyBlock = Math.max(0, enemyBlock - jugAbsorbed);
          enemyHP = Math.max(0, enemyHP - (jugDmg - jugAbsorbed));
        }
      }
      if (modifiedDelta.enemyHPChange) {
        const totalDmg = Math.abs(modifiedDelta.enemyHPChange);
        const numHits = modifiedDelta.hits ?? 1;
        const dmgPerHit = Math.floor(totalDmg / numHits);
        const remainder = totalDmg - dmgPerHit * numHits;
        for (let h = 0; h < numHits; h++) {
          const hitDmg = dmgPerHit + (h === numHits - 1 ? remainder : 0);
          const blockAbsorbed = Math.min(enemyBlock, hitDmg);
          enemyBlock = Math.max(0, enemyBlock - blockAbsorbed);
          enemyHP = Math.max(0, enemyHP - (hitDmg - blockAbsorbed));
        }
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

      // Register power cards
      let activePowers = [...s.activePowers];
      if (def.category === 'power' && !activePowers.includes(def.id)) {
        activePowers.push(def.id);
      }

      // Capacitor: expand orb slots by 2
      let maxOrbs = s.maxOrbs;
      if (def.id === 'capacitor') maxOrbs += 2;

      // Burst: activate for next skill
      let burstActive = s.burstActive;
      let doubleTapActive = s.doubleTapActive;
      if (def.id === 'burst') burstActive = true;
      if (def.id === 'double_tap') doubleTapActive = true;

      // Apply Burst/DoubleTap: play this card twice (by doubling its effects)
      let doubleEffects = false;
      if (def.category === 'defense' || def.category === 'status') {
        if (s.burstActive && def.id !== 'burst') { doubleEffects = true; burstActive = false; }
      }
      if (def.category === 'attack') {
        if (s.doubleTapActive && def.id !== 'double_tap') { doubleEffects = true; doubleTapActive = false; }
      }
      if (doubleEffects) {
        if (modifiedDelta.enemyHPChange) modifiedDelta.enemyHPChange *= 2;
        if (modifiedDelta.playerBlockChange) modifiedDelta.playerBlockChange *= 2;
        if (modifiedDelta.drawCards) modifiedDelta.drawCards *= 2;
      }

      // Orb mechanic: channel new orb, evoke leftmost if at max
      let orbs = [...s.orbs];
      if (modifiedDelta.channelOrb) {
        orbs.push(modifiedDelta.channelOrb);
        // Storm: deal 4 extra damage when channeling Lightning
        if (modifiedDelta.channelOrb === 'lightning' && s.activePowers.includes('storm')) {
          const stormDmg = Math.max(0, 4 - enemyBlock);
          enemyBlock = Math.max(0, enemyBlock - 4);
          enemyHP = Math.max(0, enemyHP - stormDmg);
        }
        // Evoke leftmost if over max
        while (orbs.length > s.maxOrbs) {
          const evoked = orbs.shift()!;
          if (evoked === 'lightning') {
            // Lightning: deal 8 damage
            const lDmg = Math.max(0, 8 - enemyBlock);
            enemyBlock = Math.max(0, enemyBlock - 8);
            enemyHP = Math.max(0, enemyHP - lDmg);
          } else if (evoked === 'frost') {
            // Frost: gain 5 block
            playerBlock += 5;
          } else if (evoked === 'dark') {
            // Dark: deal 6 damage + heal 3
            const dDmg = Math.max(0, 6 - enemyBlock);
            enemyBlock = Math.max(0, enemyBlock - 6);
            enemyHP = Math.max(0, enemyHP - dDmg);
            playerHP = Math.min(playerHP + 3, s.playerMaxHP);
          }
        }
      }

      // Corruption: skills cost 0 and exhaust
      const isSkill = def.category === 'defense' || def.category === 'status';
      const isCorrupted = s.activePowers.includes('corruption');
      const finalExhaust = def.exhaust || (isCorrupted && isSkill);
      if (isCorrupted && isSkill) {
        modifiedDelta.energyChange = (modifiedDelta.energyChange ?? 0) + def.cost;
      }

      // Fiend Fire: exhaust entire remaining hand
      const handAfterPlay = s.hand.filter((c) => c.instanceId !== instanceId);
      const fiendFireExhaust = modifiedDelta.exhaustHand ? handAfterPlay : [];
      const newHand = modifiedDelta.exhaustHand ? [] : handAfterPlay;
      const newDiscard = finalExhaust ? s.discard : [...s.discard, cardInst];
      const newExhaustPile = finalExhaust
        ? [...s.exhaustPile, cardInst, ...fiendFireExhaust]
        : [...s.exhaustPile, ...fiendFireExhaust];

      // Feel No Pain: gain 3 block when a card is exhausted
      if (finalExhaust && s.activePowers.includes('feel_no_pain')) {
        playerBlock += 3;
      }

      // Necronomicon: first 2+ cost card each turn is played twice
      let necroDoubled = false;
      if (
        hasRelic(s.relics, 'necronomicon') &&
        !s.necronomiconUsedThisTurn &&
        actualCost >= 2
      ) {
        necroDoubled = true;
        if (modifiedDelta.enemyHPChange) modifiedDelta.enemyHPChange *= 2;
        if (modifiedDelta.playerBlockChange) modifiedDelta.playerBlockChange *= 2;
      }

      // Lucky Flower: first block this turn gains 15% bonus
      if (
        modifiedDelta.playerBlockChange && modifiedDelta.playerBlockChange > 0 &&
        s.firstBlockThisTurn && hasRelic(s.relics, 'lucky_flower')
      ) {
        modifiedDelta.playerBlockChange = Math.floor(modifiedDelta.playerBlockChange * 1.15);
      }

      // Talisman: gain 1 energy when a Power card is played
      if (def.category === 'power' && hasRelic(s.relics, 'talisman')) {
        playerEnergy = Math.min(playerEnergy + 1, s.playerMaxEnergy + 3);
      }

      // Ornamental Fan: every 3rd attack card in a turn, gain 4 Block
      if (isAttackCard && hasRelic(s.relics, 'ornamental_fan')) {
        const attacksInTurn = s.cardsPlayedThisTurn + 1;
        if (attacksInTurn % 3 === 0) playerBlock += 4;
      }

      // Strange Spoon: 50% chance to NOT exhaust when exhaust would occur
      // (handled via final exhaust decision — already set above as finalExhaust)

      // Sentinel: when Sentinel card is exhausted, gain 2 energy
      if (def.id === 'sentinel' && finalExhaust) {
        playerEnergy = Math.min(playerEnergy + 2, s.playerMaxEnergy + 3);
      }

      // Dead Branch: add a random card to hand when a card is exhausted
      // (handled post-set below for draw timing)

      // Centennial Puzzle: first time player takes damage this combat, draw 3
      const justTookDamage2 = modifiedDelta.playerHPChange && modifiedDelta.playerHPChange < 0;
      if (justTookDamage2 && !s.tookDamageThisCombat && hasRelic(s.relics, 'centennial_puzzle')) {
        // Will draw 3 after set
      }

      // Combat log entry
      let logMsg = `Played ${def.name}`;
      if (modifiedDelta.enemyHPChange && modifiedDelta.enemyHPChange < 0) {
        logMsg += ` → ${Math.abs(modifiedDelta.enemyHPChange)} dmg`;
      }
      if (modifiedDelta.playerBlockChange && modifiedDelta.playerBlockChange > 0) {
        logMsg += ` → +${modifiedDelta.playerBlockChange} block`;
      }
      const newLog = [logMsg, ...s.combatLog].slice(0, 6);
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
        activePowers,
        combatLog: newLog,
        totalDamageDealt: s.totalDamageDealt + (modifiedDelta.enemyHPChange && modifiedDelta.enemyHPChange < 0 ? Math.abs(modifiedDelta.enemyHPChange) : 0),
        totalBlockGained: s.totalBlockGained + (modifiedDelta.playerBlockChange && modifiedDelta.playerBlockChange > 0 ? modifiedDelta.playerBlockChange : 0),
        attackCardsPlayedTotal: newAttackTotal,
        attackPlayedThisTurn: s.attackPlayedThisTurn || isAttackCard,
        sneckoCosts: newSneckoCosts,
        burstActive,
        doubleTapActive,
        charges: Math.max(0, s.charges + (modifiedDelta.chargeChange ?? 0)),
        stance: (modifiedDelta.setStance ?? s.stance) as 'neutral' | 'calm' | 'wrath',
        orbs,
        maxOrbs,
        necronomiconUsedThisTurn: s.necronomiconUsedThisTurn || necroDoubled,
        firstBlockThisTurn: s.firstBlockThisTurn && !(modifiedDelta.playerBlockChange && modifiedDelta.playerBlockChange > 0),
      };
    });

    if (modifiedDelta.drawCards) {
      get().drawCards(modifiedDelta.drawCards);
    }

    // Centennial Puzzle: draw 3 cards first time taking damage in combat
    const afterCentennial = get();
    if (
      modifiedDelta.playerHPChange && modifiedDelta.playerHPChange < 0 &&
      !state.tookDamageThisCombat &&
      afterCentennial.relics.includes('centennial_puzzle')
    ) {
      get().drawCards(3);
    }

    // Madness: randomize all hand card costs
    if (def.id === 'madness') {
      set((s) => {
        const newSnecko: Record<string, number> = { ...s.sneckoCosts };
        for (const card of s.hand) {
          if (card.instanceId !== instanceId) {
            newSnecko[card.instanceId] = Math.floor(Math.random() * 4);
          }
        }
        return { sneckoCosts: newSnecko };
      });
    }

    // Second Wind (second_wind2): exhaust all non-attacks in hand, gain 5 block per
    if (def.id === 'second_wind2') {
      const nonAttacks = state.hand.filter((c) => {
        if (c.instanceId === instanceId) return false;
        const d = state.masterCardPool[c.definitionId];
        return d && d.category !== 'attack';
      });
      if (nonAttacks.length > 0) {
        set((s) => ({
          hand: s.hand.filter((c) => c.instanceId === instanceId || s.masterCardPool[c.definitionId]?.category === 'attack'),
          exhaustPile: [...s.exhaustPile, ...nonAttacks],
          playerBlock: s.playerBlock + nonAttacks.length * 5,
        }));
      }
    }

    // Recycle: exhaust most expensive card in hand, gain its energy
    if (def.id === 'recycle') {
      const handCards = state.hand.filter((c) => c.instanceId !== instanceId);
      if (handCards.length > 0) {
        const mostExpensive = handCards.reduce((best, c) => {
          const d = state.masterCardPool[c.definitionId];
          const bestD = state.masterCardPool[best.definitionId];
          return (d?.cost ?? 0) > (bestD?.cost ?? 0) ? c : best;
        });
        const recycleDef = state.masterCardPool[mostExpensive.definitionId];
        const energyGain = recycleDef?.cost === -1 ? state.playerEnergy : (recycleDef?.cost ?? 1);
        set((s) => ({
          hand: s.hand.filter((c) => c.instanceId !== mostExpensive.instanceId),
          exhaustPile: [...s.exhaustPile, mostExpensive],
          playerEnergy: Math.min(s.playerEnergy + energyGain, s.playerMaxEnergy + 3),
        }));
      }
    }

    // Tempest: channel X lightning orbs
    if (def.id === 'tempest') {
      const energySpent = state.playerEnergy;
      for (let i = 0; i < energySpent; i++) {
        get().playCard = get().playCard; // trigger channel
        set((s) => {
          let orbs = [...s.orbs, 'lightning' as const];
          let enemyHP = s.enemyHP;
          let enemyBlock = s.enemyBlock;
          while (orbs.length > s.maxOrbs) {
            orbs.shift();
            const dmg = Math.max(0, 8 - enemyBlock);
            enemyBlock = Math.max(0, enemyBlock - 8);
            enemyHP = Math.max(0, enemyHP - dmg);
          }
          return { orbs, enemyHP, enemyBlock };
        });
      }
    }

    // Scry cards trigger scry mode
    if (def.id === 'scry_3' || def.id === 'calm_scry') {
      get().scry(3);
      return; // Stop further processing - we're in scry mode now
    }

    // Exhume: move top exhaust card back to hand
    if (def.id === 'exhume') {
      set((s) => {
        if (s.exhaustPile.length === 0) return {};
        const topExhaust = s.exhaustPile[s.exhaustPile.length - 1];
        return {
          hand: [...s.hand, topExhaust],
          exhaustPile: s.exhaustPile.slice(0, -1),
        };
      });
    }

    // Apotheosis: temporarily upgrade all cards in deck
    if (def.id === 'apotheosis') {
      set((s) => {
        const upgradeAll = (pile: CardInstance[]) =>
          pile.map((c) => {
            const d = s.masterCardPool[c.definitionId];
            if (d?.upgradeId) return { ...c, definitionId: d.upgradeId };
            return c;
          });
        return {
          deck: upgradeAll(s.deck),
          hand: upgradeAll(s.hand),
          discard: upgradeAll(s.discard),
        };
      });
    }

    // Masterful Stab: costs 0 if no block
    // (Already handled in card effect - but we need to actually make it free)
    // The check happens before playing, we'll handle cost override in affordability

    // Wild Strike: add a Wound to deck
    if (def.id === 'wild_strike') {
      get().addStatusCardsToDeck('wound', 1);
    }

    // Anger: add a copy to discard
    if (def.id === 'anger') {
      set((s) => ({
        discard: [...s.discard, { instanceId: generateId(), definitionId: 'anger' }],
      }));
    }

    // True Grit: exhaust a random card from hand
    if (def.id === 'true_grit') {
      set((s) => {
        if (s.hand.length === 0) return {};
        const randomIdx = Math.floor(Math.random() * s.hand.length);
        const toExhaust = s.hand[randomIdx];
        return {
          hand: s.hand.filter((_, i) => i !== randomIdx),
          exhaustPile: [...s.exhaustPile, toExhaust],
        };
      });
    }

    // Headbutt: put top discard card back on deck
    if (def.id === 'headbutt') {
      set((s) => {
        if (s.discard.length === 0) return {};
        const topDiscard = s.discard[s.discard.length - 1];
        return {
          deck: [topDiscard, ...s.deck],
          discard: s.discard.slice(0, -1),
        };
      });
    }

    // Compute whether card was exhausted (needed for Dead Branch post-set)
    const cardWasExhausted = def.exhaust || (state.activePowers.includes('corruption') &&
      (def.category === 'defense' || def.category === 'status'));

    // Dead Branch: add random card to hand when a card is exhausted
    if (cardWasExhausted && get().relics.includes('dead_branch')) {
      const randomCardId = REWARD_CARD_IDS[Math.floor(Math.random() * REWARD_CARD_IDS.length)];
      set((s) => ({
        hand: [...s.hand, { instanceId: generateId(), definitionId: randomCardId }],
      }));
    }

    // Dark Embrace: draw 1 card when a card is exhausted
    const afterExhaust = get();
    if (
      (def.exhaust || (afterExhaust.activePowers.includes('corruption') &&
        (def.category === 'defense' || def.category === 'status'))) &&
      afterExhaust.activePowers.includes('dark_embrace')
    ) {
      get().drawCards(1);
    }

    // Check boss enrage threshold (50% HP)
    const afterState = get();
    if (
      afterState.currentEnemy?.isBoss &&
      !afterState.bossEnraged &&
      afterState.enemyHP <= afterState.currentEnemy.maxHP * 0.5
    ) {
      set({ bossEnraged: true });
      // Boss gains Strength when enraged
      const bossStrength: import('../types').StatusEffect[] = [{ type: 'strength', stacks: 5 }];
      set((s) => ({ enemyStatuses: mergeStatuses(s.enemyStatuses, bossStrength) }));
    }

    if (get().enemyHP <= 0) {
      // Feed: gain 3 max HP on fatal blow
      if (def.id === 'feed' || def.id === 'feed_plus') {
        set((s) => ({ playerMaxHP: s.playerMaxHP + 3, playerHP: Math.min(s.playerHP + 3, s.playerMaxHP + 3) }));
      }
      // Ritual Dagger: permanently gain +3 damage
      if (def.id === 'ritual_dagger') {
        set((s) => ({ ritualDaggerBonus: s.ritualDaggerBonus + 3 }));
      }
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

      // Boss block reduction (Barricade blocks this)
      if (enemy.isBoss && enemy.specialMechanic?.type === 'block_reduction' && !state.activePowers.includes('barricade')) {
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

      // Decay curse: take 2 damage at end of turn
      const decayCards = state.discard.concat(state.hand).concat(state.deck)
        .filter((c) => c.definitionId === 'decay').length;
      if (decayCards > 0) {
        playerHP = Math.max(0, playerHP - 2 * decayCards);
      }

      // Regret curse: lose 1 HP per card in hand at end of turn
      const regretCards = state.discard.concat(state.deck)
        .filter((c) => c.definitionId === 'regret').length;
      if (regretCards > 0) {
        playerHP = Math.max(0, playerHP - state.hand.length * regretCards);
      }

      // Ritual: enemy gains Strength each turn
      if (enemy.eliteMechanic?.type === 'ritual') {
        enemyStatuses = mergeStatuses(enemyStatuses, [{ type: 'strength', stacks: enemy.eliteMechanic.strengthPerTurn }]);
      }

      // Enemy action
      const enemyStrength = getStatusStacks(enemyStatuses, 'strength');
      const isIntangible = getStatusStacks(playerStatuses, 'intangible') > 0;
      if (action === 'attack') {
        enemyBlock = 0;
        // Charge pattern: multiply attack on release turn
        const isChargeTurn = enemy.attackPattern.type === 'charge' &&
          state.turnNumber % ((enemy.attackPattern as { chargeTurns: number }).chargeTurns + 1) ===
          (enemy.attackPattern as { chargeTurns: number }).chargeTurns;
        const chargeMultiplier = isChargeTurn
          ? ((enemy.attackPattern as { chargeMultiplier?: number }).chargeMultiplier ?? 2)
          : 1;
        const rawAttack = Math.floor((enemy.baseAttack + enemyStrength) * chargeMultiplier);
        let dmg = Math.max(0, rawAttack - playerBlock);
        // Wrath: take double damage in Wrath stance
        if (state.stance === 'wrath' && dmg > 0) dmg = Math.floor(dmg * 2);
        // Intangible: reduce all damage to 1
        if (isIntangible && dmg > 0) dmg = 1;
        if (dmg > 0) {
          playerHP = Math.max(0, playerHP - dmg);
          // Bronze Scales: deal 3 thorns damage back when hit
          if (hasRelic(relics, 'bronze_scales')) {
            enemyHP = Math.max(0, enemyHP - 3);
          }
          // Thorns status: deal stacks damage back when hit
          const thornsStacks = getStatusStacks(playerStatuses, 'thorns');
          if (thornsStacks > 0) {
            enemyHP = Math.max(0, enemyHP - thornsStacks);
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
      // Block expiry: Barricade preserves all, Calipers caps at 15 (already done above), default: reset to 0
      if (!state.activePowers.includes('barricade') && !hasRelic(relics, 'calipers')) {
        playerBlock = 0;
      }

      // Plated Armor: gain stacks of block at start of each turn (after block reset)
      const platedArmor = getStatusStacks(playerStatuses, 'plated_armor');
      if (platedArmor > 0) {
        playerBlock += platedArmor;
      }

      // Orb passive effects each turn
      for (const orb of state.orbs) {
        if (orb === 'lightning') {
          // Lightning passive: deal 3 damage each turn
          const passiveDmg = Math.max(0, 3 - enemyBlock);
          enemyBlock = Math.max(0, enemyBlock - 3);
          enemyHP = Math.max(0, enemyHP - passiveDmg);
        } else if (orb === 'frost') {
          // Frost passive: gain 2 block each turn
          playerBlock += 2;
        }
        // Dark orb: passive is handled on evoke only
      }
      // If Barricade: block stays as-is
      // If Calipers: block was already capped to 15 in the Calipers step above, and we don't reset it

      // Decrement timed statuses at end of turn
      playerStatuses = tickTimedStatuses(playerStatuses);
      enemyStatuses = tickTimedStatuses(enemyStatuses);

      // Metallicize: gain block at start of next turn
      const metallicize = getStatusStacks(playerStatuses, 'metallicize');
      if (metallicize > 0) {
        playerBlock += metallicize;
      }

      // Demon Form: gain 2 Strength at start of each turn
      if (state.activePowers.includes('demon_form')) {
        playerStatuses = mergeStatuses(playerStatuses, [{ type: 'strength', stacks: 2 }]);
      }

      // Art of War: if no attacks played last turn, gain 1 energy next turn
      // (tracked via attackPlayedThisTurn, applied at turn start)

      // Horn Cleat: at start of turn 2, gain 14 Block
      if (state.turnNumber === 1 && hasRelic(relics, 'horn_cleat')) {
        playerBlock += 14;
      }

      const nextTurn = state.turnNumber + 1;
      const nextAction = computeEnemyAction(enemy.attackPattern, nextTurn);

      // Combat log for enemy action
      const enemyLogMsg = action === 'attack'
        ? `${enemy.name} attacked for ${Math.max(0, enemy.baseAttack + getStatusStacks(enemyStatuses, 'strength') - (state.playerBlock ?? 0))} dmg`
        : `${enemy.name} defended`;
      const newCombatLog = [enemyLogMsg, ...state.combatLog].slice(0, 6);

      // Separate retained cards from cards to discard
      const retainCards = state.hand.filter((c) => {
        const def = state.masterCardPool[c.definitionId];
        return def?.retain;
      });
      const etherealCards = state.hand.filter((c) => {
        const def = state.masterCardPool[c.definitionId];
        return def?.ethereal && !def?.retain;
      });
      const discardCards = state.hand.filter((c) => {
        const def = state.masterCardPool[c.definitionId];
        return !def?.retain && !def?.ethereal;
      });
      // Ethereal cards get exhausted instead of discarded
      // (added to exhaustPile, not discard)

      // Tough Bandages: gain 3 Block per discarded card at end of turn
      if (hasRelic(relics, 'tough_bandages')) {
        playerBlock += discardCards.length * 3;
      }

      // Calm stance: gain 1 extra energy, exit calm stance
      const calmBonus = state.stance === 'calm' ? 1 : 0;
      const nextStance = state.stance === 'calm' ? 'neutral' : state.stance;

      // Defragment: gain 1 energy per turn
      const defragmentBonus = state.activePowers.includes('defragment') ? 1 : 0;

      // Art of War: gain 1 energy if no attacks played last turn
      const artOfWarBonus = hasRelic(relics, 'art_of_war') && !state.attackPlayedThisTurn ? 1 : 0;

      // Track damage taken this turn
      const damageTakenThisTurn = action === 'attack'
        ? Math.max(0, state.playerHP - playerHP)
        : 0;

      return {
        playerHP,
        playerBlock,
        enemyHP,
        enemyBlock,
        playerStatuses,
        enemyStatuses,
        turnNumber: nextTurn,
        enemyTurnAction: nextAction,
        hand: retainCards,
        retainedCards: retainCards,
        discard: [...state.discard, ...discardCards],
        exhaustPile: [...state.exhaustPile, ...etherealCards],
        playerEnergy: PLAYER_MAX_ENERGY + artOfWarBonus + calmBonus + defragmentBonus,
        cardsPlayedThisTurn: 0,
        attackPlayedThisTurn: false,
        combatLog: newCombatLog,
        stance: nextStance as 'neutral' | 'calm' | 'wrath',
        totalDamageTaken: state.totalDamageTaken + damageTakenThisTurn,
        necronomiconUsedThisTurn: false,
        firstBlockThisTurn: true,
      };
    });

    // Centennial Puzzle: trigger on first hit from enemy
    const afterEnemy = get();
    if (
      !afterEnemy.tookDamageThisCombat &&
      afterEnemy.enemyTurnAction === 'attack' &&
      afterEnemy.relics.includes('centennial_puzzle')
    ) {
      get().drawCards(3);
      set((s) => ({ tookDamageThisCombat: true }));
    }

    if (get().playerHP <= 0) {
      const s = get();
      const score = Math.floor(
        (s.currentFloor + 1) * 50 +
        s.relics.length * 25 +
        s.gold * 0.25
      );
      const record: RunRecord = {
        floor: s.currentFloor + 1,
        score,
        won: false,
        character: s.selectedCharacter,
        ascension: s.ascensionLevel,
        deckSize: s.deck.length + s.hand.length + s.discard.length,
        relicCount: s.relics.length,
      };
      set({
        phase: 'gameover',
        currentRunScore: score,
        bestScore: Math.max(s.bestScore, score),
        runHistory: [record, ...s.runHistory].slice(0, 10),
      });
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

    // Mayhem: auto-play top card of deck
    const mayhemState = get();
    if (mayhemState.activePowers.includes('mayhem') && mayhemState.deck.length > 0) {
      const topCard = mayhemState.deck[0];
      const topDef = mayhemState.masterCardPool[topCard.definitionId];
      if (topDef && !topDef.isUnplayable && mayhemState.playerEnergy >= (topDef.cost === -1 ? 1 : Math.max(0, topDef.cost))) {
        // Remove from deck and add to hand first, then play it
        set((s) => ({ deck: s.deck.slice(1), hand: [topCard, ...s.hand] }));
        get().playCard(topCard.instanceId);
      }
    }

    // Evolve: draw 1 card per Status card drawn this turn
    const evolveState = get();
    if (evolveState.activePowers.includes('evolve')) {
      const statusCards = evolveState.hand.filter((c) => {
        const def = evolveState.masterCardPool[c.definitionId];
        return def?.isStatusCard;
      });
      if (statusCards.length > 0) {
        get().drawCards(statusCards.length);
      }
    }
  },

  stageWon: () => {
    const state = get();
    // Burning Blood: heal 6 HP after every combat
    const burningBloodHeal = hasRelic(state.relics, 'burning_blood') ? 6 : 0;
    // Mango: gain 1 max HP after every combat
    const mangoBonus = hasRelic(state.relics, 'mango') ? 1 : 0;

    // Track enemy defeat
    set((s) => ({ enemiesDefeated: s.enemiesDefeated + 1 }));

    // Gremlin Horn: gain 1 energy and draw 1 card when an enemy dies
    if (hasRelic(state.relics, 'gremlin_horn') && !state.currentEnemy?.isBoss) {
      set((s) => ({ playerEnergy: Math.min(s.playerEnergy + 1, s.playerMaxEnergy + 3) }));
      get().drawCards(1);
    }

    // Potion drop: 35% chance to drop a potion on non-boss enemy death
    if (Math.random() < 0.35 && !state.currentEnemy?.isBoss) {
      const newPotion = pickRandomPotion(state.potions);
      if (state.potions.length < state.maxOrbs) { // reuse maxOrbs (3) as max potions
        set((s) => s.potions.length < 3 ? { potions: [...s.potions, newPotion] } : {});
      }
    }

    if (state.currentEnemy?.isBoss) {
      const bossGold = 50;
      const newAscension = Math.min(state.ascensionLevel + 1, 10);
      // Score calculation
      const score = Math.floor(
        (state.currentFloor + 1) * 50 +         // floors cleared
        state.playerHP * 2 +                      // HP remaining
        state.gold * 0.5 +                        // gold
        state.relics.length * 25 +               // relics collected
        (state.deck.length + state.hand.length + state.discard.length) * 5 + // deck size
        state.ascensionLevel * 100               // ascension bonus
      );
      const newBestScore = Math.max(state.bestScore, score);
      // Pick 3 distinct boss relics for the player to choose from
      const allBossRelics = BOSS_RELICS.filter((r) => !state.relics.includes(r));
      const shuffledBossRelics = allBossRelics.sort(() => Math.random() - 0.5).slice(0, 3);

      set({
        phase: shuffledBossRelics.length > 0 ? 'boss_relic' : 'victory',
        gold: state.gold + bossGold,
        lastGoldReward: bossGold,
        playerHP: Math.min(state.playerHP + burningBloodHeal, state.playerMaxHP),
        ascensionLevel: newAscension,
        runsCompleted: state.runsCompleted + 1,
        currentRunScore: score,
        bestScore: newBestScore,
        bossRelicChoices: shuffledBossRelics,
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

    // Prayer Wheel: extra card reward for normal enemies
    const prayerWheelBonus = hasRelic(state.relics, 'prayer_wheel') ? 4 : 3;
    const choices = pickRewardCards(REWARD_CARD_IDS, prayerWheelBonus, REWARD_CARD_WEIGHTS).map((id) => ALL_CARDS[id]);
    const newMaxHP = state.playerMaxHP + mangoBonus;
    const healedHP = Math.min(state.playerHP + 10 + burningBloodHeal, newMaxHP);
    set({
      phase: 'reward',
      rewardChoices: choices,
      playerHP: healedHP,
      playerMaxHP: newMaxHP,
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
      if (hasRelic(relics, 'thread_and_needle')) {
        startStatuses = mergeStatuses(startStatuses, [{ type: 'metallicize', stacks: 4 }]);
      }
      const sneckoExtraCards = hasRelic(relics, 'snecko_eye') ? 2 : 0;

      // Separate innate cards from the rest
      const allDeckCards = [...state.deck];
      const bottledCard = state.bottledCardId
        ? allDeckCards.find((c) => c.definitionId === state.bottledCardId)
        : null;
      const innateDefs = allDeckCards.filter((c) => state.masterCardPool[c.definitionId]?.innate);
      const normalDefs = allDeckCards.filter((c) =>
        !state.masterCardPool[c.definitionId]?.innate &&
        c.instanceId !== bottledCard?.instanceId
      );
      const shuffledNormal = shuffle(normalDefs);

      const drawCount = HAND_SIZE + startExtraCards + sneckoExtraCards;
      const guaranteedCards = [
        ...(bottledCard ? [bottledCard] : []),
        ...innateDefs,
      ];
      const fromNormal = Math.max(0, drawCount - guaranteedCards.length);
      const newHand = [...guaranteedCards, ...shuffledNormal.slice(0, fromNormal)];
      const remaining = shuffledNormal.slice(fromNormal);

      const ascHP = Math.floor(enemy.maxHP * ascensionEnemyHPMultiplier(state.ascensionLevel));

      // Neow's Lament: first 3 enemies start with +1 Strength
      const neowLaments = [...state.deck, ...state.hand, ...state.discard]
        .filter((c) => c.definitionId === 'neows_lament').length;
      if (neowLaments > 0 && node.floor < 3) {
        enemyStartStatuses = mergeStatuses(enemyStartStatuses, [{ type: 'strength', stacks: 1 }]);
      }

      set({
        phase: 'combat',
        currentFloor: node.floor,
        currentStage: node.floor + 1,
        map: updatedMap,
        currentEnemy: enemy,
        enemyHP: ascHP,
        enemyBlock: enemy.startingBlock ?? 0,
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
        enemyStatuses: enemy.startingStatuses
          ? mergeStatuses(enemyStartStatuses, enemy.startingStatuses)
          : enemyStartStatuses,
        exhaustPile: [],
        retainedCards: [],
        bossEnraged: false,
        activePowers: [],
        combatLog: [],
        attackCardsPlayedTotal: 0,
        attackPlayedThisTurn: false,
        sneckoCosts: {},
        burstActive: false,
        doubleTapActive: false,
        charges: 0,
        stance: 'neutral' as const,
        orbs: [],
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

  restockShop: () => {
    set((state) => {
      if (state.gold < 50) return {};
      const newInventory = generateShopInventory(REWARD_CARD_WEIGHTS);
      return { gold: state.gold - 50, shopInventory: newInventory };
    });
  },

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

  scry: (amount: number) => {
    set((state) => {
      const scryCards = state.deck.slice(0, amount);
      return { scryCards, scryAmount: amount, phase: 'scry' };
    });
  },

  resolveScry: (keepIds: string[]) => {
    set((state) => {
      const keep = state.scryCards.filter((c) => keepIds.includes(c.instanceId));
      const discard = state.scryCards.filter((c) => !keepIds.includes(c.instanceId));
      const newDeck = [
        ...keep,
        ...state.deck.slice(state.scryAmount),
      ];
      return {
        deck: newDeck,
        discard: [...state.discard, ...discard],
        scryCards: [],
        scryAmount: 0,
        phase: 'combat',
      };
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

    // Knowing Skull: gain strength
    if (event.id === 'knowing_skull' && choice.label === 'Ask about strength') {
      set((s) => ({
        playerHP: Math.max(1, s.playerHP - 6),
        playerStatuses: mergeStatuses(s.playerStatuses, [{ type: 'strength', stacks: 2 }]),
        currentEvent: null, phase: 'map' as GamePhase,
      }));
      return;
    }

    // Golden Wing: -5 max HP
    if (event.id === 'golden_wing' && choice.label === 'Take it') {
      set((s) => ({
        gold: s.gold + 150,
        playerMaxHP: Math.max(20, s.playerMaxHP - 5),
        playerHP: Math.min(s.playerHP, Math.max(20, s.playerMaxHP - 5)),
        currentEvent: null, phase: 'map' as GamePhase,
      }));
      return;
    }

    // Metamorphosis: transform a random card
    if (event.id === 'metamorphosis' && choice.label !== 'Leave') {
      const state2 = get();
      const allCards2 = [...state2.deck, ...state2.hand, ...state2.discard];
      if (allCards2.length > 0) {
        const randomCard = allCards2[Math.floor(Math.random() * allCards2.length)];
        get().transformCard(randomCard.instanceId);
      }
      set({ currentEvent: null, phase: 'map' });
      return;
    }

    // Armory: add a random attack or defense card
    if (event.id === 'armory') {
      const state2 = get();
      const isAttack = choice.emoji === '⚔️';
      const pool = REWARD_CARD_IDS.filter((id) => {
        const def = ALL_CARDS[id];
        return isAttack ? def?.category === 'attack' : def?.category === 'defense';
      });
      const pickedCard = pool[Math.floor(Math.random() * pool.length)];
      if (pickedCard) {
        set((s) => ({
          deck: [...s.deck, { instanceId: generateId(), definitionId: pickedCard }],
          currentEvent: null, phase: 'map' as GamePhase,
        }));
      } else {
        set({ currentEvent: null, phase: 'map' });
      }
      return;
    }

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

  selectBossRelic: (relicId: string) => {
    set((state) => {
      const record: RunRecord = {
        floor: state.currentFloor + 1,
        score: state.currentRunScore,
        won: true,
        character: state.selectedCharacter,
        ascension: state.ascensionLevel,
        deckSize: state.deck.length + state.hand.length + state.discard.length,
        relicCount: state.relics.length + 1,
      };
      return {
        phase: 'victory',
        relics: [...state.relics, relicId],
        bossRelicChoices: [],
        runHistory: [record, ...state.runHistory].slice(0, 10),
      };
    });
  },

  selectCharacter: (characterId: string) => {
    set({ selectedCharacter: characterId });
  },

  discardFromHand: (instanceId: string) => {
    set((state) => {
      const card = state.hand.find((c) => c.instanceId === instanceId);
      if (!card) return {};
      const def = state.masterCardPool[card.definitionId];
      const newHand = state.hand.filter((c) => c.instanceId !== instanceId);
      // If Dark Embrace is active and card has exhaust: draw 1
      const newDiscard = def?.exhaust
        ? state.discard
        : [...state.discard, card];
      const newExhaust = def?.exhaust
        ? [...state.exhaustPile, card]
        : state.exhaustPile;
      return { hand: newHand, discard: newDiscard, exhaustPile: newExhaust };
    });
  },

  transformCard: (instanceId: string) => {
    set((state) => {
      const card = [...state.deck, ...state.hand, ...state.discard].find(
        (c) => c.instanceId === instanceId
      );
      if (!card) return {};
      // Pick a random different card from the reward pool
      const pool = REWARD_CARD_IDS.filter((id) => id !== card.definitionId);
      const newDefId = pool[Math.floor(Math.random() * pool.length)];
      const transformInPile = (pile: CardInstance[]) =>
        pile.map((c) => c.instanceId === instanceId ? { ...c, definitionId: newDefId } : c);
      return {
        deck: transformInPile(state.deck),
        hand: transformInPile(state.hand),
        discard: transformInPile(state.discard),
      };
    });
  },

  selectBlessing: (blessingId: string) => {
    set((state) => {
      let gold = state.gold;
      let playerHP = state.playerHP;
      let playerMaxHP = state.playerMaxHP;
      let relics = [...state.relics];
      let potions = [...state.potions];
      let deck = [...state.deck];

      switch (blessingId) {
        case 'bonus_gold':
          gold += 100;
          break;
        case 'relic':
          { const r = pickRandomRelic(relics, 'common'); if (r) relics.push(r); }
          break;
        case 'extra_hp':
          playerMaxHP += 10;
          playerHP = playerMaxHP;
          break;
        case 'remove_card': {
          const strike = deck.find((c) => c.definitionId === 'strike');
          if (strike) deck = deck.filter((c) => c.instanceId !== strike.instanceId);
          break;
        }
        case 'upgrade_two': {
          let count = 0;
          deck = deck.map((c) => {
            if (count >= 2) return c;
            const def = state.masterCardPool[c.definitionId];
            if (def?.upgradeId) { count++; return { ...c, definitionId: def.upgradeId }; }
            return c;
          });
          break;
        }
        case 'two_potions':
          if (potions.length < 2) {
            potions = [...potions, pickRandomPotion(potions)];
            if (potions.length < 2) potions = [...potions, pickRandomPotion(potions)];
          }
          break;
        case 'max_energy':
          // Handled in startGame via PLAYER_MAX_ENERGY + bonus
          // Store extra energy bonus in a persistent way
          break;
        case 'class_relic': {
          const charDef2 = ALL_CHARACTERS[state.selectedCharacter];
          if (charDef2 && !relics.includes(charDef2.startingRelic)) {
            relics.push(charDef2.startingRelic);
          } else {
            // Already have class relic, give random uncommon
            const r2 = pickRandomRelic(relics, 'uncommon');
            if (r2) relics.push(r2);
          }
          break;
        }
      }

      return { phase: 'map', gold, playerHP, playerMaxHP, relics, potions, deck };
    });
  },

  setAscensionLevel: (level: number) => {
    set({ ascensionLevel: Math.max(0, Math.min(10, level)) });
  },

  restartGame: () => {
    const { ascensionLevel, runsCompleted, bestScore, selectedCharacter, runHistory } = get();
    set({ ...initialState, ascensionLevel, runsCompleted, bestScore, selectedCharacter, runHistory });
    get().startGame();
  },

  goToCharacterSelect: () => {
    set({ phase: 'character_select' });
  },

  goToMenu: () => {
    const { ascensionLevel, runsCompleted, bestScore, selectedCharacter, runHistory } = get();
    set({ ...initialState, ascensionLevel, runsCompleted, bestScore, selectedCharacter, runHistory });
  },
}));
