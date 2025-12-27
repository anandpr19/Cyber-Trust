import React from 'react';
import { cn } from '../../utils/cn';
import { BadgeProps } from '../../types';
import { getRiskBgColor, getRiskTextColor } from '../../utils/colors';

export const Badge: React.FC<BadgeProps> = ({
  variant,
  children,
  size = 'md'
}) => {
  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const icons = {
    critical: '⛔',
    high: '🔴',
    medium: '🟡',
    low: '🟢',
    safe: '✅'
  };

  const riskLevel = variant.toUpperCase() as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-semibold rounded-full',
        getRiskBgColor(riskLevel),
        getRiskTextColor(riskLevel),
        sizes[size]
      )}
    >
      <span>{icons[variant]}</span>
      {children}
    </span>
  );
};