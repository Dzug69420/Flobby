import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { COLORS } from '../constants/theme';
import CardComponent from '../components/CardComponent';

export default function ScryScreen() {
  const { scryCards, masterCardPool, resolveScry } = useGameStore();
  const [toDiscard, setToDiscard] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

  const toggle = (instanceId: string) => {
    setToDiscard((prev) => {
      const next = new Set(prev);
      if (next.has(instanceId)) next.delete(instanceId);
      else next.add(instanceId);
      return next;
    });
  };

  const handleConfirm = () => {
    if (done) return;
    setDone(true);
    const keepIds = scryCards
      .filter((c) => !toDiscard.has(c.instanceId))
      .map((c) => c.instanceId);
    setTimeout(() => resolveScry(keepIds), 300);
  };

  return (
    <LinearGradient colors={['#0a0a1a', '#1a1a2e']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>👁️ Scry</Text>
        <Text style={styles.subtitle}>
          Choose cards to discard from the top of your deck. The rest stay on top.
        </Text>

        <View style={styles.cardsRow}>
          {scryCards.map((c, i) => {
            const def = masterCardPool[c.definitionId];
            if (!def) return null;
            const isDiscarding = toDiscard.has(c.instanceId);
            return (
              <View key={c.instanceId} style={styles.cardWrap}>
                <View style={[styles.cardContainer, isDiscarding && styles.cardDiscarding]}>
                  <CardComponent
                    card={c}
                    definition={def}
                    onPlay={() => toggle(c.instanceId)}
                    disabled={false}
                    affordable={true}
                    index={i}
                    faceDown={false}
                  />
                </View>
                <View style={styles.choiceLabel}>
                  <Text style={[styles.choiceText, { color: isDiscarding ? '#e74c3c' : '#66bb6a' }]}>
                    {isDiscarding ? '🗑 Discard' : '✓ Keep'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.hint}>
          {toDiscard.size === 0 ? 'Tap cards to discard them' : `${toDiscard.size} card${toDiscard.size > 1 ? 's' : ''} marked for discard`}
        </Text>

        <TouchableOpacity
          style={[styles.confirmBtn, done && styles.confirmBtnDone]}
          onPress={handleConfirm}
          disabled={done}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmBtnText}>
            {done ? '✓ Done' : `Confirm (Keep ${scryCards.length - toDiscard.size}, Discard ${toDiscard.size})`}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, gap: 12 },
  title: { color: '#ce93d8', fontSize: 26, fontWeight: 'bold' },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 300,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  cardWrap: { alignItems: 'center', gap: 6 },
  cardContainer: { opacity: 1 },
  cardDiscarding: { opacity: 0.45 },
  choiceLabel: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  choiceText: { fontSize: 13, fontWeight: 'bold' },
  hint: { color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center' },
  confirmBtn: {
    backgroundColor: '#5c6bc0',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#7986cb',
  },
  confirmBtnDone: { backgroundColor: '#388e3c', borderColor: '#66bb6a' },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
