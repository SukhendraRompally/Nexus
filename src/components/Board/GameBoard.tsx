import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameState, ResourceType, TokenType, Card, Noble } from '../../types';
import type { GameAction } from '../../engine/reducer';
import { NoblesRow } from './NoblesRow';
import { CardTier } from './CardTier';
import { TokenBank } from './TokenBank';
import { ActivePlayerCard, OpponentCard } from '../Player/PlayerCard';
import { LogPanel } from '../UI/LogPanel';
import { TurnTimer } from '../UI/TurnTimer';
import { DiscardTokenModal } from '../Modals/DiscardTokenModal';
import { NobleClaimModal } from '../Modals/NobleClaimModal';
import { PurchaseConfirmModal } from '../Modals/PurchaseConfirmModal';
import { ReserveConfirmModal } from '../Modals/ReserveConfirmModal';
import { WinnerModal } from '../Modals/WinnerModal';
import { calculateBotAction, calculateBotDiscard } from '../../engine/bot';
import { useSound } from '../../hooks/useSound';

interface GameBoardProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  mySlotIndex?: number;  // undefined = local (everyone controls); set for online mode
  onToggleToken: (resource: ResourceType) => void;
  onConfirmTakeTokens: () => void;
  onSetActionMode: (mode: 'idle' | 'takingTokens') => void;
  onCancelAction: () => void;
  onReserveCard: (cardId: string) => void;
  onPurchaseCard: (cardId: string) => void;
  onDiscardToken: (token: TokenType) => void;
  onCancelTokenTake: () => void;
  onRestart: () => void;
}

