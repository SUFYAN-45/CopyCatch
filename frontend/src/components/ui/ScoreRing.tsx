import { motion } from 'framer-motion';

interface Props {
  score: number;  // 0–100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function getScoreColor(score: number): { hex: string; textClass: string; bgClass: string; borderClass: string } {
  if (score >= 80) return { hex: '#f43f5e', textClass: 'text-rose-400', bgClass: 'bg-rose-500/10', borderClass: 'border-rose-500/20' };
  if (score >= 60) return { hex: '#f59e0b', textClass: 'text-amber-400', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-500/20' };
  if (score >= 40) return { hex: '#818cf8', textClass: 'text-indigo-400', bgClass: 'bg-indigo-500/10', borderClass: 'border-indigo-500/20' };
  if (score >= 20) return { hex: '#38bdf8', textClass: 'text-sky-400', bgClass: 'bg-sky-500/10', borderClass: 'border-sky-500/20' };
  return { hex: '#10b981', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500/20' };
}

export function ScoreRing({ 
  score, 
  size = 170, 
  strokeWidth = 10, 
  label = 'Overall Similarity',
  sublabel 
}: Props) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (clampedScore / 100) * circumference;
  const { hex: colorHex } = getScoreColor(score);

  return (
    <div className="flex flex-col items-center justify-center p-2 text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90 origin-center"
          aria-label={`Similarity gauge showing ${score.toFixed(1)} percent`}
        >
          {/* Subtle Outer boundary track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + strokeWidth / 2}
            fill="none"
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth={1}
          />

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
          />

          {/* Animated Value Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colorHex}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{ 
              filter: `drop-shadow(0 0 6px ${colorHex}40)`,
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="flex flex-col items-center leading-none"
          >
            <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white">
              {score.toFixed(1)}<span className="text-lg text-zinc-400 font-sans font-medium ml-0.5">%</span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mt-1">
              Index
            </span>
          </motion.div>
        </div>
      </div>

      {label && (
        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono mt-3">
          {label}
        </span>
      )}
      {sublabel && (
        <span className="text-[11px] text-zinc-400 mt-0.5">
          {sublabel}
        </span>
      )}
    </div>
  );
}
