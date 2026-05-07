import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import CardComponent from '../components/CardComponent';

export default function RewardScreen() {
  const { rewardChoices, selectRewardCard, currentStage } = useGameStore();
  const [chosen, setChosen] = useState<string | null>(null);

  const handlePick = (id: string) => {
    if (chosen) return;
    setChosen(id);
    setTimeout(() => selectRewardCard(id), 300);
  };

  const handleSkip = () => {
    selectRewardCard(null);
  };

  // Build fake CardInstance for display
  const fakeInst = (id: string) => ({ instanceId: id, definitionId: id });

  return (
    <LinearGradient colors={['#0a0a1a', '#1a1a2e']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.complete}>✨ Stage {currentStage - 1} Complete!</Text>
        <Text style={styles.prompt}>Choose a card to add to your deck:</Text>

        <View style={styles.cardsRow}>
          {rewardChoices.map((def, i) => (
            <TouchableOpacity
              key={def.id}
              onPress={() => handlePick(def.id)}
              activeOpacity={0.8}
              style={styles.cardWrapper}
            >
              <CardComponent
                card={fakeInst(def.id)}
                definition={def}
                onPlay={handlePick}
                disabled={chosen !== null}
                affordable={true}
                index={i}
                faceDown={false}
              />
              {chosen === def.id && (
                <Text style={styles.chosenBadge}>✅ ADDED!</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton} disabled={chosen !== null}>
          <Text style={styles.skipText}>Skip — Don't add a card</Text>
        </TouchableOpacity>

        <Text style={styles.tip}>Cards carry over between stages. Choose wisely!</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.md },
  complete: {
    fontSize: FONTS.screenTitle - 4,
    fontWeight: 'bold',
    color: COLORS.accentGold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  prompt: {
    fontSize: FONTS.button - 2,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  cardWrapper: { alignItems: 'center' },
  chosenBadge: {
    color: COLORS.hpGreen,
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 6,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  skipText: { color: COLORS.textSecondary, fontSize: 14 },
  tip: { color: COLORS.textSecondary, fontSize: 12, textAlign: 'center', opacity: 0.7 },
});
