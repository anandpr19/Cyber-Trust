/**
 * API Response Types
 */

export interface Finding {
  type: 'permission' | 'host-permission' | 'code-pattern' | 'deprecated' | 'info';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'good';
  description: string;
  permission?: string;
  pattern?: string;
  file?: string;
  value?: string;
}

export interface GroupedFinding {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'good';
  title: string;
  explanation: string;
  files?: string[];
  count: number;
  icon: string;
}

export interface FindingsReport {
  overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  riskScore: number;
  riskPercentage: number;
  summary: string;
  categories: {
    critical: GroupedFinding[];
    high: GroupedFinding[];
    medium: GroupedFinding[];
    low: GroupedFinding[];
  };
  totalIssues: number;
  recommendations: string[];
}

export interface AnalysisResult {
  success: boolean;
  extensionId: string;
  name: string;
  version: string;
  report: FindingsReport;
  rawData: {
    manifest: Record<string, unknown>;
    score: number;
    findings: Finding[];
    fileSize: number;
    zipSize: number;
  };
  savedToDb: boolean;
  timestamp: string;
}

/**
 * UI State Types
 */

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';

export interface UploadState {
  isDragging: boolean;
  isLoading: boolean;
  error: string | null;
  fileName?: string;
}

export interface AppState {
  currentAnalysis: AnalysisResult | null;
  uploadState: UploadState;
  recentAnalyses: AnalysisResult[];
}

/**
 * Component Prop Types
 */

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}
export interface BadgeProps {
  variant: 'critical' | 'high' | 'medium' | 'low' | 'safe';
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: RiskLevel;
  animated?: boolean;
  showLabel?: boolean;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

/**
 * Local Storage Types
 */

export interface StoredAnalysis {
  id: string;
  result: AnalysisResult;
  savedAt: string;
}