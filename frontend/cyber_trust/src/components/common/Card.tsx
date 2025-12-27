
import React from 'react';
import { cn } from '../../utils/cn';
import { CardProps } from '../../types';

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hover = false
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-slate-800/50 border border-slate-700/50 rounded-xl p-6',
        'transition-all duration-300 backdrop-blur-sm',
        hover && 'hover:bg-slate-800 hover:border-slate-600 hover:shadow-lg hover:-translate-y-1 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};
