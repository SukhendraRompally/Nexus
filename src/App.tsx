import { useEffect, useCallback, useState } from 'react';
import './index.css';
import { useGame } from './hooks/useGame';
import { useRoom } from './hooks/useRoom';
import { GameSetup } from './components/GameSetup';
import { GameBoard } from './components/Board/GameBoard';
import { HostLobby, ClaimSeat, WaitingForStart, RoomNotFound } from './components/online/OnlineLobby';
import { isFirebaseConfigured } from './firebase';
import type { GameConfig } from './types';
import type { GameAction } from './engine/reducer';
import type { GameState } from './types';

// ── Simple URL router ─────────────────────────────────────────────────────────

function getRoomIdFromURL(): string | null {
  const m = window.location.pathname.match(/^\/room\/([A-Za-z0-9]+)$/);
  return m ? m[1].toUpperCase() : null;
}

// ── Online Room Flow ──────────────────────────────────────────────────────────

function OnlineRoomFlow({ roomId }: { roomId: string }) {
  const {
    phase, room, gameState, mySlotIndex,
    claimSlot, startGame, onlineDispatch,
  } = useRoom(roomId);

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-3 h-3 rounded-full bg-amber-500 animate-bounce"
              style={{ animationDelay: `${i*0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'not-found') return <RoomNotFound roomId={roomId} />;

  if (phase === 'waiting-host' && room) {
    return (
      <HostLobby
        roomId={roomId}
        room={room}
        onStart={() => startGame(roomId, room)}
        onClaimSlot={slotIndex => claimSlot(roomId, slotIndex)}
      />
    );
  }

  if (phase === 'waiting-guest' && room) {
    return (
      <ClaimSeat
        roomId={roomId}
        room={room}
        onClaim={slotIndex => claimSlot(roomId, slotIndex)}
      />
    );
  }

  if (phase === 'waiting-claimed' && room) {
    return <WaitingForStart roomId={roomId} room={room} mySlotIndex={mySlotIndex} />;
  }

  if (phase === 'playing') {
    if (!gameState) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
          Loading game…
        </div>
      );
    }
    return (
      <OnlineGame
        roomId={roomId}
        gameState={gameState}
        mySlotIndex={mySlotIndex}
        onlineDispatch={onlineDispatch}
        onRestart={() => { window.location.href = '/'; }}
      />
    );
  }

  return null;
}

// ── Online Game (GameBoard wired to Firebase) ─────────────────────────────────

function OnlineGame({
  gameState, mySlotIndex, onlineDispatch, onRestart,
}: {
  roomId: string;
  gameState: GameState;
  mySlotIndex: number;
  onlineDispatch: (action: GameAction) => void;
  onRestart: () => void;
}) {
  const wrappedDispatch = useCallback((action: GameAction) => {
    onlineDispatch(action);
  }, [onlineDispatch]);

  return (
    <GameBoard
      state={gameState}
      dispatch={wrappedDispatch}
      mySlotIndex={mySlotIndex}
      onToggleToken={r => wrappedDispatch({ type: 'TOGGLE_TOKEN', resource: r })}
      onConfirmTakeTokens={() => wrappedDispatch({ type: 'CONFIRM_TAKE_TOKENS' })}
      onSetActionMode={mode => wrappedDispatch({ type: 'SET_ACTION_MODE', mode })}
      onCancelAction={() => wrappedDispatch({ type: 'CANCEL_ACTION' })}
      onReserveCard={id => wrappedDispatch({ type: 'RESERVE_CARD', cardId: id })}
      onPurchaseCard={id => wrappedDispatch({ type: 'PURCHASE_CARD', cardId: id })}
      onDiscardToken={t => wrappedDispatch({ type: 'DISCARD_TOKEN', token: t })}
      onCancelTokenTake={() => wrappedDispatch({ type: 'CANCEL_TOKEN_TAKE' })}
      onRestart={onRestart}
    />
  );
}

// ── Local Game Flow ───────────────────────────────────────────────────────────

function LocalGameFlow({
  onCreateOnline,
}: {
  onCreateOnline: (players: { name: string; isBot: boolean }[], config: GameConfig) => Promise<void>;
}) {
  const {
    state, dispatch, startGame,
    toggleToken, confirmTakeTokens, setActionMode, cancelAction,
    cancelTokenTake, reserveCard, purchaseCard, discardToken,
    resetToSetup,
  } = useGame();

  const [creatingRoom, setCreatingRoom] = useState(false);

  const handleCreateOnline = useCallback(async (
    players: { name: string; isBot: boolean }[],
    config: GameConfig,
  ) => {
    setCreatingRoom(true);
    try {
      await onCreateOnline(players, config);
    } finally {
      setCreatingRoom(false);
    }
  }, [onCreateOnline]);

  if (state.phase === 'setup') {
    return (
      <GameSetup
        onStart={startGame}
        onCreateOnline={isFirebaseConfigured ? handleCreateOnline : undefined}
        isFirebaseConfigured={isFirebaseConfigured}
        creatingRoom={creatingRoom}
      />
    );
  }

  return (
    <GameBoard
      state={state}
      dispatch={dispatch}
      onToggleToken={toggleToken}
      onConfirmTakeTokens={confirmTakeTokens}
      onSetActionMode={setActionMode}
      onCancelAction={cancelAction}
      onReserveCard={reserveCard}
      onPurchaseCard={purchaseCard}
      onDiscardToken={discardToken}
      onCancelTokenTake={cancelTokenTake}
      onRestart={resetToSetup}
    />
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────

export default function App() {
  const { createRoom } = useRoom(null);

  // Re-render on back/forward navigation
  const [, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const handleCreateOnline = useCallback(async (
    players: { name: string; isBot: boolean }[],
    config: GameConfig,
  ) => {
    try {
      const roomId = await createRoom(players, config);
      window.history.pushState(null, '', `/room/${roomId}`);
      setPath(`/room/${roomId}`);
    } catch (e: any) {
      alert(`Failed to create room: ${e?.message ?? e}\n\nCheck that your Firebase env vars are set in Vercel and that Database Rules allow reads/writes.`);
      throw e;
    }
  }, [createRoom]);

  const roomId = getRoomIdFromURL();
  if (roomId) return <OnlineRoomFlow roomId={roomId} />;
  return <LocalGameFlow onCreateOnline={handleCreateOnline} />;
}
