import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ALL_RELICS } from '../data/relics';
import { COLORS } from '../constants/theme';

const RARITY_COLORS: Record<string, string> = {
  starter: '#9e9e9e', common: '#9e9e9e', uncommon: '#5c6bc0',
  rare: '#f9a825', boss: '#e74c3c', shop: '#4caf50',
};

export default function RelicGalleryScreen({ onClose }: { onClose: () => void }) {
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const rarities = ['all', 'starter', 'common', 'uncommon', 'rare', 'boss'] as const;

  const allRelics = Object.values(ALL_RELICS);
  const filtered = filterRarity === 'all'
    ? allRelics
    : allRelics.filter((r) => r.rarity === filterRarity);

  return (
    <LinearGradient colors={['#0a0a1a', '#1a1a2e']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>✨ Relic Gallery ({filtered.length})</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Rarity filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {rarities.map((rar) => {
              const color = RARITY_COLORS[rar] ?? COLORS.accentGold;
              return (
                <TouchableOpacity
                  key={rar}
                  style={[styles.filterBtn, filterRarity === rar && { borderColor: color }]}
                  onPress={() => setFilterRarity(rar)}
                >
                  <Text style={[styles.filterText, filterRarity === rar && { color, fontWeight: 'bold' }]}>
                    {rar.charAt(0).toUpperCase() + rar.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {filtered.map((relic) => {
            const color = RARITY_COLORS[relic.rarity];
            return (
              <View key={relic.id} style={[styles.relicCard, { borderColor: color }]}>
                <Text style={styles.relicEmoji}>{relic.emoji}</Text>
                <View style={styles.relicInfo}>
                  <Text style={[styles.relicName, { color }]}>{relic.name}</Text>
                  <Text style={[styles.relicRarity, { color: color + 'aa' }]}>
                    {relic.rarity.toUpperCase()} · {relic.trigger.replace(/_/g, ' ')}
                  </Text>
                  <Text style={styles.relicDesc}>{relic.description}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: { color: COLORS.accentGold, fontSize: 18, fontWeight: 'bold' },
  closeBtn: { padding: 8 },
  closeBtnText: { color: COLORS.textSecondary, fontSize: 18 },
  filterScroll: { maxHeight: 42, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 10, gap: 6, alignItems: 'center' },
  filterBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  filterText: { color: COLORS.textSecondary, fontSize: 12 },
  grid: { padding: 12, gap: 10 },
  relicCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'flex-start',
  },
  relicEmoji: { fontSize: 32, marginTop: 2 },
  relicInfo: { flex: 1, gap: 2 },
  relicName: { fontSize: 15, fontWeight: 'bold' },
  relicRarity: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  relicDesc: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
});
