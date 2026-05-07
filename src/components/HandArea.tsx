import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { CardInstance, CardDefinition } from '../types';
import CardComponent from './CardComponent';

interface Props {
  hand: CardInstance[];
  masterPool: Record<string, CardDefinition>;
  onPlay: (id: string) => void;
  disabled: boolean;
  playerEnergy: number;
}

export default function HandArea({ hand, masterPool, onPlay, disabled, playerEnergy }: Props) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hand.map((card, index) => {
          const def = masterPool[card.definitionId];
          if (!def) return null;
          return (
            <CardComponent
              key={card.instanceId}
              card={card}
              definition={def}
              onPlay={onPlay}
              disabled={disabled}
              affordable={playerEnergy >= def.cost}
              index={index}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingVertical: 8 },
  scrollContent: { paddingHorizontal: 8, alignItems: 'flex-end' },
});
