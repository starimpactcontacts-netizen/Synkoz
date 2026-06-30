import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFonts, RussoOne_400Regular } from '@expo-google-fonts/russo-one';
import FeedScreen from './src/screens/FeedScreen';
import JoinRoomScreen from './src/screens/JoinRoomScreen';
import RoomScreen from './src/screens/RoomScreen';
import CreateRoomScreen from './src/screens/CreateRoomScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BottomNav, { Tab } from './src/components/BottomNav';
import { makeParticipants, MOCK_ROOM } from './src/data/mockRooms';
import { FeedRoom, Participant, Room } from './src/data/types';
import { Identity, loadIdentity } from './src/lib/identity';
import { createRoom, fetchParticipants, getRoom, getRoomByCode, joinRoom, roomRowToRoom } from './src/lib/db';

type Overlay =
  | { kind: 'room'; room: Room; isHost: boolean; roomId?: string; identity?: Identity }
  | { kind: 'join' }
  | null;

const MOCK_COLORS = ['#ff5c8a', '#5c8aff', '#5cffb0', '#ffd95c', '#c45cff', '#ff8a5c'];

// Used only when the backend is unreachable, so a created/joined room still works.
function seedMockParticipants(): Participant[] {
  return ['leo', 'mia', 'zane', 'kira', 'theo', 'nova'].map((n, i) => ({
    id: `p${i}`,
    username: n,
    avatarColor: MOCK_COLORS[i % MOCK_COLORS.length],
  }));
}

function localCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'SYNK';
  for (let i = 0; i < 2; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [fontsLoaded] = useFonts({ RussoOne_400Regular });

  if (!fontsLoaded) return <View style={styles.app} />;

  async function openRoomFromFeed(feedRoom: FeedRoom, live: boolean) {
    if (live) {
      try {
        const id = await loadIdentity();
        await joinRoom(id, feedRoom.id);
        const [row, parts] = await Promise.all([getRoom(feedRoom.id), fetchParticipants(feedRoom.id)]);
        if (row) {
          setOverlay({
            kind: 'room',
            isHost: row.host_id === id.userId,
            roomId: feedRoom.id,
            identity: id,
            room: roomRowToRoom(row, parts),
          });
          return;
        }
      } catch {
        // fall through to mock
      }
    }
    setOverlay({
      kind: 'room',
      isHost: false,
      room: {
        ...MOCK_ROOM,
        id: feedRoom.id,
        code: feedRoom.code,
        title: feedRoom.title,
        prize: feedRoom.prize,
        participants: makeParticipants(feedRoom.participantCount),
      },
    });
  }

  async function createAndOpenRoom(title: string, prize: string) {
    try {
      const id = await loadIdentity();
      const row = await createRoom(id, title, prize);
      const parts = await fetchParticipants(row.id);
      const participants = parts.length
        ? parts
        : [{ id: id.userId, username: id.username, avatarColor: id.avatarColor }];
      setOverlay({ kind: 'room', isHost: true, roomId: row.id, identity: id, room: roomRowToRoom(row, participants) });
      return;
    } catch {
      // backend unreachable -> local room
    }
    setOverlay({
      kind: 'room',
      isHost: true,
      room: {
        id: `room-${Date.now()}`,
        code: localCode(),
        title,
        prize,
        hostId: 'you',
        participants: seedMockParticipants(),
        status: 'waiting',
      },
    });
  }

  async function openRoomByCode(code: string) {
    try {
      const id = await loadIdentity();
      const row = await getRoomByCode(code);
      if (row) {
        await joinRoom(id, row.id);
        const parts = await fetchParticipants(row.id);
        setOverlay({
          kind: 'room',
          isHost: row.host_id === id.userId,
          roomId: row.id,
          identity: id,
          room: roomRowToRoom(row, parts),
        });
        return;
      }
    } catch {
      // fall through to mock
    }
    setOverlay({ kind: 'room', isHost: false, room: { ...MOCK_ROOM, code } });
  }

  if (overlay?.kind === 'room') {
    return (
      <>
        <RoomScreen
          room={overlay.room}
          isHost={overlay.isHost}
          roomId={overlay.roomId}
          identity={overlay.identity}
          onBack={() => setOverlay(null)}
        />
        <StatusBar style="light" />
      </>
    );
  }

  if (overlay?.kind === 'join') {
    return (
      <>
        <JoinRoomScreen onBack={() => setOverlay(null)} onJoin={openRoomByCode} />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <View style={styles.app}>
      <View style={styles.screen}>
        {tab === 'home' && (
          <FeedScreen onSelectRoom={openRoomFromFeed} onJoinByCode={() => setOverlay({ kind: 'join' })} />
        )}
        {tab === 'create' && <CreateRoomScreen onSubmit={createAndOpenRoom} />}
        {tab === 'profile' && <ProfileScreen />}
      </View>

      <BottomNav active={tab} onChange={setTab} />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#111111' },
  screen: { flex: 1 },
});
