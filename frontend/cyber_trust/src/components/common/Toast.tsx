import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-900 border-green-700 text-green-200',
    error: 'bg-red-900 border-red-700 text-red-200',
    info: 'bg-blue-900 border-blue-700 text-blue-200'
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-sm p-4 rounded-lg border ${colors[type]} animate-fade-in-up`}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icons[type]}</span>
        <p>{message}</p>
        <button
          onClick={onClose}
          className="ml-auto text-lg hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
};