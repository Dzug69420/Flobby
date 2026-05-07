import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { COLORS, FONTS, SPACING } from '../constants/theme';

export default function StartScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const titleAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#0a0a1a', '#1a1a2e', '#0f3460']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Decorative slime blobs in background */}
        <View style={[styles.blob, { top: 60, left: 20, width: 60, height: 50, backgroundColor: '#7bc67e' }]} />
        <View style={[styles.blob, { top: 100, right: 30, width: 45, height: 38, backgroundColor: '#5b9bd5' }]} />
        <View style={[styles.blob, { bottom: 120, left: 40, width: 50, height: 42, backgroundColor: '#9b59b6' }]} />
        <View style={[styles.blob, { bottom: 80, right: 20, width: 40, height: 35, backgroundColor: '#e67e22' }]} />

        <Animated.View style={[styles.titleSection, { opacity: titleAnim, transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }] }]}>
          <Text style={styles.emoji}>👾</Text>
          <Text style={styles.title}>FLOBBY</Text>
          <Text style={styles.subtitle}>The Blob Dungeon</Text>
        </Animated.View>

        <Animated.View style={{ opacity: buttonAnim }}>
          <TouchableOpacity onPress={startGame} style={styles.button} activeOpacity={0.85}>
            <Text style={styles.buttonText}>⚔️  START GAME</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Defeat 10 stages and face Flobby!</Text>
        </Animated.View>

        <Text style={styles.footer}>3 energy per turn · 6 cards per hand · 10 stages + 1 boss</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  blob: { position: 'absolute', borderRadius: 50, opacity: 0.3 },
  titleSection: { alignItems: 'center', marginBottom: SPACING.xl * 2 },
  emoji: { fontSize: 80, marginBottom: SPACING.sm },
  title: {
    fontSize: FONTS.screenTitle + 14,
    fontWeight: 'bold',
    color: COLORS.bossGold,
    letterSpacing: 8,
    textShadowColor: COLORS.accentGold,
    textShadowRadius: 20,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    fontSize: FONTS.button,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    letterSpacing: 2,
  },
  button: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 14,
    shadowColor: COLORS.accentGold,
    shadowRadius: 12,
    shadowOpacity: 0.6,
    elevation: 6,
    marginBottom: SPACING.md,
  },
  buttonText: {
    color: '#000',
    fontSize: FONTS.button + 2,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  hint: { color: COLORS.textSecondary, textAlign: 'center', fontSize: 13 },
  footer: { position: 'absolute', bottom: 30, color: COLORS.textSecondary, fontSize: 11, textAlign: 'center' },
});
