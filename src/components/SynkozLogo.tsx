import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  size?: number;
};

export default function SynkozLogo({ size = 22 }: Props) {
  const gridSize = size * 0.86;
  return (
    <View style={styles.row}>
      <Text style={[styles.text, { fontSize: size }]}>SYNK</Text>
      <View style={[styles.gridBox, { width: gridSize, height: gridSize, borderRadius: gridSize * 0.18, marginHorizontal: size * 0.04 }]}>
        <View style={styles.grid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <View key={i} style={styles.cell} />
          ))}
        </View>
      </View>
      <Text style={[styles.text, { fontSize: size }]}>Z</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
  gridBox: { backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  grid: { width: '60%', height: '60%', flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '33.33%', height: '33.33%', backgroundColor: '#111111', borderWidth: 1, borderColor: '#fff' },
});
