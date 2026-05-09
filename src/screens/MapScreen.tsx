import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Animated, Pressable, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { MapNode, RoomType } from '../types';
import { roomEmoji } from '../data/map';
import { COLORS } from '../constants/theme';
import { ALL_RELICS } from '../data/relics';
import { ALL_CHARACTERS } from '../data/characters';

const ROOM_COLORS: Record<RoomType, string> = {
  monster:  '#c0392b',
  elite:    '#6c3483',
  rest:     '#e67e22',
  shop:     '#f1c40f',
  treasure: '#1abc9c',
  event:    '#2980b9',
  boss:     '#c0392b',
};

const ROOM_LABEL: Record<RoomType, string> = {
  monster:  'Fight',
  elite:    'Elite',
  rest:     'Rest',
  shop:     'Shop',
  treasure: 'Chest',
  event:    'Event',
  boss:     'BOSS',
};

const NODE_SIZE = 48;
const COL_WIDTH = 62;
const ROW_HEIGHT = 54;

export default function MapScreen() {
  const { map, playerHP, playerMaxHP, deck, discard, hand, currentFloor, currentAct, travelToNode, relics, gold, potions, selectedCharacter, ascensionLevel, currentRunScore, masterCardPool, activePowers, enemiesDefeated } = useGameStore();
  const [showStats, setShowStats] = useState(false);
  const [showDeck, setShowDeck] = useState(false);

  const allCards = deck.length + hand.length + discard.length;
  const floors = [...new Set(map.map((n) => n.floor))].sort((a, b) => b - a); // top to bottom (boss at top)

  const renderConnections = (node: MapNode) => {
    return node.connections.map((targetId) => {
      const target = map.find((n) => n.id === targetId);
      if (!target) return null;
      const x1 = node.col * COL_WIDTH + NODE_SIZE / 2;
      const y1 = 0;
      const x2 = target.col * COL_WIDTH + NODE_SIZE / 2;
      const y2 = ROW_HEIGHT;
      return null; // Lines rendered per floor row separately
    });
  };

  return (
    <LinearGradient colors={['#0a0a1a', '#0d1b2a', '#0a1a0a']} style={styles.root}>
      <SafeAreaView style={styles.safe}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.actLabel}>Act {currentAct}</Text>
            <Text style={styles.floorLabel}>Floor {currentFloor + 1} / 15</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.statBadge}>♥ {playerHP}/{playerMaxHP}</Text>
            <Text style={styles.statBadge}>🪙 {gold}</Text>
            <Text style={styles.statBadge}>🃏 {allCards}</Text>
            <TouchableOpacity onPress={() => setShowDeck(true)}>
              <Text style={styles.statBadge}>🃏</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowStats(true)}>
              <Text style={styles.statBadge}>📊</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {(['monster', 'elite', 'rest', 'shop', 'treasure', 'event', 'boss'] as RoomType[]).map((t) => (
            <View key={t} style={styles.legendItem}>
              <Text style={styles.legendEmoji}>{roomEmoji(t)}</Text>
              <Text style={[styles.legendLabel, { color: ROOM_COLORS[t] }]}>{ROOM_LABEL[t]}</Text>
            </View>
          ))}
        </View>

        {/* Map scroll (top = boss floor, bottom = first floor) */}
        <ScrollView
          style={styles.mapScroll}
          contentContainerStyle={styles.mapContent}
          showsVerticalScrollIndicator={false}
        >
          {floors.map((floor) => {
            const floorNodes = map.filter((n) => n.floor === floor);
            return (
              <View key={floor} style={styles.floorRow}>
                <Text style={styles.floorNum}>{floor + 1}</Text>
                <View style={styles.nodesRow}>
                  {/* Render connection lines to next floor */}
                  {floorNodes.map((node) =>
                    node.connections.map((targetId) => {
                      const target = map.find((n) => n.id === targetId);
                      if (!target) return null;
                      const dx = (target.col - node.col) * COL_WIDTH;
                      return (
                        <View
                          key={`${node.id}-${targetId}`}
                          pointerEvents="none"
                          style={[
                            styles.connectionLine,
                            {
                              left: node.col * COL_WIDTH + NODE_SIZE / 2 - 1,
                              width: dx === 0 ? 2 : Math.abs(dx) + 2,
                              transform: dx < 0 ? [{ translateX: dx }] : [],
                            },
                          ]}
                        />
                      );
                    })
                  )}

                  {/* Render nodes */}
                  {floorNodes.map((node) => {
                    const color = ROOM_COLORS[node.roomType];
                    const isAvailable = node.available;
                    const isVisited = node.visited;
                    const isBoss = node.roomType === 'boss';

                    return (
                      <Pressable
                        key={node.id}
                        onPress={() => isAvailable && travelToNode(node.id)}
                        style={[
                          styles.node,
                          {
                            left: node.col * COL_WIDTH,
                            backgroundColor: isVisited ? '#222' : isAvailable ? color : '#1a1a1a',
                            borderColor: isVisited ? '#555' : isAvailable ? color : '#333',
                            borderWidth: isAvailable ? 2.5 : 1.5,
                            opacity: isVisited ? 0.45 : isAvailable ? 1 : 0.5,
                            shadowColor: isAvailable ? color : 'transparent',
                            shadowRadius: isAvailable ? 8 : 0,
                            shadowOpacity: isAvailable ? 0.9 : 0,
                            elevation: isAvailable ? 6 : 0,
                            width: isBoss ? NODE_SIZE + 12 : NODE_SIZE,
                            height: isBoss ? NODE_SIZE + 12 : NODE_SIZE,
                            borderRadius: isBoss ? 8 : NODE_SIZE / 2,
                          },
                        ]}
                      >
                        <Text style={[styles.nodeEmoji, isBoss && { fontSize: 22 }]}>
                          {isVisited ? '✓' : roomEmoji(node.roomType)}
                        </Text>
                        {isAvailable && (
                          <View style={[styles.availablePulse, { borderColor: color }]} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentFloor) / 14) * 100}%` as unknown as number }]} />
          </View>
          <Text style={styles.progressText}>{Math.round((currentFloor / 14) * 100)}% complete</Text>
        </View>

        <Text style={styles.hint}>Tap a glowing room to travel there</Text>
      </SafeAreaView>

      {/* Deck Viewer Modal */}
      <Modal visible={showDeck} transparent animationType="slide" onRequestClose={() => setShowDeck(false)}>
        <Pressable style={statsStyles.backdrop} onPress={() => setShowDeck(false)}>
          <Pressable style={[statsStyles.panel, { maxHeight: '85%' }]} onPress={(e) => e.stopPropagation()}>
            <Text style={statsStyles.title}>🃏 Your Deck ({allCards})</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[...deck].sort((a, b) => {
                const dA = masterCardPool[a.definitionId];
                const dB = masterCardPool[b.definitionId];
                return (dA?.category ?? '').localeCompare(dB?.category ?? '');
              }).map((c) => {
                const def = masterCardPool[c.definitionId];
                if (!def) return null;
                const catColors: Record<string, string> = {
                  attack: '#e74c3c', defense: '#4fc3f7', combo: '#f5a623',
                  power: '#66bb6a', status: '#9b59b6',
                };
                const color = catColors[def.category] ?? '#fff';
                return (
                  <View key={c.instanceId} style={deckViewStyles.row}>
                    <View style={[deckViewStyles.costCircle, { backgroundColor: color }]}>
                      <Text style={deckViewStyles.cost}>{def.cost === -1 ? 'X' : def.cost}</Text>
                    </View>
                    <View style={deckViewStyles.info}>
                      <Text style={[deckViewStyles.name, { color }]}>{def.name}</Text>
                      <Text style={deckViewStyles.desc} numberOfLines={1}>{def.description}</Text>
                    </View>
                    {def.upgraded && <Text style={deckViewStyles.plus}>+</Text>}
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={statsStyles.closeBtn} onPress={() => setShowDeck(false)}>
              <Text style={statsStyles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Run Stats Modal */}
      <Modal visible={showStats} transparent animationType="slide" onRequestClose={() => setShowStats(false)}>
        <Pressable style={statsStyles.backdrop} onPress={() => setShowStats(false)}>
          <Pressable style={statsStyles.panel} onPress={(e) => e.stopPropagation()}>
            <Text style={statsStyles.title}>📊 Run Statistics</Text>

            <View style={statsStyles.row}>
              <Text style={statsStyles.label}>Character</Text>
              <Text style={statsStyles.value}>
                {ALL_CHARACTERS[selectedCharacter]?.emoji} {ALL_CHARACTERS[selectedCharacter]?.name}
              </Text>
            </View>
            <View style={statsStyles.row}>
              <Text style={statsStyles.label}>Ascension</Text>
              <Text style={statsStyles.value}>{ascensionLevel}</Text>
            </View>
            <View style={statsStyles.row}>
              <Text style={statsStyles.label}>Current Floor</Text>
              <Text style={statsStyles.value}>{currentFloor + 1} / 15</Text>
            </View>
            <View style={statsStyles.row}>
              <Text style={statsStyles.label}>HP</Text>
              <Text style={statsStyles.value}>♥ {playerHP} / {playerMaxHP}</Text>
            </View>
            <View style={statsStyles.row}>
              <Text style={statsStyles.label}>Gold</Text>
              <Text style={statsStyles.value}>🪙 {gold}</Text>
            </View>
            <View style={statsStyles.row}>
              <Text style={statsStyles.label}>Deck Size</Text>
              <Text style={statsStyles.value}>🃏 {allCards}</Text>
            </View>
            <View style={statsStyles.row}>
              <Text style={statsStyles.label}>Relics</Text>
              <Text style={statsStyles.value}>{relics.map((r) => ALL_RELICS[r]?.emoji ?? '').join(' ')}</Text>
            </View>
            <View style={statsStyles.row}>
              <Text style={statsStyles.label}>Potions</Text>
              <Text style={statsStyles.value}>{potions.length > 0 ? `${potions.length} held` : 'None'}</Text>
            </View>
            {activePowers.length > 0 && (
              <View style={statsStyles.row}>
                <Text style={statsStyles.label}>Active Powers</Text>
                <Text style={statsStyles.value}>{activePowers.join(', ')}</Text>
              </View>
            )}
            <View style={statsStyles.row}>
              <Text style={statsStyles.label}>Enemies Defeated</Text>
              <Text style={statsStyles.value}>💀 {enemiesDefeated}</Text>
            </View>
            <View style={statsStyles.row}>
              <Text style={statsStyles.label}>Score So Far</Text>
              <Text style={[statsStyles.value, { color: COLORS.accentGold }]}>⭐ {currentRunScore}</Text>
            </View>

            <TouchableOpacity style={statsStyles.closeBtn} onPress={() => setShowStats(false)}>
              <Text style={statsStyles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}

const statsStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 20,
    gap: 10,
    maxHeight: '80%',
  },
  title: { color: COLORS.accentGold, fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: COLORS.textSecondary, fontSize: 13 },
  value: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  closeBtn: {
    marginTop: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeBtnText: { color: COLORS.textSecondary, fontSize: 14 },
});

const deckViewStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  costCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cost: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: 'bold' },
  desc: { color: COLORS.textSecondary, fontSize: 11 },
  plus: { color: '#ffd700', fontSize: 14, fontWeight: 'bold' },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerLeft: {},
  headerRight: { flexDirection: 'row', gap: 12 },
  actLabel: { color: COLORS.accentGold, fontSize: 18, fontWeight: 'bold' },
  floorLabel: { color: COLORS.textSecondary, fontSize: 13 },
  statBadge: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  legendEmoji: { fontSize: 11 },
  legendLabel: { fontSize: 10, fontWeight: '600' },

  mapScroll: { flex: 1 },
  mapContent: { paddingHorizontal: 16, paddingVertical: 12 },

  floorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_HEIGHT,
    marginBottom: 4,
  },
  floorNum: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 10,
    width: 22,
    textAlign: 'right',
    marginRight: 6,
  },
  nodesRow: {
    flex: 1,
    height: ROW_HEIGHT,
    position: 'relative',
  },
  connectionLine: {
    position: 'absolute',
    top: -4,
    height: ROW_HEIGHT + 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 1,
  },
  node: {
    position: 'absolute',
    top: (ROW_HEIGHT - NODE_SIZE) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeEmoji: { fontSize: 18 },
  availablePulse: {
    position: 'absolute',
    top: -4, left: -4, right: -4, bottom: -4,
    borderRadius: NODE_SIZE,
    borderWidth: 1.5,
    opacity: 0.5,
  },

  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accentGold,
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    textAlign: 'center',
  },
  hint: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 6,
  },
});
