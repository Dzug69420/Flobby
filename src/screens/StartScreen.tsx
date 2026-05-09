import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { COLORS, FONTS, SPACING } from '../constants/theme';

import HelpScreen from './HelpScreen';
import CardGalleryScreen from './CardGalleryScreen';
import RelicGalleryScreen from './RelicGalleryScreen';
import StatsScreen from './StatsScreen';

type Panel = 'menu' | 'options' | 'controls';

export default function StartScreen() {
  const goToCharacterSelect = useGameStore((s) => s.goToCharacterSelect);
  const { ascensionLevel, runsCompleted, setAscensionLevel, bestScore, runHistory } = useGameStore();
  const wins = runHistory.filter((r) => r.won).length;
  const winRate = runHistory.length > 0 ? Math.round((wins / runHistory.length) * 100) : 0;
  const { resumeSavedRun } = useGameStore();
  const [panel, setPanel] = useState<Panel>('menu');
  const [showHelp, setShowHelp] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showRelicGallery, setShowRelicGallery] = useState(false);
  const [showStats, setShowStats] = useState(false);

  if (showHelp) return <HelpScreen onClose={() => setShowHelp(false)} />;
  if (showGallery) return <CardGalleryScreen onClose={() => setShowGallery(false)} />;
  if (showRelicGallery) return <RelicGalleryScreen onClose={() => setShowRelicGallery(false)} />;
  if (showStats) return <StatsScreen onClose={() => setShowStats(false)} />;

  const titleAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    titleAnim.setValue(0);
    contentAnim.setValue(0);
    Animated.sequence([
      Animated.timing(titleAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [panel]);

  const titleStyle = {
    opacity: titleAnim,
    transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
  };

  return (
    <LinearGradient colors={['#0a0a1a', '#1a1a2e', '#0f3460']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Background blobs */}
        <View style={[styles.bgBlob, { top: 55, left: 18, width: 60, height: 50, backgroundColor: '#7bc67e' }]} />
        <View style={[styles.bgBlob, { top: 95, right: 28, width: 45, height: 38, backgroundColor: '#5b9bd5' }]} />
        <View style={[styles.bgBlob, { bottom: 110, left: 38, width: 50, height: 42, backgroundColor: '#9b59b6' }]} />
        <View style={[styles.bgBlob, { bottom: 70, right: 18, width: 40, height: 35, backgroundColor: '#e67e22' }]} />

        {/* Title — always visible */}
        <Animated.View style={[styles.titleSection, titleStyle]}>
          <Text style={styles.emoji}>👾</Text>
          <Text style={styles.title}>FLOBBY</Text>
          <Text style={styles.subtitle}>The Blob Dungeon</Text>
        </Animated.View>

        {/* Panel content */}
        <Animated.View style={[styles.panelWrap, { opacity: contentAnim }]}>
          {panel === 'menu' && (
            <MenuPanel
              onStart={goToCharacterSelect}
              onContinue={resumeSavedRun}
              onOptions={() => setPanel('options')}
              onControls={() => setPanel('controls')}
              onHelp={() => setShowHelp(true)}
              onGallery={() => setShowGallery(true)}
              onRelicGallery={() => setShowRelicGallery(true)}
              onStats={() => setShowStats(true)}
              ascensionLevel={ascensionLevel}
              runsCompleted={runsCompleted}
              onAscensionChange={setAscensionLevel}
            />
          )}
          {panel === 'options' && <OptionsPanel onBack={() => setPanel('menu')} />}
          {panel === 'controls' && <ControlsPanel onBack={() => setPanel('menu')} />}
        </Animated.View>

        {bestScore > 0 && (
        <Text style={styles.footer}>
          Best: ⭐{bestScore.toLocaleString()} · Wins: {wins}/{runHistory.length} ({winRate}%)
        </Text>
      )}
      {bestScore === 0 && (
        <Text style={styles.footer}>3 energy · 6 cards per hand · 15 floors</Text>
      )}
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ─── Sub-panels ──────────────────────────────────────────── */

const ASC_LABELS = [
  'Normal', 'A1: Elites +HP', 'A2: -10% Heal', 'A3: Coming soon',
  'A4: Enemy +10%HP', 'A5: Coming soon', 'A6: Coming soon',
  'A7: -5 MaxHP', 'A8: Coming soon', 'A9: Coming soon', 'A10: Master',
];

function MenuPanel({
  onStart, onContinue, onOptions, onControls, onHelp, onGallery, onRelicGallery, onStats,
  ascensionLevel, runsCompleted, onAscensionChange,
}: {
  onStart: () => void; onContinue: () => void; onOptions: () => void; onControls: () => void;
  onHelp: () => void; onGallery: () => void; onRelicGallery: () => void; onStats: () => void;
  ascensionLevel: number; runsCompleted: number;
  onAscensionChange: (l: number) => void;
}) {
  return (
    <View style={styles.menuButtons}>
      <MenuButton label="⚔️  START GAME" onPress={onStart} primary />
      <MenuButton label="▶  CONTINUE" onPress={onContinue} />

      {/* Ascension selector */}
      <View style={styles.ascRow}>
        <TouchableOpacity
          style={styles.ascArrow}
          onPress={() => onAscensionChange(ascensionLevel - 1)}
          disabled={ascensionLevel <= 0}
        >
          <Text style={[styles.ascArrowText, ascensionLevel <= 0 && { opacity: 0.3 }]}>◀</Text>
        </TouchableOpacity>
        <View style={styles.ascBadge}>
          <Text style={styles.ascLevel}>Asc {ascensionLevel}</Text>
          <Text style={styles.ascLabel}>{ASC_LABELS[ascensionLevel] ?? ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.ascArrow}
          onPress={() => onAscensionChange(ascensionLevel + 1)}
          disabled={ascensionLevel >= Math.min(runsCompleted, 10)}
        >
          <Text style={[styles.ascArrowText, ascensionLevel >= Math.min(runsCompleted, 10) && { opacity: 0.3 }]}>▶</Text>
        </TouchableOpacity>
      </View>

      <MenuButton label="⚙️  OPTIONS" onPress={onOptions} />
      <MenuButton label="🎮  CONTROLS" onPress={onControls} />
      <MenuButton label="📖  HOW TO PLAY" onPress={onHelp} />
      <MenuButton label="🃏  CARD GALLERY" onPress={onGallery} />
      <MenuButton label="✨  RELIC GALLERY" onPress={onRelicGallery} />
      <MenuButton label="📈  STATISTICS" onPress={onStats} />
      {runsCompleted > 0 && <Text style={styles.hint}>🏆 {runsCompleted} run{runsCompleted > 1 ? 's' : ''} completed</Text>}
      <Text style={styles.hint}>Defeat the boss to unlock higher ascensions!</Text>
    </View>
  );
}

function OptionsPanel({ onBack }: { onBack: () => void }) {
  const [sound, setSound] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [showTips, setShowTips] = useState(true);

  return (
    <View style={styles.subPanel}>
      <Text style={styles.panelTitle}>⚙️  OPTIONS</Text>
      <ToggleRow label="Sound Effects" value={sound} onToggle={() => setSound(v => !v)} />
      <ToggleRow label="Animations" value={animations} onToggle={() => setAnimations(v => !v)} />
      <ToggleRow label="Show Tips" value={showTips} onToggle={() => setShowTips(v => !v)} />
      <View style={styles.divider} />
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Version</Text>
        <Text style={styles.infoValue}>1.0.0</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Stages</Text>
        <Text style={styles.infoValue}>10 + Boss</Text>
      </View>
      <MenuButton label="← BACK" onPress={onBack} style={styles.backBtn} />
    </View>
  );
}

function ControlsPanel({ onBack }: { onBack: () => void }) {
  const entries: [string, string][] = [
    ['Tap a card', 'Play it (costs energy)'],
    ['End Turn', 'Enemy takes its action'],
    ['🗡️ badge', 'Enemy will attack this turn'],
    ['🛡️ badge', 'Enemy will defend this turn'],
    ['⚡ Energy', 'Spend it to play cards — refills each turn'],
    ['🛡️ Block', 'Absorbs damage — resets each turn'],
    ['Reward screen', 'Pick a card to add to your deck'],
    ['REST option', 'Skip card — heal +25 HP instead'],
    ['Stage clear', 'Always restores +10 HP'],
  ];

  return (
    <View style={styles.subPanel}>
      <Text style={styles.panelTitle}>🎮  CONTROLS</Text>
      <ScrollView style={styles.controlsScroll} showsVerticalScrollIndicator={false}>
        {entries.map(([action, desc]) => (
          <View key={action} style={styles.controlRow}>
            <Text style={styles.controlAction}>{action}</Text>
            <Text style={styles.controlDesc}>{desc}</Text>
          </View>
        ))}
      </ScrollView>
      <MenuButton label="← BACK" onPress={onBack} style={styles.backBtn} />
    </View>
  );
}

/* ─── Shared small components ─────────────────────────────── */

function MenuButton({ label, onPress, primary, style }: { label: string; onPress: () => void; primary?: boolean; style?: object }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[styles.menuBtn, primary && styles.menuBtnPrimary, style]}
    >
      <Text style={[styles.menuBtnText, primary && styles.menuBtnTextPrimary]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ToggleRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity style={styles.toggleRow} onPress={onToggle} activeOpacity={0.8}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.toggleTrack, value && styles.toggleTrackOn]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
      </View>
    </TouchableOpacity>
  );
}

/* ─── Styles ──────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },

  bgBlob: { position: 'absolute', borderRadius: 50, opacity: 0.28 },

  titleSection: { alignItems: 'center', marginBottom: SPACING.xl },
  emoji: { fontSize: 72, marginBottom: SPACING.sm },
  title: {
    fontSize: FONTS.screenTitle + 14,
    fontWeight: 'bold',
    color: COLORS.bossGold,
    letterSpacing: 8,
    textShadowColor: COLORS.accentGold,
    textShadowRadius: 22,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    fontSize: FONTS.button,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    letterSpacing: 2,
  },

  panelWrap: { width: '100%', alignItems: 'center' },

  /* Main menu buttons */
  menuButtons: { width: '100%', alignItems: 'center', gap: 12 },
  menuBtn: {
    width: '90%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  menuBtnPrimary: {
    backgroundColor: COLORS.accentGold,
    borderColor: COLORS.accentGold,
    shadowColor: COLORS.accentGold,
    shadowRadius: 12,
    shadowOpacity: 0.55,
    elevation: 6,
  },
  menuBtnText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.button,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  menuBtnTextPrimary: { color: '#000' },

  hint: { color: COLORS.textSecondary, textAlign: 'center', fontSize: 13, marginTop: 4 },
  ascRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 6,
  },
  ascArrow: { padding: 8 },
  ascArrowText: { color: COLORS.accentGold, fontSize: 18 },
  ascBadge: {
    backgroundColor: 'rgba(249,168,37,0.12)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 140,
  },
  ascLevel: { color: COLORS.accentGold, fontSize: 16, fontWeight: 'bold' },
  ascLabel: { color: COLORS.textSecondary, fontSize: 11 },
  footer: { position: 'absolute', bottom: 28, color: COLORS.textSecondary, fontSize: 11, textAlign: 'center' },

  /* Sub-panel shared */
  subPanel: {
    width: '100%',
    backgroundColor: 'rgba(15,20,50,0.85)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: SPACING.lg,
    gap: 10,
  },
  panelTitle: {
    color: COLORS.bossGold,
    fontSize: FONTS.button,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 6,
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 4 },

  /* Back button */
  backBtn: { marginTop: 6, width: '100%' },

  /* Options toggles */
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  toggleLabel: { color: COLORS.textPrimary, fontSize: 15 },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    padding: 3,
  },
  toggleTrackOn: { backgroundColor: COLORS.accentGold },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#888',
  },
  toggleThumbOn: { backgroundColor: '#000', alignSelf: 'flex-end' },

  /* Info rows in Options */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  infoLabel: { color: COLORS.textSecondary, fontSize: 14 },
  infoValue: { color: COLORS.textPrimary, fontSize: 14, fontWeight: 'bold' },

  /* Controls list */
  controlsScroll: { maxHeight: 220 },
  controlRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  controlAction: { color: COLORS.accentGold, fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  controlDesc: { color: COLORS.textSecondary, fontSize: 13 },
});
