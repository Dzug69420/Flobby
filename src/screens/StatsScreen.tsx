import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { ALL_CHARACTERS } from '../data/characters';
import { COLORS } from '../constants/theme';

export default function StatsScreen({ onClose }: { onClose: () => void }) {
  const { runHistory, bestScore, runsCompleted, ascensionLevel } = useGameStore();

  const wins = runHistory.filter((r) => r.won).length;
  const losses = runHistory.filter((r) => !r.won).length;
  const winRate = runHistory.length > 0 ? Math.round((wins / runHistory.length) * 100) : 0;
  const avgScore = runHistory.length > 0
    ? Math.round(runHistory.reduce((sum, r) => sum + r.score, 0) / runHistory.length)
    : 0;
  const avgFloor = runHistory.length > 0
    ? Math.round(runHistory.reduce((sum, r) => sum + r.floor, 0) / runHistory.length)
    : 0;

  const charStats = runHistory.reduce((acc, r) => {
    if (!acc[r.character]) acc[r.character] = { wins: 0, runs: 0 };
    acc[r.character].runs++;
    if (r.won) acc[r.character].wins++;
    return acc;
  }, {} as Record<string, { wins: number; runs: number }>);

  return (
    <LinearGradient colors={['#0a0a1a', '#1a1a2e']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>📊 Statistics</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Overall Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overall</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>⭐ {bestScore.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Best Score</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>🏆 {runsCompleted}</Text>
                <Text style={styles.statLabel}>Runs Won</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{winRate}%</Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>Asc {ascensionLevel}</Text>
                <Text style={styles.statLabel}>Highest Asc</Text>
              </View>
            </View>
          </View>

          {/* Run History */}
          {runHistory.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Runs ({runHistory.length})</Text>
              <View style={styles.historyStats}>
                <Text style={styles.historyLabel}>Avg Score: <Text style={styles.historyVal}>⭐{avgScore.toLocaleString()}</Text></Text>
                <Text style={styles.historyLabel}>Avg Floor: <Text style={styles.historyVal}>{avgFloor}</Text></Text>
                <Text style={styles.historyLabel}>W/L: <Text style={styles.historyVal}>{wins}/{losses}</Text></Text>
              </View>
              {runHistory.map((run, i) => {
                const char = ALL_CHARACTERS[run.character];
                return (
                  <View key={i} style={[styles.runRow, { borderLeftColor: run.won ? '#66bb6a' : '#e74c3c' }]}>
                    <Text style={[styles.runResult, { color: run.won ? '#66bb6a' : '#e74c3c' }]}>
                      {run.won ? '✓ WIN' : '✗ LOSS'}
                    </Text>
                    <Text style={styles.runChar}>{char?.emoji ?? '?'} {char?.name ?? run.character}</Text>
                    <Text style={styles.runDetail}>Fl.{run.floor} · Asc{run.ascension}</Text>
                    <Text style={styles.runScore}>⭐{run.score.toLocaleString()}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Per-Character Stats */}
          {Object.keys(charStats).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>By Character</Text>
              {Object.entries(charStats).map(([charId, stats]) => {
                const char = ALL_CHARACTERS[charId];
                const wr = Math.round((stats.wins / stats.runs) * 100);
                return (
                  <View key={charId} style={styles.charRow}>
                    <Text style={styles.charEmoji}>{char?.emoji ?? '?'}</Text>
                    <Text style={styles.charName}>{char?.name ?? charId}</Text>
                    <Text style={styles.charStats}>{stats.wins}W / {stats.runs - stats.wins}L · {wr}%</Text>
                  </View>
                );
              })}
            </View>
          )}

          {runHistory.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No runs recorded yet.</Text>
              <Text style={styles.emptySubtext}>Complete your first run to see statistics!</Text>
            </View>
          )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: { color: COLORS.accentGold, fontSize: 20, fontWeight: 'bold' },
  closeBtn: { padding: 8 },
  closeBtnText: { color: COLORS.textSecondary, fontSize: 18 },
  content: { padding: 16, gap: 20 },
  section: { gap: 10 },
  sectionTitle: { color: COLORS.accentGold, fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: {
    flex: 1, minWidth: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10, padding: 12, alignItems: 'center', gap: 4,
  },
  statVal: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statLabel: { color: COLORS.textSecondary, fontSize: 11 },
  historyStats: { flexDirection: 'row', gap: 16 },
  historyLabel: { color: COLORS.textSecondary, fontSize: 12 },
  historyVal: { color: '#fff', fontWeight: 'bold' },
  runRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingLeft: 10,
    borderLeftWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 4,
  },
  runResult: { fontSize: 11, fontWeight: 'bold', width: 50 },
  runChar: { color: '#fff', fontSize: 12, flex: 1 },
  runDetail: { color: COLORS.textSecondary, fontSize: 11 },
  runScore: { color: COLORS.accentGold, fontSize: 12, fontWeight: 'bold', width: 70, textAlign: 'right' },
  charRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  charEmoji: { fontSize: 24 },
  charName: { color: '#fff', fontSize: 14, fontWeight: 'bold', flex: 1 },
  charStats: { color: COLORS.textSecondary, fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: COLORS.textSecondary, fontSize: 16, marginBottom: 8 },
  emptySubtext: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
});
