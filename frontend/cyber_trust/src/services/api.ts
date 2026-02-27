import axios, { AxiosInstance } from 'axios';
import { AnalysisResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for debugging
    this.client.interceptors.request.use((config) => {
      console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
      return config;
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ API Response:', response.status, response.data);
        return response;
      },
      (error) => {
        console.error('❌ API Error:', error.response?.status, error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Upload CRX file for analysis
   */
  async uploadFile(file: File, extensionId?: string): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (extensionId) {
      formData.append('extensionId', extensionId);
    }

    try {
      const response = await this.client.post<AnalysisResult>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Scan extension by ID or Chrome Web Store URL
   */
  async scanExtension(input: string, force: boolean = false): Promise<AnalysisResult> {
    try {
      // Detect if input is a URL or an extension ID
      const isUrl = input.startsWith('http://') || input.startsWith('https://');
      const payload = isUrl
        ? { url: input, force: force ? 'true' : undefined }
        : { extensionId: input.trim(), force: force ? 'true' : undefined };

      const response = await this.client.post<AnalysisResult>('/scan', payload);

      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to scan extension: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check API health
   */
  async checkHealth(): Promise<{ status: string; dbConnected: boolean }> {
    try {
      const response = await this.client.get<{ status: string; dbConnected: boolean }>('/health');
      return response.data;
    } catch (error) {
      throw new Error(`API health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get public dashboard stats
   */
  async getDashboard(): Promise<any> {
    try {
      const response = await this.client.get('/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to load dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const apiClient = new ApiClient();