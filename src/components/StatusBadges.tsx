import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusEffect, StatusEffectType } from '../types';

interface Props {
  statuses: StatusEffect[];
}

interface StatusMeta {
  icon: string;
  color: string;
  bg: string;
  label: string;
}

const STATUS_META: Record<StatusEffectType, StatusMeta> = {
  vulnerable: { icon: '💢', color: '#ff8f8f', bg: 'rgba(180,30,30,0.75)', label: 'Vuln' },
  weak:       { icon: '🌀', color: '#ce93d8', bg: 'rgba(120,30,160,0.75)', label: 'Weak' },
  frail:      { icon: '💨', color: '#b0bec5', bg: 'rgba(60,60,80,0.75)',   label: 'Frail' },
  poison:     { icon: '☠️',  color: '#a5d6a7', bg: 'rgba(30,100,40,0.75)', label: 'Poison' },
  strength:   { icon: '💪', color: '#ffb74d', bg: 'rgba(140,70,0,0.75)',   label: 'Str' },
  dexterity:  { icon: '🦋', color: '#80deea', bg: 'rgba(0,100,120,0.75)', label: 'Dex' },
  metallicize:{ icon: '⚙️',  color: '#cfd8dc', bg: 'rgba(60,60,70,0.75)',  label: 'Metal' },
  ritual:     { icon: '🔮', color: '#f48fb1', bg: 'rgba(120,0,80,0.75)',   label: 'Ritual' },
};

export default function StatusBadges({ statuses }: Props) {
  if (!statuses || statuses.length === 0) return null;

  return (
    <View style={styles.row}>
      {statuses.map((s) => {
        const meta = STATUS_META[s.type];
        if (!meta) return null;
        return (
          <View key={s.type} style={[styles.badge, { backgroundColor: meta.bg }]}>
            <Text style={styles.icon}>{meta.icon}</Text>
            <Text style={[styles.stacks, { color: meta.color }]}>{s.stacks}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  icon: { fontSize: 11 },
  stacks: { fontSize: 12, fontWeight: 'bold' },
});
