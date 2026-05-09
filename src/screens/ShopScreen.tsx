import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { COLORS } from '../constants/theme';
import CardComponent from '../components/CardComponent';

const RARITY_COLOR = { common: '#9e9e9e', uncommon: '#5c6bc0', rare: '#f9a825' };

export default function ShopScreen() {
  const {
    gold, shopInventory, masterCardPool,
    deck, hand, discard,
    cardRemovalCost,
    buyShopCard, removeCard, leaveShop, restockShop,
  } = useGameStore();

  const [tab, setTab] = useState<'buy' | 'remove'>('buy');
  const [removing, setRemoving] = useState(false);

  const allCards = [...deck, ...hand, ...discard];
  const removableCards = allCards.filter((c) => {
    const def = masterCardPool[c.definitionId];
    return def;
  });

  const handleRemove = (instanceId: string) => {
    if (gold < cardRemovalCost) {
      Alert.alert('Not enough gold', `You need ${cardRemovalCost} gold to remove a card.`);
      return;
    }
    removeCard(instanceId, cardRemovalCost);
    setRemoving(false);
    setTab('buy');
  };

  return (
    <LinearGradient colors={['#0a0a0a', '#1a1500', '#0a0a0a']} style={styles.root}>
      <SafeAreaView style={styles.safe}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>💰 Shop</Text>
          <View style={styles.goldBadge}>
            <Text style={styles.goldText}>🪙 {gold}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, tab === 'buy' && styles.tabActive]}
            onPress={() => setTab('buy')}
          >
            <Text style={[styles.tabText, tab === 'buy' && styles.tabTextActive]}>Buy Cards</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'remove' && styles.tabActive]}
            onPress={() => setTab('remove')}
          >
            <Text style={[styles.tabText, tab === 'remove' && styles.tabTextActive]}>
              Remove ({cardRemovalCost}🪙)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Buy tab */}
        {tab === 'buy' && (
          <ScrollView contentContainerStyle={styles.cardGrid}>
            {shopInventory.map((item, i) => {
              const def = masterCardPool[item.cardId];
              if (!def) return null;
              const canAfford = gold >= item.price;
              const fakeInst = { instanceId: item.cardId, definitionId: item.cardId };
              return (
                <View key={item.cardId} style={styles.shopItem}>
                  <View style={[styles.soldOverlay, !item.sold && { display: 'none' }]}>
                    <Text style={styles.soldText}>SOLD</Text>
                  </View>
                  <CardComponent
                    card={fakeInst}
                    definition={def}
                    onPlay={() => !item.sold && canAfford && buyShopCard(item.cardId, item.price)}
                    disabled={item.sold || !canAfford}
                    affordable={!item.sold && canAfford}
                    index={i}
                    faceDown={false}
                  />
                  <View style={[styles.priceBadge, !canAfford && styles.priceCantAfford]}>
                    <Text style={[styles.priceText, !canAfford && styles.priceTextRed]}>
                      🪙 {item.price}
                    </Text>
                  </View>
                  {!canAfford && !item.sold && (
                    <Text style={styles.cantAffordHint}>Need {item.price - gold} more</Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Remove tab */}
        {tab === 'remove' && (
          <>
            <Text style={styles.removePrompt}>
              Permanently remove a card for {cardRemovalCost} 🪙
            </Text>
            {gold < cardRemovalCost && (
              <Text style={styles.removeWarning}>Not enough gold!</Text>
            )}
            <ScrollView contentContainerStyle={styles.cardGrid}>
              {removableCards.map((inst, i) => {
                const def = masterCardPool[inst.definitionId];
                if (!def) return null;
                return (
                  <View key={inst.instanceId} style={styles.shopItem}>
                    <CardComponent
                      card={inst}
                      definition={def}
                      onPlay={() => handleRemove(inst.instanceId)}
                      disabled={gold < cardRemovalCost}
                      affordable={gold >= cardRemovalCost}
                      index={i}
                      faceDown={false}
                    />
                    <Text style={styles.removeHint}>Tap to remove</Text>
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}

        <View style={{ flexDirection: 'row', gap: 10, margin: 16 }}>
          <TouchableOpacity
            style={[styles.leaveBtn, { flex: 1, opacity: gold >= 50 ? 1 : 0.5 }]}
            onPress={() => gold >= 50 && restockShop()}
            disabled={gold < 50}
          >
            <Text style={[styles.leaveBtnText, { color: COLORS.accentGold }]}>🔄 Restock (50🪙)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.leaveBtn, { flex: 1 }]} onPress={leaveShop}>
            <Text style={styles.leaveBtnText}>Leave Shop →</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: { color: COLORS.accentGold, fontSize: 24, fontWeight: 'bold' },
  goldBadge: {
    backgroundColor: 'rgba(249,168,37,0.15)',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.accentGold,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  goldText: { color: COLORS.accentGold, fontSize: 18, fontWeight: 'bold' },

  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.accentGold },
  tabText: { color: COLORS.textSecondary, fontSize: 14 },
  tabTextActive: { color: COLORS.accentGold, fontWeight: 'bold' },

  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    padding: 16,
    justifyContent: 'center',
  },
  shopItem: { alignItems: 'center', gap: 6, position: 'relative' },
  soldOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  soldText: { color: '#ff4444', fontSize: 22, fontWeight: 'bold', letterSpacing: 2 },

  priceBadge: {
    backgroundColor: 'rgba(249,168,37,0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accentGold,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  priceCantAfford: { borderColor: '#e74c3c', backgroundColor: 'rgba(231,76,60,0.1)' },
  priceText: { color: COLORS.accentGold, fontSize: 14, fontWeight: 'bold' },
  priceTextRed: { color: '#e74c3c' },
  cantAffordHint: { color: '#ff8f8f', fontSize: 10 },

  removePrompt: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 10,
  },
  removeWarning: { color: '#e74c3c', textAlign: 'center', fontSize: 13, fontWeight: 'bold' },
  removeHint: { color: '#e74c3c', fontSize: 10 },

  leaveBtn: {
    margin: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  leaveBtnText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' },
});
