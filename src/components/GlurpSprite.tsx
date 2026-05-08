import React, { useEffect, useRef } from 'react';
import { View, Image, Platform, Animated } from 'react-native';

const FRAME_W = 400;
const FRAME_H = 400;
const COLS = 4;
const ROWS = 20;
const SPRITE_COL = 0;
const SPRITE_ROW = 0;

const sheet = require('../../assets/glurp-spritesheet.png');

interface Props {
  size?: number;
}

export default function GlurpSprite({ size = 110 }: Props) {
  const bounce = useRef(new Animated.Value(0)).current;
  const scale = size / FRAME_W;
  const col = SPRITE_COL;
  const row = SPRITE_ROW;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -12, duration: 750, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bounce]);

  const imgW = FRAME_W * COLS * scale;
  const imgH = FRAME_H * ROWS * scale;
  const animatedStyle = { transform: [{ translateY: bounce }] };

  if (Platform.OS === 'web') {
    return (
      <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
        <View
          style={[
            { width: size, height: size },
            {
              backgroundImage: `url(${sheet})`,
              backgroundSize: `${imgW}px ${imgH}px`,
              backgroundPosition: `-${col * size}px -${row * size}px`,
              backgroundRepeat: 'no-repeat',
            } as any,
          ]}
        />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ width: size, height: size, overflow: 'hidden', position: 'relative' }, animatedStyle]}>
      <Image
        source={sheet}
        style={{
          width: imgW,
          height: imgH,
          position: 'absolute',
          left: -(col * size),
          top: -(row * size),
        }}
        resizeMode="stretch"
      />
    </Animated.View>
  );
}
