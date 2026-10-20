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
  primary:   'bg-accent hover:bg-accent-hover active:scale-98 text-white shadow-md border border-transparent',
  secondary: 'bg-surface hover:bg-highlight active:scale-98 text-content border border-border-strong shadow-sm',
  ghost:     'bg-transparent hover:bg-highlight active:scale-98 text-content-secondary border border-transparent',
  danger:    'bg-rose-50 dark:bg-rose-500/15 hover:bg-rose-100 dark:hover:bg-rose-500/25 active:scale-98 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 shadow-sm',
};

const PADDINGS = {
  sm: { padding: '6px 14px', borderRadius: '8px', gap: '6px', fontSize: '0.75rem' },
  md: { padding: '10px 20px', borderRadius: '10px', gap: '8px', fontSize: '0.875rem' },
  lg: { padding: '12px 28px', borderRadius: '12px', gap: '10px', fontSize: '1rem' },
};

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading, 
  icon, 
  children, 
  disabled, 
  className = '', 
  style = {},
  ...rest 
}: Props) {
  const pad = PADDINGS[size];

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.015 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${VARIANTS[variant]} ${className}`}
      style={{
        padding: pad.padding,
        borderRadius: pad.borderRadius,
        gap: pad.gap,
        fontSize: pad.fontSize,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
      {...(rest as object)}
    >
      {loading ? <Loader2 className="size-4 animate-spin text-current shrink-0" /> : icon}
      <span>{children}</span>
    </motion.button>
  );
}