import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

interface Props {
  current: number;
  max: number;
  height?: number;
  showText?: boolean;
  showThreshold?: number;
}

export default function HPBar({ current, max, height = 12, showText = true, showThreshold }: Props) {
  const widthAnim = useRef(new Animated.Value(current / max)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: current / max,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [current, max]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const barColor = widthAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 1],
    outputRange: ['#e03030', '#e03030', '#f5a623', '#4caf50'],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height }]}>
        <Animated.View style={[styles.fill, { width: widthInterpolated, backgroundColor: barColor, height }]} />
        {showThreshold !== undefined && (
          <View style={[
            styles.threshold,
            { left: `${showThreshold * 100}%` as unknown as number, height },
          ]} />
        )}
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
  threshold: {
    position: 'absolute',
    top: 0,
    width: 2,
    backgroundColor: 'rgba(255,165,0,0.8)',
    borderRadius: 1,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONTS.statLabel,
    textAlign: 'right',
    marginTop: 2,
  },
});
