import { FeedRoom, Participant, Room } from './types';

const COLORS = ['#ff5c8a', '#5c8aff', '#5cffb0', '#ffd95c', '#c45cff', '#ff8a5c'];

function makeParticipants(count: number): Participant[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i}`,
    username: `user${i + 1}`,
    avatarColor: COLORS[i % COLORS.length],
  }));
}

export const FEED_ROOMS: FeedRoom[] = [
  {
    id: 'r1',
    code: 'SYNK42',
    title: 'Free AirPods Giveaway',
    prize: 'AirPods Pro 2',
    hostUsername: '@maya',
    participantCount: 184,
    coverColor: '#ff5c8a',
  },
  {
    id: 'r2',
    code: 'WHEEL99',
    title: 'Friday Night Spin',
    prize: '$50 Gift Card',
    hostUsername: '@deon',
    participantCount: 62,
    coverColor: '#5c8aff',
  },
  {
    id: 'r3',
    code: 'LUCKY7',
    title: 'Pick a Winner Live',
    prize: 'Signed Poster',
    hostUsername: '@ari',
    participantCount: 311,
    coverColor: '#5cffb0',
  },
];

export const MOCK_ROOM: Room = {
  id: 'r1',
  code: 'SYNK42',
  title: 'Free AirPods Giveaway',
  prize: 'AirPods Pro 2',
  hostId: 'host',
  participants: makeParticipants(47),
  status: 'waiting',
};
