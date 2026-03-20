
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
        'bg-zinc-900/40 border border-white/5 shadow-sm rounded-sm p-6',
        'transition-all duration-300',
        hover && 'hover:border-white/10 hover:shadow-md cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};
