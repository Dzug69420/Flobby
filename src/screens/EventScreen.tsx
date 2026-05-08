import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { COLORS } from '../constants/theme';

export default function EventScreen() {
  const { currentEvent, resolveEvent, playerHP, playerMaxHP, gold } = useGameStore();
  const [chosen, setChosen] = useState<number | null>(null);

  if (!currentEvent) return null;

  const handleChoice = (i: number) => {
    if (chosen !== null) return;
    const choice = currentEvent.choices[i];
    if (choice.goldCost && gold < choice.goldCost) return;
    setChosen(i);
    setTimeout(() => resolveEvent(i), 600);
  };

  return (
    <LinearGradient colors={['#0a0a1a', '#1a1500', '#0d0a1a']} style={styles.root}>
      <SafeAreaView style={styles.safe}>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Text style={styles.stat}>♥ {playerHP}/{playerMaxHP}</Text>
          <Text style={styles.stat}>🪙 {gold}</Text>
        </View>

        {/* Event card */}
        <View style={styles.eventCard}>
          <Text style={styles.eventEmoji}>{currentEvent.emoji}</Text>
          <Text style={styles.eventTitle}>{currentEvent.title}</Text>
          <View style={styles.divider} />
          <Text style={styles.eventDesc}>{currentEvent.description}</Text>
        </View>

        {/* Choices */}
        <View style={styles.choices}>
          {currentEvent.choices.map((choice, i) => {
            const cantAfford = choice.goldCost && gold < choice.goldCost;
            const isChosen = chosen === i;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.choiceBtn,
                  cantAfford ? styles.choiceDisabled : null,
                  isChosen ? styles.choiceChosen : null,
                ]}
                onPress={() => handleChoice(i)}
                disabled={chosen !== null || !!cantAfford}
                activeOpacity={0.75}
              >
                <View style={styles.choiceHeader}>
                  <Text style={styles.choiceEmoji}>{choice.emoji}</Text>
                  <Text style={[styles.choiceLabel, cantAfford ? styles.choiceLabelDisabled : null]}>
                    {choice.label}
                  </Text>
                  {choice.goldCost && (
                    <Text style={[styles.choiceCost, cantAfford ? styles.choiceCostRed : null]}>
                      🪙 {choice.goldCost}
                    </Text>
                  )}
                  {choice.hpCost && (
                    <Text style={styles.choiceHPCost}>❤️ -{choice.hpCost}</Text>
                  )}
                </View>
                <Text style={styles.choiceDesc}>{choice.description}</Text>
                {isChosen && <Text style={styles.chosenMark}>✅</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },

  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  stat: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  eventCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    gap: 8,
  },
  eventEmoji: { fontSize: 52 },
  eventTitle: { color: COLORS.accentGold, fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  divider: { width: '60%', height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },
  eventDesc: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  choices: { width: '100%', gap: 12 },
  choiceBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 14,
    gap: 4,
  },
  choiceDisabled: { borderColor: '#333', opacity: 0.45 },
  choiceChosen: { borderColor: COLORS.accentGold, backgroundColor: 'rgba(249,168,37,0.1)' },
  choiceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  choiceEmoji: { fontSize: 20 },
  choiceLabel: { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1 },
  choiceLabelDisabled: { color: '#666' },
  choiceCost: { color: COLORS.accentGold, fontSize: 13, fontWeight: 'bold' },
  choiceCostRed: { color: '#e74c3c' },
  choiceHPCost: { color: '#ff8f8f', fontSize: 13, fontWeight: 'bold' },
  choiceDesc: { color: COLORS.textSecondary, fontSize: 12, marginLeft: 28 },
  chosenMark: { fontSize: 18, textAlign: 'right' },
});
