import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { censor } from '../lib/profanity';

export type ChatMessage = {
  id: string;
  user: string;
  text: string;
  mine?: boolean;
};

type Props = {
  /** Controlled (backend) mode: messages come from the room subscription. */
  messages?: ChatMessage[];
  /** Backend send handler. Receives the already-moderated text. */
  onSend?: (text: string) => void;
};

const NAME_COLORS = ['#ff5c8a', '#5c8aff', '#5cffb0', '#ffd95c', '#c45cff', '#ff8a5c'];

function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return NAME_COLORS[h % NAME_COLORS.length];
}

const SEED: ChatMessage[] = [
  { id: 'm1', user: 'maya', text: 'good luck everyone 🍀' },
  { id: 'm2', user: 'deon', text: 'lets gooo' },
  { id: 'm3', user: 'ari', text: 'hope i win the airpods fr' },
];

export default function LiveChat({ messages, onSend }: Props) {
  const controlled = messages !== undefined;
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(SEED);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const shown = controlled ? (messages as ChatMessage[]) : localMessages;

  function send() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const clean = censor(trimmed); // moderation: mask profanity before posting
    if (controlled) {
      onSend?.(clean);
    } else {
      setLocalMessages((prev) => [...prev, { id: `me-${Date.now()}`, user: 'you', text: clean, mine: true }]);
    }
    setDraft('');
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <Ionicons name="chatbubbles" size={16} color="#fff" />
        <Text style={styles.title}>Live chat</Text>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {shown.length === 0 ? (
          <Text style={styles.emptyChat}>Be the first to say something 👋</Text>
        ) : (
          shown.map((m) => (
            <Text key={m.id} style={styles.message}>
              <Text style={[styles.user, { color: m.mine ? '#fff' : colorFor(m.user) }]}>{m.user}</Text>
              <Text style={styles.messageText}>  {m.text}</Text>
            </Text>
          ))
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Say something…"
          placeholderTextColor="#666"
          autoCorrect
          returnKeyType="send"
          onSubmitEditing={send}
          maxLength={200}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { opacity: draft.trim() ? 1 : 0.4 }]}
          onPress={send}
          disabled={!draft.trim()}
        >
          <Ionicons name="send" size={16} color="#111" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 28,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  title: { color: '#fff', fontSize: 16, fontWeight: '800' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ff3b5c', marginLeft: 4 },
  liveText: { color: '#ff3b5c', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  messages: {
    maxHeight: 220,
    backgroundColor: '#161616',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#242424',
  },
  messagesContent: { padding: 12, gap: 8 },
  emptyChat: { color: '#666', fontSize: 13, textAlign: 'center', paddingVertical: 14 },
  message: { fontSize: 14, lineHeight: 19 },
  user: { fontWeight: '800' },
  messageText: { color: '#e9e9e9' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#1c1c1c',
    borderRadius: 22,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
