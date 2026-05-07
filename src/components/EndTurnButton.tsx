import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

interface Props {
  onPress: () => void;
  disabled: boolean;
}

export default function EndTurnButton({ onPress, disabled }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (disabled) {
      pulseAnim.setValue(1);
    }
  }, [disabled]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[styles.button, disabled && styles.buttonDisabled]}
        activeOpacity={0.8}
      >
        <Text style={[styles.label, disabled && styles.labelDisabled]}>END TURN</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: COLORS.accentGold,
    shadowRadius: 8,
    shadowOpacity: 0.5,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#555',
    shadowOpacity: 0,
  },
  label: {
    color: '#000',
    fontSize: FONTS.button,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  labelDisabled: { color: '#888' },
});
