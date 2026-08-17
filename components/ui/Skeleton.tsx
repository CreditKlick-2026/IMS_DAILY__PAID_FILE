import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-none ${className}`}
      {...props}
    />
  );
}

export function TableRowSkeleton({ cols = 6, rows = 5 }: { cols?: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="border-b border-slate-100 animate-pulse">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="px-3.5 py-3">
              <div
                className="h-3.5 bg-slate-200/80 rounded-none"
                style={{ width: `${Math.max(40, Math.min(95, 60 + ((rIdx * 17 + cIdx * 23) % 35)))}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/90 p-4 shadow-2xs space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-5" />
      </div>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-2.5 w-40" />
    </div>
  );
}
