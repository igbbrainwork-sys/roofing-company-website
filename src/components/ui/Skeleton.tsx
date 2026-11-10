import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
  }[variant];

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={`animate-pulse bg-slate-200/80 ${variantStyles} ${className}`}
      {...props}
    />
  );
};
