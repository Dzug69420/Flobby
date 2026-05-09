import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ALL_CARDS, REWARD_CARD_IDS } from '../data/cards';
import { COLORS } from '../constants/theme';
import CardComponent from '../components/CardComponent';
import CardTooltip from '../components/CardTooltip';
import { CardDefinition } from '../types';

const CATEGORIES = ['all', 'attack', 'defense', 'combo', 'power', 'status'] as const;
const RARITIES = ['all', 'common', 'uncommon', 'rare'] as const;

const CATEGORY_COLORS: Record<string, string> = {
  attack: '#e74c3c', defense: '#4fc3f7', combo: '#f5a623',
  power: '#66bb6a', status: '#9b59b6',
};

export default function CardGalleryScreen({ onClose }: { onClose: () => void }) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [tooltipDef, setTooltipDef] = useState<CardDefinition | null>(null);

  const allGalleryCards = useMemo(() => {
    return REWARD_CARD_IDS.map((id) => ALL_CARDS[id]).filter(Boolean);
  }, []);

  const filtered = useMemo(() => {
    return allGalleryCards.filter((def) => {
      if (filterCategory !== 'all' && def.category !== filterCategory) return false;
      if (filterRarity !== 'all' && def.rarity !== filterRarity) return false;
      if (search && !def.name.toLowerCase().includes(search.toLowerCase()) &&
          !def.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allGalleryCards, filterCategory, filterRarity, search]);

  const fakeInst = (id: string) => ({ instanceId: id, definitionId: id });

  return (
    <LinearGradient colors={['#0a0a1a', '#1a1a2e']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📖 Card Gallery ({filtered.length})</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search cards..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={search}
          onChangeText={setSearch}
        />

        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterBtn, filterCategory === cat && styles.filterBtnActive,
                  cat !== 'all' && filterCategory === cat && { backgroundColor: CATEGORY_COLORS[cat] + '33', borderColor: CATEGORY_COLORS[cat] }]}
                onPress={() => setFilterCategory(cat)}
              >
                <Text style={[styles.filterText,
                  filterCategory === cat && { color: cat === 'all' ? COLORS.accentGold : CATEGORY_COLORS[cat], fontWeight: 'bold' }]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Rarity filter */}
        <View style={styles.rarityRow}>
          {RARITIES.map((rar) => {
            const rarColors: Record<string, string> = { common: '#9e9e9e', uncommon: '#5c6bc0', rare: '#f9a825' };
            return (
              <TouchableOpacity
                key={rar}
                style={[styles.rarityBtn, filterRarity === rar && { borderColor: rarColors[rar] ?? COLORS.accentGold }]}
                onPress={() => setFilterRarity(rar)}
              >
                <Text style={[styles.rarityText, filterRarity === rar && { color: rarColors[rar] ?? COLORS.accentGold }]}>
                  {rar.charAt(0).toUpperCase() + rar.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Card grid */}
        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {filtered.map((def, i) => (
            <TouchableOpacity key={def.id} onPress={() => setTooltipDef(def)} activeOpacity={0.85}>
              <CardComponent
                card={fakeInst(def.id)}
                definition={def}
                onPlay={() => setTooltipDef(def)}
                onLongPress={setTooltipDef}
                disabled={false}
                affordable={true}
                index={i % 12}
                faceDown={false}
              />
            </TouchableOpacity>
          ))}
          {filtered.length === 0 && (
            <Text style={styles.empty}>No cards match your filters.</Text>
          )}
        </ScrollView>
      </SafeAreaView>
      <CardTooltip definition={tooltipDef} onClose={() => setTooltipDef(null)} />
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

  searchInput: {
    margin: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    color: '#fff',
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  filterScroll: { maxHeight: 40 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 10, gap: 6, alignItems: 'center' },
  filterBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  filterBtnActive: { borderColor: COLORS.accentGold },
  filterText: { color: COLORS.textSecondary, fontSize: 12 },

  rarityRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    gap: 6,
    paddingVertical: 6,
  },
  rarityBtn: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  rarityText: { color: COLORS.textSecondary, fontSize: 11 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 10,
    justifyContent: 'center',
  },
  empty: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 40, fontSize: 14 },
});
