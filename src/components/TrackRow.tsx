import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Track } from '../data/types';

export default function TrackRow({ track }: { track: Track }) {
  return (
    <View style={styles.row}>
      <Image source={{ uri: track.artwork }} style={styles.artwork} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.bpm}>{track.bpm} bpm</Text>
        <View style={styles.metaBottom}>
          <View style={styles.keyBadge}>
            <Text style={styles.keyText}>{track.key}</Text>
          </View>
          <Text style={styles.duration}>{track.duration}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '600',
  },
  artist: {
    color: '#9a9a9a',
    fontSize: 15,
    marginTop: 2,
  },
  meta: {
    alignItems: 'flex-end',
  },
  bpm: {
    color: '#fff',
    fontSize: 16,
  },
  metaBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  keyBadge: {
    backgroundColor: '#5fd0e0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  keyText: {
    color: '#06222a',
    fontWeight: '700',
    fontSize: 13,
  },
  duration: {
    color: '#fff',
    fontSize: 15,
  },
});
