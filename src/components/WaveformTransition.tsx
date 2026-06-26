import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import Svg, { Line, Path, Rect } from 'react-native-svg';

const WAVE_HEIGHT = 130;

function randomBars(count: number, seed: number) {
  const bars: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280;
    const rnd = s / 233280;
    bars.push(0.15 + rnd * 0.85);
  }
  return bars;
}

function Waveform({
  width,
  color,
  seed,
  flip,
}: {
  width: number;
  color: string;
  seed: number;
  flip?: boolean;
}) {
  const barCount = 90;
  const barWidth = width / barCount;
  const bars = useMemo(() => randomBars(barCount, seed), [barCount, seed]);

  return (
    <Svg width={width} height={WAVE_HEIGHT}>
      {bars.map((h, i) => {
        const barHeight = h * (WAVE_HEIGHT / 2 - 4);
        const x = i * barWidth;
        const cy = WAVE_HEIGHT / 2;
        return (
          <Rect
            key={i}
            x={x}
            y={flip ? cy : cy - barHeight}
            width={Math.max(barWidth - 1, 1)}
            height={barHeight}
            fill={color}
            opacity={0.85}
          />
        );
      })}
    </Svg>
  );
}

type Props = {
  width: number;
  bars: string;
  onPlayheadChange?: (ratio: number) => void;
};

export default function WaveformTransition({ width, bars }: Props) {
  const [playheadRatio, setPlayheadRatio] = useState(0.18);
  const [crossfadeTop, setCrossfadeTop] = useState(0.55);
  const [crossfadeBottom, setCrossfadeBottom] = useState(0.45);
  const containerRef = useRef<View>(null);

  const clamp = (v: number) => Math.max(0, Math.min(1, v));

  const playheadResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        setPlayheadRatio((prev) => clamp(prev + gesture.dx / width));
      },
    })
  ).current;

  const topLineResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        setCrossfadeTop((prev) => clamp(prev - gesture.dy / WAVE_HEIGHT));
      },
    })
  ).current;

  const bottomLineResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        setCrossfadeBottom((prev) => clamp(prev + gesture.dy / WAVE_HEIGHT));
      },
    })
  ).current;

  const playheadX = playheadRatio * width;

  return (
    <View style={styles.wrapper} ref={containerRef}>
      <View style={styles.trackBox}>
        <Waveform width={width} color="#3a78d8" seed={42} />
        <Waveform width={width} color="#d8893a" seed={7} flip />
        <Svg
          width={width}
          height={WAVE_HEIGHT}
          style={StyleSheet.absoluteFill}
        >
          <Line
            x1={0}
            y1={WAVE_HEIGHT / 2}
            x2={width}
            y2={WAVE_HEIGHT / 2}
            stroke="#f3e8c8"
            strokeWidth={1.5}
          />
          <Path
            d={`M0,${WAVE_HEIGHT / 2} L${playheadX},${WAVE_HEIGHT / 2} L${width},${
              WAVE_HEIGHT * (1 - crossfadeTop)
            }`}
            stroke="#e07be0"
            strokeWidth={2}
            fill="none"
          />
        </Svg>
        <View
          style={[styles.playhead, { left: playheadX }]}
          {...playheadResponder.panHandlers}
        />
        <View
          style={styles.dragHandle}
          {...topLineResponder.panHandlers}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.trackBox}>
        <Waveform width={width} color="#3a78d8" seed={11} />
        <Waveform width={width} color="#d8893a" seed={23} flip />
        <Svg
          width={width}
          height={WAVE_HEIGHT}
          style={StyleSheet.absoluteFill}
        >
          <Line
            x1={0}
            y1={WAVE_HEIGHT / 2}
            x2={width}
            y2={WAVE_HEIGHT / 2}
            stroke="#f3e8c8"
            strokeWidth={1.5}
          />
          <Path
            d={`M0,${WAVE_HEIGHT * crossfadeBottom} L${playheadX},${WAVE_HEIGHT / 2} L${width},${WAVE_HEIGHT / 2}`}
            stroke="#e07be0"
            strokeWidth={2}
            fill="none"
          />
        </Svg>
        <View
          style={[styles.playhead, { left: playheadX }]}
          {...playheadResponder.panHandlers}
        />
        <View
          style={styles.dragHandle}
          {...bottomLineResponder.panHandlers}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#15161a',
  },
  trackBox: {
    height: WAVE_HEIGHT,
    borderWidth: 1,
    borderColor: '#3aa0e0',
    overflow: 'hidden',
  },
  divider: {
    height: 2,
    backgroundColor: '#000',
  },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 24,
    marginLeft: -12,
  },
  dragHandle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '40%',
    height: '20%',
  },
});
