import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, set, onValue, off } from 'firebase/database';
import { nanoid } from 'nanoid';
import { db } from '../firebase';
import type { GameState, GameConfig, Player } from '../types';
import { gameReducer } from '../engine/reducer';
import type { GameAction } from '../engine/reducer';
import { initializeGame } from '../engine/setup';

// ── Types ────────────────────────────────────────────────────────────────────

export interface RoomSlot {
  name: string;
  isBot: boolean;
  claimedBy: string | null; // playerId that claimed this seat
}

export interface RoomData {
  hostId: string;
  status: 'waiting' | 'playing' | 'ended';
  config: GameConfig;
  slots: RoomSlot[];
  state: GameState | null;
}

// ── Persistent player ID ─────────────────────────────────────────────────────

function getOrCreatePlayerId(): string {
  let pid = localStorage.getItem('nexus_pid');
  if (!pid) { pid = nanoid(8); localStorage.setItem('nexus_pid', pid); }
  return pid;
}

function getClaimedSlot(roomId: string): number | null {
  const v = localStorage.getItem(`nexus_slot_${roomId}`);
  return v !== null ? Number(v) : null;
}

function setClaimedSlot(roomId: string, slotIndex: number) {
  localStorage.setItem(`nexus_slot_${roomId}`, String(slotIndex));
}

// ── Firebase strips empty arrays/nulls — restore them ────────────────────────

function normalizePlayer(p: Player): Player {
  return {
    ...p,
    tokens:         p.tokens         ?? { crystal: 0, fuel: 0, mineral: 0, alloy: 0, data: 0, darkMatter: 0 },
    bonuses:        p.bonuses        ?? { crystal: 0, fuel: 0, mineral: 0, alloy: 0, data: 0 },
    reservedCards:  Array.isArray(p.reservedCards)  ? p.reservedCards  : [],
    purchasedCards: Array.isArray(p.purchasedCards) ? p.purchasedCards : [],
    claimedFactionLeaders: Array.isArray(p.claimedFactionLeaders) ? p.claimedFactionLeaders
      : Array.isArray(p.claimedNobles) ? p.claimedNobles : [],
  };
}

