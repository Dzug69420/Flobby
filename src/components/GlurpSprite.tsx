import React, { useEffect, useState } from 'react';
import { View, Image } from 'react-native';

const FRAME_W = 400;
const FRAME_H = 400;
const COLS = 4;
const ROWS = 20;
const TOTAL_FRAMES = COLS * ROWS; // 80

interface Props {
  size?: number;
}

export default function GlurpSprite({ size = 110 }: Props) {
  const [frame, setFrame] = useState(0);
  const scale = size / FRAME_W;

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % TOTAL_FRAMES), 80);
    return () => clearInterval(id);
  }, []);

  const col = frame % COLS;
  const row = Math.floor(frame / COLS);

  return (
    <View style={{ width: size, height: size, overflow: 'hidden' }}>
      <Image
        source={require('../../assets/glurp-spritesheet.png')}
        style={{
          width: FRAME_W * COLS * scale,
          height: FRAME_H * ROWS * scale,
          position: 'absolute',
          left: -col * FRAME_W * scale,
          top: -row * FRAME_H * scale,
        }}
        resizeMode="stretch"
      />
    </View>
  );
}
