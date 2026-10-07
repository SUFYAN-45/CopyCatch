import { motion } from 'framer-motion';

interface Props {
  label: string;
  value: number;   // 0–100
  delay?: number;
  helperText?: string;
  accentColor?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'auto' | 'cyan' | 'purple';
}

function getFillClass(val: number, accent: string): string {
  if (accent === 'indigo') return 'bg-purple-600 dark:bg-purple-500'; 
  if (accent === 'violet') return 'bg-cyan-600 dark:bg-cyan-500';
  if (accent === 'emerald') return 'bg-emerald-500';
  if (accent === 'amber') return 'bg-amber-500';
  if (accent === 'cyan') return 'bg-cyan-500';
  if (accent === 'purple') return 'bg-purple-500';
  
  // auto
  if (val >= 80) return 'bg-rose-500';
  if (val >= 60) return 'bg-amber-500';
  if (val >= 40) return 'bg-purple-500';
  if (val >= 20) return 'bg-cyan-500';
  return 'bg-emerald-500';
}

function getGlowClass(val: number, accent: string): string {
  if (accent === 'indigo' || accent === 'purple') return 'shadow-[0_0_12px_rgba(168,85,247,0.6)] dark:shadow-[0_0_12px_rgba(168,85,247,0.8)]';
  if (accent === 'violet' || accent === 'cyan') return 'shadow-[0_0_12px_rgba(6,182,212,0.6)] dark:shadow-[0_0_12px_rgba(6,182,212,0.8)]';
  if (accent === 'emerald') return 'shadow-[0_0_12px_rgba(16,185,129,0.6)] dark:shadow-[0_0_12px_rgba(16,185,129,0.8)]';
  if (accent === 'amber') return 'shadow-[0_0_12px_rgba(245,158,11,0.6)] dark:shadow-[0_0_12px_rgba(245,158,11,0.8)]';
  
  if (val >= 80) return 'shadow-[0_0_12px_rgba(244,63,94,0.6)] dark:shadow-[0_0_12px_rgba(244,63,94,0.8)]';
  if (val >= 60) return 'shadow-[0_0_12px_rgba(245,158,11,0.6)] dark:shadow-[0_0_12px_rgba(245,158,11,0.8)]';
  if (val >= 40) return 'shadow-[0_0_12px_rgba(168,85,247,0.6)] dark:shadow-[0_0_12px_rgba(168,85,247,0.8)]';
  if (val >= 20) return 'shadow-[0_0_12px_rgba(6,182,212,0.6)] dark:shadow-[0_0_12px_rgba(6,182,212,0.8)]';
  return 'shadow-[0_0_12px_rgba(16,185,129,0.6)] dark:shadow-[0_0_12px_rgba(16,185,129,0.8)]';
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
  const glowClass = getGlowClass(clamped, accentColor);

  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-content-secondary transition-colors group-hover:text-content">{label}</span>
          {helperText && (
             <span className="group relative">
               <span className="text-[11px] text-content-muted hidden sm:inline-block cursor-help border-b border-dashed border-border-strong pb-0.5">({helperText})</span>
               <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-content text-base text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg border border-border-strong">
                 {helperText} details
               </span>
             </span>
          )}
        </div>
        <span className="font-mono font-bold text-content tracking-tight">
          {value.toFixed(1)}%
        </span>
      </div>

      <div className="relative h-2.5 rounded-full bg-highlight overflow-hidden shadow-inner">
        <motion.div
          className={`h-full rounded-full ${fillClass} ${glowClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
        />
      </div>
    </div>
  );
}