export function GameBoard({
  state, dispatch, mySlotIndex,
  onToggleToken, onConfirmTakeTokens, onSetActionMode, onCancelAction,
  onReserveCard, onPurchaseCard,
  onDiscardToken, onCancelTokenTake, onRestart,
}: GameBoardProps) {
  const activePlayer = state.players[state.activePlayerIndex];
  const opponents = state.players.filter((_, i) => i !== state.activePlayerIndex);
  const isIdle = state.actionMode === 'idle' && !state.pendingSubAction;
  const isBot = activePlayer?.isBot ?? false;

  // Online mode: block controls when it's not this client's turn
  const isOnline = mySlotIndex !== undefined;
  const isMyOnlineTurn = isOnline ? mySlotIndex === state.activePlayerIndex : true;
  const controlsEnabled = isMyOnlineTurn && !isBot;
  const timerTotal = state.config.timerSeconds;

  const [confirmPurchase, setConfirmPurchase] = useState<Card | null>(null);
  const [confirmReserve, setConfirmReserve] = useState<Card | null>(null);
  const [inspectNoble, setInspectNoble] = useState<Noble | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { play } = useSound();
  const prevActiveIndexRef = useRef<number>(-1);

  // ── Auto-dispatch helper ─────────────────────────────────────────────────
  const autoDispatch = useCallback((action: GameAction) => {
    dispatch(action);
  }, [dispatch]);

  // ── Bot turn logic ───────────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase === 'ended' || state.phase === 'setup') return;
    if (!isBot) return;

    // Clear any pending bot timer
    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);

    // Handle sub-actions
    if (state.pendingSubAction === 'discardTokens') {
      botTimeoutRef.current = setTimeout(() => {
        autoDispatch(calculateBotDiscard(state));
      }, 600);
      return;
    }
    // Noble claiming for bots is handled inside calculateBotAction (step 0)

    // Main bot turn — think for 1-1.5s
    if (state.actionMode === 'idle' && !state.pendingSubAction) {
      const delay = 1000 + Math.random() * 500;
      botTimeoutRef.current = setTimeout(() => {
        autoDispatch(calculateBotAction(state));
      }, delay);
    }

    return () => {
      if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    };
  }, [state.activePlayerIndex, state.pendingSubAction, state.actionMode, isBot, state.phase]);

  // ── "Your turn" sound ────────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase !== 'playing' && state.phase !== 'finalRound') return;
    const prev = prevActiveIndexRef.current;
    prevActiveIndexRef.current = state.activePlayerIndex;
    if (prev === -1) return; // skip first render
    if (prev === state.activePlayerIndex) return;

    // In online mode: only play for your own turn. In local mode: always play.
    const shouldPlay = mySlotIndex !== undefined
      ? mySlotIndex === state.activePlayerIndex && !isBot
      : !isBot;

    if (shouldPlay) play('yourTurn');
    else if (mySlotIndex === undefined && !isBot) play('turnEnd');
  }, [state.activePlayerIndex, state.phase]);

  // ── Turn timer ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!timerTotal || isBot || state.phase === 'ended' || state.phase === 'setup') {
      setTimeLeft(null);
      return;
    }
    if (state.pendingSubAction) return;

    setTimeLeft(timerTotal);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => autoDispatch(calculateBotAction(state)), 0);
          return null;
        }
        if (prev === 11) play('timerWarning');          // 10s left
        if (prev <= 6 && prev > 1) play('timerCritical'); // last 5s
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.activePlayerIndex, state.pendingSubAction, timerTotal, isBot, state.phase]);

  return (
    <>
      <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-gray-950 text-white">

        {/* ── Header ── */}
        <header className="flex items-center justify-between px-4 h-12 border-b border-slate-800 bg-slate-950 shrink-0 gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="font-black text-xl tracking-tighter">
              NEX<span className="text-amber-400">US</span>
            </span>
            <span className="hidden md:block text-[9px] text-slate-500 uppercase tracking-widest">Space Colony</span>
            {timerTotal && !isBot && timeLeft !== null && (
              <TurnTimer seconds={timeLeft} total={timerTotal} />
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {state.phase === 'finalRound' && (
              <span className="text-[9px] bg-red-900/70 border border-red-700/60 text-red-300 px-2 py-0.5 rounded-full font-black animate-pulse">
                FINAL ROUND
              </span>
            )}
            {state.players.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                i === state.activePlayerIndex
                  ? 'bg-amber-950/70 border border-amber-600/60 text-amber-200'
                  : 'bg-slate-800/80 border border-slate-700/50 text-slate-300'
              }`}>
                {p.isBot && <span className="text-[10px]">🤖</span>}
                <span className="max-w-[60px] truncate">{p.name}</span>
                <span className={`font-black ${i === state.activePlayerIndex ? 'text-amber-300' : 'text-white'}`}>
                  {p.points}VP
                </span>
              </div>
            ))}
          </div>
        </header>

        {/* ── Body: 3 columns ── */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-auto lg:overflow-hidden">

          {/* ══ Col 1: Playing Arena ══ */}
          <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
            <NoblesRow
              nobles={state.factionLeaders}
              activePlayer={activePlayer}
              onNobleClick={n => setInspectNoble(n)}
            />
            <div className="flex-1 min-h-0 flex flex-col">
              {([3, 2, 1] as const).map(t => (
                <CardTier key={t}
                  tier={t}
                  active={state.tiers[t-1].active}
                  deckCount={state.tiers[t-1].deck.length}
                  activePlayer={activePlayer}
                  actionMode={isBot ? 'idle' : state.actionMode}
                  onPurchaseClick={c => controlsEnabled && setConfirmPurchase(c)}
                  onReserveClick={c => controlsEnabled && setConfirmReserve(c)}
                />
              ))}
            </div>
          </div>

          {/* ══ Col 2: Players ══ */}
          <div className="xl:w-80 lg:w-72 w-full shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-800 shrink-0 flex items-center justify-between">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Your Colony</span>
              {isBot && (
                <span className="text-[9px] text-violet-400 font-bold">🤖 Bot thinking…</span>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-3">
              <ActivePlayerCard
                player={activePlayer}
                isIdle={isIdle && controlsEnabled}
                isFinalRound={state.phase === 'finalRound'}
                onPurchaseReservedClick={c => controlsEnabled && setConfirmPurchase(c)}
              />
            </div>
            {opponents.length > 0 && (
              <div className="shrink-0 border-t border-slate-700/60 p-3 space-y-2">
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">
                  Other Colonists
                </p>
                {opponents.map(p => (
                  <OpponentCard key={p.id} player={p}
                    isCurrentTurn={state.players.indexOf(p) === state.activePlayerIndex} />
                ))}
              </div>
            )}
          </div>

          {/* ══ Col 3: Resources + Log ══ */}
          <div className="xl:w-60 lg:w-56 w-full shrink-0 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-800 shrink-0">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Resources & Log</span>
            </div>
            <div className="shrink-0 p-3 border-b border-slate-800">
              <TokenBank
                state={state}
                onTokenClick={r => { if (controlsEnabled) { play('tokenPick'); onToggleToken(r); } }}
                onConfirmTokens={() => { if (controlsEnabled) { play('tokenConfirm'); onConfirmTakeTokens(); } }}
                onCancel={() => controlsEnabled && onCancelAction()}
                onStartTaking={() => controlsEnabled && onSetActionMode('takingTokens')}
              />
            </div>
            <div className="flex-1 min-h-0 p-3 overflow-hidden flex flex-col">
              <LogPanel entries={state.log} />
            </div>
          </div>

        </div>
      </div>

      {/* ── Online: waiting-for-turn overlay ── */}
      {isOnline && !isMyOnlineTurn && !isBot && state.phase !== 'ended' && (
        <div className="fixed inset-0 z-40 pointer-events-none flex items-end justify-center pb-8">
          <div className="bg-slate-900/95 border border-slate-700 rounded-2xl px-6 py-3 flex items-center gap-3 shadow-2xl pointer-events-auto">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"
                  style={{ animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
            <p className="text-white font-bold text-sm">
              Waiting for <span className="text-amber-400">{activePlayer?.name}</span>'s turn…
            </p>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {inspectNoble && (
        <NobleClaimModal
          noble={inspectNoble}
          player={activePlayer}
          isActivePlayer={!isBot}
          onClaim={nobleId => { play('nobleClaimed'); dispatch({ type: 'CLAIM_FACTION_LEADER', nobleId }); }}
          onClose={() => setInspectNoble(null)}
        />
      )}
      {state.pendingSubAction === 'discardTokens' && !isBot && (
        <DiscardTokenModal
          player={activePlayer}
          recentlyTakenTokens={state.recentlyTakenTokens}
          onDiscard={onDiscardToken}
          onCancelTurn={onCancelTokenTake}
        />
      )}
      {/* Noble selection now happens manually via NoblesRow click → NobleClaimModal */}
      {confirmPurchase && (
        <PurchaseConfirmModal
          card={confirmPurchase}
          player={activePlayer}
          onConfirm={() => { play('cardPurchase'); onPurchaseCard(confirmPurchase.id); setConfirmPurchase(null); }}
          onCancel={() => setConfirmPurchase(null)}
        />
      )}
      {confirmReserve && (
        <ReserveConfirmModal
          card={confirmReserve}
          bankDarkMatter={state.bank.darkMatter}
          onConfirm={() => { play('cardReserve'); onReserveCard(confirmReserve.id); setConfirmReserve(null); }}
          onCancel={() => setConfirmReserve(null)}
        />
      )}
      {state.phase === 'ended' && state.winnerId && (
        <WinnerModal players={state.players} winnerId={state.winnerId} onRestart={onRestart} />
      )}
    </>
  );
}
