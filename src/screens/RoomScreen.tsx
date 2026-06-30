import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import ParticipantSquare from '../components/ParticipantSquare';
import Spinner from '../components/Spinner';
import LiveChat, { ChatMessage } from '../components/LiveChat';
import { Participant, Room } from '../data/types';
import { Identity } from '../lib/identity';
import {
  fetchMessages,
  fetchParticipants,
  finishSpin,
  MessageRow,
  sendMessage,
  startSpin,
  subscribeToRoom,
} from '../lib/db';

const GRID_GAP = 4;
const MAX_RINGS = 4; // 3x3 -> 5x5 -> 7x7 -> 9x9 (up to 80 seats)
const MAX_GRID_WIDTH = 360;
const SPIN_DURATION = 5000; // ms the roulette runs before landing
const SPIN_LOOPS = 4; // how many times it sweeps everyone before slowing down

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Seats available when a square of `rings` concentric rings is completely full:
// the full (2n+1)x(2n+1) grid minus the single center spinner cell.
function seatsForRings(rings: number) {
  const dim = 2 * rings + 1;
  return dim * dim - 1;
}

// How many participant seats are actually shown for a given headcount.
function visibleSeats(total: number): number {
  let rings = 1;
  while (rings < MAX_RINGS && seatsForRings(rings) < total) rings++;
  return Math.min(total, seatsForRings(rings));
}

type Props = {
  room: Room;
  isHost: boolean;
  onBack: () => void;
  /** When present, the room is backed by Supabase (live multiplayer). */
  roomId?: string;
  identity?: Identity;
};

