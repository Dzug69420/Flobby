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
      <View style={styles.row}>
        <Text style={styles.label}>❤️ HP</Text>
        <View style={styles.barWrapper}>
          <HPBar current={hp} max={maxHP} height={10} showText={true} />
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.blockText}>🛡️ Block: <Text style={styles.blockValue}>{block}</Text></Text>
        <View style={styles.energyRow}>
          {energyPips.map((filled, i) => (
            <Text key={i} style={[styles.pip, filled ? styles.pipFull : styles.pipEmpty]}>
              {filled ? '⚡' : '○'}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(22,33,62,0.85)',
    borderRadius: 10,
    padding: SPACING.sm,
    marginHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceRaised,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  label: { color: COLORS.textSecondary, fontSize: FONTS.statLabel, marginRight: 8, width: 40 },
  barWrapper: { flex: 1 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  blockText: { color: COLORS.textSecondary, fontSize: FONTS.statLabel },
  blockValue: { color: COLORS.blockColor, fontWeight: 'bold' },
  energyRow: { flexDirection: 'row', gap: 4 },
  pip: { fontSize: 18 },
  pipFull: { color: COLORS.energyColor },
  pipEmpty: { color: '#555', fontSize: 14 },
});
