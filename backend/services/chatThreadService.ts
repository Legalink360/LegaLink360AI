import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient<any> | null = null;

function getSupabaseClient(): SupabaseClient<any> {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    }

    supabase = createClient(supabaseUrl, supabaseKey);
  }

  return supabase;
}

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

export class ChatThreadService {
  /**
   * Get all chat threads for a user, ordered by most recent
   */
  async getUserChatThreads(userId: string): Promise<ChatThread[]> {
    try {
      console.log('[ChatThreadService] Fetching threads for user:', userId);
      
      const { data, error } = await getSupabaseClient()
        .from('chat_threads')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ChatThreadService] Error fetching chat threads:', error);
        return [];
      }

      console.log('[ChatThreadService] Found threads:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('[ChatThreadService] Error in getUserChatThreads:', error);
      return [];
    }
  }

  /**
   * Get a specific chat thread
   */
  async getChatThread(threadId: string, userId: string): Promise<ChatThread | null> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('chat_threads')
        .select('*')
        .eq('id', threadId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching chat thread:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getChatThread:', error);
      return null;
    }
  }

  /**
   * Create a new chat thread
   */
  async createChatThread(
    userId: string,
    title: string = 'New Chat',
    topic?: string,
    documentIds?: string[]
  ): Promise<ChatThread | null> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('chat_threads')
        .insert([
          {
            user_id: userId,
            title,
            topic,
            document_ids: documentIds || [],
            message_count: 0,
            is_archived: false,
            is_pinned: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating chat thread:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createChatThread:', error);
      return null;
    }
  }

  /**
   * Update chat thread metadata
   */
  async updateChatThread(
    threadId: string,
    userId: string,
    updates: Partial<ChatThread>
  ): Promise<ChatThread | null> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('chat_threads')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', threadId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating chat thread:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateChatThread:', error);
      return null;
    }
  }

  /**
   * Update thread title
   */
  async updateThreadTitle(
    threadId: string,
    userId: string,
    title: string
  ): Promise<boolean> {
    try {
      const { error } = await getSupabaseClient()
        .from('chat_threads')
        .update({
          title,
          updated_at: new Date().toISOString(),
        })
        .eq('id', threadId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating thread title:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateThreadTitle:', error);
      return false;
    }
  }

  /**
   * Update message count and last message info
   */
  async updateThreadMessage(
    threadId: string,
    userId: string,
    lastMessage?: string
  ): Promise<boolean> {
    try {
      const { error } = await getSupabaseClient()
        .rpc('increment_thread_message_count', {
          p_thread_id: threadId,
          p_user_id: userId,
          p_last_message: lastMessage || null,
        });

      if (error) {
        console.error('Error updating thread message:', error);
        return false;
      }

      return true;
    } catch (error) {
      // RPC might not exist, fallback to regular update
      try {
        const { error: updateError } = await getSupabaseClient()
          .from('chat_threads')
          .update({
            last_message_text: lastMessage,
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', threadId)
          .eq('user_id', userId);

        return !updateError;
      } catch (fallbackError) {
        console.error('Error in updateThreadMessage fallback:', fallbackError);
        return false;
      }
    }
  }

  /**
   * Archive a chat thread
   */
  async archiveThread(threadId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await getSupabaseClient()
        .from('chat_threads')
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', threadId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error archiving thread:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in archiveThread:', error);
      return false;
    }
  }

  /**
   * Delete a chat thread
   */
  async deleteThread(threadId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await getSupabaseClient()
        .from('chat_threads')
        .delete()
        .eq('id', threadId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting thread:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteThread:', error);
      return false;
    }
  }

  /**
   * Pin/unpin a thread
   */
  async togglePinThread(threadId: string, userId: string, isPinned: boolean): Promise<boolean> {
    try {
      const { error } = await getSupabaseClient()
        .from('chat_threads')
        .update({
          is_pinned: isPinned,
          updated_at: new Date().toISOString(),
        })
        .eq('id', threadId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error toggling pin:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in togglePinThread:', error);
      return false;
    }
  }
}
