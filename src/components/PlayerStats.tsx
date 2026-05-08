import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/theme';
import HPBar from './HPBar';
import StatusBadges from './StatusBadges';
import { StatusEffect } from '../types';

interface Props {
  hp: number;
  maxHP: number;
  block: number;
  energy: number;
  maxEnergy: number;
  playerStatuses: StatusEffect[];
  characterEmoji?: string;
}

export default function PlayerStats({ hp, maxHP, block, playerStatuses, characterEmoji }: Props) {
  const prevHp = useRef(hp);
  const prevBlock = useRef(block);
  const [damageText, setDamageText] = useState<string | null>(null);
  const [healText, setHealText] = useState<string | null>(null);
  const [blockDeltaText, setBlockDeltaText] = useState<string | null>(null);
  const damageAnim = useRef(new Animated.Value(0)).current;
  const healAnim = useRef(new Animated.Value(0)).current;
  const blockAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delta = prevHp.current - hp;
    if (delta > 0) {
      setDamageText(`-${delta}`);
      damageAnim.setValue(0);
      Animated.sequence([
        Animated.timing(damageAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(damageAnim, { toValue: 2, duration: 500, useNativeDriver: true }),
      ]).start(() => setDamageText(null));
    } else if (delta < 0) {
      setHealText(`+${Math.abs(delta)}`);
      healAnim.setValue(0);
      Animated.sequence([
        Animated.timing(healAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(healAnim, { toValue: 2, duration: 500, useNativeDriver: true }),
      ]).start(() => setHealText(null));
    }
    prevHp.current = hp;
  }, [hp, damageAnim, healAnim]);

  useEffect(() => {
    const delta = block - prevBlock.current;
    if (delta !== 0) {
      setBlockDeltaText(delta > 0 ? `+${delta}` : `${delta}`);
      blockAnim.setValue(0);
      Animated.sequence([
        Animated.timing(blockAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(blockAnim, { toValue: 2, duration: 300, useNativeDriver: true }),
      ]).start(() => setBlockDeltaText(null));
    }
    prevBlock.current = block;
  }, [block, blockAnim]);

  const damageStyle = {
    opacity: damageAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 1, 0] }),
    transform: [
      { translateY: damageAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [10, -6, -24] }) },
      { scale: damageAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [0.8, 1.1, 1.2] }) },
    ],
  };

  const healStyle = {
    opacity: healAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 1, 0] }),
    transform: [
      { translateY: healAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [0, -10, -28] }) },
      { scale: healAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [0.9, 1.2, 1.0] }) },
    ],
  };

  const blockStyle = {
    opacity: blockAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 1, 0] }),
    transform: [
      { translateY: blockAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [10, -6, -22] }) },
      { scale: blockAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [0.8, 1.1, 1.1] }) },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Character sprite */}
      <View style={styles.spriteWrap}>
        <Text style={styles.sprite}>{characterEmoji ?? '🧙'}</Text>
        {block > 0 && (
          <View style={styles.blockBadge}>
            <Text style={styles.blockIcon}>🛡️</Text>
            <Text style={styles.blockNum}>{block}</Text>
          </View>
        )}
      </View>

      {/* HP bar + block */}
      <View style={styles.hpRow}>
        <View style={styles.hpSection}>
          <Text style={styles.hpLabel}>{hp}/{maxHP}</Text>
          <HPBar current={hp} max={maxHP} height={14} showText={false} />
          {damageText ? (
            <Animated.Text style={[styles.damageText, damageStyle]}>{damageText}</Animated.Text>
          ) : null}
          {healText ? (
            <Animated.Text style={[styles.healText, healStyle]}>{healText}</Animated.Text>
          ) : null}
        </View>
        {block > 0 && (
          <View style={styles.blockCounter}>
            <Text style={styles.blockIcon}>🛡️</Text>
            <Text style={styles.blockNum}>{block}</Text>
            {blockDeltaText ? (
              <Animated.Text style={[styles.blockDeltaText, blockStyle]}>{blockDeltaText}</Animated.Text>
            ) : null}
          </View>
        )}
      </View>
    {/* Player status effects */}
    <StatusBadges statuses={playerStatuses} />
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
  spriteWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  sprite: {
    fontSize: 72,
    textShadowColor: 'rgba(255,255,255,0.25)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  hpRow: {
    position: 'relative',
    alignItems: 'center',
    width: '100%',
  },
  hpSection: {
    width: '50%',
    alignItems: 'center',
    gap: 3,
    position: 'relative',
  },
  blockCounter: {
    position: 'absolute',
    right: -80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,20,60,0.85)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: COLORS.blockColor,
  },
  blockIcon: { fontSize: 18 },
  blockNum: { color: COLORS.blockColor, fontSize: 22, fontWeight: 'bold' },
  blockDeltaText: {
    position: 'absolute',
    left: '100%',
    marginLeft: 6,
    color: '#85d7ff',
    fontSize: 18,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  blockBadge: {
    position: 'absolute',
    bottom: -4,
    right: -10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,20,60,0.9)',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: COLORS.blockColor,
    gap: 2,
  },
  damageText: {
    position: 'absolute',
    top: -22,
    color: '#ff8f8f',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  healText: {
    position: 'absolute',
    top: -22,
    color: '#4caf50',
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
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
