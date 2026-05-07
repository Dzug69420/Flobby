import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { CardDefinition, CardInstance } from '../types';
import { COLORS, FONTS, CARD } from '../constants/theme';

interface Props {
  card: CardInstance;
  definition: CardDefinition;
  onPlay: (id: string) => void;
  disabled: boolean;
  affordable: boolean;
  index: number;
  faceDown?: boolean;
}

const CATEGORY_EMOJI: Record<string, string> = {
  attack: '⚔️',
  defense: '🛡️',
  combo: '⚡',
  status: '✨',
};

const CATEGORY_COLOR: Record<string, string> = {
  attack: '#e74c3c',
  defense: '#4fc3f7',
  combo: '#f5a623',
  status: '#9b59b6',
};

export default function CardComponent({ card, definition, onPlay, disabled, affordable, index, faceDown = false }: Props) {
  const slideAnim = useRef(new Animated.Value(120)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flipAnim = useRef(new Animated.Value(faceDown ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      delay: index * 60,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, []);

  useEffect(() => {
    if (!faceDown) {
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 250,
        useNativeDriver: true,
      }).start();
    }
  }, [faceDown]);

  const handlePress = () => {
    if (disabled || !affordable) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.12, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => onPlay(card.instanceId));
  };

  const rotateY = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['180deg', '90deg', '0deg'],
  });

  const cardOpacity = !affordable ? 0.4 : 1;
  const borderColor = CATEGORY_COLOR[definition.category] ?? COLORS.cardBorder;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} disabled={disabled || !affordable}>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }, { rotateY }],
            opacity: cardOpacity,
            borderColor,
          },
        ]}
      >
        {/* Cost pip */}
        <View style={[styles.costBadge, { backgroundColor: borderColor }]}>
          <Text style={styles.costText}>{definition.cost}</Text>
        </View>

        <Text style={styles.name} numberOfLines={2}>{definition.name}</Text>
        <Text style={styles.emoji}>{CATEGORY_EMOJI[definition.category]}</Text>
        <Text style={styles.desc} numberOfLines={3}>{definition.description}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD.width,
    height: CARD.height,
    backgroundColor: COLORS.surface,
    borderRadius: CARD.borderRadius,
    borderWidth: 2,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  costBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  costText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  name: {
    color: COLORS.textPrimary,
    fontSize: FONTS.cardName,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  emoji: { fontSize: 26 },
  desc: {
    color: COLORS.textSecondary,
    fontSize: FONTS.cardDesc,
    textAlign: 'center',
  },
});
