import { useState, useCallback } from 'react';

// Get API base URL from environment, default to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

interface Source {
  rank: number;
  id?: string;
  title: string;
  category: string;
  relevanceScore: string;
}

interface QueryResponse {
  success: boolean;
  query: string;
  answer: string;
  sources: Source[];
  sourceCount: number;
  elapsedTime: string;
}

interface RetrievalResponse {
  success: boolean;
  query: string;
  resultsCount: number;
  elapsedTime: string;
  results: Array<{
    rank: number;
    id: string;
    title: string;
    content: string;
    relevanceScore: string;
    category: string;
    chunkIndex: number;
  }>;
}

export function useLegalChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Query the legal AI backend for an answer
   */
  const queryLegalAI = useCallback(
    async (query: string): Promise<QueryResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = (await response.json()) as QueryResponse;

        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to query legal AI';
        setError(errorMessage);
        console.error('[useLegalChat] Error:', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Retrieve relevant documents for a query
   */
  const retrieveDocuments = useCallback(
    async (query: string, topK: number = 5): Promise<RetrievalResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/retrieve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, topK }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = (await response.json()) as RetrievalResponse;

        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to retrieve documents';
        setError(errorMessage);
        console.error('[useLegalChat] Error:', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Stream answer from the legal AI
   */
  const streamLegalAI = useCallback(
    async (query: string, onChunk: (chunk: string) => void): Promise<Source[] | null> => {
      setLoading(true);
      setError(null);

      try {
        console.log('[useLegalChat] Streaming query: ', query);

        const response = await fetch(`${API_BASE_URL}/api/query/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let sources: Source[] = [];
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          // Keep the last incomplete line in the buffer
          buffer = lines[lines.length - 1];

          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i];

            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.done) {
                  sources = data.sources || [];
                } else if (data.chunk) {
                  onChunk(data.chunk);
                }
              } catch (e) {
                console.error('[useLegalChat] Failed to parse chunk:', e);
              }
            }
          }
        }

        return sources;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to stream legal AI response';
        setError(errorMessage);
        console.error('[useLegalChat] Error:', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    queryLegalAI,
    retrieveDocuments,
    streamLegalAI,
  };
}
