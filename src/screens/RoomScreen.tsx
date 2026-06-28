import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ParticipantSquare from '../components/ParticipantSquare';
import Spinner from '../components/Spinner';
import { Room } from '../data/types';

const MAX_VISIBLE_SQUARES = 9;
const SQUARE_SIZE = 64;
const SPINNER_SIZE = SQUARE_SIZE;
const GAP = 10;

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

  const ringSize = SPINNER_SIZE + GAP * 2 + SQUARE_SIZE;

  const positions = useMemo(() => {
    const n = visible.length;
    const base = Math.floor(n / 4);
    const remainder = n % 4;
    const counts = [0, 1, 2, 3].map((side) => base + (side < remainder ? 1 : 0));

    const points: { x: number; y: number }[] = [];
    counts.forEach((count, side) => {
      for (let k = 0; k < count; k++) {
        const frac = (k + 0.5) / count;
        const d = frac * ringSize;
        if (side === 0) points.push({ x: d, y: 0 });
        else if (side === 1) points.push({ x: ringSize, y: d });
        else if (side === 2) points.push({ x: ringSize - d, y: ringSize });
        else points.push({ x: 0, y: ringSize - d });
      }
    });

    return points.map(({ x, y }) => ({
      left: x - SQUARE_SIZE / 2,
      top: y - SQUARE_SIZE / 2,
    }));
  }, [visible.length, ringSize]);

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

        <View style={[styles.ring, { width: ringSize, height: ringSize }]}>
          {visible.map((p, i) => (
            <ParticipantSquare
              key={p.id}
              participant={p}
              size={SQUARE_SIZE}
              highlighted={p.id === winnerId}
              style={[styles.squarePos, positions[i]]}
            />
          ))}
          <View style={styles.spinnerCenter}>
            <Spinner
              size={SPINNER_SIZE}
              spinning={spinning}
              canSpin={isHost}
              onPress={handleSpinPress}
              onSpinComplete={handleSpinComplete}
            />
          </View>
        </View>

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
  ring: { position: 'relative' },
  squarePos: { position: 'absolute' },
  spinnerCenter: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -SPINNER_SIZE / 2,
    marginTop: -SPINNER_SIZE / 2,
  },
  overflow: { color: '#888', fontSize: 13, marginTop: 16 },
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
