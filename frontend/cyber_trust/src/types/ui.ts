import { RiskLevel, GroupedFinding } from './index';

export interface RiskLevelCardProps {
  score: number;
  overallRisk: RiskLevel;
  summary: string;
}

export interface FindingCardProps {
  finding: GroupedFinding;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export interface ExtensionHeaderProps {
  extensionId: string;
  name: string;
  version: string;
  timestamp: string;
}

export interface RecommendationProps {
  recommendations: string[];
  score: number;
}