export type Participant = {
  id: string;
  username: string;
  avatarColor: string;
};

export type RoomStatus = 'waiting' | 'spinning' | 'finished';

export type Room = {
  id: string;
  code: string;
  title: string;
  prize: string;
  hostId: string;
  participants: Participant[];
  status: RoomStatus;
  winnerId?: string;
};

export type FeedRoom = {
  id: string;
  code: string;
  title: string;
  prize: string;
  hostUsername: string;
  participantCount: number;
  coverColor: string;
};
