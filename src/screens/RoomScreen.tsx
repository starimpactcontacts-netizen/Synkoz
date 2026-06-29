import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import ParticipantSquare from '../components/ParticipantSquare';
import Spinner from '../components/Spinner';
import { Room } from '../data/types';

const GRID_GAP = 4;
const MAX_RINGS = 4; // 3x3 -> 5x5 -> 7x7 -> 9x9 (up to 80 seats)
const MAX_GRID_WIDTH = 360;

// Seats available when a square of `rings` concentric rings is completely full:
// the full (2n+1)x(2n+1) grid minus the single center spinner cell.
// rings 1..4 -> 8, 24, 48, 80 seats.
function seatsForRings(rings: number) {
  const dim = 2 * rings + 1;
  return dim * dim - 1;
}

type Props = {
  room: Room;
  isHost: boolean;
  onBack: () => void;
};

export default function RoomScreen({ room, isHost, onBack }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const { width: screenWidth } = useWindowDimensions();

  const joined = room.participants.length;

  // Grow the grid in square rings to the smallest square that seats everyone,
  // capped at MAX_RINGS. Anyone past the cap spills into the "+N more" line.
  let rings = 1;
  while (rings < MAX_RINGS && seatsForRings(rings) < joined) rings++;
  const dim = 2 * rings + 1;
  const totalCells = dim * dim;
  const centerIndex = (totalCells - 1) / 2;
  const seatCount = totalCells - 1;

  const visible = room.participants.slice(0, seatCount);
  const overflow = joined - visible.length;

  // Shrink the cells so the full square always fits the screen width.
  const gridTargetWidth = Math.min(screenWidth - 40, MAX_GRID_WIDTH);
  const cellSize = Math.floor((gridTargetWidth - GRID_GAP * (dim - 1)) / dim);
  const gridWidth = cellSize * dim + GRID_GAP * (dim - 1);

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

        <View style={[styles.grid, { width: gridWidth }]}>
          {Array.from({ length: totalCells }).map((_, cellIndex) => {
            if (cellIndex === centerIndex) {
              return (
                <Spinner
                  key="spinner"
                  size={cellSize}
                  spinning={spinning}
                  canSpin={isHost}
                  onPress={handleSpinPress}
                  onSpinComplete={handleSpinComplete}
                />
              );
            }
            const participantIndex = cellIndex < centerIndex ? cellIndex : cellIndex - 1;
            const p = visible[participantIndex];
            if (!p) {
              // Untaken seat: stays gray and empty.
              return (
                <View
                  key={`empty-${cellIndex}`}
                  style={[styles.emptySeat, { width: cellSize, height: cellSize }]}
                />
              );
            }
            return (
              <ParticipantSquare
                key={p.id}
                participant={p}
                size={cellSize}
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
  container: { flex: 1, backgroundColor: '#111111' },
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
  emptySeat: {
    backgroundColor: '#262626',
    borderRadius: 6,
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
