import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { EnemyDefinition, StatusEffect } from '../types';
import { COLORS } from '../constants/theme';
import HPBar from './HPBar';
import SlimeSprite from './SlimeSprite';
import StatusBadges from './StatusBadges';

interface Props {
  enemy: EnemyDefinition;
  enemyHP: number;
  enemyBlock: number;
  enemyTurnAction: 'attack' | 'defend' | null;
  stage: number;
  enemyStatuses: StatusEffect[];
}

export default function EnemyDisplay({ enemy, enemyHP, enemyBlock, enemyTurnAction, stage, enemyStatuses }: Props) {
  const wobble = useRef(new Animated.Value(1)).current;
  const intentBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (stage === 1) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, { toValue: 1.05, duration: 1400, useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [stage]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(intentBounce, { toValue: -4, duration: 900, useNativeDriver: true }),
        Animated.timing(intentBounce, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [enemyTurnAction]);

  const isBoss = enemy.isBoss;
  const isElite = enemy.isElite;
  const isAttacking = enemyTurnAction === 'attack';
  const enemyStrength = enemyStatuses.find((s) => s.type === 'strength')?.stacks ?? 0;
  const intentValue = isAttacking
    ? enemy.baseAttack + enemyStrength
    : Math.floor(enemy.baseAttack * 0.8);
  const intentStatusIcons = isAttacking && enemy.attackStatuses && enemy.attackStatuses.length > 0
    ? enemy.attackStatuses.map((s) => {
        const icons: Record<string, string> = { vulnerable: '💢', weak: '🌀', frail: '💨', poison: '☠️' };
        return icons[s.type] ?? '';
      }).join('')
    : '';

  const blob = (
    <Animated.View
      style={[
        styles.blob,
        {
          width: enemy.bodySize,
          height: enemy.bodySize * 0.85,
          borderRadius: enemy.bodySize / 2,
          backgroundColor: enemy.color,
          transform: [{ scale: wobble }],
          shadowColor: isBoss ? COLORS.bossGold : enemy.color,
          shadowRadius: isBoss ? 18 : 8,
          shadowOpacity: isBoss ? 0.9 : 0.5,
          borderWidth: isBoss ? 2 : 0,
          borderColor: isBoss ? COLORS.bossGold : 'transparent',
        },
      ]}
    >
      <Text style={[styles.blobFace, { fontSize: enemy.bodySize * 0.38 }]}>{enemy.faceEmoji}</Text>
      {isBoss && <Text style={[styles.bossEmoji, { fontSize: enemy.bodySize * 0.2 }]}>😈</Text>}
    </Animated.View>
  );

  return (
    <View style={[styles.container, isBoss && styles.bossContainer]}>

      {/* Intent badge — floats above the enemy */}
      <Animated.View
        style={[
          styles.intentBadge,
          isAttacking ? styles.intentAttackBg : styles.intentDefendBg,
          { transform: [{ translateY: intentBounce }] },
        ]}
      >
        <Text style={styles.intentIcon}>{isAttacking ? '🗡️' : '🛡️'}</Text>
        <Text style={[styles.intentValue, isAttacking ? styles.intentAttackColor : styles.intentDefendColor]}>
          {intentValue}
        </Text>
        {intentStatusIcons !== '' && (
          <Text style={styles.intentStatusIcons}>{intentStatusIcons}</Text>
        )}
      </Animated.View>

      {/* Enemy name + elite/boss labels */}
      {isBoss && enemy.specialMechanic?.type === 'block_reduction' && (
        <Text style={styles.bossLabel}>
          ⚠️ BOSS — Reduces your block by {Math.round(enemy.specialMechanic.fraction * 100)}%!
        </Text>
      )}
      {isElite && enemy.eliteMechanic?.type === 'enrage' && (
        <Text style={styles.eliteLabel}>
          ⚠️ ELITE — Gains +{enemy.eliteMechanic.strengthPerSkill} Str per non-attack!
        </Text>
      )}
      {isElite && enemy.eliteMechanic?.type === 'wound_on_defend' && (
        <Text style={styles.eliteLabel}>⚠️ ELITE — Adds Wounds when defending!</Text>
      )}
      {isElite && enemy.eliteMechanic?.type === 'ritual' && (
        <Text style={styles.eliteLabel}>⚠️ ELITE — Gains Strength each turn!</Text>
      )}
      <Text style={[styles.enemyName, isBoss && styles.bossName, isElite && styles.eliteName]} numberOfLines={1}>
        {isElite ? '💀 ' : ''}{enemy.name}
      </Text>

      {/* Sprite */}
      <View style={styles.spriteWrap}>
        {stage === 1 ? <SlimeSprite size={180} /> : blob}
      </View>

      {/* Block badge */}
      {enemyBlock > 0 && (
        <View style={styles.blockBadge}>
          <Text style={styles.blockIcon}>🛡️</Text>
          <Text style={styles.blockNum}>{enemyBlock}</Text>
        </View>
      )}

      {/* HP bar */}
      <View style={styles.hpSection}>
        <Text style={styles.hpLabel}>{enemyHP}/{enemy.maxHP}</Text>
        <HPBar current={enemyHP} max={enemy.maxHP} height={14} showText={false} />
      </View>

      {/* Status effects */}
      <StatusBadges statuses={enemyStatuses} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  bossContainer: {},

  intentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 1.5,
    shadowRadius: 6,
    shadowOpacity: 0.6,
    elevation: 4,
  },
  intentAttackBg: {
    backgroundColor: 'rgba(160,20,20,0.85)',
    borderColor: '#e74c3c',
    shadowColor: '#e74c3c',
  },
  intentDefendBg: {
    backgroundColor: 'rgba(15,60,130,0.85)',
    borderColor: '#4fc3f7',
    shadowColor: '#4fc3f7',
  },
  intentIcon: { fontSize: 15 },
  intentValue: { fontSize: 17, fontWeight: 'bold' },
  intentStatusIcons: { fontSize: 12 },
  intentAttackColor: { color: '#ff8080' },
  intentDefendColor: { color: COLORS.accentBlue },

  bossLabel: {
    color: COLORS.accentGold,
    fontSize: 10,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 2,
    textAlign: 'center',
  },
  eliteLabel: {
    color: '#ce93d8',
    fontSize: 10,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 2,
    textAlign: 'center',
  },
  eliteName: { color: '#ce93d8', fontSize: 14 },
  enemyName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bossName: { color: COLORS.bossGold, fontSize: 14 },

  spriteWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  blob: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  blobFace: { textAlign: 'center' },
  bossEmoji: { textAlign: 'center', marginTop: -4 },

  blockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.blockColor,
    gap: 2,
    marginBottom: 4,
  },
  blockIcon: { fontSize: 11 },
  blockNum: { color: COLORS.blockColor, fontSize: 12, fontWeight: 'bold' },

  hpSection: {
    width: '50%',
    alignItems: 'center',
    gap: 3,
  },
  hpLabel: {
    color: '#ff6b6b',
    fontSize: 26,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
