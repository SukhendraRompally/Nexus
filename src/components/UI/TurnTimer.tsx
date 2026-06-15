interface TurnTimerProps {
  seconds: number;
  total: number;
}

export function TurnTimer({ seconds, total }: TurnTimerProps) {
  const pct = total > 0 ? seconds / total : 0;
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);
  const isLow = seconds <= 10;
  const isCritical = seconds <= 5;

  return (
    <div className={`flex items-center gap-1.5 ${isCritical ? 'animate-pulse' : ''}`}>
      <div className="relative w-9 h-9">
        <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90">
          <circle cx="16" cy="16" r={radius} fill="none"
            stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle cx="16" cy="16" r={radius} fill="none"
            stroke={isCritical ? '#ef4444' : isLow ? '#f97316' : '#f59e0b'}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
            strokeLinecap="round"
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${
          isCritical ? 'text-red-400' : isLow ? 'text-orange-400' : 'text-amber-300'
        }`}>
          {seconds}
        </span>
      </div>
      <span className={`text-[9px] font-bold hidden sm:block ${
        isCritical ? 'text-red-400' : isLow ? 'text-orange-400' : 'text-slate-400'
      }`}>
        {isCritical ? 'Hurry!' : isLow ? 'Low time' : 'Turn timer'}
      </span>
    </div>
  );
}
