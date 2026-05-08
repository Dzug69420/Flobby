import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ALL_POTIONS } from '../data/potions';

interface Props {
  potions: string[];
  onUse: (potionId: string) => void;
  disabled?: boolean;
}

export default function PotionSlots({ potions, onUse, disabled }: Props) {
  const slots = [0, 1, 2];

  return (
    <View style={styles.row}>
      {slots.map((i) => {
        const potionId = potions[i];
        const def = potionId ? ALL_POTIONS[potionId] : null;
        return (
          <Pressable
            key={i}
            onPress={() => def && !disabled && onUse(potionId)}
            style={[
              styles.slot,
              def ? { backgroundColor: def.color + '33', borderColor: def.color } : styles.emptySlot,
            ]}
            disabled={!def || disabled}
          >
            {def ? (
              <Text style={styles.emoji}>{def.emoji}</Text>
            ) : (
              <Text style={styles.emptyDot}>·</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  slot: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlot: {
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  emoji: { fontSize: 18 },
  emptyDot: { color: 'rgba(255,255,255,0.2)', fontSize: 20 },
});
