import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';

type Props = {
  initial: string;
  color: string;
  x: number;
  y: number;
  size: number;
  eliminated: boolean;
  isMe: boolean;
};

// A single lobby tile: a filled rounded square with the player's initial.
// Locked in a grid (no ambient motion); only reacts when eliminated.
function ParticipantDot({ initial, color, x, y, size, eliminated, isMe }: Props) {
  const alive = useRef(new Animated.Value(1)).current;
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!eliminated) return;
    Animated.sequence([
      Animated.timing(flash, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(alive, { toValue: 0.12, duration: 280, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [eliminated, alive, flash]);

  const radius = Math.max(3, size * 0.18);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.tile,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: color,
          opacity: alive,
          transform: [{ scale: alive.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
        },
        isMe && { borderColor: '#fff', borderWidth: Math.max(2, size * 0.09) },
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.5 }]} numberOfLines={1}>
        {initial}
      </Text>
      <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flash, borderRadius: radius }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
  },
  initial: { color: '#000', fontWeight: '900' },
  flash: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff' },
});

export default React.memo(ParticipantDot);
