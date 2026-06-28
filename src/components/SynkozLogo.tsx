import React from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';

type Props = {
  /** Rendered height of the logo in px. */
  size?: number;
  /** Stroke/outline color of the wordmark. */
  color?: string;
};

// Outlined block-letter silhouettes for the Synkoz wordmark: S Y N K [3x3 grid] Z.
// Each glyph is authored in a local 0..150 wide, 20..220 tall coordinate box and
// laid out left to right inside the viewBox below.
const GLYPHS: Record<string, string> = {
  S: 'M0 20 L150 20 L150 66 L46 66 L46 97 L150 97 L150 220 L0 220 L0 174 L104 174 L104 143 L0 143 Z',
  Y: 'M0 20 L46 20 L75 82 L104 20 L150 20 L98 120 L98 220 L52 220 L52 120 Z',
  N: 'M0 20 L46 20 L104 150 L104 20 L150 20 L150 220 L104 220 L46 90 L46 220 L0 220 Z',
  K: 'M0 20 L46 20 L46 98 L108 20 L150 20 L80 120 L150 220 L108 220 L46 142 L46 220 L0 220 Z',
  Z: 'M0 20 L150 20 L150 68 L86 172 L150 172 L150 220 L0 220 L0 172 L64 68 L0 68 Z',
};

const VIEW_W = 1110;
const VIEW_H = 240;

export default function SynkozLogo({ size = 22, color = '#fff' }: Props) {
  const width = size * (VIEW_W / VIEW_H);
  const stroke = { stroke: color, strokeWidth: 4, fill: 'none' as const, strokeLinejoin: 'round' as const };
  // Top-left x of each element along the baseline (advance ~180 per letter).
  const cellX = [40, 83, 126];
  const cellY = [50, 93, 136];

  return (
    <Svg width={width} height={size} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
      <G transform="translate(0,0)">
        <Path d={GLYPHS.S} {...stroke} />
      </G>
      <G transform="translate(180,0)">
        <Path d={GLYPHS.Y} {...stroke} />
      </G>
      <G transform="translate(360,0)">
        <Path d={GLYPHS.N} {...stroke} />
      </G>
      <G transform="translate(540,0)">
        <Path d={GLYPHS.K} {...stroke} />
      </G>

      {/* The "O": a slightly tilted square enclosing a 3x3 grid of squares. */}
      <G transform="translate(720,0) rotate(-6 100 115)">
        <Rect x={5} y={20} width={190} height={190} rx={6} {...stroke} />
        {cellY.map((cy) =>
          cellX.map((cx) => (
            <Rect key={`${cx}-${cy}`} x={cx} y={cy} width={32} height={32} {...stroke} />
          )),
        )}
      </G>

      <G transform="translate(950,0)">
        <Path d={GLYPHS.Z} {...stroke} />
      </G>
    </Svg>
  );
}
