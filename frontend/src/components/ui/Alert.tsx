import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type Variant = 'info' | 'success' | 'warning' | 'error';

const CONFIG: Record<Variant, { icon: typeof Info; color: string; bg: string }> = {
  info:    { icon: Info,         color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/20' },
  success: { icon: CheckCircle,  color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  warning: { icon: AlertCircle,  color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  error:   { icon: XCircle,      color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/20' },
};

interface Props {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({ variant = 'info', title, children, className = '' }: Props) {
  const { icon: Icon, color, bg } = CONFIG[variant];
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 rounded-xl border p-4 ${bg} ${className}`}
    >
      <Icon className={`mt-0.5 size-5 shrink-0 ${color}`} />
      <div className="text-sm">
        {title && <p className={`font-semibold mb-0.5 ${color}`}>{title}</p>}
        <p className="text-zinc-300">{children}</p>
      </div>
    </motion.div>
  );
}
