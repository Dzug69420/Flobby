import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { COLORS, FONTS, SPACING } from '../constants/theme';

function getDeathQuip(stage: number): string {
  if (stage <= 2) return 'Even the Glurps were too much...';
  if (stage <= 4) return 'The slimes are tougher than they look.';
  if (stage <= 6) return "Halfway there — but halfway doesn't count.";
  if (stage <= 8) return 'So close to Flobby. So very close.';
  if (stage <= 10) return 'One stage away from the boss. Heartbreaking.';
  return 'Flobby wins this time...';
}

export default function GameOverScreen() {
  const { currentStage, currentFloor, deck, hand, discard, playerHP, currentEnemy, restartGame, goToMenu, relics, gold, currentRunScore, bestScore, runHistory, runsCompleted } = useGameStore();
  const deckSize = deck.length + hand.length + discard.length;
  const isNewBest = currentRunScore > 0 && currentRunScore >= bestScore;
  const wins = runHistory.filter((r) => r.won).length;
  const totalRuns = runHistory.length;

  return (
    <LinearGradient colors={['#1a0000', '#3d0000', '#0a0000']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.skull}>💀</Text>
        <Text style={styles.title}>YOU DIED</Text>
        <Text style={styles.subtitle}>{getDeathQuip(currentStage)}</Text>

        <View style={styles.statsBox}>
          <Text style={styles.statLine}>Reached Floor: <Text style={styles.statVal}>{currentFloor + 1} / 15</Text></Text>
          {currentEnemy && (
            <Text style={styles.statLine}>Killed by: <Text style={styles.statVal}>{currentEnemy.name} {currentEnemy.faceEmoji}</Text></Text>
          )}
          <Text style={styles.statLine}>Final Deck Size: <Text style={styles.statVal}>{deckSize} cards</Text></Text>
          <Text style={styles.statLine}>Relics Collected: <Text style={styles.statVal}>{relics.length}</Text></Text>
          <Text style={styles.statLine}>Gold Remaining: <Text style={styles.statVal}>🪙 {gold}</Text></Text>
          {currentRunScore > 0 && (
            <Text style={styles.statLine}>Score: <Text style={[styles.statVal, isNewBest && { color: COLORS.accentGold }]}>⭐ {currentRunScore.toLocaleString()}</Text></Text>
          )}
          {isNewBest && <Text style={[styles.statLine, { color: COLORS.accentGold, fontWeight: 'bold' }]}>🏆 New Best Score!</Text>}
          {bestScore > currentRunScore && bestScore > 0 && (
            <Text style={styles.statLine}>Best Score: <Text style={styles.statVal}>⭐ {bestScore.toLocaleString()}</Text></Text>
          )}
        </View>

        {/* Run History Preview */}
        {runHistory.length > 1 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Recent Runs</Text>
            {runHistory.slice(0, 3).map((r, i) => (
              <View key={i} style={styles.historyRow}>
                <Text style={[styles.historyWon, { color: r.won ? '#66bb6a' : '#e74c3c' }]}>
                  {r.won ? '✓' : '✗'}
                </Text>
                <Text style={styles.historyText}>
                  Floor {r.floor} · Asc {r.ascension} · ⭐{r.score}
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity onPress={restartGame} style={styles.button} activeOpacity={0.85}>
          <Text style={styles.buttonText}>🔄  TRY AGAIN</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToMenu} style={styles.menuButton} activeOpacity={0.8}>
          <Text style={styles.menuButtonText}>🏠  MAIN MENU</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  skull: { fontSize: 80, marginBottom: SPACING.sm },
  title: {
    fontSize: FONTS.screenTitle + 6,
    fontWeight: 'bold',
    color: COLORS.accent,
    letterSpacing: 6,
    textShadowColor: '#ff0000',
    textShadowRadius: 15,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.button - 2, marginTop: SPACING.xs, marginBottom: SPACING.xl },
  statsBox: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: SPACING.md,
    width: '100%',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#550000',
  },
  statLine: { color: COLORS.textSecondary, fontSize: 15, marginBottom: SPACING.xs },
  statVal: { color: COLORS.textPrimary, fontWeight: 'bold' },
  button: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: COLORS.accent,
    shadowRadius: 10,
    shadowOpacity: 0.5,
    elevation: 5,
    marginBottom: 12,
  },
  buttonText: { color: '#fff', fontSize: FONTS.button, fontWeight: 'bold', letterSpacing: 1 },
  menuButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.3)',
  },
  menuButtonText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: 'bold' },
  historySection: {
    width: '100%',
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#440000',
  },
  historyTitle: { color: '#888', fontSize: 12, marginBottom: 6 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  historyWon: { fontSize: 14, fontWeight: 'bold', width: 16 },
  historyText: { color: COLORS.textSecondary, fontSize: 12 },
});
