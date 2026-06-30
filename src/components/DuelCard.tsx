import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Participant } from '../data/types';

type Props = {
  participant: Participant | null;
  highlighted: boolean;
  won: boolean;
  size: number;
};

export default function DuelCard({ participant, highlighted, won, size }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (won) {
      Animated.spring(scale, { toValue: 1.14, friction: 5, useNativeDriver: true }).start();
      Animated.timing(glowOpacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    } else if (highlighted) {
      Animated.timing(glowOpacity, { toValue: 1, duration: 90, useNativeDriver: true }).start();
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.07, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(glowOpacity, { toValue: 0, duration: 120, useNativeDriver: true }).start();
    }
  }, [highlighted, won, scale, glowOpacity]);

  if (!participant) return null;
  const glowColor = won ? '#ffd95c' : '#ff2d55';

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }] }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            width: size * 1.3,
            height: size * 1.5,
            borderRadius: 10,
            backgroundColor: glowColor,
            opacity: glowOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] }),
          },
        ]}
      />
      <View
        style={[
          styles.card,
          { width: size, height: size * 1.2, borderRadius: 8, borderColor: highlighted || won ? glowColor : '#333' },
        ]}
      >
        <View
          style={[
            styles.avatar,
            { width: size * 0.54, height: size * 0.54, borderRadius: size * 0.27, backgroundColor: participant.avatarColor },
          ]}
        >
          <Text style={[styles.initial, { fontSize: size * 0.24 }]}>{participant.username.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={[styles.name, { fontSize: size * 0.13 }]} numberOfLines={1}>
          {participant.username}
        </Text>
        {won && <Text style={styles.crown}>👑 WINNER</Text>}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute' },
  card: {
    backgroundColor: '#16161a',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#000', fontWeight: '900' },
  name: { color: '#fff', fontWeight: '800' },
  crown: { color: '#ffd95c', fontFamily: 'RussoOne_400Regular', fontSize: 13, marginTop: 2, letterSpacing: 0.5 },
});
