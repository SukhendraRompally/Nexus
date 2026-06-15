import { useState } from 'react';
import type { RoomData, RoomSlot } from '../../hooks/useRoom';

// ── Shared helpers ────────────────────────────────────────────────────────────

function copyToClipboard(text: string) {
  navigator.clipboard?.writeText(text).catch(() => {
    const el = document.createElement('textarea');
    el.value = text; document.body.appendChild(el);
    el.select(); document.execCommand('copy');
    document.body.removeChild(el);
  });
}

function SlotRow({ slot }: { slot: RoomSlot }) {
  const isClaimed = slot.claimedBy !== null;
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${
      isClaimed ? 'bg-slate-800/60 border border-slate-700/60' : 'bg-slate-900/40 border border-slate-800/40'
    }`}>
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isClaimed ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.7)]' : 'bg-slate-700'}`} />
      <span className="text-white font-bold text-sm flex-1">{slot.name}</span>
      {slot.isBot && <span className="text-violet-400 text-xs font-bold">🤖 Bot</span>}
      {!slot.isBot && isClaimed && <span className="text-green-400 text-xs font-bold">✓ Ready</span>}
      {!slot.isBot && !isClaimed && <span className="text-slate-500 text-xs">Waiting to join…</span>}
    </div>
  );
}

// ── Host Waiting Room ─────────────────────────────────────────────────────────

interface HostLobbyProps {
  roomId: string;
  room: RoomData;
  onStart: () => void;
  onClaimSlot?: (slotIndex: number) => void;
}

