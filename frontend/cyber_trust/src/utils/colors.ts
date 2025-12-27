import { RiskLevel } from '../types';

export const getRiskColor = (level: RiskLevel): string => {
  const colors: Record<RiskLevel, string> = {
    SAFE: '#10B981',
    LOW: '#F59E0B',
    MEDIUM: '#F97316',
    HIGH: '#EF4444',
    CRITICAL: '#7C3AED'
  };
  return colors[level];
};

export const getRiskBgColor = (level: RiskLevel): string => {
  const colors: Record<RiskLevel, string> = {
    SAFE: 'bg-green-900/20',
    LOW: 'bg-amber-900/20',
    MEDIUM: 'bg-orange-900/20',
    HIGH: 'bg-red-900/20',
    CRITICAL: 'bg-purple-900/20'
  };
  return colors[level];
};

export const getRiskTextColor = (level: RiskLevel): string => {
  const colors: Record<RiskLevel, string> = {
    SAFE: 'text-green-400',
    LOW: 'text-amber-400',
    MEDIUM: 'text-orange-400',
    HIGH: 'text-red-400',
    CRITICAL: 'text-purple-400'
  };
  return colors[level];
};

export const getRiskBorderColor = (level: RiskLevel): string => {
  const colors: Record<RiskLevel, string> = {
    SAFE: 'border-green-500',
    LOW: 'border-amber-500',
    MEDIUM: 'border-orange-500',
    HIGH: 'border-red-500',
    CRITICAL: 'border-purple-500'
  };
  return colors[level];
};