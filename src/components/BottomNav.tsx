import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type Tab = 'home' | 'create' | 'profile';

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

export default function BottomNav({ active, onChange }: Props) {
  return (
    <View style={styles.bar}>
      <SideTab icon="home" label="Home" active={active === 'home'} onPress={() => onChange('home')} />

      <TouchableOpacity style={styles.tab} onPress={() => onChange('create')} activeOpacity={0.7}>
        <View style={[styles.createBtn, active === 'create' && styles.createBtnActive]}>
          <Ionicons name="add" size={22} color="#111" />
        </View>
        <Text style={[styles.label, active === 'create' && styles.labelActive]}>Create</Text>
      </TouchableOpacity>

      <SideTab icon="person" label="Profile" active={active === 'profile'} onPress={() => onChange('profile')} />
    </View>
  );
}

function SideTab({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={22} color={active ? '#fff' : '#888'} />
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#161616',
    borderTopWidth: 2,
    borderTopColor: '#2a2a2a',
    paddingTop: 8,
    paddingBottom: 16,
  },
  tab: { alignItems: 'center', justifyContent: 'center', gap: 4, flex: 1, height: 46 },
  label: { color: '#888', fontSize: 10.5, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  labelActive: { color: '#fff' },
  createBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnActive: { backgroundColor: '#ff2d55', borderColor: '#ffb3c4' },
});
