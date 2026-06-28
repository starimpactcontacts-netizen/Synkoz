import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import FeedScreen from './src/screens/FeedScreen';
import JoinRoomScreen from './src/screens/JoinRoomScreen';
import RoomScreen from './src/screens/RoomScreen';
import { MOCK_ROOM } from './src/data/mockRooms';
import { FeedRoom, Room } from './src/data/types';

type Screen = 'feed' | 'join' | 'room';

export default function App() {
  const [screen, setScreen] = useState<Screen>('feed');
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  function openRoomFromFeed(feedRoom: FeedRoom) {
    setActiveRoom({ ...MOCK_ROOM, id: feedRoom.id, code: feedRoom.code, title: feedRoom.title, prize: feedRoom.prize });
    setScreen('room');
  }

  function openRoomFromCode(code: string) {
    setActiveRoom({ ...MOCK_ROOM, code });
    setScreen('room');
  }

  return (
    <>
      {screen === 'feed' && (
        <FeedScreen onSelectRoom={openRoomFromFeed} onJoinByCode={() => setScreen('join')} />
      )}
      {screen === 'join' && (
        <JoinRoomScreen onBack={() => setScreen('feed')} onJoin={openRoomFromCode} />
      )}
      {screen === 'room' && activeRoom && (
        <RoomScreen room={activeRoom} isHost={true} onBack={() => setScreen('feed')} />
      )}
      <StatusBar style="light" />
    </>
  );
}
