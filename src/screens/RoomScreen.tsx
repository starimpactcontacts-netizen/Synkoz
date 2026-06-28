import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ParticipantSquare from '../components/ParticipantSquare';
import Spinner from '../components/Spinner';
import { Room } from '../data/types';

const MAX_VISIBLE_SQUARES = 8;
const CELL_SIZE = 76;
const GRID_GAP = 4;
const CENTER_INDEX = 4;

type Props = {
  room: Room;
  isHost: boolean;
  onBack: () => void;
};

export default function RoomScreen({ room, isHost, onBack }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const visible = room.participants.slice(0, MAX_VISIBLE_SQUARES);
  const overflow = room.participants.length - visible.length;

  const winner = room.participants.find((p) => p.id === winnerId);

  function handleSpinPress() {
    if (spinning) return;
    setWinnerId(null);
    setPosted(false);
    setSpinning(true);
  }

  function handleSpinComplete() {
    setSpinning(false);
    const pick = room.participants[Math.floor(Math.random() * room.participants.length)];
    setWinnerId(pick.id);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.code}>#{room.code}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{room.title}</Text>
        <Text style={styles.prize}>🎁 {room.prize}</Text>
        <Text style={styles.count}>{room.participants.length} joined</Text>

        <View style={[styles.grid, { width: CELL_SIZE * 3 + GRID_GAP * 2 }]}>
          {Array.from({ length: 9 }).map((_, cellIndex) => {
            if (cellIndex === CENTER_INDEX) {
              return (
                <Spinner
                  key="spinner"
                  size={CELL_SIZE}
                  spinning={spinning}
                  canSpin={isHost}
                  onPress={handleSpinPress}
                  onSpinComplete={handleSpinComplete}
                />
              );
            }
            const participantIndex = cellIndex < CENTER_INDEX ? cellIndex : cellIndex - 1;
            const p = visible[participantIndex];
            if (!p) return <View key={`empty-${cellIndex}`} style={{ width: CELL_SIZE, height: CELL_SIZE }} />;
            return (
              <ParticipantSquare
                key={p.id}
                participant={p}
                size={CELL_SIZE}
                highlighted={p.id === winnerId}
              />
            );
          })}
        </View>

        <Text style={styles.hint}>{isHost ? 'Tap the center block to spin' : 'Waiting for host to spin'}</Text>

        {overflow > 0 && <Text style={styles.overflow}>+{overflow} more participants</Text>}

        {winner && (
          <View style={styles.resultBanner}>
            <Text style={styles.resultText}>🏆 Winner: {winner.username}</Text>
            {isHost && !posted && (
              <TouchableOpacity style={styles.postButton} onPress={() => setPosted(true)}>
                <Text style={styles.postButtonText}>Post Result</Text>
              </TouchableOpacity>
            )}
            {posted && <Text style={styles.postedText}>Posted to feed ✓</Text>}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  back: { color: '#fff', fontSize: 16 },
  code: { color: '#888', fontSize: 14, fontWeight: '700' },
  scroll: { alignItems: 'center', paddingBottom: 40 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 16, textAlign: 'center' },
  prize: { color: '#fff', fontSize: 16, marginTop: 6 },
  count: { color: '#888', fontSize: 13, marginTop: 4, marginBottom: 24 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  hint: { color: '#666', fontSize: 13, marginTop: 18 },
  overflow: { color: '#888', fontSize: 13, marginTop: 6 },
  resultBanner: { marginTop: 28, alignItems: 'center', gap: 12 },
  resultText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  postButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  postButtonText: { color: '#000', fontWeight: '800' },
  postedText: { color: '#5cffb0', fontWeight: '700' },
});
