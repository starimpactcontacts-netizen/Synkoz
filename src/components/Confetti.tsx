import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { mulberry32 } from '../utils/rng';

const COLORS = ['#ff5c8a', '#5c8aff', '#5cffb0', '#ffd95c', '#c45cff', '#ff8a5c', '#ffffff'];
const COUNT = 28;

type Piece = { dx: number; dy: number; rotate: number; size: number; color: string };

type Props = { active: boolean; seed: number };

export default function Confetti({ active, seed }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  const pieces = useMemo<Piece[]>(() => {
    const rand = mulberry32(seed);
    return Array.from({ length: COUNT }, () => {
      const angle = rand() * Math.PI * 2;
      const distance = 70 + rand() * 140;
      return {
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance * 0.6 + 140,
        rotate: (rand() - 0.5) * 720,
        size: 5 + rand() * 6,
        color: COLORS[Math.floor(rand() * COLORS.length)],
      };
    });
  }, [seed]);

  useEffect(() => {
    if (!active) return;
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [active, seed, progress]);

  if (!active) return null;

  return (
    <>
      {pieces.map((p, i) => {
        const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] });
        const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, p.dy] });
        const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rotate}deg`] });
        const opacity = progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={[
              styles.piece,
              {
                width: p.size,
                height: p.size * 1.6,
                backgroundColor: p.color,
                opacity,
                transform: [{ translateX }, { translateY }, { rotate }],
              },
            ]}
          />
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', left: '50%', top: '34%', borderRadius: 2 },
});
