export type Track = {
  title: string;
  artist: string;
  artwork: string;
  bpm: number;
  key: string;
  duration: string;
};

export type Preset = 'custom' | 'auto' | 'fade' | 'rise';
