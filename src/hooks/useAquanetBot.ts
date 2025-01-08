import { useState, useCallback } from 'react';
import { AquanetBot } from '../AquanetBot';
import type { AquanetBotOptions } from '../types';

interface UseAquanetBotReturn {
  loading: boolean;
  error: Error | null;
  query: (question: string) => Promise<string>;
}

export default function useAquanetBot(options: AquanetBotOptions): UseAquanetBotReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const bot = new AquanetBot(options);

  const query = useCallback(async (question: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bot.query(question);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [bot]);

  return {
    loading,
    error,
    query
  };
} 