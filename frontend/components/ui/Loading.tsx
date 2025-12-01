'use client';

import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function Loading({ size = 'md', className, text }: LoadingProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className="relative">
        <div className={cn('animate-spin rounded-full border-4 border-gray-200', sizes[size])}>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
        </div>
        <div className={cn('absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-20', sizes[size])}></div>
      </div>
      {text && (
        <p className="text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
}

// Full page loading spinner
export function LoadingPage({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Loading size="lg" text={text} />
    </div>
  );
}
