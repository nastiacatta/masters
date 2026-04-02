import clsx from 'clsx';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export default function Skeleton({
  width,
  height,
  className,
  variant = 'rect',
}: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-slate-200',
        variant === 'circle' && 'rounded-full',
        variant === 'text' && 'rounded h-3',
        variant === 'rect' && 'rounded-xl',
        className,
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
