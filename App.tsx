import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FeedScreen from './src/screens/FeedScreen';
import JoinRoomScreen from './src/screens/JoinRoomScreen';
import RoomScreen from './src/screens/RoomScreen';
import CreateRoomScreen from './src/screens/CreateRoomScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BottomNav, { Tab } from './src/components/BottomNav';
import { MOCK_ROOM } from './src/data/mockRooms';
import { FeedRoom, Room } from './src/data/types';

// Full-screen flows that take over from the tabbed shell (no navbar).
type Overlay =
  | { kind: 'room'; room: Room; isHost: boolean }
  | { kind: 'join' }
  | null;

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [overlay, setOverlay] = useState<Overlay>(null);

  function openRoomFromFeed(feedRoom: FeedRoom) {
    setOverlay({
      kind: 'room',
      isHost: false,
      room: { ...MOCK_ROOM, id: feedRoom.id, code: feedRoom.code, title: feedRoom.title, prize: feedRoom.prize },
    });
  }

  function openRoomFromCode(code: string) {
    setOverlay({ kind: 'room', isHost: false, room: { ...MOCK_ROOM, code } });
  }

  function openCreatedRoom(room: Room) {
    setOverlay({ kind: 'room', isHost: true, room });
  }

  if (overlay?.kind === 'room') {
    return (
      <>
        <RoomScreen room={overlay.room} isHost={overlay.isHost} onBack={() => setOverlay(null)} />
        <StatusBar style="light" />
      </>
    );
  }

  if (overlay?.kind === 'join') {
    return (
      <>
        <JoinRoomScreen onBack={() => setOverlay(null)} onJoin={openRoomFromCode} />
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
        {tab === 'create' && <CreateRoomScreen onCreate={openCreatedRoom} />}
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
