import { supabase } from './supabase';
import { Identity } from './identity';
import { FeedRoom, Participant, Room } from '../data/types';

// ---- Row shapes (snake_case from Postgres) ---------------------------------
export type RoomRow = {
  id: string;
  code: string;
  title: string;
  prize: string;
  host_id: string;
  status: string;
  spinning: boolean;
  winner_id: string | null;
  created_at: string;
};

export type ParticipantRow = {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  avatar_color: string;
  created_at: string;
};

export type MessageRow = {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  text: string;
  created_at: string;
};

const FEED_COLORS = ['#ff5c8a', '#5c8aff', '#5cffb0', '#ffd95c', '#c45cff', '#ff8a5c'];

function colorForCode(code: string): string {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0;
  return FEED_COLORS[h % FEED_COLORS.length];
}

function genCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'SYNK';
  for (let i = 0; i < 2; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function roomRowToRoom(row: RoomRow, participants: Participant[]): Room {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    prize: row.prize,
    hostId: row.host_id,
    participants,
    status: (row.status as Room['status']) ?? 'waiting',
    winnerId: row.winner_id ?? undefined,
  };
}

export function participantRowToParticipant(row: ParticipantRow): Participant {
  return { id: row.user_id, username: row.username, avatarColor: row.avatar_color };
}

// ---- Feed ------------------------------------------------------------------
export async function listOpenRooms(): Promise<FeedRoom[]> {
  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  const rows = (rooms ?? []) as RoomRow[];
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const { data: parts } = await supabase
    .from('participants')
    .select('room_id,user_id,username')
    .in('room_id', ids);

  const counts: Record<string, number> = {};
  const hostName: Record<string, string> = {};
  (parts ?? []).forEach((p: any) => {
    counts[p.room_id] = (counts[p.room_id] ?? 0) + 1;
  });
  rows.forEach((r) => {
    const host = (parts ?? []).find((p: any) => p.room_id === r.id && p.user_id === r.host_id);
    hostName[r.id] = host ? '@' + host.username : '@host';
  });

  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    title: r.title,
    prize: r.prize,
    hostUsername: hostName[r.id],
    participantCount: counts[r.id] ?? 0,
    coverColor: colorForCode(r.code),
  }));
}

// ---- Rooms -----------------------------------------------------------------
export async function createRoom(identity: Identity, title: string, prize: string): Promise<RoomRow> {
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = genCode();
    const { data, error } = await supabase
      .from('rooms')
      .insert({ code, title, prize, host_id: identity.userId, status: 'waiting' })
      .select()
      .single();
    if (!error && data) {
      await joinRoom(identity, data.id);
      return data as RoomRow;
    }
    lastErr = error;
    // 23505 = unique_violation on the code; retry with a new code.
    if (!error || (error as any).code !== '23505') break;
  }
  throw lastErr ?? new Error('Could not create room');
}

export async function getRoomByCode(code: string): Promise<RoomRow | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .maybeSingle();
  if (error) throw error;
  return (data as RoomRow) ?? null;
}

export async function getRoom(roomId: string): Promise<RoomRow | null> {
  const { data, error } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle();
  if (error) throw error;
  return (data as RoomRow) ?? null;
}

export async function joinRoom(identity: Identity, roomId: string): Promise<void> {
  const { error } = await supabase
    .from('participants')
    .upsert(
      {
        room_id: roomId,
        user_id: identity.userId,
        username: identity.username,
        avatar_color: identity.avatarColor,
      },
      { onConflict: 'room_id,user_id' },
    );
  if (error) throw error;
}

export async function fetchParticipants(roomId: string): Promise<Participant[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as ParticipantRow[]).map(participantRowToParticipant);
}

// ---- Spin ------------------------------------------------------------------
export async function startSpin(roomId: string, winnerUserId: string): Promise<void> {
  const { error } = await supabase
    .from('rooms')
    .update({ spinning: true, winner_id: winnerUserId, status: 'spinning' })
    .eq('id', roomId);
  if (error) throw error;
}

export async function finishSpin(roomId: string): Promise<void> {
  await supabase.from('rooms').update({ spinning: false, status: 'finished' }).eq('id', roomId);
}

// ---- Chat ------------------------------------------------------------------
export async function fetchMessages(roomId: string): Promise<MessageRow[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
    .limit(100);
  if (error) throw error;
  return (data as MessageRow[]) ?? [];
}

export async function sendMessage(identity: Identity, roomId: string, text: string): Promise<void> {
  const { error } = await supabase.from('messages').insert({
    room_id: roomId,
    user_id: identity.userId,
    username: identity.username,
    text,
  });
  if (error) throw error;
}

// ---- Realtime --------------------------------------------------------------
export type RoomSubscriptionHandlers = {
  onParticipantsChange: () => void;
  onMessage: (row: MessageRow) => void;
  onRoomChange: (row: RoomRow) => void;
};

export function subscribeToRoom(roomId: string, handlers: RoomSubscriptionHandlers): () => void {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'participants', filter: `room_id=eq.${roomId}` },
      () => handlers.onParticipantsChange(),
    )
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
      (payload) => handlers.onMessage(payload.new as MessageRow),
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
      (payload) => handlers.onRoomChange(payload.new as RoomRow),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
