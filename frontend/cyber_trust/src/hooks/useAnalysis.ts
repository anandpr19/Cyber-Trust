import { useState, useCallback } from 'react';
import { AnalysisResult } from '../types';
import { apiClient } from '../services/api';

interface UseAnalysisReturn {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  uploadFile: (file: File) => Promise<void>;
  scanById: (input: string, force?: boolean) => Promise<void>;
  clear: () => void;
}

export const useAnalysis = (): UseAnalysisReturn => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const analysis = await apiClient.uploadFile(file);
      setResult(analysis);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze extension';
      setError(errorMessage);
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const scanById = useCallback(async (input: string, force: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const analysis = await apiClient.scanExtension(input, force);
      setResult(analysis);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan extension';
      setError(errorMessage);
      console.error('Scan error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, isLoading, error, uploadFile, scanById, clear };
};
