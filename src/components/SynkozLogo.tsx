import React from 'react';
import { Image } from 'react-native';

const LOGO = require('../../assets/synkoz-logo.png');

// Intrinsic dimensions of the trimmed logo artwork (assets/synkoz-logo.png).
const ASPECT = 1175 / 231;

type Props = {
  /** Rendered height of the logo in px. */
  size?: number;
};

export default function SynkozLogo({ size = 22 }: Props) {
  return (
    <Image
      source={LOGO}
      resizeMode="contain"
      style={{ height: size, width: size * ASPECT }}
    />
  );
}
