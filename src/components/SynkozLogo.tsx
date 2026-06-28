import React from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';

type Props = {
  /** Rendered height of the logo in px. */
  size?: number;
  /** Stroke/outline color of the wordmark. */
  color?: string;
};

// Outlined, hand-drawn block-letter silhouettes tracing the Synkoz wordmark:
// S Y N K [tilted 3x3 grid] Z. Letters are irregular/slanted with a protruding
// foot on the S and wide splayed Y to match the sketched brand mark.
const GLYPHS: Record<string, string> = {
  S: 'M30 26 L150 16 L152 64 L54 70 L52 96 L150 92 L156 212 L-8 224 L-6 176 L104 178 L106 142 L20 146 Z',
  Y: 'M-12 12 L52 20 L80 88 L102 18 L168 8 L106 120 L104 226 L52 222 L56 118 Z',
  N: 'M2 22 L52 16 L110 150 L108 16 L160 12 L156 220 L104 226 L48 92 L44 224 L-2 218 Z',
  K: 'M0 20 L52 16 L50 100 L116 14 L166 16 L86 118 L164 224 L112 228 L48 142 L46 224 L-4 218 Z',
  Z: 'M0 14 L166 6 L168 58 L94 166 L168 164 L170 224 L2 230 L-2 174 L72 68 L0 72 Z',
};

// Left x-offset and per-glyph rotation (deg) for an uneven, sketched row.
const LAYOUT: { key: keyof typeof GLYPHS | 'grid'; x: number; rot: number }[] = [
  { key: 'S', x: 0, rot: 2 },
  { key: 'Y', x: 175, rot: -2 },
  { key: 'N', x: 360, rot: 2 },
  { key: 'K', x: 530, rot: -1 },
  { key: 'grid', x: 705, rot: 7 },
  { key: 'Z', x: 935, rot: 2 },
];

const VIEW_W = 1140;
const VIEW_H = 245;

export default function SynkozLogo({ size = 22, color = '#fff' }: Props) {
  const width = size * (VIEW_W / VIEW_H);
  const stroke = {
    stroke: color,
    strokeWidth: 5,
    fill: 'none' as const,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  };
  const cellX = [40, 83, 126];
  const cellY = [50, 93, 136];

  return (
    <Svg width={width} height={size} viewBox={`-15 0 ${VIEW_W} ${VIEW_H}`}>
      {LAYOUT.map(({ key, x, rot }) =>
        key === 'grid' ? (
          // The "O": a slightly tilted square enclosing a 3x3 grid of squares.
          <G key="grid" transform={`translate(${x},0) rotate(${rot} 100 120)`}>
            <Rect x={6} y={22} width={188} height={188} rx={8} {...stroke} />
            {cellY.map((cy) =>
              cellX.map((cx) => (
                <Rect key={`${cx}-${cy}`} x={cx} y={cy} width={32} height={32} rx={2} {...stroke} />
              )),
            )}
          </G>
        ) : (
          <G key={key} transform={`translate(${x},0) rotate(${rot} 75 120)`}>
            <Path d={GLYPHS[key]} {...stroke} />
          </G>
        ),
      )}
    </Svg>
  );
}
