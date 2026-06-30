import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  /** Creates the room (backend if available, else a local room) and opens it. */
  onSubmit: (title: string, prize: string) => Promise<void>;
};

export default function CreateRoomScreen({ onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [prize, setPrize] = useState('');
  const [busy, setBusy] = useState(false);

  const canCreate = title.trim().length > 0 && prize.trim().length > 0 && !busy;

  async function create() {
    if (!canCreate) return;
    setBusy(true);
    try {
      await onSubmit(title.trim(), prize.trim());
    } finally {
      setBusy(false);
    }
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

        <TouchableOpacity
          style={[styles.button, !canCreate && styles.buttonDisabled]}
          disabled={!canCreate}
          onPress={create}
          activeOpacity={0.85}
        >
          {busy ? (
            <ActivityIndicator color="#111" />
          ) : (
            <>
              <Ionicons name="rocket" size={18} color="#111" />
              <Text style={styles.buttonText}>Create room</Text>
            </>
          )}
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 26,
    paddingVertical: 16,
    marginTop: 28,
    minHeight: 54,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#111', fontWeight: '900', fontSize: 16 },
});
