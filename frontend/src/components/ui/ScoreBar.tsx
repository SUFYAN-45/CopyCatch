/** Horizontal score bar with label + percentage */
import { motion } from 'framer-motion';

interface Props {
  label: string;
  value: number;   // 0–100
  color?: string;
  delay?: number;
}

function barColor(v: number, custom?: string): string {
  if (custom) return custom;
  if (v >= 75) return 'bg-red-500';
  if (v >= 50) return 'bg-amber-500';
  if (v >= 25) return 'bg-indigo-500';
  return 'bg-emerald-500';
}

export function ScoreBar({ label, value, color, delay = 0 }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="font-semibold text-zinc-200">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/6 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor(value, color)}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  );
}
