import AsyncStorage from '@react-native-async-storage/async-storage';

// A lightweight, anonymous per-device identity so people can create/join rooms
// and chat without a login flow. Persisted in AsyncStorage (localStorage on web).

const KEY = 'synkoz.identity.v1';
const COLORS = ['#ff5c8a', '#5c8aff', '#5cffb0', '#ffd95c', '#c45cff', '#ff8a5c'];

export type Identity = {
  userId: string;
  username: string;
  avatarColor: string;
};

let cached: Identity | null = null;

function randomId(): string {
  return 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function fresh(): Identity {
  return {
    userId: randomId(),
    username: 'guest' + Math.floor(1000 + Math.random() * 9000),
    avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

export async function loadIdentity(): Promise<Identity> {
  if (cached) return cached;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      cached = JSON.parse(raw) as Identity;
      return cached;
    }
  } catch {
    // ignore storage errors; fall through to a fresh identity
  }
  const id = fresh();
  cached = id;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(id));
  } catch {
    // ignore
  }
  return id;
}

export function getCachedIdentity(): Identity | null {
  return cached;
}

export async function updateIdentity(patch: Partial<Identity>): Promise<Identity> {
  const cur = await loadIdentity();
  const next = { ...cur, ...patch };
  cached = next;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}
