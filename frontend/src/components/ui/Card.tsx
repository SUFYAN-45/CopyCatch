interface Props {
  className?: string;
  children?: React.ReactNode;
}

export function Card({ className = '', children }: Props) {
  return (
    <div className={`rounded-2xl border border-white/8 bg-zinc-900/60 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: Props) {
  return <div className={`px-6 pt-6 pb-4 border-b border-white/6 ${className}`}>{children}</div>;
}

export function CardBody({ className = '', children }: Props) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
