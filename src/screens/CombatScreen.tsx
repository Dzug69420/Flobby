import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
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

  const handleEndTurn = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    endTurn();
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

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.stageText}>Stage {currentStage} / 11</Text>
          <View style={styles.pileRow}>
            <Text style={styles.pileText}>🃏 {deck.length}</Text>
            <Text style={styles.pileText}>🗑️ {discard.length}</Text>
          </View>
        </View>

        {/* ── Battle row: player left, enemy right ── */}
        <View style={styles.battleRow}>
          <PlayerStats
            hp={playerHP}
            maxHP={playerMaxHP}
            block={playerBlock}
            energy={playerEnergy}
            maxEnergy={playerMaxEnergy}
          />
          <View style={styles.battleGap} />
          <EnemyDisplay
            enemy={currentEnemy}
            enemyHP={enemyHP}
            enemyBlock={enemyBlock}
            enemyTurnAction={enemyTurnAction}
            stage={currentStage}
          />
        </View>

        {/* ── Hand ── */}
        <View style={styles.handSection}>
          <Text style={styles.handLabel}>HAND  ({hand.length} cards)</Text>
          <HandArea
            hand={hand}
            masterPool={masterCardPool}
            onPlay={handlePlayCard}
            disabled={isAnimating}
            playerEnergy={playerEnergy}
          />
        </View>

        {/* ── End turn ── */}
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
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  stageText: {
    color: COLORS.accentGold,
    fontSize: FONTS.stageInfo + 2,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  pileRow: { flexDirection: 'row', gap: 14 },
  pileText: { color: COLORS.textSecondary, fontSize: FONTS.stageInfo + 1 },

  battleRow: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  battleGap: { width: SPACING.sm },

  handSection: {
    paddingTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  handLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 2,
    marginLeft: 4,
  },

  endTurnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.sm,
  },
});
