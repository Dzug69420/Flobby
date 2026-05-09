import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import CardComponent from '../components/CardComponent';
import CardTooltip from '../components/CardTooltip';
import { CardDefinition } from '../types';

export default function RewardScreen() {
  const { rewardChoices, selectRewardCard, currentStage, playerHP, playerMaxHP, gold, lastGoldReward } = useGameStore();
  const [chosen, setChosen] = useState<string | null>(null);
  const [tooltipDef, setTooltipDef] = useState<CardDefinition | null>(null);

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
        <View style={styles.statsRow}>
          <Text style={styles.healed}>+10 HP</Text>
          {lastGoldReward > 0 && (
            <Text style={styles.goldEarned}>+{lastGoldReward} 🪙</Text>
          )}
        </View>
        <View style={styles.hpRow}>
          <Text style={styles.hpText}>♥ {playerHP} / {playerMaxHP}</Text>
          <Text style={styles.goldTotal}> 🪙 {gold}</Text>
        </View>
        <Text style={styles.prompt}>Choose a card — or rest to heal more:</Text>

        <View style={styles.cardsRow}>
          {rewardChoices.map((def, i) => {
            const rarityColor = def.rarity === 'rare' ? '#f9a825' : def.rarity === 'uncommon' ? '#5c6bc0' : '#9e9e9e';
            const rarityLabel = def.rarity ? def.rarity.toUpperCase() : 'COMMON';
            return (
              <TouchableOpacity
                key={def.id}
                onPress={() => handlePick(def.id)}
                activeOpacity={0.8}
                style={styles.cardWrapper}
              >
                {/* Rarity banner above card */}
                <View style={[styles.rarityBanner, { backgroundColor: rarityColor + '33', borderColor: rarityColor }]}>
                  <Text style={[styles.rarityText, { color: rarityColor }]}>{rarityLabel}</Text>
                </View>
                <CardComponent
                  card={fakeInst(def.id)}
                  definition={def}
                  onPlay={handlePick}
                  onLongPress={setTooltipDef}
                  disabled={chosen !== null}
                  affordable={true}
                  index={i}
                  faceDown={false}
                />
                {chosen === def.id && (
                  <Text style={styles.chosenBadge}>✅ ADDED!</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity onPress={handleSkip} style={styles.restButton} disabled={chosen !== null}>
          <Text style={styles.restTitle}>🛌 REST</Text>
          <Text style={styles.restSub}>Skip card — heal +25 HP instead</Text>
        </TouchableOpacity>

        <Text style={styles.tip}>Tap to select · Long-press for details</Text>
      </SafeAreaView>
      <CardTooltip definition={tooltipDef} onClose={() => setTooltipDef(null)} />
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
  cardWrapper: { alignItems: 'center', gap: 4 },
  rarityBanner: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  rarityText: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  chosenBadge: {
    color: COLORS.hpGreen,
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 6,
    alignItems: 'center',
  },
  healed: {
    color: COLORS.hpGreen,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  goldEarned: {
    color: COLORS.accentGold,
    fontSize: 14,
    fontWeight: 'bold',
  },
  hpRow: {
    marginBottom: SPACING.md,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  hpText: {
    color: '#ff8080',
    fontSize: 18,
    fontWeight: 'bold',
  },
  goldTotal: {
    color: COLORS.accentGold,
    fontSize: 16,
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
