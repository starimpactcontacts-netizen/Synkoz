import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Participant } from '../data/types';
import ParticipantDot from './ParticipantDot';
import DuelCard from './DuelCard';
import Confetti from './Confetti';
import { buildSpinPlan, SpinPlan } from '../utils/eliminationSchedule';
import { hashSeed } from '../utils/rng';

const RENDER_CAP = 360;
const DUEL_DURATION = 1500;
const DUEL_LOOPS = 7;
const GRID_GAP = 4;
const GRID_PAD = 8;
const MAX_TILE = 58;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const now = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

type Phase = 'idle' | 'eliminating' | 'duel' | 'revealed';

type DotMeta = { x: number; y: number };
type StageLayout = { ids: string[]; positions: Map<string, DotMeta>; dotSize: number };

// Lay participants out as a dense, locked lobby grid: filled row-major in
// roster order (top-left first) so the crowd reads as "N humans here", and
// centered as a block so small rooms don't stretch across the whole stage.
function computeLayout(ids: string[], stageW: number, stageH: number): StageLayout {
  const count = Math.max(ids.length, 1);
  const innerW = stageW - GRID_PAD * 2;
  const innerH = stageH - GRID_PAD * 2;

  let cols = Math.max(1, Math.round(Math.sqrt((count * innerW) / innerH)));
  let rows = Math.max(1, Math.ceil(count / cols));
  while (cols * rows < count) cols++;

  const cell = Math.min((innerW + GRID_GAP) / cols, (innerH + GRID_GAP) / rows);
  const dotSize = Math.max(6, Math.min(MAX_TILE, cell - GRID_GAP));

  // Center the whole grid block inside the stage.
  const usedCols = Math.min(cols, count);
  const gridW = usedCols * dotSize + (usedCols - 1) * GRID_GAP;
  const gridRows = Math.ceil(count / cols);
  const gridH = gridRows * dotSize + (gridRows - 1) * GRID_GAP;
  const originX = (stageW - gridW) / 2;
  const originY = (stageH - gridH) / 2;

  const positions = new Map<string, DotMeta>();
  ids.forEach((id, i) => {
    const cx = i % cols;
    const cy = Math.floor(i / cols);
    positions.set(id, {
      x: originX + cx * (dotSize + GRID_GAP),
      y: originY + cy * (dotSize + GRID_GAP),
    });
  });

  return { ids, positions, dotSize };
}

type Props = {
  participants: Participant[];
  isHost: boolean;
  width: number;
  /** Bumped by the parent to kick off a new spin once triggerWinnerId is set. */
  spinToken: number;
  triggerWinnerId: string | null;
  /** Stable per-room id used to keep the elimination order identical across viewers. */
  spinSeed: string;
  /** The viewer's own participant id, so their tile can be highlighted. */
  meId?: string;
  onPressSpin: () => void;
  onResolved: (winnerId: string) => void;
};

