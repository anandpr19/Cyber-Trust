import { useState, useCallback } from 'react';
import { StoredAnalysis, AnalysisResult } from '../types';

// Helper function to load from localStorage
const loadAnalysesFromStorage = (): StoredAnalysis[] => {
  try {
    const stored = localStorage.getItem('cyber-trust-analyses');
    if (stored) {
      return JSON.parse(stored) as StoredAnalysis[];
    }
    return [];
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return [];
  }
};

export const useLocalStorage = () => {
  // Use lazy initialization - only runs once on mount!
  // This avoids the setState-in-effect warning
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>(() => 
    loadAnalysesFromStorage()
  );

  // Save analysis
  const saveAnalysis = useCallback((result: AnalysisResult) => {
    try {
      const stored: StoredAnalysis = {
        id: `${result.extensionId}-${Date.now()}`,
        result,
        savedAt: new Date().toISOString()
      };

      // Use functional update to avoid dependency issues
      setAnalyses((prev) => {
        const updated = [stored, ...prev].slice(0, 10); // Keep last 10
        localStorage.setItem('cyber-trust-analyses', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setAnalyses([]);
    localStorage.removeItem('cyber-trust-analyses');
  }, []);

  return { analyses, saveAnalysis, clearAll };
};
