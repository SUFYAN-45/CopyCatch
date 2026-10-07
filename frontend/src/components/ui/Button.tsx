import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANTS = {
  primary:   'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 border border-indigo-400/25',
  secondary: 'bg-white/[0.05] hover:bg-white/[0.08] active:bg-white/[0.1] text-zinc-200 border border-white/[0.1] shadow-sm',
  ghost:     'bg-transparent hover:bg-white/[0.05] active:bg-white/[0.08] text-zinc-300 border border-transparent',
  danger:    'bg-red-500/15 hover:bg-red-500/25 active:bg-red-500/30 text-red-300 border border-red-500/30 shadow-sm',
};

const SIZES = {
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-xs sm:text-sm px-4 py-2.5 rounded-xl gap-2 font-medium',
  lg: 'text-sm sm:text-base px-6 py-3 rounded-xl gap-2.5 font-semibold',
};

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading, 
  icon, 
  children, 
  disabled, 
  className = '', 
  ...rest 
}: Props) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.015 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...(rest as object)}
    >
      {loading ? <Loader2 className="size-4 animate-spin text-current" /> : icon}
      <span>{children}</span>
    </motion.button>
  );
}
