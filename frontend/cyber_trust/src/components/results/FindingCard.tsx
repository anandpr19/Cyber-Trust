import React from 'react';
import { GroupedFinding } from '../../types';
import { Card } from '../common/Card';
import { getRiskBorderColor, getRiskTextColor } from '../../utils/colors';
import { cn } from '../../utils/cn';

interface FindingCardProps {
  finding: GroupedFinding;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  isExpanded,
  onToggle,
  index
}) => {
  // Convert lowercase to uppercase for color functions
  const riskLevel = finding.severity.toUpperCase() as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Card
        hover
        onClick={onToggle}
        className={cn(
          'cursor-pointer transition-all duration-300 border border-white/5 bg-zinc-900/40 shadow-sm border-l-2',
          getRiskBorderColor(riskLevel)
        )}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl opacity-80">{finding.icon}</span>
                <h3 className={`text-base font-medium ${getRiskTextColor(riskLevel)}`}>
                  {finding.title}
                </h3>
              </div>
              <div className="flex flex-wrap gap-3 items-center mt-3">
                <span className={`text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded border border-white/10 ${getRiskTextColor(riskLevel)} bg-black/20`}>
                  {finding.category}
                </span>
                {finding.count > 1 && (
                  <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500">
                    LOCATIONS: {finding.count}
                  </span>
                )}
              </div>
            </div>
            <div className={`text-zinc-500 text-sm font-mono transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
              {'>'}
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="space-y-4 pt-4 border-t border-white/5 animate-expand">
              <p className="text-zinc-400 text-sm leading-relaxed">{finding.explanation}</p>

              {finding.files && finding.files.length > 0 && (
                <div className="bg-black/40 border border-white/5 rounded p-3 mt-2">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-3">
                    Detected_In_Files [{finding.files.length}]:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {finding.files.slice(0, 5).map((file, i) => (
                      <code
                        key={i}
                        className="text-xs font-mono bg-zinc-900/80 px-2 py-1 rounded border border-white/5 text-zinc-300"
                      >
                        {file}
                      </code>
                    ))}
                    {finding.files.length > 5 && (
                      <span className="text-xs font-mono text-zinc-500 px-2 py-1">
                        +{finding.files.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};