import { getSupabaseClient } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

console.log('[chatThreadApi] Initialized with API_BASE_URL:', API_BASE_URL);

export interface ChatThread {
  id: string;
  user_id: string;
  title: string;
  topic?: string;
  document_ids?: string[];
  message_count: number;
  last_message_text?: string;
  is_archived: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
}

/**
 * Chat Thread Service - Client side
 * Handles all chat thread operations via backend API
 */
export const chatThreadApi = {
  /**
   * Get all chat threads for the current user
   */
  async getThreads(): Promise<ChatThread[]> {
    try {
      const session = await getSupabaseClient().auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        console.error('[chatThreadApi] No auth token available');
        return [];
      }

      console.log('[chatThreadApi] Fetching threads from:', `${API_BASE_URL}/api/chat/threads`);
      
      const response = await fetch(`${API_BASE_URL}/api/chat/threads`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[chatThreadApi] Failed to fetch threads:', response.status, response.statusText, errorText);
        return [];
      }

      const data = await response.json();
      console.log('[chatThreadApi] Threads fetched successfully:', data);
      return data.threads || [];
    } catch (error) {
      console.error('[chatThreadApi] Error fetching chat threads:', error);
      return [];
    }
  },

  /**
   * Get a specific chat thread
   */
  async getThread(threadId: string): Promise<ChatThread | null> {
    try {
      const session = await getSupabaseClient().auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        console.error('No auth token available');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/threads/${threadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch thread:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data.thread || null;
    } catch (error) {
      console.error('Error fetching chat thread:', error);
      return null;
    }
  },

  /**
   * Create a new chat thread
   */
  async createThread(
    title: string = 'New Chat',
    topic?: string,
    documentIds?: string[]
  ): Promise<ChatThread | null> {
    try {
      const session = await getSupabaseClient().auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        console.error('No auth token available');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/threads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          topic,
          documentIds,
        }),
      });

      if (!response.ok) {
        console.error('Failed to create thread:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data.thread || null;
    } catch (error) {
      console.error('Error creating chat thread:', error);
      return null;
    }
  },

  /**
   * Update a chat thread
   */
  async updateThread(
    threadId: string,
    updates: Partial<ChatThread>
  ): Promise<ChatThread | null> {
    try {
      const session = await getSupabaseClient().auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        console.error('No auth token available');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/threads/${threadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        console.error('Failed to update thread:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data.thread || null;
    } catch (error) {
      console.error('Error updating chat thread:', error);
      return null;
    }
  },

  /**
   * Archive a chat thread
   */
  async archiveThread(threadId: string): Promise<boolean> {
    try {
      const session = await getSupabaseClient().auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        console.error('No auth token available');
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/threads/${threadId}/archive`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error archiving thread:', error);
      return false;
    }
  },

  /**
   * Delete a chat thread
   */
  async deleteThread(threadId: string): Promise<boolean> {
    try {
      const session = await getSupabaseClient().auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        console.error('No auth token available');
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/threads/${threadId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting thread:', error);
      return false;
    }
  },

  /**
   * Pin or unpin a thread
   */
  async togglePin(threadId: string, isPinned: boolean): Promise<boolean> {
    try {
      const session = await getSupabaseClient().auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        console.error('No auth token available');
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/threads/${threadId}/pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPinned }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error toggling pin:', error);
      return false;
    }
  },

  /**
   * Update thread with latest message
   */
  async updateThreadMessage(threadId: string, lastMessage?: string): Promise<boolean> {
    try {
      return await this.updateThread(threadId, {
        last_message_text: lastMessage,
        last_message_at: new Date().toISOString(),
      }).then(result => !!result);
    } catch (error) {
      console.error('Error updating thread message:', error);
      return false;
    }
  },
};
