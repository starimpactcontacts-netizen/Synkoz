import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TrackRow from '../components/TrackRow';
import WaveformTransition from '../components/WaveformTransition';
import PresetsBar from '../components/PresetsBar';
import { Preset, Track } from '../data/types';

const TRACK_A: Track = {
  title: 'Gimme More',
  artist: 'Britney Spears',
  artwork:
    'https://upload.wikimedia.org/wikipedia/en/9/95/Britney_Spears_-_Blackout.png',
  bpm: 113,
  key: '11A',
  duration: '4:11',
};

const TRACK_B: Track = {
  title: "Don't Stop The Music",
  artist: 'Rihanna',
  artwork:
    'https://upload.wikimedia.org/wikipedia/en/2/2c/Rihanna_-_Good_Girl_Gone_Bad.png',
  bpm: 123,
  key: '11A',
  duration: '4:27',
};

const BAR_OPTIONS = [4, 8, 16, 32];

export default function EditTransitionScreen() {
  const { width } = useWindowDimensions();
  const [preset, setPreset] = useState<Preset>('custom');
  const [bars, setBars] = useState(16);
  const waveformWidth = width - 40;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Edit transition</Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>Beta</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={styles.save}>Save</Text>
        </TouchableOpacity>
      </View>

      <TrackRow track={TRACK_A} />

      <View style={styles.waveformSection}>
        <Text style={styles.caption}>Fade in so peak 😩</Text>
        <View style={{ paddingHorizontal: 20 }}>
          <WaveformTransition width={waveformWidth} bars={`${bars}`} />
        </View>
        <View style={styles.barsRow}>
          <BarsSelector value={bars} onChange={setBars} />
        </View>
      </View>

      <TrackRow track={TRACK_B} />

      <View style={styles.spacer} />

      <PresetsBar selected={preset} onSelect={setPreset} />
    </SafeAreaView>
  );
}

function BarsSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity style={styles.barsPill} onPress={() => setOpen((o) => !o)}>
        <Text style={styles.barsPillText}>{value} bars</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#fff" />
      </TouchableOpacity>
      {open && (
        <View style={styles.barsDropdown}>
          {BAR_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.barsOption}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.barsOptionText,
                  option === value && styles.barsOptionTextSelected,
                ]}
              >
                {option} bars
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
  },
  betaBadge: {
    backgroundColor: '#3ddc6a',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  betaText: {
    color: '#003311',
    fontWeight: '700',
    fontSize: 11,
  },
  cancel: {
    color: '#fff',
    fontSize: 16,
  },
  save: {
    color: '#3ddc6a',
    fontSize: 16,
    fontWeight: '600',
  },
  waveformSection: {
    marginTop: 30,
  },
  caption: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  barsRow: {
    alignItems: 'center',
    marginTop: 14,
  },
  barsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1f24',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  barsPillText: {
    color: '#fff',
    fontSize: 14,
  },
  barsDropdown: {
    position: 'absolute',
    top: 38,
    left: '50%',
    marginLeft: -60,
    width: 120,
    backgroundColor: '#1e1f24',
    borderRadius: 12,
    paddingVertical: 4,
    zIndex: 10,
  },
  barsOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  barsOptionText: {
    color: '#cfcfcf',
    fontSize: 14,
  },
  barsOptionTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  spacer: {
    flex: 1,
  },
});
