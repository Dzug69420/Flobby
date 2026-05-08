import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated, Pressable, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { COLORS, SPACING, CARD } from '../constants/theme';
import StageBackground from '../components/StageBackground';
import EnemyDisplay from '../components/EnemyDisplay';
import PlayerStats from '../components/PlayerStats';
import HandArea from '../components/HandArea';
import EndTurnButton from '../components/EndTurnButton';
import CardComponent from '../components/CardComponent';
import RelicDisplay from '../components/RelicDisplay';
import PotionSlots from '../components/PotionSlots';
import CardTooltip from '../components/CardTooltip';
import { CardDefinition } from '../types';
import { ALL_CHARACTERS } from '../data/characters';

export default function CombatScreen() {
  const {
    currentStage, playerHP, playerMaxHP, playerBlock, playerEnergy, playerMaxEnergy,
    deck, hand, discard, currentEnemy, enemyHP, enemyBlock, enemyTurnAction,
    masterCardPool, playCard, endTurn, turnNumber, cardsPlayedThisTurn, goToMenu,
    playerStatuses, enemyStatuses, gold, relics, potions, usePotion, exhaustPile, bossEnraged, activePowers, selectedCharacter, combatLog,
  } = useGameStore();

  const [isAnimating, setIsAnimating] = useState(false);
  const [turnMessage, setTurnMessage] = useState<string | null>(null);
  const [pendingEnemyAction, setPendingEnemyAction] = useState<'attack' | 'defend'>('attack');
  const [showSettings, setShowSettings] = useState(false);
  const [showDeckViewer, setShowDeckViewer] = useState(false);
  const [deckViewTab, setDeckViewTab] = useState<'deck' | 'discard'>('deck');
  const [tooltipDef, setTooltipDef] = useState<CardDefinition | null>(null);
  const [stageFlash, setStageFlash] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    setStageFlash(true);
    const timer = setTimeout(() => setStageFlash(false), 1800);
    return () => clearTimeout(timer);
  }, [currentStage]);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const enemyActionAnim = useRef(new Animated.Value(0)).current;
  const deckHoverAnim = useRef(new Animated.Value(1)).current;
  const settingsHoverAnim = useRef(new Animated.Value(1)).current;
  const screenShakeAnim = useRef(new Animated.Value(0)).current;

  const shakeScreen = () => {
    screenShakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(screenShakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(screenShakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(screenShakeAnim, { toValue: 6, duration: 45, useNativeDriver: true }),
      Animated.timing(screenShakeAnim, { toValue: -4, duration: 45, useNativeDriver: true }),
      Animated.timing(screenShakeAnim, { toValue: 2, duration: 40, useNativeDriver: true }),
      Animated.timing(screenShakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const animateOverlay = (visible: boolean) => {
    Animated.timing(overlayOpacity, {
      toValue: visible ? 1 : 0,
      duration: 420,
      useNativeDriver: true,
    }).start();
  };

  const animateEnemyAction = (action: 'attack' | 'defend') => {
    enemyActionAnim.setValue(0);
    if (action === 'attack') {
      Animated.sequence([
        Animated.timing(enemyActionAnim, { toValue: -18, duration: 240, useNativeDriver: true }),
        Animated.timing(enemyActionAnim, { toValue: 0, duration: 240, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.sequence([
        Animated.timing(enemyActionAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(enemyActionAnim, { toValue: 0, duration: 240, useNativeDriver: true }),
      ]).start();
    }
  };

  const enemyActionTransform = pendingEnemyAction === 'attack'
    ? { transform: [{ translateY: enemyActionAnim }] }
    : { transform: [{ scale: enemyActionAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] };

  const handleEndTurn = () => {
    if (isAnimating || !currentEnemy) return;
    const nextAction = enemyTurnAction || 'attack';
    const enemyName = currentEnemy.name;
    const enemyIsBoss = currentEnemy.isBoss;
    setIsAnimating(true);
    setPendingEnemyAction(nextAction);
    setTurnMessage('Turn ended');
    animateOverlay(true);

    setTimeout(() => setTurnMessage(`${enemyName}'s turn`), 600);
    setTimeout(() => {
      const attackMsg = enemyIsBoss
        ? `${enemyName} ATTACKS! 👑`
        : `${enemyName} attacks!`;
      setTurnMessage(nextAction === 'attack' ? attackMsg : `${enemyName} braces up!`);
      animateEnemyAction(nextAction);
      if (nextAction === 'attack') shakeScreen();
    }, 1200);
    setTimeout(() => endTurn(), 2100);
    setTimeout(() => {
      if (!isMounted.current) return;
      animateOverlay(false);
      setTurnMessage(null);
      setIsAnimating(false);
      enemyActionAnim.setValue(0);
    }, 2900);
  };

  const handlePlayCard = (id: string) => {
    if (isAnimating) return;
    playCard(id);
  };

  const spring = (anim: Animated.Value, to: number) =>
    Animated.spring(anim, { toValue: to, useNativeDriver: true, tension: 220, friction: 10 }).start();

  if (!currentEnemy) return null;

  const viewCards = deckViewTab === 'deck' ? deck : discard;

  const combatCtx = {
    playerHP, playerMaxHP, playerBlock, playerEnergy,
    enemyHP, enemyBlock,
    cardsInHand: hand,
    cardsInDiscard: discard,
    cardsInDeck: deck,
    turnNumber, cardsPlayedThisTurn,
    playerStatuses, enemyStatuses,
  };

  return (
    <View style={styles.root}>
      <StageBackground stageNumber={currentStage} />

      <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: screenShakeAnim }] }]}>
      <SafeAreaView style={styles.safe}>

        {/* ── TOP HUD ── */}
        <View style={styles.hud}>
          <View style={styles.hudLeft}>
            <LinearGradient colors={['#c0392b', '#7b241c']} style={styles.flameOrb}>
              <Text style={styles.flameText}>🔥</Text>
            </LinearGradient>
            <View style={styles.hpBadge}>
              <Text style={styles.heartIcon}>♥</Text>
              <Text style={styles.hpValue}>{playerHP}</Text>
              <Text style={styles.hpSlash}>/</Text>
              <Text style={styles.hpMax}>{playerMaxHP}</Text>
            </View>
            <View style={styles.goldBadgeHud}>
              <Text style={styles.goldHudText}>🪙{gold}</Text>
            </View>
          </View>

          <View style={styles.hudCenter}>
            <Text style={styles.stageLabel}>Stage {currentStage} / 11</Text>
          </View>

          <View style={styles.hudRight}>
            {/* Deck viewer button */}
            <Pressable
              onPress={() => { setDeckViewTab('deck'); setShowDeckViewer(true); }}
              onHoverIn={() => spring(deckHoverAnim, 1.15)}
              onHoverOut={() => spring(deckHoverAnim, 1)}
            >
              <Animated.View style={[styles.deckBadge, { transform: [{ scale: deckHoverAnim }] }]}>
                <Text style={styles.deckNum}>{deck.length + hand.length}</Text>
                <Text style={styles.deckIcon}>🃏</Text>
              </Animated.View>
            </Pressable>

            {/* Settings button */}
            <Pressable
              onPress={() => setShowSettings(true)}
              onHoverIn={() => spring(settingsHoverAnim, 1.2)}
              onHoverOut={() => spring(settingsHoverAnim, 1)}
            >
              <Animated.View style={{ transform: [{ scale: settingsHoverAnim }] }}>
                <Text style={styles.hudBtn}>⚙️</Text>
              </Animated.View>
            </Pressable>
          </View>
        </View>

        {/* ── RELIC + POWERS ROW ── */}
        {(relics.length > 0 || activePowers.length > 0) && (
          <View style={styles.relicRow}>
            <RelicDisplay relics={relics} />
            {activePowers.length > 0 && (
              <View style={styles.powersRow}>
                {activePowers.map((pid) => {
                  const def = masterCardPool[pid];
                  if (!def) return null;
                  return (
                    <View key={pid} style={styles.powerBadge}>
                      <Text style={styles.powerEmoji}>🔋</Text>
                      <Text style={styles.powerName}>{def.name}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ── BATTLE AREA ── */}
        <View style={styles.battleArea}>
          <PlayerStats
            hp={playerHP}
            maxHP={playerMaxHP}
            block={playerBlock}
            energy={playerEnergy}
            maxEnergy={playerMaxEnergy}
            playerStatuses={playerStatuses}
            characterEmoji={ALL_CHARACTERS[selectedCharacter]?.emoji}
          />
          <Animated.View style={[styles.enemyWrapper, enemyActionTransform]}>
            <EnemyDisplay
              enemy={currentEnemy}
              enemyHP={enemyHP}
              enemyBlock={enemyBlock}
              enemyTurnAction={enemyTurnAction}
              stage={currentStage}
              enemyStatuses={enemyStatuses}
              bossEnraged={bossEnraged}
            />
          </Animated.View>
        </View>

        {turnMessage ? (
          <Animated.View style={[styles.turnOverlay, { opacity: overlayOpacity }]}>
            <Text style={styles.turnMessage}>{turnMessage}</Text>
          </Animated.View>
        ) : null}

        {stageFlash && (
          <View style={styles.stageFlashOverlay} pointerEvents="none">
            <Text style={styles.stageFlashText}>
              {currentEnemy.isBoss ? '⚠️ BOSS FIGHT' : `Stage ${currentStage}`}
            </Text>
            {currentEnemy.isBoss && (
              <Text style={styles.stageFlashSub}>{currentEnemy.name} {currentEnemy.faceEmoji}</Text>
            )}
          </View>
        )}

        {/* ── COMBAT LOG ── */}
        {combatLog.length > 0 && (
          <View style={styles.combatLog} pointerEvents="none">
            {combatLog.slice(0, 3).map((entry, i) => (
              <Text
                key={i}
                style={[styles.combatLogEntry, { opacity: 1 - i * 0.3 }]}
                numberOfLines={1}
              >
                {entry}
              </Text>
            ))}
          </View>
        )}

        {/* ── BOTTOM BAR ── */}
        <View style={styles.bottomBar}>
          <View style={styles.energySection}>
            <LinearGradient
              colors={['#e67e22', '#ca6f1e', '#7d3c00']}
              style={styles.energyOrb}
            >
              <Text style={styles.energyFraction}>{playerEnergy}/{playerMaxEnergy}</Text>
            </LinearGradient>
            <Text style={styles.pileLabelLeft}>🃏 {deck.length}</Text>
            {cardsPlayedThisTurn > 0 && (
              <Text style={styles.playedLabel}>▶ {cardsPlayedThisTurn}</Text>
            )}
            <PotionSlots
              potions={potions}
              onUse={usePotion}
              disabled={isAnimating}
            />
          </View>

          <View style={styles.handWrapper}>
            <HandArea
              hand={hand}
              masterPool={masterCardPool}
              onPlay={handlePlayCard}
              disabled={isAnimating}
              playerEnergy={playerEnergy}
              combatCtx={combatCtx}
            />
          </View>

          <View style={styles.endTurnSection}>
            <EndTurnButton
              onPress={handleEndTurn}
              disabled={isAnimating}
              turnNumber={turnNumber + 1}
            />
            <Text style={styles.pileLabelRight}>🗑 {discard.length}</Text>
            {exhaustPile.length > 0 && (
              <Text style={styles.pileLabelRight}>🔥 {exhaustPile.length}</Text>
            )}
          </View>
        </View>

        {/* ── SETTINGS OVERLAY ── */}
        {showSettings && (
          <View style={styles.overlayBack}>
            <View style={styles.settingsPanel}>
              <Text style={styles.overlayTitle}>⏸ PAUSED</Text>
              <View style={styles.overlaySep} />
              <TouchableOpacity
                style={styles.overlayBtn}
                onPress={() => setShowSettings(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.overlayBtnText}>▶  RESUME</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.overlayBtn, styles.overlayBtnDanger]}
                onPress={() => { setShowSettings(false); goToMenu(); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.overlayBtnText, styles.overlayBtnTextDanger]}>🏠  QUIT TO MENU</Text>
              </TouchableOpacity>
              <Text style={styles.overlayHint}>Stage {currentStage} · {playerHP}/{playerMaxHP} HP</Text>
            </View>
          </View>
        )}

        {/* ── DECK VIEWER OVERLAY ── */}
        {showDeckViewer && (
          <View style={styles.overlayBack}>
            <View style={styles.deckViewerPanel}>
              <View style={styles.deckViewerHeader}>
                <Text style={styles.overlayTitle}>🃏 YOUR CARDS</Text>
                <TouchableOpacity onPress={() => setShowDeckViewer(false)} hitSlop={12}>
                  <Text style={styles.closeBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[styles.tab, deckViewTab === 'deck' && styles.tabActive]}
                  onPress={() => setDeckViewTab('deck')}
                >
                  <Text style={[styles.tabText, deckViewTab === 'deck' && styles.tabTextActive]}>
                    Deck ({deck.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, deckViewTab === 'discard' && styles.tabActive]}
                  onPress={() => setDeckViewTab('discard')}
                >
                  <Text style={[styles.tabText, deckViewTab === 'discard' && styles.tabTextActive]}>
                    Discard ({discard.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Card grid */}
              <ScrollView
                style={styles.deckScroll}
                contentContainerStyle={styles.deckGrid}
                showsVerticalScrollIndicator={false}
              >
                {viewCards.length === 0 ? (
                  <Text style={styles.emptyText}>No cards here.</Text>
                ) : (
                  viewCards.map((cardInst, i) => {
                    const def = masterCardPool[cardInst.definitionId];
                    if (!def) return null;
                    return (
                      <View key={cardInst.instanceId} style={styles.deckCardWrap}>
                        <CardComponent
                          card={cardInst}
                          definition={def}
                          onPlay={() => setTooltipDef(def)}
                          disabled={false}
                          affordable={true}
                          index={i}
                        />
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        )}

      </SafeAreaView>
      </Animated.View>
      <CardTooltip definition={tooltipDef} onClose={() => setTooltipDef(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  // HUD
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  hudLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  flameOrb: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#f5a623',
  },
  flameText: { fontSize: 28 },
  hpBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: 24, borderWidth: 1, borderColor: 'rgba(231,76,60,0.5)',
  },
  heartIcon: { color: '#e74c3c', fontSize: 26, fontWeight: 'bold' },
  hpValue: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  hpSlash: { color: '#666', fontSize: 22 },
  hpMax: { color: '#aaa', fontSize: 22 },

  hudCenter: { flex: 1, alignItems: 'center' },
  stageLabel: { color: COLORS.accentGold, fontSize: 26, fontWeight: 'bold', letterSpacing: 1 },

  hudRight: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'flex-end' },
  deckBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  deckNum: { color: '#fff', fontSize: 48, fontWeight: 'bold' },
  deckIcon: { fontSize: 48 },
  hudBtn: { fontSize: 48 },
  goldBadgeHud: {
    backgroundColor: 'rgba(249,168,37,0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f9a825',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  goldHudText: { color: '#f9a825', fontSize: 13, fontWeight: 'bold' },

  combatLog: {
    position: 'absolute',
    left: 8,
    bottom: 120,
    gap: 2,
    zIndex: 5,
  },
  combatLogEntry: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  relicRow: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 4,
  },
  powersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  powerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(102,187,106,0.15)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#66bb6a',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  powerEmoji: { fontSize: 10 },
  powerName: { color: '#66bb6a', fontSize: 10, fontWeight: 'bold' },

  // BATTLE
  battleArea: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING.sm,
    paddingBottom: 4,
  },
  enemyWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  turnOverlay: {
    position: 'absolute',
    top: 130,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  turnMessage: {
    color: COLORS.accentGold,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },

  // STAGE FLASH
  stageFlashOverlay: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  stageFlashText: {
    color: COLORS.bossGold,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  stageFlashSub: {
    color: COLORS.accentGold,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // BOTTOM BAR
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.xs,
    paddingBottom: 24,
    paddingTop: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    gap: 6,
    minHeight: 290,
    overflow: 'visible',
  },
  energySection: { alignItems: 'center', gap: 4, paddingBottom: 4 },
  energyOrb: {
    width: 81, height: 81, borderRadius: 41,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#f5a623',
    shadowColor: '#e67e22', shadowRadius: 10, shadowOpacity: 0.9,
    elevation: 6,
  },
  energyFraction: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  pileLabelLeft: { color: COLORS.textSecondary, fontSize: 48, marginTop: 2 },
  playedLabel: { color: COLORS.accentGold, fontSize: 13, fontWeight: 'bold', opacity: 0.85 },
  handWrapper: { flex: 1, justifyContent: 'flex-end', overflow: 'visible' },
  endTurnSection: { alignItems: 'center', gap: 5, paddingBottom: 4 },
  pileLabelRight: { color: COLORS.textSecondary, fontSize: 48 },

  // OVERLAYS (shared)
  overlayBack: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  } as any,
  overlayTitle: {
    color: COLORS.bossGold,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  overlaySep: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8 },
  overlayBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  overlayBtnDanger: {
    borderColor: 'rgba(231,76,60,0.45)',
    backgroundColor: 'rgba(231,76,60,0.1)',
  },
  overlayBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  overlayBtnTextDanger: { color: '#ff8080' },
  overlayHint: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4 },

  // SETTINGS PANEL
  settingsPanel: {
    backgroundColor: '#0d1226',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 28,
    width: 280,
    gap: 12,
    shadowColor: '#000',
    shadowRadius: 30,
    shadowOpacity: 0.6,
    elevation: 20,
  },

  // DECK VIEWER
  deckViewerPanel: {
    backgroundColor: '#0d1226',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 20,
    width: '92%',
    maxHeight: '88%',
    shadowColor: '#000',
    shadowRadius: 30,
    shadowOpacity: 0.6,
    elevation: 20,
  },
  deckViewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeBtn: { color: '#888', fontSize: 22, fontWeight: 'bold', paddingHorizontal: 4 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabActive: {
    backgroundColor: 'rgba(245,166,35,0.18)',
    borderColor: COLORS.accentGold,
  },
  tabText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: 'bold' },
  tabTextActive: { color: COLORS.accentGold },
  deckScroll: { flexGrow: 0 },
  deckGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  deckCardWrap: { overflow: 'visible' },
  emptyText: { color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 20 },
});
