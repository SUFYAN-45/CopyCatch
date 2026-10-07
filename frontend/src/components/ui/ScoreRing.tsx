import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface Props {
  score: number;  // 0–100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function getScoreColor(score: number): { hex: string; textClass: string; bgClass: string; borderClass: string } {
  if (score >= 80) return { hex: '#f43f5e', textClass: 'text-rose-600 dark:text-rose-400', bgClass: 'bg-rose-50 dark:bg-rose-500/10', borderClass: 'border-rose-200 dark:border-rose-500/20' };
  if (score >= 60) return { hex: '#f59e0b', textClass: 'text-amber-600 dark:text-amber-400', bgClass: 'bg-amber-50 dark:bg-amber-500/10', borderClass: 'border-amber-200 dark:border-amber-500/20' };
  if (score >= 40) return { hex: '#c084fc', textClass: 'text-purple-600 dark:text-purple-400', bgClass: 'bg-purple-50 dark:bg-purple-500/10', borderClass: 'border-purple-200 dark:border-purple-500/20' };
  if (score >= 20) return { hex: '#06b6d4', textClass: 'text-cyan-600 dark:text-cyan-400', bgClass: 'bg-cyan-50 dark:bg-cyan-500/10', borderClass: 'border-cyan-200 dark:border-cyan-500/20' };
  return { hex: '#10b981', textClass: 'text-emerald-600 dark:text-emerald-400', bgClass: 'bg-emerald-50 dark:bg-emerald-500/10', borderClass: 'border-emerald-200 dark:border-emerald-500/20' };
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

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 1100, bounce: 0 });
  const displayValue = useTransform(springValue, (current) => current.toFixed(1));

  useEffect(() => {
    // Slight delay before animating
    const timer = setTimeout(() => motionValue.set(clampedScore), 150);
    return () => clearTimeout(timer);
  }, [clampedScore, motionValue]);

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
            className="stroke-border-subtle"
            strokeWidth={1}
          />

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className="stroke-highlight"
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
              filter: `drop-shadow(0 0 8px ${colorHex}60) drop-shadow(0 0 16px ${colorHex}30)`,
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
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-content flex items-baseline">
              <motion.span>{displayValue}</motion.span><span className="text-lg text-content-muted font-sans font-medium ml-0.5">%</span>
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted mt-1">
              Index
            </span>
          </motion.div>
        </div>
      </div>

      {label && (
        <span className="text-xs font-bold text-content-secondary uppercase tracking-wider font-mono mt-4">
          {label}
        </span>
      )}
      {sublabel && (
        <span className="text-[11px] font-medium text-content-muted mt-1">
          {sublabel}
        </span>
      )}
    </div>
  );
}
