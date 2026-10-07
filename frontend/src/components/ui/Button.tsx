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
  primary:   'bg-accent hover:bg-accent-hover active:scale-95 text-white shadow-md border-transparent',
  secondary: 'bg-surface hover:bg-highlight active:scale-95 text-content border border-border-strong shadow-sm',
  ghost:     'bg-transparent hover:bg-highlight active:scale-95 text-content-secondary border border-transparent',
  danger:    'bg-rose-50 dark:bg-rose-500/15 hover:bg-rose-100 dark:hover:bg-rose-500/25 active:scale-95 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 shadow-sm',
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
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...(rest as object)}
    >
      {loading ? <Loader2 className="size-4 animate-spin text-current" /> : icon}
      <span>{children}</span>
    </motion.button>
  );
}
