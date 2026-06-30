import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { loadIdentity, updateIdentity } from '../lib/identity';

const SETTINGS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'lock-closed-outline', label: 'Privacy' },
  { icon: 'shield-checkmark-outline', label: 'Account' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
  { icon: 'information-circle-outline', label: 'About' },
];

export default function ProfileScreen() {
  const [username, setUsername] = useState('your_name');
  const [editing, setEditing] = useState(false);
  const [tiktokConnected, setTiktokConnected] = useState(false);

  useEffect(() => {
    loadIdentity().then((id) => setUsername(id.username));
  }, []);

  function toggleEdit() {
    if (editing) {
      const clean = username.trim() || 'guest';
      setUsername(clean);
      updateIdentity({ username: clean });
    }
    setEditing((e) => !e);
  }

  const initial = username.trim().charAt(0).toUpperCase() || '?';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Profile</Text>

        {/* Profile picture */}
        <View style={styles.avatarWrap}>
          <TouchableOpacity style={styles.avatar} activeOpacity={0.85}>
            <Text style={styles.avatarInitial}>{initial}</Text>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={15} color="#111" />
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHint}>Tap to add a photo</Text>
        </View>

        {/* Username */}
        <Text style={styles.label}>Username</Text>
        <View style={styles.usernameRow}>
          <Text style={styles.at}>@</Text>
          <TextInput
            style={styles.usernameInput}
            value={username}
            onChangeText={(t) => setUsername(t.replace(/\s/g, ''))}
            editable={editing}
            placeholder="username"
            placeholderTextColor="#666"
            autoCapitalize="none"
            maxLength={20}
          />
          <TouchableOpacity onPress={toggleEdit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name={editing ? 'checkmark' : 'pencil'} size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Connect TikTok */}
        <TouchableOpacity
          style={[styles.tiktokBtn, tiktokConnected && styles.tiktokConnected]}
          onPress={() => setTiktokConnected((c) => !c)}
          activeOpacity={0.85}
        >
          <Ionicons name="musical-notes" size={18} color={tiktokConnected ? '#5cffb0' : '#fff'} />
          <Text style={[styles.tiktokText, tiktokConnected && { color: '#5cffb0' }]}>
            {tiktokConnected ? 'TikTok connected' : 'Connect TikTok'}
          </Text>
          {tiktokConnected && <Ionicons name="checkmark-circle" size={18} color="#5cffb0" />}
        </TouchableOpacity>

        {/* Settings */}
        <Text style={[styles.label, { marginTop: 28 }]}>Settings</Text>
        <View style={styles.settingsCard}>
          {SETTINGS.map((s, i) => (
            <TouchableOpacity
              key={s.label}
              style={[styles.settingRow, i < SETTINGS.length - 1 && styles.settingDivider]}
              activeOpacity={0.7}
            >
              <Ionicons name={s.icon} size={20} color="#cfcfcf" />
              <Text style={styles.settingLabel}>{s.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#555" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color="#ff3b5c" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111111' },
  scroll: { padding: 24, paddingBottom: 40 },
  heading: { color: '#fff', fontSize: 24, fontFamily: 'RussoOne_400Regular', marginTop: 8 },
  avatarWrap: { alignItems: 'center', marginTop: 20, marginBottom: 8 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#5c8aff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 40, fontWeight: '900' },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#111111',
  },
  photoHint: { color: '#777', fontSize: 13, marginTop: 10 },
  label: { color: '#cfcfcf', fontSize: 13, fontWeight: '700', marginTop: 22, marginBottom: 8 },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1c1c1c',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#333',
  },
  at: { color: '#777', fontSize: 16, fontWeight: '800' },
  usernameInput: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700', paddingVertical: 0 },
  tiktokBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 15,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#333',
  },
  tiktokConnected: { borderColor: '#5cffb0' },
  tiktokText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  settingsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2c2c2c',
    overflow: 'hidden',
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 16 },
  settingDivider: { borderBottomWidth: 1, borderBottomColor: '#242424' },
  settingLabel: { color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 26 },
  logoutText: { color: '#ff3b5c', fontSize: 15, fontWeight: '800' },
});
