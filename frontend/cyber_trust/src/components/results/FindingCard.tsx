import React from 'react';
import { GroupedFinding } from '../../types';
import { Card } from '../common/Card';
import { getRiskBgColor, getRiskTextColor } from '../../utils/colors';
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
          'cursor-pointer transition-all duration-300',
          getRiskBgColor(riskLevel)
        )}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{finding.icon}</span>
                <h3 className={`text-lg font-bold ${getRiskTextColor(riskLevel)}`}>
                  {finding.title}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`text-xs font-semibold px-2 py-1 rounded ${getRiskBgColor(riskLevel)}`}>
                  {finding.category}
                </span>
                {finding.count > 1 && (
                  <span className="text-xs text-slate-400">
                    Found in {finding.count} locations
                  </span>
                )}
              </div>
            </div>
            <div className={`text-2xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="space-y-4 pt-4 border-t border-slate-700/50 animate-expand">
              <p className="text-slate-300 leading-relaxed">{finding.explanation}</p>

              {finding.files && finding.files.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-400 mb-2">
                    Found in {finding.files.length} file{finding.files.length > 1 ? 's' : ''}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {finding.files.slice(0, 5).map((file, i) => (
                      <code
                        key={i}
                        className="text-xs bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50 text-slate-300"
                      >
                        {file}
                      </code>
                    ))}
                    {finding.files.length > 5 && (
                      <span className="text-xs text-slate-400 px-2 py-1">
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