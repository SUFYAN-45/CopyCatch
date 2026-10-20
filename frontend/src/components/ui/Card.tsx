interface Props {
  className?: string;
  children?: React.ReactNode;
}

export function Card({ className = '', children }: Props) {
  return (
    <div className={`surface-card rounded-2xl border border-border-subtle shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }: Props) {
  return (
    <div className={`px-6 pt-6 pb-4 border-b border-border-subtle ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ className = '', children }: Props) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}