export function HostLobby({ roomId, room, onStart, onClaimSlot }: HostLobbyProps) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/room/${roomId}`;


  const handleCopy = () => {
    copyToClipboard(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const humanSlots = room.slots.filter(s => !s.isBot);
  const allHumansClaimed = humanSlots.every(s => !!s.claimedBy);
  const claimedCount = humanSlots.filter(s => !!s.claimedBy).length;
  const canStart = room.slots.length >= 2 && claimedCount >= 1; // at least host + 1


  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Online Game</p>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            NEX<span className="text-amber-400">US</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Room <span className="text-amber-400 font-black">{roomId}</span></p>
        </div>

        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-5 space-y-5">

          {/* Share link */}
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Share Link</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 font-mono truncate">
                {link}
              </div>
              <button onClick={handleCopy}
                className={`shrink-0 px-4 py-2 rounded-xl font-black text-xs transition-all ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-black'
                }`}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-slate-600 text-[10px] mt-1.5">Send this link to your friends — they'll join directly</p>
          </div>

          {/* Player slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-white uppercase tracking-widest">
                Players ({claimedCount}/{humanSlots.length} ready)
              </p>
              {allHumansClaimed && (
                <span className="text-green-400 text-[10px] font-bold animate-pulse">All seated!</span>
              )}
            </div>
            <div className="space-y-1.5">
              {room.slots.map((slot, i) => <SlotRow key={i} slot={slot} />)}
            </div>

            {/* Host can claim a seat */}
            {!allHumansClaimed && onClaimSlot && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-2">Your seat (host)</p>
                <div className="space-y-1.5">
                  {room.slots.filter(s => !s.isBot && !s.claimedBy).map((slot) => {
                    const slotIdx = room.slots.indexOf(slot);
                    return (
                      <button
                        key={slotIdx}
                        onClick={() => onClaimSlot(slotIdx)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-amber-500/50 transition-all text-left"
                      >
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-black text-xs">
                          ★
                        </div>
                        <span className="text-white font-bold text-sm">{slot.name}</span>
                        <span className="text-amber-400 text-xs ml-auto">Claim →</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Settings summary */}
          <div className="bg-slate-800/40 rounded-xl px-3 py-2.5 flex gap-4 text-xs text-slate-400">
            <span><span className="text-white font-bold">Timer:</span> {room.config.timerSeconds ? `${room.config.timerSeconds}s` : 'Off'}</span>
            <span><span className="text-white font-bold">Victory:</span> {room.config.vpThreshold} VP</span>
          </div>

          {/* Start button */}
          <button
            onClick={onStart}
            disabled={!canStart}
            className={`w-full py-3 rounded-xl font-black text-base transition-all ${
              canStart
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-[0_0_20px_rgba(251,191,36,0.3)] active:scale-95'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}>
            {canStart ? 'Start Game →' : `Waiting for players… (${claimedCount}/${room.slots.length} ready)`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Guest: Claim a Seat ───────────────────────────────────────────────────────

interface ClaimSeatProps {
  roomId: string;
  room: RoomData;
  onClaim: (slotIndex: number) => void;
}

export function ClaimSeat({ roomId, room, onClaim }: ClaimSeatProps) {
  const availableSlots = room.slots
    .map((s, i) => ({ ...s, index: i }))
    .filter(s => !s.isBot && !s.claimedBy);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">You're invited!</p>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            NEX<span className="text-amber-400">US</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Room <span className="text-amber-400 font-black">{roomId}</span></p>
        </div>

        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-5 space-y-4">
          <p className="text-white font-black text-sm">Choose your seat:</p>

          {availableSlots.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-red-400 font-bold">All seats are taken!</p>
              <p className="text-slate-500 text-sm mt-1">Ask the host to restart with an open slot for you.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableSlots.map(slot => (
                <button
                  key={slot.index}
                  onClick={() => onClaim(slot.index)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black group-hover:bg-amber-500/20">
                    {slot.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white font-bold">{slot.name}</span>
                  <span className="text-amber-400 text-xs ml-auto">Play as this player →</span>
                </button>
              ))}
            </div>
          )}

          {/* Show all players for context */}
          <div className="border-t border-slate-800 pt-3">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">All players</p>
            <div className="space-y-1">
              {room.slots.map((s, i) => <SlotRow key={i} slot={s} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Guest: Seat Claimed, Waiting for Host ────────────────────────────────────

interface WaitingForStartProps {
  roomId: string;
  room: RoomData;
  mySlotIndex: number;
}

export function WaitingForStart({ roomId, room, mySlotIndex }: WaitingForStartProps) {
  const mySlot = room.slots[mySlotIndex];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black tracking-tighter text-white">
            NEX<span className="text-amber-400">US</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Room <span className="text-amber-400 font-black">{roomId}</span></p>
        </div>

        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-5 space-y-4">
          {/* My seat */}
          <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl p-3 text-center">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">Your seat</p>
            <p className="text-amber-300 font-black text-xl">{mySlot?.name}</p>
          </div>

          {/* Waiting indicator */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <p className="text-slate-300 text-sm font-semibold">Waiting for host to start…</p>
          </div>

          {/* All players */}
          <div className="space-y-1.5">
            {room.slots.map((s, i) => <SlotRow key={i} slot={s} />)}
          </div>

          <div className="bg-slate-800/40 rounded-xl px-3 py-2.5 flex gap-4 text-xs text-slate-400">
            <span><span className="text-white font-bold">Timer:</span> {room.config.timerSeconds ? `${room.config.timerSeconds}s` : 'Off'}</span>
            <span><span className="text-white font-bold">Victory:</span> {room.config.vpThreshold} VP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Not Found ─────────────────────────────────────────────────────────────────

export function RoomNotFound({ roomId }: { roomId: string }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
          NEX<span className="text-amber-400">US</span>
        </h1>
        <p className="text-red-400 font-bold text-lg mb-2">Room not found</p>
        <p className="text-slate-500 text-sm mb-6">
          Room <span className="text-amber-400 font-mono">{roomId}</span> doesn't exist or has expired.
        </p>
        <button onClick={() => { window.location.href = '/'; }}
          className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors">
          ← Go Home
        </button>
      </div>
    </div>
  );
}
