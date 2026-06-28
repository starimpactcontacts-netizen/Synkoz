import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FEED_ROOMS } from '../data/mockRooms';
import { FeedRoom } from '../data/types';
import SynkozLogo from '../components/SynkozLogo';

type Props = {
  onSelectRoom: (room: FeedRoom) => void;
  onJoinByCode: () => void;
};

export default function FeedScreen({ onSelectRoom, onJoinByCode }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SynkozLogo size={20} />
        <TouchableOpacity style={styles.joinPill} onPress={onJoinByCode}>
          <Text style={styles.joinPillText}>Join with code</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={FEED_ROOMS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <RoomCard room={item} onPress={() => onSelectRoom(item)} />}
      />
    </SafeAreaView>
  );
}

function RoomCard({ room, onPress }: { room: FeedRoom; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.card, { borderColor: room.coverColor }]} onPress={onPress}>
      <Text style={styles.cardTitle}>{room.title}</Text>
      <Text style={styles.cardPrize}>🎁 {room.prize}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardHost}>{room.hostUsername}</Text>
        <Text style={styles.cardCount}>{room.participantCount} in room</Text>
      </View>
      <Text style={styles.cardCode}>Code: {room.code}</Text>
    </TouchableOpacity>
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
    paddingBottom: 8,
  },
  logo: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  joinPill: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinPillText: { color: '#000', fontWeight: '700', fontSize: 13 },
  list: { padding: 16, gap: 14 },
  card: {
    backgroundColor: '#1c1c1c',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    marginBottom: 14,
  },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  cardPrize: { color: '#fff', fontSize: 14, marginTop: 6 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  cardHost: { color: '#888', fontSize: 13 },
  cardCount: { color: '#888', fontSize: 13 },
  cardCode: { color: '#555', fontSize: 12, marginTop: 8 },
});
