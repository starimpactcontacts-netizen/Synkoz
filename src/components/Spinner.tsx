import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  size: number;
  spinning: boolean;
  canSpin: boolean;
  onPress: () => void;
};

export default function Spinner({ size, spinning, canSpin, onPress }: Props) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (spinning) {
      rotation.setValue(0);
      const loop = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 650,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      loop.start();
      return () => loop.stop();
    }
    rotation.stopAnimation();
  }, [spinning]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const iconSize = size * 0.5;

  return (
    <TouchableOpacity
      style={[styles.block, { width: size, height: size, borderRadius: size * 0.18 }]}
      disabled={!canSpin || spinning}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Ionicons name="sync" size={iconSize} color="#111" />
      </Animated.View>
      {!spinning && size >= 56 && <Text style={[styles.label, { fontSize: size * 0.16 }]}>SPIN</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#111',
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
  },
});
