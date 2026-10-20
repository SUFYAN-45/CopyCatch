import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  withGrid?: boolean;
}

export function PageContainer({ children, className = '', withGrid = false }: Props) {
  return (
    <div className={`relative w-full flex-1 flex flex-col ${withGrid ? 'bg-grid-pattern' : ''}`}>
      <div className={`page-container ${className}`}>
        {children}
      </div>
    </div>
  );
}