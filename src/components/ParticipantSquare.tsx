import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Participant } from '../data/types';

type Props = {
  participant: Participant;
  size: number;
  highlighted?: boolean;
  style?: any;
};

export default function ParticipantSquare({ participant, size, highlighted, style }: Props) {
  return (
    <View
      style={[
        styles.square,
        {
          width: size,
          height: size,
          backgroundColor: participant.avatarColor,
          borderColor: highlighted ? '#fff' : 'transparent',
          borderWidth: highlighted ? 3 : 0,
        },
        style,
      ]}
    >
      <Text style={[styles.initial, { fontSize: size * 0.45 }]} numberOfLines={1}>
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
    color: '#000',
    fontWeight: '800',
  },
});
