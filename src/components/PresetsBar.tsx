import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Preset } from '../data/types';

const PRESETS: { id: Preset; label: string; icon?: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'custom', label: 'Custom' },
  { id: 'auto', label: 'Auto', icon: 'sparkles' },
  { id: 'fade', label: 'Fade' },
  { id: 'rise', label: 'Rise' },
];

type Props = {
  selected: Preset;
  onSelect: (preset: Preset) => void;
};

export default function PresetsBar({ selected, onSelect }: Props) {
  return (
    <View>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.label}>Presets</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.row}>
        {PRESETS.map((preset) => {
          const isSelected = preset.id === selected;
          return (
            <TouchableOpacity
              key={preset.id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelect(preset.id)}
            >
              {preset.icon && (
                <Ionicons
                  name={preset.icon}
                  size={16}
                  color={isSelected ? '#000' : '#fff'}
                  style={styles.icon}
                />
              )}
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#2a2a2a',
  },
  label: {
    color: '#9a9a9a',
    fontSize: 14,
    marginHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 10,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1e1f24',
  },
  chipSelected: {
    backgroundColor: '#fff',
  },
  chipText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#000',
  },
  icon: {
    marginRight: 4,
  },
});
