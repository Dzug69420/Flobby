import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { EnemyDefinition } from '../types';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import HPBar from './HPBar';
import GlurpSprite from './GlurpSprite';

interface Props {
  enemy: EnemyDefinition;
  enemyHP: number;
  enemyBlock: number;
  enemyTurnAction: 'attack' | 'defend' | null;
  stage: number;
}

export default function EnemyDisplay({ enemy, enemyHP, enemyBlock, enemyTurnAction, stage }: Props) {
  const wobble = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (stage === 1) return; // sprite handles its own animation
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, { toValue: 1.06, duration: 800, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [stage]);

  const isBoss = enemy.isBoss;
  const intentText = enemyTurnAction === 'attack'
    ? `⚔️  ${enemy.baseAttack} dmg`
    : '🛡️  Defending';

  const blob = (
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
          shadowOpacity: isBoss ? 0.8 : 0.4,
        },
      ]}
    >
      <Text style={[styles.face, { fontSize: enemy.bodySize * 0.38 }]}>{enemy.faceEmoji}</Text>
      {isBoss && <Text style={[styles.bossEmoji, { fontSize: enemy.bodySize * 0.22 }]}>😈</Text>}
    </Animated.View>
  );

  return (
    <View style={[styles.container, isBoss && styles.bossContainer]}>
      {isBoss && <Text style={styles.bossLabel}>⚠️ Halves your block!</Text>}

      <View style={styles.nameRow}>
        <Text style={[styles.name, isBoss && styles.bossName]} numberOfLines={1} adjustsFontSizeToFit>
          {enemy.name}
        </Text>
        {isBoss && <Text style={styles.bossTag}>BOSS</Text>}
      </View>

      <View style={styles.spriteWrap}>
        {stage === 1 ? <GlurpSprite size={100} row={0} /> : blob}
      </View>

      <View style={styles.hpRow}>
        <HPBar current={enemyHP} max={enemy.maxHP} height={9} showText={true} />
      </View>

      <View style={styles.statusRow}>
        {enemyBlock > 0 && (
          <Text style={styles.blockText}>🛡️ {enemyBlock}</Text>
        )}
        <Text
          style={[styles.intent, enemyTurnAction === 'attack' ? styles.intentAttack : styles.intentDefend]}
          numberOfLines={1}
        >
          {intentText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(22,33,62,0.88)',
    borderRadius: 14,
    padding: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceRaised,
  },
  bossContainer: {
    borderColor: COLORS.bossGold,
    borderWidth: 2,
  },
  bossLabel: {
    color: COLORS.accentGold,
    fontSize: 10,
    marginBottom: 2,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    width: '100%',
    justifyContent: 'center',
    gap: 4,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: FONTS.enemyName,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  bossName: { color: COLORS.bossGold },
  bossTag: {
    backgroundColor: COLORS.accent,
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  spriteWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    height: 104,
  },
  slimeBody: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
  },
  face: { textAlign: 'center' },
  bossEmoji: { textAlign: 'center', marginTop: -4 },
  hpRow: { width: '100%', marginBottom: 6 },
  statusRow: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  blockText: { color: COLORS.blockColor, fontSize: 13, fontWeight: 'bold' },
  intent: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  intentAttack: { color: COLORS.accent },
  intentDefend: { color: COLORS.accentBlue },
});
