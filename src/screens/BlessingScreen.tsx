import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { COLORS } from '../constants/theme';

interface Blessing {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

const ALL_BLESSINGS: Blessing[] = [
  { id: 'bonus_gold', title: 'Treasure', description: 'Start with 100 extra gold.', emoji: '🪙' },
  { id: 'relic', title: 'Common Relic', description: 'Gain a random common relic.', emoji: '✨' },
  { id: 'extra_hp', title: 'Vitality', description: 'Increase max HP by 10.', emoji: '❤️' },
  { id: 'remove_card', title: 'Purify', description: 'Remove a Bonk from your starter deck.', emoji: '🗑️' },
  { id: 'upgrade_two', title: 'Forge Ahead', description: 'Upgrade 2 cards in your starting deck.', emoji: '⚒️' },
  { id: 'two_potions', title: 'Alchemy', description: 'Start with 2 random potions.', emoji: '🧪' },
  { id: 'max_energy', title: 'Power Cell', description: 'Start with 4 max energy this run.', emoji: '⚡' },
  { id: 'class_relic', title: "Fighter's Crest", description: 'Gain your character class\'s signature relic.', emoji: '🏆' },
];

function pickThree(): Blessing[] {
  const shuffled = [...ALL_BLESSINGS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export default function BlessingScreen() {
  const { selectBlessing, runsCompleted } = useGameStore();
  const [chosen, setChosen] = useState<string | null>(null);
  const blessings = useMemo(() => pickThree(), []);

  const handle = (id: string) => {
    if (chosen) return;
    setChosen(id);
    setTimeout(() => selectBlessing(id), 500);
  };

  return (
    <LinearGradient colors={['#0a0a1a', '#1a0a2e', '#0a1a0a']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>🌟 Starting Blessing</Text>
        <Text style={styles.subtitle}>
          {runsCompleted === 0
            ? 'Your first run! Choose a starting advantage.'
            : `Run #${runsCompleted + 1}. Choose your blessing.`}
        </Text>

        <View style={styles.cards}>
          {blessings.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[
                styles.card,
                chosen === b.id && styles.cardChosen,
                chosen !== null && chosen !== b.id && styles.cardDimmed,
              ]}
              onPress={() => handle(b.id)}
              disabled={chosen !== null}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>{b.emoji}</Text>
              <Text style={styles.cardTitle}>{b.title}</Text>
              <View style={styles.divider} />
              <Text style={styles.cardDesc}>{b.description}</Text>
              {chosen === b.id && <Text style={styles.chosenMark}>✅ CHOSEN</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.hint}>You can only choose once per run.</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  title: { color: COLORS.accentGold, fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 32, textAlign: 'center' },

  cards: { width: '100%', gap: 14 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 18,
    alignItems: 'center',
    gap: 6,
  },
  cardChosen: {
    borderColor: COLORS.accentGold,
    backgroundColor: 'rgba(249,168,37,0.1)',
  },
  cardDimmed: { opacity: 0.35 },
  emoji: { fontSize: 36 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  divider: { width: '50%', height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  cardDesc: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
  chosenMark: { color: COLORS.accentGold, fontSize: 14, fontWeight: 'bold', marginTop: 4 },

  hint: { color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 24 },
});
