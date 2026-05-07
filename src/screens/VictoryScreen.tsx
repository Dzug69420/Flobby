import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { COLORS, FONTS, SPACING } from '../constants/theme';

export default function VictoryScreen() {
  const { playerHP, playerMaxHP, deck, hand, discard, restartGame } = useGameStore();
  const deckSize = deck.length + hand.length + discard.length;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
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
          <Text style={styles.statLine}>Remaining HP: <Text style={styles.statVal}>{playerHP} / {playerMaxHP}</Text></Text>
          <Text style={styles.statLine}>Final Deck Size: <Text style={styles.statVal}>{deckSize} cards</Text></Text>
          <Text style={styles.statLine}>All 11 stages cleared! 🎉</Text>
        </View>

        <TouchableOpacity onPress={restartGame} style={styles.button} activeOpacity={0.85}>
          <Text style={styles.buttonText}>🔄  PLAY AGAIN</Text>
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
  statLine: { color: COLORS.textSecondary, fontSize: 15, marginBottom: SPACING.xs },
  statVal: { color: COLORS.bossGold, fontWeight: 'bold' },
  button: {
    backgroundColor: COLORS.bossGold,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: COLORS.bossGold,
    shadowRadius: 12,
    shadowOpacity: 0.6,
    elevation: 5,
  },
  buttonText: { color: '#000', fontSize: FONTS.button, fontWeight: 'bold', letterSpacing: 1 },
});
