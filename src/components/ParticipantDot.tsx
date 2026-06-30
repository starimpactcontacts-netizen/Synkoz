import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';

type Props = {
  initial: string;
  color: string;
  x: number;
  y: number;
  size: number;
  floatPhases: Animated.Value[];
  floatIndex: number;
  ampX: number;
  ampY: number;
  eliminated: boolean;
};

function ParticipantDot({ initial, color, x, y, size, floatPhases, floatIndex, ampX, ampY, eliminated }: Props) {
  const alive = useRef(new Animated.Value(1)).current;
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!eliminated) return;
    Animated.sequence([
      Animated.timing(flash, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(alive, { toValue: 0, duration: 260, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [eliminated, alive, flash]);

  const floatX = useMemo(
    () => floatPhases[floatIndex % floatPhases.length].interpolate({ inputRange: [0, 1], outputRange: [-ampX, ampX] }),
    [floatPhases, floatIndex, ampX],
  );
  const floatY = useMemo(
    () =>
      floatPhases[(floatIndex + 2) % floatPhases.length].interpolate({ inputRange: [0, 1], outputRange: [-ampY, ampY] }),
    [floatPhases, floatIndex, ampY],
  );

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dot,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: alive,
          transform: [{ translateX: floatX }, { translateY: floatY }, { scale: alive }],
        },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.46 }]} numberOfLines={1}>
        {initial}
      </Text>
      <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash, borderRadius: size / 2 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dot: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#000', fontWeight: '800' },
  flash: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff' },
});

export default React.memo(ParticipantDot);
