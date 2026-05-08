import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { ALL_CHARACTERS, CHARACTER_IDS } from '../data/characters';
import { ALL_RELICS } from '../data/relics';
import { COLORS } from '../constants/theme';

export default function CharacterSelectScreen() {
  const { selectedCharacter, selectCharacter, startGame, ascensionLevel } = useGameStore();
  const [hovered, setHovered] = useState<string | null>(null);

  const previewId = hovered ?? selectedCharacter;
  const preview = ALL_CHARACTERS[previewId];
  const startingRelic = ALL_RELICS[preview.startingRelic];

  return (
    <LinearGradient colors={['#0a0a1a', '#1a0a2e', '#0d1a0a']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Choose Your Character</Text>
        {ascensionLevel > 0 && (
          <Text style={styles.ascBadge}>Ascension {ascensionLevel}</Text>
        )}

        {/* Character cards row */}
        <View style={styles.charRow}>
          {CHARACTER_IDS.map((id) => {
            const char = ALL_CHARACTERS[id];
            const isSelected = selectedCharacter === id;
            return (
              <TouchableOpacity
                key={id}
                style={[
                  styles.charCard,
                  { borderColor: char.color },
                  isSelected && { backgroundColor: char.color + '22' },
                ]}
                onPress={() => selectCharacter(id)}
                activeOpacity={0.8}
              >
                <Text style={styles.charEmoji}>{char.emoji}</Text>
                <Text style={[styles.charName, { color: char.color }]}>{char.name}</Text>
                <Text style={styles.charHP}>♥ {char.maxHP}</Text>
                {isSelected && <Text style={styles.selectedMark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Preview panel */}
        <View style={[styles.preview, { borderColor: preview.color }]}>
          <View style={styles.previewHeader}>
            <Text style={[styles.previewName, { color: preview.color }]}>
              {preview.emoji} {preview.name}
            </Text>
            <Text style={styles.previewHP}>♥ {preview.maxHP} HP</Text>
          </View>
          <Text style={styles.previewDesc}>{preview.description}</Text>
          <Text style={[styles.specialtyLabel, { color: preview.color }]}>
            Specialty: {preview.specialty}
          </Text>

          <View style={styles.previewDivider} />

          <Text style={styles.previewSectionLabel}>Starting Relic:</Text>
          {startingRelic && (
            <View style={styles.relicRow}>
              <Text style={styles.relicEmoji}>{startingRelic.emoji}</Text>
              <View>
                <Text style={styles.relicName}>{startingRelic.name}</Text>
                <Text style={styles.relicDesc}>{startingRelic.description}</Text>
              </View>
            </View>
          )}

          <Text style={styles.previewSectionLabel}>Starting Deck ({preview.startingDeck.reduce((s, e) => s + e.count, 0)} cards):</Text>
          <View style={styles.deckList}>
            {preview.startingDeck.map((entry) => (
              <Text key={entry.cardId} style={styles.deckEntry}>
                ×{entry.count} {entry.cardId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Text>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: preview.color }]}
          onPress={startGame}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>Play as {preview.name} ⚔️</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  title: { color: COLORS.accentGold, fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  ascBadge: { color: '#ce93d8', fontSize: 12, textAlign: 'center', marginBottom: 12 },

  charRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  charCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  charEmoji: { fontSize: 32 },
  charName: { fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  charHP: { color: '#ff8f8f', fontSize: 11 },
  selectedMark: { color: '#66bb6a', fontSize: 16, fontWeight: 'bold' },

  preview: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    gap: 8,
    marginBottom: 14,
  },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewName: { fontSize: 20, fontWeight: 'bold' },
  previewHP: { color: '#ff8f8f', fontSize: 14, fontWeight: 'bold' },
  previewDesc: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  specialtyLabel: { fontSize: 12, fontWeight: '600' },
  previewDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  previewSectionLabel: { color: COLORS.accentGold, fontSize: 12, fontWeight: 'bold' },

  relicRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  relicEmoji: { fontSize: 24 },
  relicName: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  relicDesc: { color: COLORS.textSecondary, fontSize: 11 },

  deckList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  deckEntry: {
    color: '#fff',
    fontSize: 11,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  startBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
});
