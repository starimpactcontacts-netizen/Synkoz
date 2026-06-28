import React from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';

type Props = {
  /** Rendered height of the logo in px. */
  size?: number;
  /** Stroke/outline color of the wordmark. */
  color?: string;
};

// Hand-drawn, outlined block-letter silhouettes tracing the Synkoz wordmark:
// S Y N K [tilted 3x3 grid] Z. Letters are intentionally irregular/slanted to
// match the sketched outline style of the brand mark. Each glyph is authored in
// a roughly 0..150 wide, 18..222 tall box and laid out left to right.
const GLYPHS: Record<string, string> = {
  S: 'M4 30 L152 18 L150 64 L50 70 L44 96 L148 92 L156 214 L6 222 L2 176 L106 178 L110 140 L0 146 Z',
  Y: 'M-6 16 L54 22 L78 86 L100 20 L162 14 L104 122 L102 224 L52 220 L54 120 Z',
  N: 'M2 22 L50 18 L106 150 L104 18 L156 16 L152 220 L102 224 L48 92 L46 224 L-2 220 Z',
  K: 'M0 22 L50 18 L48 100 L112 16 L160 18 L84 120 L158 222 L110 226 L48 142 L46 222 L-2 220 Z',
  Z: 'M2 18 L158 12 L160 60 L92 168 L160 168 L162 222 L4 226 L0 176 L70 70 L2 74 Z',
};

// Left x-offset and per-glyph rotation (deg) to give the row a sketched, uneven feel.
const LAYOUT: { key: keyof typeof GLYPHS | 'grid'; x: number; rot: number }[] = [
  { key: 'S', x: 0, rot: 1.5 },
  { key: 'Y', x: 175, rot: -2.5 },
  { key: 'N', x: 350, rot: 1 },
  { key: 'K', x: 520, rot: -2 },
  { key: 'grid', x: 695, rot: -8 },
  { key: 'Z', x: 920, rot: 2 },
];

const VIEW_W = 1130;
const VIEW_H = 240;

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
    <Svg width={width} height={size} viewBox={`-10 0 ${VIEW_W} ${VIEW_H}`}>
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
