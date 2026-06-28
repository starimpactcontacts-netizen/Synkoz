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
    <TouchableOpacity
      disabled={!canSpin || spinning}
      onPress={onPress}
      style={[styles.wrapper, { width: size, height: size }]}
    >
      <View style={styles.pointer} />
      <Animated.View
        style={[
          styles.dial,
          { width: size, height: size, borderRadius: size / 2, transform: [{ rotate: spin }] },
        ]}
      >
        <View style={styles.grid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <View key={i} style={styles.cell} />
          ))}
        </View>
      </Animated.View>
      <Text style={styles.label}>{spinning ? 'Spinning…' : canSpin ? 'Spin' : 'Waiting'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dial: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  grid: {
    width: '46%',
    height: '46%',
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
    top: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    zIndex: 2,
  },
  label: {
    position: 'absolute',
    color: '#000',
    fontWeight: '800',
    fontSize: 12,
  },
});
