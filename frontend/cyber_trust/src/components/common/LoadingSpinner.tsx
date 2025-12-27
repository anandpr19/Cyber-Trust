import React from 'react';
import { LoadingSpinnerProps } from '../../types';

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'text-blue-500'
}) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} ${color} animate-spin`}
        style={{
          borderWidth: '3px',
          borderStyle: 'solid',
          borderColor: 'currentColor',
          borderRightColor: 'transparent',
          borderRadius: '50%'
        }}
      />
    </div>
  );
};