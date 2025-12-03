// components/Skeleton.tsx
'use client';

import React from 'react';

export type SkeletonVariant = 'default' | 'circle' | 'rectangular' | 'text';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'default',
  width,
  height,
  className = '',
  rounded = 'md'
}) => {
  const variantClasses = {
    default: 'bg-gray-200',
    circle: 'bg-gray-200 rounded-full',
    rectangular: 'bg-gray-200',
    text: 'bg-gray-200 h-4'
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  const style: React.CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined
  };

  const baseClasses = `animate-pulse ${variantClasses[variant]}`;
  const finalClasses = variant === 'circle' 
    ? baseClasses 
    : `${baseClasses} ${roundedClasses[rounded]}`;

  return (
    <div 
      className={`${finalClasses} ${className}`}
      style={style}
      role="status"
      aria-label="Loading..."
    />
  );
};

// Card Skeleton
export interface CardSkeletonProps {
  showImage?: boolean;
  lines?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  showImage = false, 
  lines = 3 
}) => (
  <div className="bg-white rounded-lg shadow p-6 space-y-4">
    {showImage && <Skeleton variant="rectangular" height={192} className="mb-4" />}
    <Skeleton width="60%" height={24} />
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        width={i === lines - 1 ? '80%' : '100%'} 
        height={16} 
      />
    ))}
    <div className="flex gap-2 pt-2">
      <Skeleton width={80} height={32} />
      <Skeleton width={80} height={32} />
    </div>
  </div>
);

// Table Skeleton
export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5, 
  columns = 4,
  showHeader = true 
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      {showHeader && (
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3 text-left">
                <Skeleton width="70%" height={16} />
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody className="bg-white divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <td key={colIndex} className="px-6 py-4">
                <Skeleton width="80%" height={16} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// List Skeleton
export interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ 
  items = 5,
  showAvatar = false 
}) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
        {showAvatar && <Skeleton variant="circle" width={48} height={48} />}
        <div className="flex-1 space-y-2">
          <Skeleton width="40%" height={18} />
          <Skeleton width="90%" height={14} />
        </div>
      </div>
    ))}
  </div>
);

// Chart Skeleton
export const ChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton width={120} height={24} />
      <Skeleton width={80} height={32} />
    </div>
    <div className="space-y-2">
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 7 }).map((_, i) => {
          const heights = [60, 40, 80, 50, 90, 70, 85];
          return (
            <Skeleton 
              key={i} 
              className="flex-1" 
              height={`${heights[i]}%`}
            />
          );
        })}
      </div>
    </div>
    <div className="flex items-center justify-center gap-4 pt-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton variant="circle" width={12} height={12} />
          <Skeleton width={60} height={14} />
        </div>
      ))}
    </div>
  </div>
);

// Dashboard Grid Skeleton
export interface DashboardSkeletonProps {
  cards?: number;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ 
  cards = 4 
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton width={200} height={32} />
      <Skeleton width={120} height={40} />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6 space-y-3">
          <Skeleton width={100} height={14} />
          <Skeleton width="60%" height={32} />
          <Skeleton width="40%" height={12} />
        </div>
      ))}
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
    
    <div className="bg-white rounded-lg shadow p-6">
      <Skeleton width={180} height={24} className="mb-4" />
      <TableSkeleton rows={5} columns={5} />
    </div>
  </div>
);

// Form Skeleton
export interface FormSkeletonProps {
  fields?: number;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({ fields = 5 }) => (
  <div className="bg-white rounded-lg shadow p-6 space-y-6">
    <Skeleton width={200} height={28} />
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton width={120} height={16} />
        <Skeleton height={40} />
      </div>
    ))}
    <div className="flex gap-3 pt-4">
      <Skeleton width={100} height={40} />
      <Skeleton width={100} height={40} />
    </div>
  </div>
);