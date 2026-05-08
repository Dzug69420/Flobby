import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { CardDefinition, CardInstance } from '../types';
import { COLORS, CARD } from '../constants/theme';
import { CardPreview } from '../utils/gameLogic';

interface Props {
  card: CardInstance;
  definition: CardDefinition;
  onPlay: (id: string) => void;
  disabled: boolean;
  affordable: boolean;
  index: number;
  faceDown?: boolean;
  preview?: CardPreview;
}

const CATEGORY_BANNER: Record<string, string> = {
  attack: '#5a1010',
  defense: '#0d2b55',
  combo: '#5a3a00',
  status: '#30105a',
  power: '#1a2a0a',
};

const CATEGORY_BORDER: Record<string, string> = {
  attack: '#e74c3c',
  defense: '#4fc3f7',
  combo: '#f5a623',
  status: '#9b59b6',
  power: '#66bb6a',
};

const CATEGORY_TYPE_LABEL: Record<string, string> = {
  attack: 'ATTACK',
  defense: 'SKILL',
  combo: 'COMBO',
  status: 'STATUS',
  power: 'POWER',
};

const CATEGORY_ART: Record<string, string> = {
  attack: '⚔️',
  defense: '🛡️',
  combo: '⚡',
  status: '✨',
  power: '🔋',
};

const RARITY_COLORS: Record<string, string> = {
  common: '#9e9e9e',
  uncommon: '#5c6bc0',
  rare: '#f9a825',
};

export default function CardComponent({
  card, definition, onPlay, disabled, affordable, index, faceDown = false, preview,
}: Props) {
  const slideAnim = useRef(new Animated.Value(120)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const hoverLift = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(faceDown ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      delay: index * 55,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, []);

  useEffect(() => {
    if (!faceDown) {
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 350,
        delay: index * 180,
        useNativeDriver: true,
      }).start();
    }
  }, [faceDown]);

  const handlePress = () => {
    if (disabled || !affordable) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.08, duration: 70, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
    ]).start(() => onPlay(card.instanceId));
  };

  const handleHoverIn = () => {
    if (disabled || !affordable) return;
    Animated.spring(hoverLift, {
      toValue: -45,
      useNativeDriver: true,
      tension: 200,
      friction: 12,
    }).start();
  };

  const handleHoverOut = () => {
    Animated.spring(hoverLift, {
      toValue: 0,
      useNativeDriver: true,
      tension: 200,
      friction: 12,
    }).start();
  };

  const rotateY = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['180deg', '90deg', '0deg'],
  });

  const combinedY = Animated.add(slideAnim, hoverLift);
  const isUnplayable = definition.isUnplayable;
  const borderColor = definition.upgraded
    ? '#ffd700'
    : isUnplayable
    ? '#555'
    : (CATEGORY_BORDER[definition.category] ?? COLORS.cardBorder);
  const bannerColor = isUnplayable ? '#1a1a1a' : (CATEGORY_BANNER[definition.category] ?? '#222');

  return (
    <Pressable
      onPress={handlePress}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      disabled={disabled || !affordable}
    >
      <Animated.View
        style={[
          styles.card,
          {
            borderColor,
            opacity: affordable ? 1 : 0.45,
            transform: [{ translateY: combinedY }, { scale: scaleAnim }, { rotateY }],
            shadowColor: borderColor,
          },
        ]}
      >
        {/* Top banner: cost + name + rarity dot */}
        <View style={[styles.banner, { backgroundColor: bannerColor }]}>
          <View style={[styles.costBadge, { backgroundColor: borderColor }]}>
            <Text style={styles.costText}>{definition.cost === -1 ? 'X' : definition.cost}</Text>
          </View>
          <Text style={styles.cardName} numberOfLines={1}>{definition.name}</Text>
          {definition.rarity && (
            <View style={[styles.rarityDot, { backgroundColor: RARITY_COLORS[definition.rarity] }]} />
          )}
        </View>

        {/* Art area */}
        <View style={styles.artArea}>
          <Text style={styles.artEmoji}>{CATEGORY_ART[definition.category]}</Text>
          {preview && (
            <View style={styles.previewRow}>
              {preview.damage !== undefined && (
                <View style={styles.previewBadgeDmg}>
                  <Text style={styles.previewText}>⚔️{preview.damage}</Text>
                </View>
              )}
              {preview.block !== undefined && (
                <View style={styles.previewBadgeBlock}>
                  <Text style={styles.previewText}>🛡️{preview.block}</Text>
                </View>
              )}
              {preview.heal !== undefined && (
                <View style={styles.previewBadgeHeal}>
                  <Text style={styles.previewText}>❤️{preview.heal}</Text>
                </View>
              )}
              {preview.draw !== undefined && (
                <View style={styles.previewBadgeDraw}>
                  <Text style={styles.previewText}>🃏+{preview.draw}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* Description */}
        <View style={styles.descArea}>
          <Text style={styles.descText} numberOfLines={3}>{definition.description}</Text>
        </View>

        {/* Type label + keywords */}
        <View style={[styles.typeBar, { borderTopColor: borderColor + '55' }]}>
          {isUnplayable ? (
            <Text style={styles.unplayableText}>UNPLAYABLE</Text>
          ) : (
            <View style={styles.typeRow}>
              <Text style={[styles.typeText, { color: borderColor }]}>
                {CATEGORY_TYPE_LABEL[definition.category]}
              </Text>
              {definition.innate && <Text style={styles.keywordBadge}>★</Text>}
              {definition.retain && <Text style={styles.keywordBadgeRetain}>↩</Text>}
              {definition.exhaust && <Text style={styles.keywordBadgeExhaust}>✖</Text>}
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD.width,
    height: CARD.height,
    backgroundColor: '#111827',
    borderRadius: CARD.borderRadius,
    borderWidth: 2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 6,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 7,
  },
  costBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    flexShrink: 0,
  },
  costText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  rarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  cardName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
    letterSpacing: 0.2,
  },
  artArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  artEmoji: { fontSize: 48 },
  previewRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  previewBadgeDmg: {
    backgroundColor: 'rgba(231,76,60,0.85)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  previewBadgeBlock: {
    backgroundColor: 'rgba(41,128,185,0.85)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  previewBadgeHeal: {
    backgroundColor: 'rgba(39,174,96,0.85)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  previewBadgeDraw: {
    backgroundColor: 'rgba(142,68,173,0.85)',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  previewText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  divider: { height: 1, marginHorizontal: 7, opacity: 0.45 },
  descArea: {
    paddingHorizontal: 7,
    paddingVertical: 6,
    minHeight: 52,
    justifyContent: 'center',
  },
  descText: {
    color: '#bbb',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  typeBar: {
    paddingVertical: 5,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  unplayableText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 1,
  },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  keywordBadge: { color: '#f9a825', fontSize: 11, fontWeight: 'bold' },
  keywordBadgeRetain: { color: '#80deea', fontSize: 11, fontWeight: 'bold' },
  keywordBadgeExhaust: { color: '#ff8f8f', fontSize: 11, fontWeight: 'bold' },
  typeText: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
