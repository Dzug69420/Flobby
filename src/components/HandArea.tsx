import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CardInstance, CardDefinition, CombatContext } from '../types';
import CardComponent from './CardComponent';
import { computeCardPreview } from '../utils/gameLogic';

interface Props {
  hand: CardInstance[];
  masterPool: Record<string, CardDefinition>;
  onPlay: (id: string) => void;
  disabled: boolean;
  playerEnergy: number;
  combatCtx?: CombatContext;
}

const MAX_ROTATION = 12;
const MAX_DROP_PX = 16;
const CARD_OVERLAP = -18;

export default function HandArea({ hand, masterPool, onPlay, disabled, playerEnergy, combatCtx }: Props) {
  const count = hand.length;

  return (
    <View style={styles.container}>
      <View style={[styles.fanRow, { paddingTop: MAX_DROP_PX + 8 }]}>
        {hand.map((card, index) => {
          const def = masterPool[card.definitionId];
          if (!def) return null;

          const midIndex = (count - 1) / 2;
          const offset = index - midIndex;
          const normalized = count > 1 ? offset / midIndex : 0;

          const rotation = normalized * MAX_ROTATION;
          const translateY = Math.abs(normalized) * MAX_DROP_PX;
          const zIndex = count - Math.round(Math.abs(offset));

          return (
            <View
              key={card.instanceId}
              style={[
                styles.cardWrapper,
                {
                  transform: [{ rotate: `${rotation}deg` }, { translateY }],
                  zIndex,
                  marginHorizontal: CARD_OVERLAP / 2,
                },
              ]}
            >
              <CardComponent
                card={card}
                definition={def}
                onPlay={onPlay}
                disabled={disabled}
                affordable={!def.isUnplayable && playerEnergy >= def.cost}
                index={index}
                preview={combatCtx ? computeCardPreview(def, combatCtx) : undefined}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  fanRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'visible',
  },
  cardWrapper: {
    overflow: 'visible',
  },
});
