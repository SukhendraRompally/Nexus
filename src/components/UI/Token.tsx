import type { TokenType } from '../../types';

// ── SVG Icons ────────────────────────────────────────────────────────────────

function CrystalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" className="w-5 h-5">
      <polygon points="12,3 21,8 21,16 12,21 3,16 3,8" />
      <line x1="12" y1="3" x2="12" y2="21" strokeOpacity="0.4" />
      <line x1="3" y1="8" x2="21" y2="16" strokeOpacity="0.4" />
      <line x1="21" y1="8" x2="3" y2="16" strokeOpacity="0.4" />
    </svg>
  );
}

function FuelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)" className="w-5 h-5">
      <path d="M13 2L5 14h6l-2 8 10-12h-6l2-8z" />
    </svg>
  );
}

function MineralIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" className="w-5 h-5">
      <polygon points="12,3 22,20 2,20" />
      <line x1="12" y1="3" x2="12" y2="20" strokeOpacity="0.4" />
      <line x1="7" y1="12" x2="17" y2="12" strokeOpacity="0.4" />
    </svg>
  );
}

function AlloyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" fill="rgba(255,255,255,0.35)" />
      {[0,45,90,135,180,225,270,315].map(a => {
        const rad = (a * Math.PI) / 180;
        return <line key={a}
          x1={12 + 5 * Math.cos(rad)} y1={12 + 5 * Math.sin(rad)}
          x2={12 + 8.5 * Math.cos(rad)} y2={12 + 8.5 * Math.sin(rad)} />;
      })}
    </svg>
  );
}

function DataIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <circle cx="9" cy="9" r="1.2" fill="rgba(255,255,255,0.9)" />
      <circle cx="15" cy="15" r="1.2" fill="rgba(255,255,255,0.9)" />
      <circle cx="15" cy="9" r="1.2" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

function DarkMatterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)" className="w-5 h-5">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

// ── Token styles ─────────────────────────────────────────────────────────────

const TOKEN_CLASSES: Record<TokenType, string> = {
  crystal:    'token-crystal ring-2 ring-cyan-300/70',
  fuel:       'token-fuel ring-2 ring-orange-300/70',
  mineral:    'token-mineral ring-2 ring-green-300/70',
  alloy:      'token-alloy ring-2 ring-red-300/70',
  data:       'token-data ring-2 ring-fuchsia-300/70',
  darkMatter: 'token-darkMatter ring-2 ring-amber-200/80',
};

const LABEL_COLORS: Record<TokenType, string> = {
  crystal:    'text-cyan-400',
  fuel:       'text-orange-400',
  mineral:    'text-green-400',
  alloy:      'text-red-400',
  data:       'text-fuchsia-400',
  darkMatter: 'text-amber-400',
};

const LABELS: Record<TokenType, string> = {
  crystal:    'Crystal',
  fuel:       'Fuel',
  mineral:    'Mineral',
  alloy:      'Alloy',
  data:       'Data',
  darkMatter: 'Dark Matter',
};

const ICONS: Record<TokenType, React.ReactNode> = {
  crystal:    <CrystalIcon />,
  fuel:       <FuelIcon />,
  mineral:    <MineralIcon />,
  alloy:      <AlloyIcon />,
  data:       <DataIcon />,
  darkMatter: <DarkMatterIcon />,
};

// ── Component ────────────────────────────────────────────────────────────────

interface TokenProps {
  type: TokenType;
  count?: number;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  selectedCount?: number; // shows +N badge on top
  className?: string;
}

export function Token({
  type, count, size = 'md', showLabel = false,
  onClick, selected, disabled, selectedCount, className = '',
}: TokenProps) {
  const sizeMap = { xs: 'w-7 h-7', sm: 'w-9 h-9', md: 'w-12 h-12' };
  const iconScale = { xs: 'scale-75', sm: 'scale-90', md: '' };

  return (
    <div className={`flex flex-col items-center gap-0.5 ${className}`}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative rounded-full flex items-center justify-center transition-all duration-150
          ${sizeMap[size]} ${TOKEN_CLASSES[type]} ${iconScale[size]}
          ${onClick && !disabled ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}
          ${selected ? 'scale-110 ring-4 ring-white/80' : ''}
          ${disabled ? 'opacity-35 cursor-not-allowed saturate-50' : ''}
        `}
      >
        {ICONS[type]}
        {/* Count in bank */}
        {count !== undefined && (
          <span className="absolute -bottom-1 -right-1 bg-slate-950 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-slate-700 shadow leading-none">
            {count}
          </span>
        )}
        {/* Selected count overlay */}
        {selectedCount !== undefined && selectedCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-slate-900 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow leading-none">
            +{selectedCount}
          </span>
        )}
      </button>
      {showLabel && (
        <span className={`text-[9px] font-semibold leading-none ${LABEL_COLORS[type]}`}>
          {LABELS[type]}
        </span>
      )}
    </div>
  );
}
