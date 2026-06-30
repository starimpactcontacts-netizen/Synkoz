import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FEED_ROOMS } from '../data/mockRooms';
import { FeedRoom } from '../data/types';
import { listOpenRooms } from '../lib/db';
import SynkozLogo from '../components/SynkozLogo';

type Props = {
  onSelectRoom: (room: FeedRoom, live: boolean) => void;
  onJoinByCode: () => void;
};

function formatCount(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return (k >= 10 ? Math.round(k) : Math.round(k * 10) / 10) + 'K';
}

export default function FeedScreen({ onSelectRoom, onJoinByCode }: Props) {
  const [query, setQuery] = useState('');
  const [baseRooms, setBaseRooms] = useState<FeedRoom[]>(FEED_ROOMS);
  const [live, setLive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const rooms = await listOpenRooms();
      if (rooms && rooms.length > 0) {
        setBaseRooms(rooms);
        setLive(true);
        return;
      }
    } catch {
      // fall through to mock
    }
    setBaseRooms(FEED_ROOMS);
    setLive(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const rooms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return baseRooms;
    return baseRooms.filter((r) => r.code.toLowerCase().includes(q) || r.title.toLowerCase().includes(q));
  }, [query, baseRooms]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SynkozLogo size={20} />
        <TouchableOpacity style={styles.joinPill} onPress={onJoinByCode}>
          <Text style={styles.joinPillText}>Join with code</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#777" />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search room code"
          placeholderTextColor="#666"
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color="#777" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionLabel}>Open rooms</Text>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#888" />}
        renderItem={({ item }) => <RoomCard room={item} onPress={() => onSelectRoom(item, live)} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search" size={28} color="#444" />
            <Text style={styles.emptyText}>No rooms match “{query}”</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function RoomCard({ room, onPress }: { room: FeedRoom; onPress: () => void }) {
  const initial = room.hostUsername.replace('@', '').charAt(0).toUpperCase();
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.avatar, { backgroundColor: room.coverColor }]}>
        <Text style={styles.avatarInitial}>{initial}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {room.title}
        </Text>
        <Text style={styles.cardPrize} numberOfLines={1}>
          🎁 {room.prize}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.cardHost} numberOfLines={1}>
            {room.hostUsername}
          </Text>
          <View style={styles.countChip}>
            <Ionicons name="people" size={13} color="#cfcfcf" />
            <Text style={styles.countText}>{formatCount(room.participantCount)}</Text>
          </View>
        </View>
      </View>
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
  joinPill: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  joinPillText: { color: '#000', fontWeight: '700', fontSize: 13 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 6,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1c1c1c',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: 0.5, paddingVertical: 0 },
  sectionLabel: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 18, marginBottom: 4, paddingHorizontal: 20 },
  list: { padding: 16, paddingTop: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  avatar: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#111', fontSize: 24, fontWeight: '900' },
  cardBody: { flex: 1, justifyContent: 'center' },
  cardTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  cardPrize: { color: '#9a9a9a', fontSize: 13, marginTop: 3 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  cardHost: { color: '#777', fontSize: 13, flex: 1 },
  countChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#262626',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  countText: { color: '#e6e6e6', fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { color: '#666', fontSize: 14 },
});
