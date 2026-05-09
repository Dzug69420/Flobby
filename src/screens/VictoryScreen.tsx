import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { ALL_RELICS } from '../data/relics';

export default function VictoryScreen() {
  const { playerHP, playerMaxHP, deck, hand, discard, restartGame, goToMenu, ascensionLevel, runsCompleted, gold, currentRunScore, bestScore, relics, totalDamageDealt, totalDamageTaken, totalBlockGained } = useGameStore();
  const deckSize = deck.length + hand.length + discard.length;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <LinearGradient colors={['#000000', '#2d2000', '#4a3000']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.crown}>👑</Text>

        <Animated.Text style={[styles.title, { transform: [{ scale: pulseAnim }] }]}>
          VICTORY!
        </Animated.Text>
        <Text style={styles.subtitle}>You defeated Flobby!</Text>

        <View style={styles.statsBox}>
          <Text style={styles.statLine}>HP: <Text style={styles.statVal}>{playerHP}/{playerMaxHP}</Text>
            <Text style={styles.statCalc}> (+{playerHP * 2} pts)</Text>
          </Text>
          <Text style={styles.statLine}>Deck: <Text style={styles.statVal}>{deckSize} cards</Text>
            <Text style={styles.statCalc}> (+{deckSize * 5} pts)</Text>
          </Text>
          <Text style={styles.statLine}>Gold: <Text style={styles.statVal}>🪙 {gold}</Text>
            <Text style={styles.statCalc}> (+{Math.floor(gold * 0.5)} pts)</Text>
          </Text>
          <Text style={styles.statLine}>Relics: <Text style={styles.statVal}>{relics.length}</Text>
            <Text style={styles.statCalc}> (+{relics.length * 25} pts)</Text>
          </Text>
          <Text style={styles.statLine}>Floors: <Text style={styles.statVal}>15/15</Text>
            <Text style={styles.statCalc}> (+750 pts)</Text>
          </Text>
          {ascensionLevel > 0 && (
            <Text style={styles.statLine}>Ascension Bonus: <Text style={[styles.statVal, { color: '#ce93d8' }]}>Asc {ascensionLevel}</Text>
              <Text style={styles.statCalc}> (+{ascensionLevel * 100} pts)</Text>
            </Text>
          )}
          <View style={styles.scoreDivider} />
          <Text style={styles.statLine}>
            TOTAL SCORE: <Text style={[styles.statVal, { color: '#66bb6a', fontSize: 18 }]}>⭐ {currentRunScore.toLocaleString()}</Text>
          </Text>
          {bestScore > currentRunScore && (
            <Text style={styles.statLine}>Best Score: <Text style={styles.statVal}>⭐ {bestScore.toLocaleString()}</Text></Text>
          )}
          {bestScore === currentRunScore && currentRunScore > 0 && (
            <Text style={[styles.statLine, { color: COLORS.accentGold }]}>🏆 NEW BEST SCORE!</Text>
          )}
          <Text style={styles.statLine}>Runs Completed: <Text style={styles.statVal}>🏆 {runsCompleted}</Text></Text>
          {totalDamageDealt > 0 && (
            <Text style={styles.statLine}>Damage Dealt: <Text style={styles.statVal}>⚔️ {totalDamageDealt.toLocaleString()}</Text></Text>
          )}
          {totalDamageTaken > 0 && (
            <Text style={styles.statLine}>Damage Taken: <Text style={styles.statVal}>💔 {totalDamageTaken}</Text></Text>
          )}
          {totalBlockGained > 0 && (
            <Text style={styles.statLine}>Total Block: <Text style={styles.statVal}>🛡️ {totalBlockGained.toLocaleString()}</Text></Text>
          )}
        </View>

        {/* Relics Gallery */}
        {relics.length > 0 && (
          <View style={styles.relicsSection}>
            <Text style={styles.relicsTitle}>Relics Collected ({relics.length})</Text>
            <View style={styles.relicsRow}>
              {relics.map((id) => {
                const def = ALL_RELICS[id];
                return (
                  <View key={id} style={styles.relicBadge}>
                    <Text style={styles.relicEmoji}>{def?.emoji ?? '?'}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <TouchableOpacity onPress={restartGame} style={styles.button} activeOpacity={0.85}>
          <Text style={styles.buttonText}>🔄  PLAY AGAIN</Text>
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
  crown: { fontSize: 90, marginBottom: SPACING.sm },
  title: {
    fontSize: FONTS.screenTitle + 8,
    fontWeight: 'bold',
    color: COLORS.bossGold,
    letterSpacing: 6,
    textShadowColor: COLORS.accentGold,
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    fontSize: FONTS.button,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  statsBox: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: SPACING.md,
    width: '100%',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.bossGold,
  },
  statLine: { color: COLORS.textSecondary, fontSize: 14, marginBottom: SPACING.xs },
  statVal: { color: COLORS.bossGold, fontWeight: 'bold' },
  statCalc: { color: 'rgba(255,215,0,0.5)', fontSize: 11 },
  scoreDivider: { height: 1, backgroundColor: 'rgba(255,215,0,0.2)', marginVertical: 6 },
  relicsSection: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  relicsTitle: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 8 },
  relicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  relicBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  relicEmoji: { fontSize: 18 },
  button: {
    backgroundColor: COLORS.bossGold,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: COLORS.bossGold,
    shadowRadius: 12,
    shadowOpacity: 0.6,
    elevation: 5,
    marginBottom: 12,
  },
  buttonText: { color: '#000', fontSize: FONTS.button, fontWeight: 'bold', letterSpacing: 1 },
  menuButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.35)',
  },
  menuButtonText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: 'bold' },
});
