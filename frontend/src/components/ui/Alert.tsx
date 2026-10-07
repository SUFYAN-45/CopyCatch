import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type Variant = 'info' | 'success' | 'warning' | 'error';

const CONFIG: Record<Variant, { icon: typeof Info; color: string; bg: string; border: string }> = {
  info:    { icon: Info,         color: 'text-indigo-400',  bg: 'bg-indigo-500/8',  border: 'border-indigo-500/20' },
  success: { icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/20' },
  warning: { icon: AlertCircle,  color: 'text-amber-400',   bg: 'bg-amber-500/8',   border: 'border-amber-500/20' },
  error:   { icon: XCircle,      color: 'text-rose-400',    bg: 'bg-rose-500/8',    border: 'border-rose-500/20' },
};

interface Props {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({ variant = 'info', title, children, className = '' }: Props) {
  const { icon: Icon, color, bg, border } = CONFIG[variant];
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 rounded-xl border p-4 ${bg} ${border} ${className}`}
    >
      <Icon className={`mt-0.5 size-4.5 shrink-0 ${color}`} />
      <div className="text-xs sm:text-sm leading-relaxed">
        {title && <p className={`font-semibold mb-0.5 ${color}`}>{title}</p>}
        <div className="text-zinc-300 font-normal">{children}</div>
      </div>
    </motion.div>
  );
}
