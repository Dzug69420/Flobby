import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { COLORS } from '../constants/theme';
import CardComponent from '../components/CardComponent';

export default function RestScreen() {
  const {
    playerHP, playerMaxHP, deck, hand, discard, masterCardPool,
    upgradeCard, leaveRestSite,
  } = useGameStore();
  const [mode, setMode] = useState<'choose' | 'smith' | 'done'>('choose');
  const [smithed, setSmithed] = useState<string | null>(null);

  const healAmount = Math.floor(playerMaxHP * 0.3);

  const handleRest = () => {
    // Heal is applied immediately in leaveRestSite via store (we pass heal flag)
    useGameStore.setState((s) => ({
      playerHP: Math.min(s.playerHP + healAmount, s.playerMaxHP),
    }));
    setMode('done');
    setTimeout(() => leaveRestSite(), 600);
  };

  const allCards = [...deck, ...hand, ...discard];
  const upgradableCards = allCards.filter((c) => {
    const def = masterCardPool[c.definitionId];
    return def?.upgradeId;
  });

  const handleSmith = (instanceId: string) => {
    if (smithed) return;
    setSmithed(instanceId);
    upgradeCard(instanceId);
    setTimeout(() => leaveRestSite(), 700);
  };

  return (
    <LinearGradient colors={['#1a0a00', '#2d1500', '#1a0a00']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>🔥 Rest Site</Text>
        <Text style={styles.hpText}>♥ {playerHP} / {playerMaxHP}</Text>

        {mode === 'choose' && (
          <View style={styles.optionsRow}>
            {/* Rest */}
            <TouchableOpacity style={styles.optionCard} onPress={handleRest}>
              <Text style={styles.optionEmoji}>🛌</Text>
              <Text style={styles.optionTitle}>Rest</Text>
              <Text style={styles.optionDesc}>Heal {healAmount} HP</Text>
              <Text style={styles.optionSub}>({Math.round(30)}% of max)</Text>
            </TouchableOpacity>

            {/* Smith */}
            <TouchableOpacity
              style={[styles.optionCard, upgradableCards.length === 0 && styles.optionDisabled]}
              onPress={() => upgradableCards.length > 0 && setMode('smith')}
            >
              <Text style={styles.optionEmoji}>⚒️</Text>
              <Text style={styles.optionTitle}>Smith</Text>
              <Text style={styles.optionDesc}>Upgrade a card</Text>
              <Text style={styles.optionSub}>
                {upgradableCards.length > 0
                  ? `${upgradableCards.length} upgradable`
                  : 'No upgradable cards'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {mode === 'smith' && (
          <>
            <Text style={styles.smithPrompt}>Choose a card to upgrade:</Text>
            <ScrollView contentContainerStyle={styles.cardGrid} showsVerticalScrollIndicator={false}>
              {upgradableCards.map((inst, i) => {
                const def = masterCardPool[inst.definitionId];
                const upgDef = def?.upgradeId ? masterCardPool[def.upgradeId] : undefined;
                return (
                  <View key={inst.instanceId} style={styles.cardWrap}>
                    <CardComponent
                      card={inst}
                      definition={def}
                      onPlay={() => handleSmith(inst.instanceId)}
                      disabled={smithed !== null}
                      affordable={true}
                      index={i}
                      faceDown={false}
                    />
                    {upgDef && (
                      <Text style={styles.upgradeHint}>→ {upgDef.description}</Text>
                    )}
                    {smithed === inst.instanceId && (
                      <Text style={styles.upgradedBadge}>✅ Upgraded!</Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}

        {mode === 'done' && (
          <Text style={styles.doneText}>Resting... ♥ +{healAmount}</Text>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, alignItems: 'center', paddingHorizontal: 16 },
  title: { color: '#ff8c42', fontSize: 28, fontWeight: 'bold', marginTop: 24, marginBottom: 4 },
  hpText: { color: '#ff6b6b', fontSize: 18, fontWeight: 'bold', marginBottom: 24 },

  optionsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 12,
  },
  optionCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ff8c42',
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  optionDisabled: { borderColor: '#444', opacity: 0.5 },
  optionEmoji: { fontSize: 36 },
  optionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  optionDesc: { color: COLORS.accentGold, fontSize: 14, fontWeight: '600' },
  optionSub: { color: COLORS.textSecondary, fontSize: 12 },

  smithPrompt: {
    color: COLORS.accentGold,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  cardWrap: { alignItems: 'center', gap: 4 },
  upgradeHint: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 100,
  },
  upgradedBadge: {
    color: '#66bb6a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  doneText: {
    color: '#66bb6a',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 48,
  },
});
