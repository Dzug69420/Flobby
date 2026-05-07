import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { EnemyDefinition } from '../types';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import HPBar from './HPBar';

interface Props {
  enemy: EnemyDefinition;
  enemyHP: number;
  enemyBlock: number;
  enemyTurnAction: 'attack' | 'defend' | null;
}

export default function EnemyDisplay({ enemy, enemyHP, enemyBlock, enemyTurnAction }: Props) {
  const wobble = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, { toValue: 1.05, duration: 750, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 1, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const isBoss = enemy.isBoss;
  const intentText = enemyTurnAction === 'attack'
    ? `⚔️ Attack ${enemy.baseAttack}`
    : '🛡️ Defending';

  return (
    <View style={[styles.container, isBoss && styles.bossContainer]}>
      {isBoss && <Text style={styles.bossLabel}>⚠️ Halves your block!</Text>}
      <View style={styles.nameRow}>
        <Text style={[styles.name, isBoss && styles.bossName]}>{enemy.name}</Text>
        {isBoss && <Text style={styles.bossTag}>BOSS</Text>}
      </View>

      <Animated.View
        style={[
          styles.slimeBody,
          {
            width: enemy.bodySize,
            height: enemy.bodySize * 0.85,
            borderRadius: enemy.bodySize / 2,
            backgroundColor: enemy.color,
            transform: [{ scale: wobble }],
            shadowColor: isBoss ? COLORS.bossGold : enemy.color,
            shadowRadius: isBoss ? 16 : 6,
            shadowOpacity: isBoss ? 0.8 : 0.5,
          },
        ]}
      >
        <Text style={[styles.face, { fontSize: enemy.bodySize * 0.38 }]}>{enemy.faceEmoji}</Text>
        {isBoss && <Text style={[styles.bossEmoji, { fontSize: enemy.bodySize * 0.22 }]}>😈</Text>}
      </Animated.View>

      <View style={styles.statsRow}>
        <View style={styles.hpSection}>
          <HPBar current={enemyHP} max={enemy.maxHP} height={8} showText={true} />
        </View>
      </View>

      <View style={styles.statusRow}>
        {enemyBlock > 0 && (
          <Text style={styles.blockText}>🛡️ {enemyBlock}</Text>
        )}
        <Text style={[styles.intent, enemyTurnAction === 'attack' ? styles.intentAttack : styles.intentDefend]}>
          {intentText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(22,33,62,0.85)',
    borderRadius: 12,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceRaised,
    marginHorizontal: SPACING.sm,
  },
  bossContainer: {
    borderColor: COLORS.bossGold,
    borderWidth: 2,
    shadowColor: COLORS.bossGold,
    shadowRadius: 10,
    shadowOpacity: 0.6,
    elevation: 8,
  },
  bossLabel: {
    color: COLORS.accentGold,
    fontSize: 11,
    marginBottom: 2,
    fontStyle: 'italic',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  name: { color: COLORS.textPrimary, fontSize: FONTS.enemyName, fontWeight: 'bold' },
  bossName: { color: COLORS.bossGold },
  bossTag: {
    backgroundColor: COLORS.accent,
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  slimeBody: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 8,
  },
  face: { textAlign: 'center' },
  bossEmoji: { textAlign: 'center', marginTop: -4 },
  statsRow: { width: '100%', marginBottom: 4 },
  hpSection: { width: '100%' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  blockText: { color: COLORS.blockColor, fontSize: 13, fontWeight: 'bold' },
  intent: { fontSize: 13, fontWeight: 'bold' },
  intentAttack: { color: COLORS.accent },
  intentDefend: { color: COLORS.accentBlue },
});
