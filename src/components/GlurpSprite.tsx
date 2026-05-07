import React, { useEffect, useState } from 'react';
import { View, Image } from 'react-native';

const FRAME_W = 400;
const FRAME_H = 400;
const COLS = 4;

interface Props {
  size?: number;
  row?: number;
}

export default function GlurpSprite({ size = 110, row = 0 }: Props) {
  const [col, setCol] = useState(0);
  const scale = size / FRAME_W;

  useEffect(() => {
    const id = setInterval(() => setCol((c) => (c + 1) % COLS), 160);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <Image
        source={require('../../assets/glurp-spritesheet.png')}
        style={{
          width: FRAME_W * COLS * scale,
          height: FRAME_H * 20 * scale,
          position: 'absolute',
          left: -col * FRAME_W * scale,
          top: -row * FRAME_H * scale,
        }}
        resizeMode="stretch"
      />
    </View>
  );
}
