import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Participant, Room } from '../data/types';

type Props = {
  onCreate: (room: Room) => void;
};

const COLORS = ['#ff5c8a', '#5c8aff', '#5cffb0', '#ffd95c', '#c45cff', '#ff8a5c'];
const SEED_NAMES = ['leo', 'mia', 'zane', 'kira', 'theo', 'nova'];

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'SYNK';
  for (let i = 0; i < 2; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function seedParticipants(): Participant[] {
  return SEED_NAMES.map((name, i) => ({
    id: `p${i}`,
    username: name,
    avatarColor: COLORS[i % COLORS.length],
  }));
}

export default function CreateRoomScreen({ onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [prize, setPrize] = useState('');
  const code = useMemo(randomCode, []);

  const canCreate = title.trim().length > 0 && prize.trim().length > 0;

  function create() {
    if (!canCreate) return;
    onCreate({
      id: `room-${Date.now()}`,
      code,
      title: title.trim(),
      prize: prize.trim(),
      hostId: 'you',
      participants: seedParticipants(),
      status: 'waiting',
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Create a room</Text>
        <Text style={styles.sub}>Host a giveaway and spin for a winner.</Text>

        <Text style={styles.label}>Room title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Free AirPods Giveaway"
          placeholderTextColor="#666"
          maxLength={48}
        />

        <Text style={styles.label}>Prize</Text>
        <TextInput
          style={styles.input}
          value={prize}
          onChangeText={setPrize}
          placeholder="AirPods Pro 2"
          placeholderTextColor="#666"
          maxLength={48}
        />

        <View style={styles.codeChip}>
          <Ionicons name="key" size={15} color="#9a9a9a" />
          <Text style={styles.codeText}>Room code: {code}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, !canCreate && styles.buttonDisabled]}
          disabled={!canCreate}
          onPress={create}
          activeOpacity={0.85}
        >
          <Ionicons name="rocket" size={18} color="#111" />
          <Text style={styles.buttonText}>Create room</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111111' },
  scroll: { padding: 24, gap: 8 },
  heading: { color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 8 },
  sub: { color: '#888', fontSize: 14, marginBottom: 18 },
  label: { color: '#cfcfcf', fontSize: 13, fontWeight: '700', marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: '#1c1c1c',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  codeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#1c1c1c',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 22,
  },
  codeText: { color: '#cfcfcf', fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 26,
    paddingVertical: 16,
    marginTop: 28,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#111', fontWeight: '900', fontSize: 16 },
});
