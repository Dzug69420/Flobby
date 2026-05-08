import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

interface Section {
  title: string;
  emoji: string;
  content: Array<{ label: string; desc: string }>;
}

const SECTIONS: Section[] = [
  {
    title: 'Core Combat',
    emoji: '⚔️',
    content: [
      { label: 'Energy', desc: 'You start each turn with 3 Energy. Cards cost energy to play. Unused energy is lost at turn end.' },
      { label: 'Block', desc: 'Block absorbs incoming damage. Standard block disappears at turn end (unless Barricade is active).' },
      { label: 'Attack', desc: 'Attack cards deal damage to the enemy. Damage first destroys enemy Block, then their HP.' },
      { label: 'End Turn', desc: 'When done playing cards, press End Turn. The enemy acts, then you draw 6 new cards.' },
    ],
  },
  {
    title: 'Status Effects',
    emoji: '💢',
    content: [
      { label: 'Vulnerable 💢', desc: 'The affected entity takes 50% MORE damage from attacks. Decrements each turn.' },
      { label: 'Weak 🌀', desc: 'The affected entity deals 25% LESS damage with attacks. Decrements each turn.' },
      { label: 'Poison ☠️', desc: 'At end of enemy turn, deal damage equal to Poison stacks, then remove 1 stack.' },
      { label: 'Strength 💪', desc: 'Permanently increases all attack damage by the stack count.' },
      { label: 'Dexterity 🦋', desc: 'Permanently increases all block gained by the stack count.' },
      { label: 'Frail 💨', desc: 'Reduces block gained by 25%. Decrements each turn.' },
      { label: 'Metallicize ⚙️', desc: 'Gain block equal to stacks at the start of each turn (permanently).' },
    ],
  },
  {
    title: 'Card Keywords',
    emoji: '🃏',
    content: [
      { label: 'Exhaust ✖', desc: 'Card goes to the Exhaust pile (permanent removal) instead of discard after playing.' },
      { label: 'Innate ★', desc: 'This card always appears in your opening hand at combat start.' },
      { label: 'Retain ↩', desc: 'At turn end, this card stays in your hand instead of going to discard.' },
      { label: 'X Cost', desc: 'Costs ALL remaining energy. Effect scales with energy spent.' },
    ],
  },
  {
    title: 'Map & Rooms',
    emoji: '🗺️',
    content: [
      { label: '⚔️ Monster', desc: 'Fight a regular enemy. Defeat them for card rewards and gold.' },
      { label: '💀 Elite', desc: 'Harder enemy with special mechanics. Also drops a relic on defeat.' },
      { label: '🔥 Rest Site', desc: 'Choose: Heal 30% HP, OR upgrade a card permanently.' },
      { label: '💰 Shop', desc: 'Spend gold on cards, potions, and card removal.' },
      { label: '📦 Treasure', desc: 'Free card rewards and a random potion. No combat.' },
      { label: '❓ Event', desc: 'Random event with choice-based outcomes.' },
      { label: '👑 Boss', desc: 'The final boss of the act. Defeat them to win!' },
    ],
  },
  {
    title: 'Relics & Potions',
    emoji: '✨',
    content: [
      { label: 'Relics', desc: 'Permanent passive items collected during your run. Tap them in combat to see their effect.' },
      { label: 'Potions 🍶', desc: 'Single-use consumables. Hold 3 at once. Tap to use in combat.' },
      { label: 'Burning Blood', desc: 'Starter relic — heal 6 HP after every combat victory.' },
    ],
  },
  {
    title: 'Deck Building',
    emoji: '🏗️',
    content: [
      { label: 'Card Rewards', desc: 'After defeating enemies, choose 1 of 3 cards to add to your deck, or rest for HP.' },
      { label: 'Upgrades', desc: 'Upgrade cards at Rest Sites (Smith option). Upgraded cards have + in their name and stronger effects.' },
      { label: 'Card Removal', desc: 'Remove cards at the Shop for gold. Slimmer decks cycle faster.' },
      { label: 'Rarity', desc: 'Common (grey), Uncommon (blue), Rare (gold). Higher rarity = more powerful effects.' },
    ],
  },
];

export default function HelpScreen({ onClose }: { onClose: () => void }) {
  const [activeSection, setActiveSection] = useState(0);

  return (
    <LinearGradient colors={['#0a0a1a', '#1a1a2e']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>📖 How to Play</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕ Close</Text>
          </TouchableOpacity>
        </View>

        {/* Section tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          <View style={styles.tabRow}>
            {SECTIONS.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.tab, activeSection === i && styles.tabActive]}
                onPress={() => setActiveSection(i)}
              >
                <Text style={styles.tabEmoji}>{s.emoji}</Text>
                <Text style={[styles.tabText, activeSection === i && styles.tabTextActive]}>
                  {s.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>
            {SECTIONS[activeSection].emoji} {SECTIONS[activeSection].title}
          </Text>
          {SECTIONS[activeSection].content.map((item, i) => (
            <View key={i} style={styles.item}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemDesc}>{item.desc}</Text>
            </View>
          ))}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: { color: COLORS.accentGold, fontSize: 20, fontWeight: 'bold' },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  closeBtnText: { color: COLORS.textSecondary, fontSize: 13 },

  tabScroll: { maxHeight: 60, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 8, alignItems: 'center' },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accentGold },
  tabEmoji: { fontSize: 14 },
  tabText: { color: COLORS.textSecondary, fontSize: 12 },
  tabTextActive: { color: COLORS.accentGold, fontWeight: 'bold' },

  content: { flex: 1, padding: 16 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  item: {
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accentGold,
  },
  itemLabel: { color: COLORS.accentGold, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  itemDesc: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19 },
});
