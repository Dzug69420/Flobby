import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  stageNumber: number;
}

const styles = StyleSheet.create({
  cloud: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20 },
  ground: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 55 },
  stalactite: { position: 'absolute', width: 16, backgroundColor: '#4a6fa5', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  raindrop: { position: 'absolute', width: 4, height: 10, backgroundColor: '#74b9ff', borderRadius: 2 },
  tree: { position: 'absolute', width: 14, backgroundColor: '#1a4a1a', borderRadius: 2 },
  moon: { position: 'absolute', width: 40, height: 40, backgroundColor: '#f0e68c', borderRadius: 20 },
  dune: { position: 'absolute', backgroundColor: '#d4a96a', borderRadius: 100 },
  cactus: { position: 'absolute', width: 14, height: 50, backgroundColor: '#27ae60', borderRadius: 4 },
  lavaPool: { position: 'absolute', backgroundColor: '#e74c3c', borderRadius: 30, opacity: 0.8 },
  ember: { position: 'absolute', width: 8, height: 8, backgroundColor: '#f39c12', borderRadius: 4, opacity: 0.7 },
  mushroom: { position: 'absolute', width: 40, height: 30, backgroundColor: '#e91e8c', borderRadius: 20, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  sparkle: { position: 'absolute', width: 6, height: 6, backgroundColor: '#fff', borderRadius: 3, opacity: 0.6 },
  ruinWall: { position: 'absolute', width: 55, backgroundColor: '#555', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  flame: { position: 'absolute', width: 20, height: 40, backgroundColor: '#f39c12', borderRadius: 10, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, opacity: 0.85 },
  brick: { position: 'absolute', width: 70, height: 14, backgroundColor: '#444', borderRadius: 2, borderWidth: 1, borderColor: '#222' },
  star: { position: 'absolute', width: 3, height: 3, backgroundColor: '#fff', borderRadius: 2, opacity: 0.8 },
  wisp: { position: 'absolute', width: 30, height: 20, backgroundColor: 'rgba(150,0,255,0.25)', borderRadius: 15 },
  mountain: { position: 'absolute', backgroundColor: '#1a0000', borderTopLeftRadius: 80, borderTopRightRadius: 80 },
  lavaCrack: { position: 'absolute', height: 2, backgroundColor: '#e74c3c', opacity: 0.8 },
  pillar: { position: 'absolute', width: 30, backgroundColor: '#4a3800', borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  spotlight: { position: 'absolute', alignSelf: 'center', width: 140, height: 140, backgroundColor: 'rgba(255,215,0,0.06)', borderRadius: 70 },
  goldParticle: { position: 'absolute', width: 6, height: 6, backgroundColor: '#ffd700', borderRadius: 3, opacity: 0.5 },
});

const backgrounds: Record<number, { colors: [string, string]; elements: React.ReactNode }> = {
  1: {
    colors: ['#b8e994', '#f9ca24'],
    elements: (
      <>
        <View style={[styles.cloud, { top: 40, left: 30, width: 80, height: 30 }]} />
        <View style={[styles.cloud, { top: 60, left: 140, width: 60, height: 22 }]} />
        <View style={[styles.cloud, { top: 35, right: 40, width: 70, height: 26 }]} />
        <View style={[styles.ground, { backgroundColor: '#27ae60' }]} />
      </>
    ),
  },
  2: {
    colors: ['#2c3e50', '#4a6fa5'],
    elements: (
      <>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={[styles.stalactite, { left: 20 + i * 55, top: 0, height: 30 + (i % 3) * 15 }]} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.raindrop, { left: 40 + i * 70, top: 80 + (i % 2) * 40 }]} />
        ))}
        <View style={[styles.ground, { backgroundColor: '#1a252f' }]} />
      </>
    ),
  },
  3: {
    colors: ['#1e3c1e', '#0a0a0a'],
    elements: (
      <>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={[styles.tree, { left: i * 60 - 10, bottom: 60, height: 60 + (i % 3) * 20 }]} />
        ))}
        <View style={[styles.moon, { top: 40, right: 40 }]} />
        <View style={[styles.ground, { backgroundColor: '#0d1f0d' }]} />
      </>
    ),
  },
  4: {
    colors: ['#f5cba7', '#e67e22'],
    elements: (
      <>
        <View style={[styles.dune, { bottom: 55, left: -30, width: 200, height: 60 }]} />
        <View style={[styles.dune, { bottom: 50, right: -20, width: 180, height: 50 }]} />
        <View style={[styles.cactus, { bottom: 60, left: 60 }]} />
        <View style={[styles.cactus, { bottom: 60, right: 80 }]} />
        <View style={[styles.ground, { backgroundColor: '#d4a96a' }]} />
      </>
    ),
  },
  5: {
    colors: ['#4a0000', '#1a0000'],
    elements: (
      <>
        <View style={[styles.lavaPool, { bottom: 60, left: 10, width: 100, height: 20 }]} />
        <View style={[styles.lavaPool, { bottom: 65, right: 20, width: 80, height: 15 }]} />
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.ember, { bottom: 80 + i * 30, left: 30 + i * 70 }]} />
        ))}
        <View style={[styles.ground, { backgroundColor: '#2d0000' }]} />
      </>
    ),
  },
  6: {
    colors: ['#2d004f', '#e91e8c'],
    elements: (
      <>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.mushroom, { bottom: 60, left: 20 + i * 110 }]} />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.sparkle, { top: 60 + i * 40, left: 20 + i * 65 }]} />
        ))}
        <View style={[styles.ground, { backgroundColor: '#1a002e' }]} />
      </>
    ),
  },
  7: {
    colors: ['#7f1900', '#0d0000'],
    elements: (
      <>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.ruinWall, { bottom: 60, left: i * 80 - 10, height: 50 + (i % 2) * 30 }]} />
        ))}
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.flame, { bottom: 60, left: 40 + i * 110 }]} />
        ))}
        <View style={[styles.ground, { backgroundColor: '#3d0000' }]} />
      </>
    ),
  },
  8: {
    colors: ['#2c2c2c', '#111111'],
    elements: (
      <>
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <View
              key={`${row}-${col}`}
              style={[styles.brick, { bottom: 60 + row * 18, left: col * 80 + (row % 2) * 40 - 20 }]}
            />
          ))
        )}
        <View style={[styles.ground, { backgroundColor: '#1a1a1a' }]} />
      </>
    ),
  },
  9: {
    colors: ['#050005', '#1a0030'],
    elements: (
      <>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <View key={i} style={[styles.star, { top: 30 + (i * 47) % 120, left: 10 + (i * 83) % 300 }]} />
        ))}
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.wisp, { top: 80 + i * 60, left: 30 + i * 100 }]} />
        ))}
        <View style={[styles.ground, { backgroundColor: '#0a000f' }]} />
      </>
    ),
  },
  10: {
    colors: ['#0a0000', '#3d0000'],
    elements: (
      <>
        <View style={[styles.mountain, { bottom: 60, left: -20, width: 160, height: 90 }]} />
        <View style={[styles.mountain, { bottom: 60, right: -10, width: 130, height: 70 }]} />
        <View style={[styles.lavaCrack, { bottom: 62, left: 50, width: 80 }]} />
        <View style={[styles.lavaCrack, { bottom: 62, right: 60, width: 60 }]} />
        <View style={[styles.ground, { backgroundColor: '#1a0000' }]} />
      </>
    ),
  },
  11: {
    colors: ['#000000', '#2d2000'],
    elements: (
      <>
        <View style={[styles.pillar, { bottom: 55, left: 10, height: 160 }]} />
        <View style={[styles.pillar, { bottom: 55, right: 10, height: 160 }]} />
        <View style={[styles.spotlight, { top: 30 }]} />
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.goldParticle, { top: 40 + (i * 53) % 150, left: 30 + (i * 67) % 280 }]} />
        ))}
        <View style={[styles.ground, { backgroundColor: '#1a1200' }]} />
      </>
    ),
  },
};

export default function StageBackground({ stageNumber }: Props) {
  const bg = backgrounds[stageNumber] ?? backgrounds[1];
  return (
    <LinearGradient colors={bg.colors} style={StyleSheet.absoluteFillObject}>
      {bg.elements}
    </LinearGradient>
  );
}
