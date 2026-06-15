import type { ResourceType, TokenType } from '../../types';

// ── Per-resource Tailwind classes (fuel=orange, data=fuchsia) ───────────────

const BG: Record<TokenType, string> = {
  crystal:    'bg-cyan-400',
  fuel:       'bg-orange-400',
  mineral:    'bg-green-500',
  alloy:      'bg-red-500',
  data:       'bg-fuchsia-500',
  darkMatter: 'bg-amber-400',
};

const RING: Record<TokenType, string> = {
  crystal:    'ring-1 ring-cyan-200',
  fuel:       'ring-1 ring-orange-200',
  mineral:    'ring-1 ring-green-300',
  alloy:      'ring-1 ring-red-300',
  data:       'ring-1 ring-fuchsia-300',
  darkMatter: 'ring-1 ring-amber-200',
};

interface ResourcePipProps {
  resource: TokenType;
  count?: number;
  size?: 'xs' | 'sm' | 'md';
}

export function ResourcePip({ resource, count, size = 'sm' }: ResourcePipProps) {
  const sz = size === 'xs' ? 'w-3 h-3 text-[8px]' : size === 'sm' ? 'w-4 h-4 text-[9px]' : 'w-5 h-5 text-[10px]';
  return (
    <span className={`inline-flex items-center justify-center rounded-full text-white font-bold shrink-0 ${sz} ${BG[resource]} ${RING[resource]}`}>
      {count !== undefined ? count : ''}
    </span>
  );
}

// ── Cost pill (shown on cards) ───────────────────────────────────────────────

const PILL_BG: Record<ResourceType, string> = {
  crystal: 'bg-cyan-950/80 border-cyan-700/50 text-cyan-300',
  fuel:    'bg-orange-950/80 border-orange-700/50 text-orange-300',
  mineral: 'bg-green-950/80 border-green-700/50 text-green-300',
  alloy:   'bg-red-950/80 border-red-700/50 text-red-300',
  data:    'bg-fuchsia-950/80 border-fuchsia-700/50 text-fuchsia-300',
};

interface CostPillProps {
  resource: ResourceType;
  count: number;
  covered?: boolean;
}

export function CostPill({ resource, count, covered = false }: CostPillProps) {
  return (
    <span className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full border text-[9px] font-bold ${PILL_BG[resource]} ${covered ? 'opacity-30 line-through' : ''}`}>
      <ResourcePip resource={resource} size="xs" />
      {count}
    </span>
  );
}
