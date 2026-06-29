import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type Tab = 'play' | 'create' | 'profile';

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

export default function BottomNav({ active, onChange }: Props) {
  return (
    <View style={styles.bar}>
      <SideTab
        icon="game-controller"
        label="Play"
        active={active === 'play'}
        onPress={() => onChange('play')}
      />

      <TouchableOpacity style={styles.createWrap} onPress={() => onChange('create')} activeOpacity={0.85}>
        <View style={[styles.createBtn, active === 'create' && styles.createBtnActive]}>
          <Ionicons name="add" size={30} color="#111" />
        </View>
        <Text style={[styles.createLabel, active === 'create' && styles.labelActive]}>Create</Text>
      </TouchableOpacity>

      <SideTab
        icon="person"
        label="Profile"
        active={active === 'profile'}
        onPress={() => onChange('profile')}
      />
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
  const color = active ? '#fff' : '#777';
  return (
    <TouchableOpacity style={styles.sideTab} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.sideLabel, active && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: '#161616',
    borderTopWidth: 1,
    borderTopColor: '#242424',
    paddingTop: 10,
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  sideTab: { alignItems: 'center', gap: 4, flex: 1, paddingBottom: 6 },
  sideLabel: { color: '#777', fontSize: 11, fontWeight: '700' },
  labelActive: { color: '#fff' },
  createWrap: { alignItems: 'center', flex: 1 },
  createBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  createBtnActive: { backgroundColor: '#ff2d55' },
  createLabel: { color: '#777', fontSize: 11, fontWeight: '700', marginTop: 4 },
});
