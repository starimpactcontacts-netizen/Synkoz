import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import CrowdStage from '../components/CrowdStage';
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

const STAGE_MAX_WIDTH = 380;

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
  const [spinToken, setSpinToken] = useState(0);
  const [pendingWinnerId, setPendingWinnerId] = useState<string | null>(null);

  const [liveParticipants, setLiveParticipants] = useState<Participant[]>(room.participants);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);

  const animatingRef = useRef(false);
  const participants = liveMode ? liveParticipants : room.participants;
  const participantsRef = useRef(participants);
  participantsRef.current = participants;

  const { width: screenWidth } = useWindowDimensions();

  function toChat(row: MessageRow): ChatMessage {
    return { id: row.id, user: row.username, text: row.text, mine: row.user_id === identity?.userId };
  }

  // Kicks off the cinematic elimination + duel sequence; shared by the host's
  // own tap and by viewers reacting to the broadcast winner.
  function runRoulette(winnerUserId: string) {
    if (animatingRef.current) return;
    if (!participantsRef.current.some((p) => p.id === winnerUserId)) return;

    animatingRef.current = true;
    setWinnerId(null);
    setPosted(false);
    setSpinning(true);
    setPendingWinnerId(winnerUserId);
    setSpinToken((t) => t + 1);
  }

  function handleSpinResolved(resolvedWinnerId: string) {
    setWinnerId(resolvedWinnerId);
    setSpinning(false);
    animatingRef.current = false;
    if (liveMode && isHost && roomId) finishSpin(roomId).catch(() => {});
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

  const stageWidth = Math.min(screenWidth - 40, STAGE_MAX_WIDTH);
  const winner = participants.find((p) => p.id === winnerId);

  function handleSpinPress() {
    if (spinning) return;
    const parts = participantsRef.current;
    if (parts.length === 0) return;
    const winnerUserId = parts[Math.floor(Math.random() * parts.length)].id;

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

        <CrowdStage
          participants={participants}
          isHost={isHost}
          width={stageWidth}
          spinToken={spinToken}
          triggerWinnerId={pendingWinnerId}
          spinSeed={roomId ?? room.code}
          onPressSpin={handleSpinPress}
          onResolved={handleSpinResolved}
        />

        {winner && !spinning && (
          <View style={styles.resultBanner}>
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
  prize: { color: '#fff', fontSize: 16, marginTop: 6, marginBottom: 18 },
  resultBanner: { marginTop: 22, alignItems: 'center', gap: 12 },
  postButton: { backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 24 },
  postButtonText: { color: '#000', fontWeight: '800' },
  postedText: { color: '#5cffb0', fontWeight: '700' },
});
