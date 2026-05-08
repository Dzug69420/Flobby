import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import CardComponent from '../components/CardComponent';

export default function RewardScreen() {
  const { rewardChoices, selectRewardCard, currentStage, playerHP, playerMaxHP } = useGameStore();
  const [chosen, setChosen] = useState<string | null>(null);

  const handlePick = (id: string) => {
    if (chosen) return;
    setChosen(id);
    setTimeout(() => selectRewardCard(id), 300);
  };

  const handleSkip = () => {
    if (chosen) return;
    selectRewardCard(null);
  };

  // Build fake CardInstance for display
  const fakeInst = (id: string) => ({ instanceId: id, definitionId: id });

  return (
    <LinearGradient colors={['#0a0a1a', '#1a1a2e']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.complete}>✨ Stage {currentStage} Complete!</Text>
        <Text style={styles.healed}>+10 HP restored</Text>
        <View style={styles.hpRow}>
          <Text style={styles.hpText}>♥ {playerHP} / {playerMaxHP}</Text>
        </View>
        <Text style={styles.prompt}>Choose a card — or rest to heal more:</Text>

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

        <TouchableOpacity onPress={handleSkip} style={styles.restButton} disabled={chosen !== null}>
          <Text style={styles.restTitle}>🛌 REST</Text>
          <Text style={styles.restSub}>Skip card — heal +25 HP instead</Text>
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
  healed: {
    color: COLORS.hpGreen,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  hpRow: {
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  hpText: {
    color: '#ff8080',
    fontSize: 18,
    fontWeight: 'bold',
  },
  restButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.hpGreen,
    backgroundColor: 'rgba(46,204,113,0.08)',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  restTitle: { color: COLORS.hpGreen, fontSize: 16, fontWeight: 'bold' },
  restSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  tip: { color: COLORS.textSecondary, fontSize: 12, textAlign: 'center', opacity: 0.7 },
});
