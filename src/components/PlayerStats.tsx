import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import HPBar from './HPBar';

interface Props {
  hp: number;
  maxHP: number;
  block: number;
  energy: number;
  maxEnergy: number;
}

export default function PlayerStats({ hp, maxHP, block, energy, maxEnergy }: Props) {
  const energyPips = Array.from({ length: maxEnergy }, (_, i) => i < energy);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🧑 YOU</Text>

      {/* Player avatar blob */}
      <View style={styles.avatar}>
        <Text style={styles.avatarEmoji}>🛡️</Text>
      </View>

      <View style={styles.statBlock}>
        <Text style={styles.statLabel}>HP</Text>
        <HPBar current={hp} max={maxHP} height={9} showText={true} />
      </View>

      <View style={styles.row}>
        <Text style={styles.blockLabel}>🛡️ Block</Text>
        <Text style={styles.blockValue}>{block}</Text>
      </View>

      <View style={styles.energyRow}>
        {energyPips.map((filled, i) => (
          <Text key={i} style={filled ? styles.pipFull : styles.pipEmpty}>
            {filled ? '⚡' : '○'}
          </Text>
        ))}
        <Text style={styles.energyLabel}>{energy}/{maxEnergy}</Text>
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
  label: {
    color: COLORS.accentBlue,
    fontSize: FONTS.enemyName,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  avatar: {
    width: 100,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(79,195,247,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(79,195,247,0.25)',
    marginBottom: 6,
  },
  avatarEmoji: { fontSize: 50 },
  statBlock: { width: '100%', marginBottom: 6 },
  statLabel: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 2 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  blockLabel: { color: COLORS.textSecondary, fontSize: 13 },
  blockValue: { color: COLORS.blockColor, fontSize: 14, fontWeight: 'bold' },
  energyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    width: '100%',
    flexWrap: 'wrap',
  },
  pipFull: { color: COLORS.energyColor, fontSize: 17 },
  pipEmpty: { color: '#555', fontSize: 13 },
  energyLabel: { color: COLORS.textSecondary, fontSize: 12, marginLeft: 4 },
});
