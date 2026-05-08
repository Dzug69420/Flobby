import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { ALL_RELICS } from '../data/relics';
import { COLORS } from '../constants/theme';

interface Props {
  relics: string[];
}

const RARITY_COLOR: Record<string, string> = {
  starter: '#9e9e9e',
  common: '#9e9e9e',
  uncommon: '#5c6bc0',
  rare: '#f9a825',
  boss: '#e74c3c',
};

export default function RelicDisplay({ relics }: Props) {
  const [tooltip, setTooltip] = useState<string | null>(null);

  if (relics.length === 0) return null;

  const tooltipRelic = tooltip ? ALL_RELICS[tooltip] : null;

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.row}
      >
        {relics.map((id) => {
          const def = ALL_RELICS[id];
          if (!def) return null;
          const rarityColor = RARITY_COLOR[def.rarity] ?? '#9e9e9e';
          return (
            <Pressable
              key={id}
              onPress={() => setTooltip(tooltip === id ? null : id)}
              style={[styles.relicBadge, { borderColor: rarityColor }]}
            >
              <Text style={styles.relicEmoji}>{def.emoji}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Tooltip modal */}
      {tooltipRelic && (
        <Pressable style={styles.tooltipBackdrop} onPress={() => setTooltip(null)}>
          <View style={styles.tooltipBox}>
            <Text style={styles.tooltipEmoji}>{tooltipRelic.emoji}</Text>
            <Text style={styles.tooltipName}>{tooltipRelic.name}</Text>
            <Text style={[styles.tooltipRarity, { color: RARITY_COLOR[tooltipRelic.rarity] }]}>
              {tooltipRelic.rarity.toUpperCase()}
            </Text>
            <Text style={styles.tooltipDesc}>{tooltipRelic.description}</Text>
          </View>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: 40 },
  row: { flexDirection: 'row', gap: 6, paddingHorizontal: 4, alignItems: 'center' },
  relicBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  relicEmoji: { fontSize: 16 },

  tooltipBackdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  tooltipBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.accentGold,
    padding: 18,
    maxWidth: 260,
    alignItems: 'center',
    gap: 6,
  },
  tooltipEmoji: { fontSize: 36 },
  tooltipName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  tooltipRarity: { fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  tooltipDesc: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
});
