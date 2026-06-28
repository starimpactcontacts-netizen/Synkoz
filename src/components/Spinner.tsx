import React, { useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  size: number;
  spinning: boolean;
  onSpinComplete: () => void;
  canSpin: boolean;
  onPress: () => void;
};

export default function Spinner({ size, spinning, onSpinComplete, canSpin, onPress }: Props) {
  const rotation = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (spinning) {
      rotation.setValue(0);
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => onSpinComplete());
    }
  }, [spinning]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${360 * 5 + Math.floor(Math.random() * 360)}deg`],
  });

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        disabled={!canSpin || spinning}
        onPress={onPress}
        style={[styles.dialWrapper, { width: size, height: size }]}
      >
        <View style={styles.pointer} />
        <Animated.View
          style={[
            styles.dial,
            { width: size, height: size, borderRadius: size * 0.18, transform: [{ rotate: spin }] },
          ]}
        >
          <View style={styles.grid}>
            {Array.from({ length: 9 }).map((_, i) => (
              <View key={i} style={styles.cell} />
            ))}
          </View>
        </Animated.View>
      </TouchableOpacity>
      <Text style={styles.label}>{spinning ? 'Spinning…' : canSpin ? 'Tap to Spin' : 'Waiting for host'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 10,
  },
  dialWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dial: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    width: '54%',
    height: '54%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '33.33%',
    height: '33.33%',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
  },
  pointer: {
    position: 'absolute',
    top: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    zIndex: 2,
  },
  label: {
    color: '#888',
    fontSize: 13,
    fontWeight: '700',
  },
});
