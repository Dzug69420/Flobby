import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

interface Props {
  current: number;
  max: number;
  height?: number;
  showText?: boolean;
}

export default function HPBar({ current, max, height = 12, showText = true }: Props) {
  const widthAnim = useRef(new Animated.Value(current / max)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: current / max,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [current, max]);

  const ratio = current / max;
  const barColor = ratio > 0.5 ? COLORS.hpGreen : ratio > 0.25 ? COLORS.hpYellow : COLORS.hpLow;

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height }]}>
        <Animated.View style={[styles.fill, { width: widthInterpolated, backgroundColor: barColor, height }]} />
      </View>
      {showText && (
        <Text style={styles.label}>
          {current} / {max}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  track: {
    backgroundColor: '#333',
    borderRadius: 6,
    overflow: 'hidden',
    width: '100%',
  },
  fill: { borderRadius: 6 },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONTS.statLabel,
    textAlign: 'right',
    marginTop: 2,
  },
});
