import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  withGrid?: boolean;
}

export function PageContainer({ children, className = '', withGrid = false }: Props) {
  return (
    <div className={`relative w-full min-h-[calc(100vh-4.5rem)] ${withGrid ? 'bg-grid-pattern' : ''}`}>
      <div className={`mx-auto max-w-[1280px] w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-10 sm:py-12 ${className}`}>
        {children}
      </div>
    </div>
  );
}
