import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { COLORS, FONTS, SPACING } from '../constants/theme';

export default function GameOverScreen() {
  const { currentStage, deck, hand, discard, playerHP, restartGame } = useGameStore();
  const deckSize = deck.length + hand.length + discard.length;

  return (
    <LinearGradient colors={['#1a0000', '#3d0000', '#0a0000']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.skull}>💀</Text>
        <Text style={styles.title}>YOU DIED</Text>
        <Text style={styles.subtitle}>Flobby wins this time...</Text>

        <View style={styles.statsBox}>
          <Text style={styles.statLine}>Reached Stage: <Text style={styles.statVal}>{currentStage} / 11</Text></Text>
          <Text style={styles.statLine}>Final Deck Size: <Text style={styles.statVal}>{deckSize} cards</Text></Text>
          <Text style={styles.statLine}>Remaining HP: <Text style={styles.statVal}>{playerHP}</Text></Text>
        </View>

        <TouchableOpacity onPress={restartGame} style={styles.button} activeOpacity={0.85}>
          <Text style={styles.buttonText}>🔄  TRY AGAIN</Text>
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
  },
  buttonText: { color: '#fff', fontSize: FONTS.button, fontWeight: 'bold', letterSpacing: 1 },
});
