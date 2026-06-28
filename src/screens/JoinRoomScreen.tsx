import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  onBack: () => void;
  onJoin: (code: string) => void;
};

export default function JoinRoomScreen({ onBack, onJoin }: Props) {
  const [code, setCode] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Enter room code</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          placeholder="e.g. SYNK42"
          placeholderTextColor="#555"
          autoCapitalize="characters"
          maxLength={10}
        />
        <TouchableOpacity
          style={[styles.button, !code && styles.buttonDisabled]}
          disabled={!code}
          onPress={() => onJoin(code)}
        >
          <Text style={styles.buttonText}>Join Room</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111111' },
  header: { paddingHorizontal: 20, paddingTop: 16 },
  back: { color: '#fff', fontSize: 16 },
  body: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 16 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  input: {
    backgroundColor: '#1c1c1c',
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#000', fontWeight: '800', fontSize: 16 },
});
