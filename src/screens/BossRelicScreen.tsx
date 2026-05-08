import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { ALL_RELICS } from '../data/relics';
import { COLORS } from '../constants/theme';

export default function BossRelicScreen() {
  const { bossRelicChoices, selectBossRelic, currentRunScore } = useGameStore();
  const [chosen, setChosen] = useState<string | null>(null);

  const handle = (id: string) => {
    if (chosen) return;
    setChosen(id);
    setTimeout(() => selectBossRelic(id), 600);
  };

  return (
    <LinearGradient colors={['#1a0a00', '#2d0000', '#0a0a1a']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>👑 Boss Defeated!</Text>
        <Text style={styles.subtitle}>Choose your final boss relic:</Text>
        <Text style={styles.score}>Score: ⭐ {currentRunScore.toLocaleString()}</Text>

        <View style={styles.choices}>
          {bossRelicChoices.map((id) => {
            const def = ALL_RELICS[id];
            if (!def) return null;
            return (
              <TouchableOpacity
                key={id}
                style={[
                  styles.relicCard,
                  chosen === id && styles.relicCardChosen,
                  chosen !== null && chosen !== id && styles.relicCardDimmed,
                ]}
                onPress={() => handle(id)}
                disabled={chosen !== null}
                activeOpacity={0.8}
              >
                <Text style={styles.relicEmoji}>{def.emoji}</Text>
                <View style={styles.relicInfo}>
                  <Text style={styles.relicName}>{def.name}</Text>
                  <Text style={[styles.relicRarity, { color: '#e74c3c' }]}>BOSS RELIC</Text>
                  <Text style={styles.relicDesc}>{def.description}</Text>
                </View>
                {chosen === id && <Text style={styles.checkmark}>✅</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.hint}>Your chosen relic will be shown on the Victory screen.</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  title: { color: COLORS.bossGold, fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  subtitle: { color: COLORS.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 4 },
  score: { color: COLORS.accentGold, fontSize: 14, textAlign: 'center', marginBottom: 28 },

  choices: { gap: 16 },
  relicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e74c3c',
    padding: 16,
  },
  relicCardChosen: {
    backgroundColor: 'rgba(231,76,60,0.12)',
    borderColor: COLORS.bossGold,
  },
  relicCardDimmed: { opacity: 0.35 },
  relicEmoji: { fontSize: 40 },
  relicInfo: { flex: 1, gap: 2 },
  relicName: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  relicRarity: { fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  relicDesc: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  checkmark: { fontSize: 24 },

  hint: { color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'center', marginTop: 24 },
});
