"use client";

import { useCallback, useState, useEffect } from "react";
import { type FactAction } from "@/components/ChatArea";
import { type ChatThread } from "@/components/Sidebar";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/hooks/useAuth";
import { chatThreadApi } from "@/lib/chatThreadApi";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ChatArea from "@/components/ChatArea";
import Footer from "@/components/Footer";

// Helper function to format date
function formatDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export default function App() {
  const { scheme, setScheme } = useColorScheme();
  const { isAuthenticated } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatThread[]>([]);
  const [chatKitControl, setChatKitControl] = useState<any>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);

  // Fetch chat history from database
  const fetchChatHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setChatHistory([]);
      return;
    }

    try {
      const threads = await chatThreadApi.getThreads();
      
      const formattedHistory = threads.map((thread) => ({
        id: thread.id,
        title: thread.title || "Untitled Chat",
        date: thread.last_message_at 
          ? formatDate(new Date(thread.last_message_at)) 
          : formatDate(new Date(thread.created_at)),
      }));
      
      setChatHistory(formattedHistory);
      
    } catch (error) {
      console.error("[App] Error fetching chat history:", error);
      setChatHistory([]);
    }
  }, [isAuthenticated]);

  // Fetch chat history when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchChatHistory();
    }
  }, [isAuthenticated, fetchChatHistory]);

  const handleWidgetAction = useCallback(async (action: FactAction) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[ChatKitPanel] widget action", action);
    }
  }, []);

  const handleResponseEnd = useCallback(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[ChatKitPanel] response end");
    }
  }, []);

  const handleNewChat = useCallback(async () => {
    try {
      // Create a new thread in the database
      const newThread = await chatThreadApi.createThread("New Chat");
      if (newThread) {
        setCurrentThreadId(newThread.id);
        
        // Add to sidebar immediately (optimistic update)
        setChatHistory(prev => [
          {
            id: newThread.id,
            title: "New Chat",
            date: formatDate(new Date()),
          },
          ...prev
        ]);
        
        // Try to set the thread in ChatKit if it's ready
        if (chatKitControl) {
          if (typeof chatKitControl.setThreadId === "function") {
            await chatKitControl.setThreadId(newThread.id);
          } else if (chatKitControl.control?.setThreadId) {
            await chatKitControl.control.setThreadId(newThread.id);
          }
        }
        
        // Refresh history from API to sync
        await fetchChatHistory();
      }
    } catch (error) {
      console.error("[App] Error creating new chat", error);
    }
  }, [chatKitControl, fetchChatHistory]);

  const handleSelectChat = useCallback(
    async (threadId: string) => {
      if (!chatKitControl) {
        console.warn("[App] ChatKit control not ready");
        return;
      }
      try {
        setCurrentThreadId(threadId);
        
        // Get the OpenAI thread ID from the database
        const openaiThreadId = await chatThreadApi.getOpenAIThreadId(threadId);
        
        if (!openaiThreadId) {
          return;
        }
        
        // Use OpenAI thread ID with ChatKit
        if (typeof chatKitControl.setThreadId === "function") {
          await chatKitControl.setThreadId(openaiThreadId);
        } else if (chatKitControl.control?.setThreadId) {
          await chatKitControl.control.setThreadId(openaiThreadId);
        }
      } catch (error) {
        console.error("[App] Error selecting chat", error);
      }
    },
    [chatKitControl]
  );

  const handleThreadChange = useCallback((threadId: string | null) => {
    setCurrentThreadId(threadId);
    // Refresh history when thread changes
    fetchChatHistory();
  }, [fetchChatHistory]);

  const handleChatKitReady = useCallback((element: any) => {
    setChatKitControl(element);
    
    // Fetch chat history for the sidebar
    if (isAuthenticated) {
      fetchChatHistory();
    }

    // Try to extract threads from ChatKit and sync them
    if (element) {
      // Run async operations in a separate function to avoid await in non-async callback
      const syncThreads = async () => {
        try {
          // Try different ways to access threads from ChatKit
          let threads: any[] = [];
          
          if (typeof element.getThreads === "function") {
            threads = await element.getThreads();
          } else if (element.threadList && Array.isArray(element.threadList)) {
            threads = element.threadList;
          } else if (element._threads && Array.isArray(element._threads)) {
            threads = element._threads;
          }

          // Sync threads to database
          if (threads.length > 0) {
            for (const thread of threads) {
              try {
                const threadTitle = thread.title || thread.name || "Untitled Chat";
                await chatThreadApi.createThread(threadTitle);
              } catch (error) {
                console.error("[App] Error syncing thread:", error);
              }
            }
            // Refresh sidebar after syncing
            await fetchChatHistory();
          }
        } catch (error) {
          console.error("[App] Error extracting/syncing threads:", error);
        }
      };
      
      // Call the async function without awaiting in the callback
      syncThreads();
    }
  }, [isAuthenticated, fetchChatHistory]);

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950">
      {/* Sidebar */}
      <Sidebar 
        chatHistory={chatHistory}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        {/* Unified Chat Area (Welcome + Chat Input) */}
        <ChatArea
          theme={scheme}
          onWidgetAction={handleWidgetAction}
          onResponseEnd={handleResponseEnd}
          onThemeRequest={setScheme}
          onThreadChange={handleThreadChange}
          onChatKitReady={handleChatKitReady}
          currentThreadId={currentThreadId}
          onOpenAIThreadIdReady={(openaiThreadId) => {}}
        />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