function normalizeGameState(gs: GameState): GameState {
  return {
    ...gs,
    players:       gs.players?.map(normalizePlayer) ?? [],
    factionLeaders: Array.isArray(gs.factionLeaders) ? gs.factionLeaders
      : Array.isArray(gs.nobles) ? gs.nobles : [],
    eligibleFactionLeaders: Array.isArray(gs.eligibleFactionLeaders) ? gs.eligibleFactionLeaders
      : Array.isArray(gs.eligibleNobles) ? gs.eligibleNobles : [],
    log:           Array.isArray(gs.log)           ? gs.log           : [],
    pendingSelectedTokens: gs.pendingSelectedTokens ?? {},
    recentlyTakenTokens:   gs.recentlyTakenTokens  ?? null,
    tiers: (gs.tiers ?? []).map(t => ({
      ...t,
      active: Array.isArray(t.active) ? t.active : [null, null, null, null],
      deck:   Array.isArray(t.deck)   ? t.deck   : [],
    })) as GameState['tiers'],
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export type RoomPhase =
  | 'loading'
  | 'not-found'
  | 'waiting-host'    // I am the host, game hasn't started
  | 'waiting-guest'   // I am a guest, haven't claimed a slot yet or waiting for start
  | 'waiting-claimed' // I claimed a slot, waiting for host to start
  | 'playing';        // Game is in progress

export function useRoom(roomId: string | null) {
  const myId = getOrCreatePlayerId();

  const [phase, setPhase]           = useState<RoomPhase>('loading');
  const [room, setRoom]             = useState<RoomData | null>(null);
  const [gameState, setGameState]   = useState<GameState | null>(null);
  const [mySlotIndex, setMySlotIndex] = useState<number>(-1);

  // Keep a ref to current gameState for use inside dispatch without stale closure
  const gameStateRef = useRef<GameState | null>(null);
  gameStateRef.current = gameState;

  // ── Subscribe to room ────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId || !db) return;

    const roomRef = ref(db, `rooms/${roomId}`);

    const unsub = onValue(roomRef, (snap) => {
      if (!snap.exists()) { setPhase('not-found'); return; }

      const data = snap.val() as RoomData;
      setRoom(data);

      // Resolve game state — normalize because Firebase strips empty arrays
      const gs = data.state ? normalizeGameState(data.state) : null;
      setGameState(gs);

      // Determine this client's phase
      const claimedSlot = getClaimedSlot(roomId);
      const isHost = data.hostId === myId;

      if (data.status === 'playing' && gs) {
        const slot = claimedSlot ?? (isHost ? 0 : -1);
        setMySlotIndex(slot);
        setPhase('playing');
        return;
      }

      if (data.status === 'waiting') {
        if (isHost) { setPhase('waiting-host'); setMySlotIndex(-1); return; } // host hasn't claimed yet
        if (claimedSlot !== null) {
          setMySlotIndex(claimedSlot);
          setPhase('waiting-claimed');
        } else {
          setPhase('waiting-guest');
          setMySlotIndex(-1);
        }
      }
    });

    return () => off(roomRef, 'value', unsub);
  }, [roomId, myId]);

  // ── Create a new room (host) ─────────────────────────────────────────────
  const createRoom = useCallback(async (
    slots: { name: string; isBot: boolean }[],
    config: GameConfig,
  ): Promise<string> => {
    if (!db) throw new Error('Firebase not configured');

    const id = nanoid(8).toUpperCase();
    const roomData: RoomData = {
      hostId: myId,
      status: 'waiting',
      config,
      slots: slots.map((s) => ({
        name: s.name,
        isBot: s.isBot,
        // All slots start unclaimed (host will claim one too); bots are marked as 'bot'
        claimedBy: s.isBot ? 'bot' : null,
      })),
      state: null,
    };

    await set(ref(db, `rooms/${id}`), roomData);
    // Don't pre-claim for host — they'll claim a seat like everyone else
    return id;
  }, [myId]);

  // ── Claim a slot (guest) ─────────────────────────────────────────────────
  const claimSlot = useCallback(async (roomId: string, slotIndex: number) => {
    if (!db || !room) return;
    const updatedSlots = room.slots.map((s, i) =>
      i === slotIndex ? { ...s, claimedBy: myId } : s
    );
    await set(ref(db, `rooms/${roomId}/slots`), updatedSlots);
    setClaimedSlot(roomId, slotIndex);
    setMySlotIndex(slotIndex);
    setPhase('waiting-claimed');
  }, [myId, room]);

  // ── Start game (host only) ───────────────────────────────────────────────
  const startGame = useCallback(async (roomId: string, currentRoom: RoomData) => {
    if (!db) return;
    const { slots, config } = currentRoom;
    const players = slots.map(s => ({ name: s.name, isBot: s.isBot }));
    const initialState = initializeGame(players, config);

    await set(ref(db, `rooms/${roomId}`), {
      ...currentRoom,
      status: 'playing',
      state: initialState,
    });
  }, []);

  // ── Online dispatch (active player writes new state to Firebase) ─────────
  const onlineDispatch = useCallback((action: GameAction) => {
    if (!db || !roomId || !gameStateRef.current) return;
    const newState = gameReducer(normalizeGameState(gameStateRef.current), action);
    set(ref(db, `rooms/${roomId}/state`), newState);
    setGameState(newState); // optimistic local update
  }, [roomId]);

  const isMyTurn = mySlotIndex !== -1 && gameState?.activePlayerIndex === mySlotIndex;
  const amHost = room?.hostId === myId;

  return {
    phase, room, gameState, mySlotIndex, myId, isMyTurn, amHost,
    createRoom, claimSlot, startGame, onlineDispatch,
  };
}
