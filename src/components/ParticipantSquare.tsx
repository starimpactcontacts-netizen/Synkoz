import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Participant } from '../data/types';

const RED = '#ff2d55';

type Props = {
  participant: Participant;
  size: number;
  /** Currently swept by the roulette (turns the square red). */
  red?: boolean;
  /** The settled winner (red + white ring). */
  winner?: boolean;
  style?: any;
};

export default function ParticipantSquare({ participant, size, red, winner, style }: Props) {
  const isRed = red || winner;
  return (
    <View
      style={[
        styles.square,
        {
          width: size,
          height: size,
          backgroundColor: isRed ? RED : participant.avatarColor,
          borderColor: winner ? '#fff' : 'transparent',
          borderWidth: winner ? 3 : 0,
        },
        style,
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.45, color: isRed ? '#fff' : '#000' }]} numberOfLines={1}>
        {participant.username.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  square: {
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontWeight: '800',
  },
});
