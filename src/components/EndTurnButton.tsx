import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  onPress: () => void;
  disabled: boolean;
  turnNumber?: number;
  handSize?: number;
  energy?: number;
  maxEnergy?: number;
}

export default function EndTurnButton({ onPress, disabled, turnNumber = 1, handSize, energy, maxEnergy }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (disabled) {
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [disabled]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[styles.button, disabled && styles.buttonDisabled]}
        activeOpacity={0.75}
      >
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          End Turn
        </Text>
        {!disabled && handSize !== undefined && handSize > 0 && (
          <Text style={styles.subLabel}>{handSize} card{handSize !== 1 ? 's' : ''} in hand</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(20,20,35,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.accentGold,
    shadowColor: COLORS.accentGold,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.5,
    elevation: 5,
    minWidth: 90,
    alignItems: 'center',
  },
  buttonDisabled: {
    borderColor: '#444',
    shadowOpacity: 0,
    backgroundColor: 'rgba(20,20,35,0.6)',
  },
  label: {
    color: COLORS.accentGold,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  labelDisabled: { color: '#555' },
  subLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
