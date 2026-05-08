import React, { useEffect, useState } from 'react';
import { View, Image } from 'react-native';

const FRAME_W = 320;
const FRAME_H = 320;
const COLS = 5;
const ROWS = 25;
const TOTAL_FRAMES = COLS * ROWS;
const FPS = 12;

const sheet = require('../../assets/spritesheet_transparent.png');

interface Props {
  size?: number;
}

export default function SlimeSprite({ size = 110 }: Props) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFrame(f => (f + 1) % TOTAL_FRAMES);
    }, 1000 / FPS);
    return () => clearInterval(id);
  }, []);

  const col = frame % COLS;
  const row = Math.floor(frame / COLS);
  const scale = size / FRAME_W;
  const imgW = FRAME_W * COLS * scale;
  const imgH = FRAME_H * ROWS * scale;

  return (
    <View style={{ width: size, height: size, overflow: 'hidden', position: 'relative' }}>
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
    </View>
  );
}
