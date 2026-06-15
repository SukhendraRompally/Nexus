import { useState } from 'react';
import type { RoomData, RoomSlot } from '../../hooks/useRoom';

function copyToClipboard(text: string) {
  navigator.clipboard?.writeText(text).catch(() => {
    const el = document.createElement('textarea');
    el.value = text; document.body.appendChild(el);
    el.select(); document.execCommand('copy');
    document.body.removeChild(el);
  });
}

// !! Firebase strips null → undefined, so use !!claimedBy throughout
function SlotRow({ slot }: { slot: RoomSlot }) {
  const isClaimed = !!slot.claimedBy;
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-xl ${
      isClaimed ? 'bg-slate-800/60 border border-slate-700/60' : 'bg-slate-900/40 border border-slate-800/40'
    }`}>
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
        isClaimed ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.7)]' : 'bg-slate-700'
      }`} />
      <span className="text-white font-bold text-sm flex-1">{slot.name || 'Open seat'}</span>
      {slot.isBot  && <span className="text-violet-400 text-xs font-bold">🤖 Bot</span>}
      {!slot.isBot &&  isClaimed && <span className="text-green-400 text-xs font-bold">✓ Ready</span>}
      {!slot.isBot && !isClaimed && <span className="text-slate-500 text-xs">Waiting to join…</span>}
    </div>
  );
}

// ── Host Waiting Room ─────────────────────────────────────────────────────────

interface HostLobbyProps {
  roomId: string;
  room: RoomData;
  onStart: () => void;
  onClaimSlot: (slotIndex: number, name: string) => void;
}

export function HostLobby({ roomId, room, onStart, onClaimSlot }: HostLobbyProps) {
  const [copied, setCopied] = useState(false);
  const [hostName, setHostName] = useState('');
  const link = `${window.location.origin}/room/${roomId}`;

  const humanSlots = room.slots.filter(s => !s.isBot);
  const claimedCount = humanSlots.filter(s => !!s.claimedBy).length;
  const allHumansClaimed = humanSlots.every(s => !!s.claimedBy);
  const hostHasClaimed = room.slots.some(s => !!s.claimedBy && !s.isBot);
  const unclaimedHumanSlots = room.slots.filter(s => !s.isBot && !s.claimedBy);
  const canStart = claimedCount >= 1 && room.slots.length >= 2;

  const handleCopy = () => {
    copyToClipboard(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Online Game — Host</p>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            NEX<span className="text-amber-400">US</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Room <span className="text-amber-400 font-black">{roomId}</span></p>
        </div>

        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-5 space-y-5">

          {/* Share link */}
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Share with friends</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 font-mono truncate">
                {link}
              </div>
              <button onClick={handleCopy}
                className={`shrink-0 px-4 py-2 rounded-xl font-black text-xs transition-all ${
                  copied ? 'bg-green-600 text-white' : 'bg-amber-500 hover:bg-amber-400 text-black'
                }`}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Players status */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-white uppercase tracking-widest">
                Players ({claimedCount}/{humanSlots.length} ready)
              </p>
              {allHumansClaimed && <span className="text-green-400 text-[10px] font-bold animate-pulse">All seated!</span>}
            </div>
            <div className="space-y-1.5">
              {room.slots.map((slot, i) => <SlotRow key={i} slot={slot} />)}
            </div>
          </div>

          {/* Host claims their seat with name */}
          {!hostHasClaimed && unclaimedHumanSlots.length > 0 && (
            <div className="border-t border-slate-700 pt-4">
              <p className="text-[10px] font-black text-white uppercase tracking-widest mb-3">Claim your seat</p>
              <input
                type="text"
                placeholder="Enter your name"
                value={hostName}
                onChange={e => setHostName(e.target.value.slice(0, 15))}
                maxLength={15}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 mb-2 transition-colors"
              />
              <div className="space-y-1.5">
                {unclaimedHumanSlots.map(slot => {
                  const slotIdx = room.slots.indexOf(slot);
                  return (
                    <button key={slotIdx}
                      onClick={() => hostName.trim() && onClaimSlot(slotIdx, hostName.trim())}
                      disabled={!hostName.trim()}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                        hostName.trim()
                          ? 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-amber-500/50'
                          : 'bg-slate-800/40 border-slate-800 cursor-not-allowed'
                      }`}>
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-black text-xs">★</div>
                      <div>
                        <p className="text-white font-bold text-sm">{hostName.trim() || 'Your name'}</p>
                        <p className="text-slate-500 text-[10px]">Seat {slotIdx + 1}</p>
                      </div>
                      <span className="text-amber-400 text-xs ml-auto">{hostName.trim() ? 'Claim →' : 'Enter name first'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="bg-slate-800/40 rounded-xl px-3 py-2.5 flex gap-4 text-xs text-slate-400">
            <span><span className="text-white font-bold">Timer:</span> {room.config.timerSeconds ? `${room.config.timerSeconds}s` : 'Off'}</span>
            <span><span className="text-white font-bold">Victory:</span> {room.config.vpThreshold} VP</span>
          </div>

          <button onClick={onStart} disabled={!canStart}
            className={`w-full py-3 rounded-xl font-black text-base transition-all ${
              canStart
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-[0_0_20px_rgba(251,191,36,0.3)] active:scale-95'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}>
            {canStart ? 'Start Game →' : `Claim your seat first`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Guest: Enter name + claim seat ───────────────────────────────────────────

interface ClaimSeatProps {
  roomId: string;
  room: RoomData;
  onClaim: (slotIndex: number, name: string) => void;
}

export function ClaimSeat({ roomId, room, onClaim }: ClaimSeatProps) {
  const [name, setName] = useState('');
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

          {availableSlots.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-red-400 font-bold">All seats are taken!</p>
              <p className="text-slate-500 text-sm mt-1">Ask the host to start a new room.</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Your name</p>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={e => setName(e.target.value.slice(0, 15))}
                  maxLength={15}
                  autoFocus
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Choose a seat</p>
                <div className="space-y-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot.index}
                      onClick={() => name.trim() && onClaim(slot.index, name.trim())}
                      disabled={!name.trim()}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                        name.trim()
                          ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-amber-500/50 cursor-pointer'
                          : 'bg-slate-800/40 border-slate-800 cursor-not-allowed opacity-60'
                      }`}>
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
                        {(name.trim() || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold text-sm">{name.trim() || 'Enter name above'}</p>
                        <p className="text-slate-500 text-[10px]">Seat {slot.index + 1}</p>
                      </div>
                      <span className="text-amber-400 text-xs ml-auto">{name.trim() ? 'Join →' : ''}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Current players */}
          <div className="border-t border-slate-800 pt-3">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Current players</p>
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

export function WaitingForStart({ roomId, room, mySlotIndex }: {
  roomId: string; room: RoomData; mySlotIndex: number;
}) {
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
          <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl p-3 text-center">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">Joined as</p>
            <p className="text-amber-300 font-black text-xl">{mySlot?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
                  style={{ animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
            <p className="text-slate-300 text-sm font-semibold">Waiting for host to start…</p>
          </div>
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