export default function RoomScreen({ room, isHost, onBack, roomId, identity }: Props) {
  const liveMode = Boolean(roomId && identity);

  const [spinning, setSpinning] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [liveParticipants, setLiveParticipants] = useState<Participant[]>(room.participants);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);

  const rafRef = useRef<number | null>(null);
  const animatingRef = useRef(false);
  const participants = liveMode ? liveParticipants : room.participants;
  const participantsRef = useRef(participants);
  participantsRef.current = participants;

  const { width: screenWidth } = useWindowDimensions();

  function toChat(row: MessageRow): ChatMessage {
    return { id: row.id, user: row.username, text: row.text, mine: row.user_id === identity?.userId };
  }

  // Decelerating roulette that lands on `winnerUserId` (shared across clients).
  function runRoulette(winnerUserId: string) {
    if (animatingRef.current) return;
    const parts = participantsRef.current;
    const n = visibleSeats(parts.length);
    const winnerIndex = parts.findIndex((p) => p.id === winnerUserId);
    if (n === 0 || winnerIndex < 0 || winnerIndex >= n) return;

    animatingRef.current = true;
    setWinnerId(null);
    setPosted(false);
    setSpinning(true);

    const distance = n * SPIN_LOOPS + winnerIndex;
    const start = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
    let lastStep = -1;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / SPIN_DURATION);
      const step = Math.floor(easeOutCubic(t) * distance);
      if (step !== lastStep) {
        lastStep = step;
        setActiveIndex(step % n);
      }
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setActiveIndex(winnerIndex);
        setWinnerId(winnerUserId);
        setSpinning(false);
        animatingRef.current = false;
        rafRef.current = null;
        if (liveMode && isHost && roomId) finishSpin(roomId).catch(() => {});
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }

  // Load + subscribe for live rooms.
  useEffect(() => {
    if (!roomId) return;
    let active = true;
    (async () => {
      try {
        const [parts, msgs] = await Promise.all([fetchParticipants(roomId), fetchMessages(roomId)]);
        if (!active) return;
        if (parts.length > 0) setLiveParticipants(parts);
        setLiveMessages(msgs.map(toChat));
      } catch {
        // keep whatever we have (initial mock/seed)
      }
    })();

    const unsub = subscribeToRoom(roomId, {
      onParticipantsChange: async () => {
        try {
          const parts = await fetchParticipants(roomId);
          if (active) setLiveParticipants(parts);
        } catch {}
      },
      onMessage: (row) =>
        setLiveMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, toChat(row)])),
      onRoomChange: (row) => {
        if (row.spinning && row.winner_id && !animatingRef.current) runRoulette(row.winner_id);
      },
    });

    return () => {
      active = false;
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const joined = participants.length;
  let rings = 1;
  while (rings < MAX_RINGS && seatsForRings(rings) < joined) rings++;
  const dim = 2 * rings + 1;
  const totalCells = dim * dim;
  const centerIndex = (totalCells - 1) / 2;
  const seatCount = totalCells - 1;

  const visible = participants.slice(0, seatCount);
  const overflow = joined - visible.length;

  const gridTargetWidth = Math.min(screenWidth - 40, MAX_GRID_WIDTH);
  const cellSize = Math.floor((gridTargetWidth - GRID_GAP * (dim - 1)) / dim);
  const gridWidth = cellSize * dim + GRID_GAP * (dim - 1);

  const winner = participants.find((p) => p.id === winnerId);

  function handleSpinPress() {
    if (spinning) return;
    const parts = participantsRef.current;
    const n = visibleSeats(parts.length);
    if (n === 0) return;
    const winnerIndex = Math.floor(Math.random() * n);
    const winnerUserId = parts[winnerIndex].id;

    if (liveMode && roomId) {
      // Broadcast the winner; every client (incl. host) animates to it.
      startSpin(roomId, winnerUserId).catch(() => {});
      runRoulette(winnerUserId);
    } else {
      runRoulette(winnerUserId);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} disabled={spinning}>
          <Text style={[styles.back, spinning && styles.backDisabled]}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.code}>#{room.code}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{room.title}</Text>
        <Text style={styles.prize}>🎁 {room.prize}</Text>
        <Text style={styles.count}>{joined} joined</Text>

        <View style={[styles.grid, { width: gridWidth }]}>
          {Array.from({ length: totalCells }).map((_, cellIndex) => {
            if (cellIndex === centerIndex) {
              return (
                <Spinner key="spinner" size={cellSize} spinning={spinning} canSpin={isHost} onPress={handleSpinPress} />
              );
            }
            const participantIndex = cellIndex < centerIndex ? cellIndex : cellIndex - 1;
            const p = visible[participantIndex];
            if (!p) {
              return (
                <View key={`empty-${cellIndex}`} style={[styles.emptySeat, { width: cellSize, height: cellSize }]} />
              );
            }
            return (
              <ParticipantSquare
                key={p.id}
                participant={p}
                size={cellSize}
                red={activeIndex === participantIndex}
                winner={!spinning && p.id === winnerId}
              />
            );
          })}
        </View>

        <Text style={styles.hint}>
          {spinning ? 'Spinning…' : isHost ? 'Tap the center block to spin' : 'Waiting for host to spin'}
        </Text>

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

        {liveMode ? (
          <LiveChat
            messages={liveMessages}
            onSend={(text) => {
              if (roomId && identity) sendMessage(identity, roomId, text).catch(() => {});
            }}
          />
        ) : (
          <LiveChat />
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
  backDisabled: { color: '#555' },
  code: { color: '#888', fontSize: 14, fontWeight: '700' },
  scroll: { alignItems: 'center', paddingBottom: 40 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 16, textAlign: 'center' },
  prize: { color: '#fff', fontSize: 16, marginTop: 6 },
  count: { color: '#888', fontSize: 13, marginTop: 4, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
  emptySeat: { backgroundColor: '#262626', borderRadius: 6 },
  hint: { color: '#666', fontSize: 13, marginTop: 18 },
  overflow: { color: '#888', fontSize: 13, marginTop: 6 },
  resultBanner: { marginTop: 28, alignItems: 'center', gap: 12 },
  resultText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  postButton: { backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24 },
  postButtonText: { color: '#000', fontWeight: '800' },
  postedText: { color: '#5cffb0', fontWeight: '700' },
});
