import React, { useEffect, useState } from 'react';
import { ProgressBarProps, RiskLevel } from '../../types';
import { getRiskColor } from '../../utils/colors';

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color,
  animated = true,
  showLabel = true
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Only animate when animated is true and value changes
  useEffect(() => {
    if (!animated) {
      // Just set directly - no animation. Schedule update asynchronously to avoid synchronous setState in effect.
      const handle = window.setTimeout(() => setDisplayValue(value), 0);
      return () => clearTimeout(handle);
    }

    // Animation logic
    let current = 0;
    const target = value;
    const increment = target / 30;

    const interval = window.setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayValue(target);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, 16); // 60fps

    return () => clearInterval(interval);
  }, [value, animated]);

  // Determine color based on value if not specified
  const getColorForValue = (val: number): RiskLevel => {
    if (val >= 80) return 'SAFE';
    if (val >= 50) return 'LOW';
    if (val >= 25) return 'MEDIUM';
    return 'HIGH';
  };

  const bgColor = color || getColorForValue(value);
  const progressColor = getRiskColor(bgColor as RiskLevel);

  return (
    <div className="w-full">
      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
        <div
          style={{
            width: `${(displayValue / max) * 100}%`,
            backgroundColor: progressColor,
            transition: animated ? 'width 0.3s ease-out' : 'none'
          }}
          className="h-full rounded-full shadow-lg"
        />
      </div>
      {showLabel && (
        <div className="mt-2 text-right text-sm font-semibold text-slate-300">
          {displayValue}/{max}
        </div>
      )}
    </div>
  );
};