export default function CrowdStage({
  participants,
  isHost,
  width,
  spinToken,
  triggerWinnerId,
  spinSeed,
  meId,
  onPressSpin,
  onResolved,
}: Props) {
  const stageHeight = Math.round(width * 0.95);

  const [phase, setPhase] = useState<Phase>('idle');
  const [currentWave, setCurrentWave] = useState(-1);
  const [duelHighlight, setDuelHighlight] = useState<0 | 1>(0);
  const [duelLeft, setDuelLeft] = useState<Participant | null>(null);
  const [duelRight, setDuelRight] = useState<Participant | null>(null);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [stageLayout, setStageLayout] = useState<StageLayout>(() =>
    computeLayout(participants.slice(0, RENDER_CAP).map((p) => p.id), width, stageHeight),
  );

  const planRef = useRef<SpinPlan | null>(null);
  const winnerSlotRef = useRef<0 | 1>(0);
  const rafRef = useRef<number | null>(null);
  const lastTokenRef = useRef(spinToken);
  const revealSeedRef = useRef(0);

  const stageScale = useRef(new Animated.Value(1)).current;
  const crowdOpacity = useRef(new Animated.Value(1)).current;
  const duelOpacity = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const counterPunch = useRef(new Animated.Value(1)).current;

  // Track the live roster while idle so newcomers appear in the crowd.
  useEffect(() => {
    if (phase !== 'idle') return;
    setStageLayout(computeLayout(participants.slice(0, RENDER_CAP).map((p) => p.id), width, stageHeight));
  }, [phase, participants, width, stageHeight]);

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
  }, []);

  function punchCounter() {
    counterPunch.setValue(0.8);
    Animated.spring(counterPunch, { toValue: 1, friction: 4, tension: 130, useNativeDriver: true }).start();
  }

  function flashScreen() {
    flash.setValue(0.45);
    Animated.timing(flash, { toValue: 0, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }

  function settleWinner(winnerId: string) {
    const winnerP = participants.find((p) => p.id === winnerId) ?? null;
    setWinner(winnerP);
    setPhase('revealed');
    revealSeedRef.current = hashSeed(winnerId + spinSeed);
    onResolved(winnerId);
  }

  function runDuel(plan: SpinPlan, winnerId: string) {
    setPhase('duel');
    const winnerP = participants.find((p) => p.id === winnerId) ?? null;
    const opponentP = plan.opponentId ? participants.find((p) => p.id === plan.opponentId) ?? null : null;

    if (!opponentP) {
      settleWinner(winnerId);
      return;
    }

    const winnerSlot: 0 | 1 = hashSeed(winnerId + spinSeed) % 2 === 0 ? 0 : 1;
    winnerSlotRef.current = winnerSlot;
    setDuelLeft(winnerSlot === 0 ? winnerP : opponentP);
    setDuelRight(winnerSlot === 0 ? opponentP : winnerP);
    setDuelHighlight(0);

    Animated.parallel([
      Animated.timing(crowdOpacity, { toValue: 0, duration: 320, useNativeDriver: true }),
      Animated.timing(duelOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();

    const distance = DUEL_LOOPS * 2 + winnerSlot;
    const start = now();
    let lastStep = -1;

    const tick = (t: number) => {
      const elapsed = t - start;
      const tt = Math.min(1, elapsed / DUEL_DURATION);
      const step = Math.floor(easeOutCubic(tt) * distance);
      if (step !== lastStep) {
        lastStep = step;
        setDuelHighlight((step % 2) as 0 | 1);
      }
      if (tt < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDuelHighlight(winnerSlot);
        rafRef.current = null;
        settleWinner(winnerId);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function runEliminationWaves(plan: SpinPlan, winnerId: string) {
    const cumulative: number[] = [];
    plan.waveDurations.reduce((acc, d, i) => {
      const v = acc + d;
      cumulative[i] = v;
      return v;
    }, 0);
    const elimTotal = cumulative.length ? cumulative[cumulative.length - 1] : 0;

    if (elimTotal > 0) {
      const targetScale = Math.min(2.2, 1.25 + plan.milestones[0] / 160);
      Animated.timing(stageScale, {
        toValue: targetScale,
        duration: elimTotal,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }

    const start = now();
    let lastCompleted = 0;

    const tick = (t: number) => {
      const elapsed = t - start;
      if (elapsed >= elimTotal) {
        if (lastCompleted !== cumulative.length) {
          lastCompleted = cumulative.length;
          setCurrentWave(cumulative.length - 1);
          punchCounter();
          flashScreen();
        }
        rafRef.current = null;
        runDuel(plan, winnerId);
        return;
      }
      let completed = 0;
      for (let w = 0; w < cumulative.length; w++) if (elapsed >= cumulative[w]) completed = w + 1;
      if (completed !== lastCompleted) {
        lastCompleted = completed;
        setCurrentWave(completed - 1);
        punchCounter();
        flashScreen();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function startSpin(winnerId: string) {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);

    let ids = participants.slice(0, RENDER_CAP).map((p) => p.id);
    if (!ids.includes(winnerId)) ids = ids.slice(0, -1).concat(winnerId);

    const layout = computeLayout(ids, width, stageHeight);
    setStageLayout(layout);

    stageScale.setValue(1);
    crowdOpacity.setValue(1);
    duelOpacity.setValue(0);
    setDuelLeft(null);
    setDuelRight(null);
    setWinner(null);
    setCurrentWave(-1);

    if (ids.length <= 1) {
      setPhase('revealed');
      settleWinner(winnerId);
      return;
    }

    const seed = hashSeed(spinSeed + ':' + winnerId);
    const plan = buildSpinPlan(ids, winnerId, seed);
    planRef.current = plan;
    setPhase('eliminating');
    runEliminationWaves(plan, winnerId);
  }

  useEffect(() => {
    if (spinToken === lastTokenRef.current) return;
    lastTokenRef.current = spinToken;
    if (triggerWinnerId) startSpin(triggerWinnerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinToken, triggerWinnerId]);

  const participantById = useMemo(() => new Map(participants.map((p) => [p.id, p])), [participants]);

  const totalCount = participants.length;
  const plan = planRef.current;
  let displayCount = totalCount;
  if (phase === 'eliminating' && plan) displayCount = plan.milestones[currentWave + 1] ?? totalCount;
  else if (phase === 'duel') displayCount = 2;
  else if (phase === 'revealed') displayCount = 1;

  const statusLabel =
    phase === 'idle'
      ? 'PARTICIPANTS'
      : phase === 'eliminating'
      ? 'ELIMINATING'
      : phase === 'duel'
      ? 'FINAL ROUND'
      : 'WINNER';

  const overflow = totalCount - Math.min(totalCount, RENDER_CAP);
  const dotsLayout = stageLayout;
  const cardSize = Math.min(width * 0.4, 150);

  return (
    <View style={styles.wrap}>
      <View style={[styles.stage, { width, height: stageHeight }]}>
        <LinearGradient colors={['#1c1320', '#0a0a0c']} style={StyleSheet.absoluteFill} />

        <View style={styles.cornerBadge} pointerEvents="none">
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, phase !== 'idle' && styles.statusDotActive]} />
            <Text style={styles.statusLabel}>{statusLabel}</Text>
          </View>
          <Animated.Text style={[styles.counter, { transform: [{ scale: counterPunch }] }]}>{displayCount}</Animated.Text>
          {phase === 'idle' && overflow > 0 && <Text style={styles.overflow}>+{overflow}</Text>}
        </View>

        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: crowdOpacity, transform: [{ scale: stageScale }] }]}
        >
          {dotsLayout &&
            Array.from(dotsLayout.positions.entries()).map(([id, meta]) => {
              const participant = participantById.get(id);
              if (!participant) return null;
              const waveIdx = plan?.waveOfId.get(id);
              const eliminated = phase !== 'idle' && waveIdx !== undefined && waveIdx <= currentWave;
              return (
                <ParticipantDot
                  key={id}
                  initial={participant.username.charAt(0).toUpperCase()}
                  color={participant.avatarColor}
                  x={meta.x}
                  y={meta.y}
                  size={dotsLayout.dotSize}
                  eliminated={eliminated}
                  isMe={id === meId}
                />
              );
            })}
        </Animated.View>

        {(phase === 'duel' || phase === 'revealed') && (
          <Animated.View style={[StyleSheet.absoluteFill, styles.duelLayer, { opacity: duelOpacity }]}>
            {phase === 'duel' ? (
              <View style={styles.duelRow}>
                <DuelCard participant={duelLeft} highlighted={duelHighlight === 0} won={false} size={cardSize} />
                <Text style={styles.vs}>VS</Text>
                <DuelCard participant={duelRight} highlighted={duelHighlight === 1} won={false} size={cardSize} />
              </View>
            ) : (
              <View style={styles.winnerWrap}>
                <DuelCard participant={winner} highlighted={false} won size={cardSize * 1.15} />
                <Confetti active seed={revealSeedRef.current} />
              </View>
            )}
          </Animated.View>
        )}

        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.flashOverlay, { opacity: flash }]} />
      </View>

      {phase === 'idle' &&
        (isHost ? (
          <TouchableOpacity activeOpacity={0.88} onPress={onPressSpin} style={styles.spinBtnWrap}>
            <LinearGradient colors={['#ff2d55', '#c45cff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.spinBtn}>
              <Text style={styles.spinBtnText}>SPIN THE WHEEL</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <Text style={styles.waitingText}>Waiting for host to spin…</Text>
        ))}

      {phase === 'eliminating' && <Text style={styles.waitingText}>Picking a winner…</Text>}
      {phase === 'duel' && <Text style={styles.waitingText}>Down to the final two…</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: '100%' },
  cornerBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    backgroundColor: 'rgba(10,10,12,0.55)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 1 },
  statusDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#555' },
  statusDotActive: { backgroundColor: '#ff3b5c' },
  statusLabel: { color: '#999', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  counter: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  overflow: { color: '#777', fontSize: 9, marginTop: 1 },
  stage: {
    marginTop: 4,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3a3344',
  },
  duelLayer: { alignItems: 'center', justifyContent: 'center' },
  duelRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  vs: { color: '#666', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  winnerWrap: { alignItems: 'center', justifyContent: 'center' },
  flashOverlay: { backgroundColor: '#fff' },
  spinBtnWrap: { marginTop: 22, borderRadius: 8, shadowColor: '#c45cff', shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  spinBtn: { paddingHorizontal: 36, paddingVertical: 16, borderRadius: 8, borderWidth: 2, borderColor: '#fff' },
  spinBtnText: { color: '#fff', fontFamily: 'RussoOne_400Regular', fontSize: 15, letterSpacing: 1 },
  waitingText: { color: '#666', fontSize: 13, marginTop: 18 },
});
