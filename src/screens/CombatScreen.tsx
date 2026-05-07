import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import StageBackground from '../components/StageBackground';
import EnemyDisplay from '../components/EnemyDisplay';
import PlayerStats from '../components/PlayerStats';
import HandArea from '../components/HandArea';
import EndTurnButton from '../components/EndTurnButton';

export default function CombatScreen() {
  const {
    currentStage, playerHP, playerMaxHP, playerBlock, playerEnergy, playerMaxEnergy,
    deck, hand, discard, currentEnemy, enemyHP, enemyBlock, enemyTurnAction,
    masterCardPool, playCard, endTurn,
  } = useGameStore();

  const [isAnimating, setIsAnimating] = useState(false);
  const damageAnim = useRef(new Animated.Value(0)).current;

  const handleEndTurn = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    endTurn();
    // Brief lock to let end-turn resolve
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePlayCard = (id: string) => {
    if (isAnimating) return;
    playCard(id);
  };

  if (!currentEnemy) return null;

  return (
    <View style={styles.root}>
      <StageBackground stageNumber={currentStage} />

      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.stageText}>Stage {currentStage} / 11</Text>
          <View style={styles.pileRow}>
            <Text style={styles.pileText}>🃏 {deck.length}</Text>
            <Text style={styles.pileText}>🗑️ {discard.length}</Text>
          </View>
        </View>

        {/* Enemy */}
        <View style={styles.enemySection}>
          <EnemyDisplay
            enemy={currentEnemy}
            enemyHP={enemyHP}
            enemyBlock={enemyBlock}
            enemyTurnAction={enemyTurnAction}
          />
        </View>

        {/* Player stats */}
        <View style={styles.playerSection}>
          <PlayerStats
            hp={playerHP}
            maxHP={playerMaxHP}
            block={playerBlock}
            energy={playerEnergy}
            maxEnergy={playerMaxEnergy}
          />
        </View>

        {/* Hand */}
        <View style={styles.handSection}>
          <HandArea
            hand={hand}
            masterPool={masterCardPool}
            onPlay={handlePlayCard}
            disabled={isAnimating}
            playerEnergy={playerEnergy}
          />
        </View>

        {/* End turn */}
        <View style={styles.endTurnRow}>
          <EndTurnButton onPress={handleEndTurn} disabled={isAnimating} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  stageText: { color: COLORS.accentGold, fontSize: FONTS.stageInfo, fontWeight: 'bold' },
  pileRow: { flexDirection: 'row', gap: 12 },
  pileText: { color: COLORS.textSecondary, fontSize: FONTS.stageInfo },
  enemySection: { flex: 3, justifyContent: 'center', paddingHorizontal: SPACING.sm, paddingTop: SPACING.sm },
  playerSection: { paddingHorizontal: 0, paddingVertical: SPACING.xs },
  handSection: { flex: 2, justifyContent: 'flex-end' },
  endTurnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.xs,
  },
});
