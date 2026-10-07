import { motion } from 'framer-motion';

interface Props {
  label: string;
  value: number;   // 0–100
  delay?: number;
  helperText?: string;
  accentColor?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'auto';
}

function getFillClass(val: number, accent: string): string {
  if (accent === 'indigo') return 'bg-indigo-500';
  if (accent === 'violet') return 'bg-violet-500';
  if (accent === 'emerald') return 'bg-emerald-500';
  if (accent === 'amber') return 'bg-amber-500';
  
  // auto
  if (val >= 80) return 'bg-rose-500';
  if (val >= 60) return 'bg-amber-500';
  if (val >= 40) return 'bg-indigo-500';
  if (val >= 20) return 'bg-sky-500';
  return 'bg-emerald-500';
}

export function ScoreBar({ 
  label, 
  value, 
  delay = 0, 
  helperText, 
  accentColor = 'auto' 
}: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const fillClass = getFillClass(clamped, accentColor);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-300">{label}</span>
          {helperText && (
            <span className="text-[11px] text-zinc-400 hidden sm:inline-block">({helperText})</span>
          )}
        </div>
        <span className="font-mono font-semibold text-white tracking-tight">
          {value.toFixed(1)}%
        </span>
      </div>

      <div className="relative h-2 rounded-full bg-white/[0.06] overflow-hidden border border-white/[0.04]">
        <motion.div
          className={`h-full rounded-full ${fillClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
        />
      </div>
    </div>
  );
}
