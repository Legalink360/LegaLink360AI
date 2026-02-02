"use client";

import { useCallback, useState } from "react";
import { type FactAction } from "@/components/ChatArea";
import { type ChatThread } from "@/components/Sidebar";
import { useColorScheme } from "@/hooks/useColorScheme";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ChatArea from "@/components/ChatArea";
import Footer from "@/components/Footer";

// Helper function to format date
function formatDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export default function App() {
  const { scheme, setScheme } = useColorScheme();
  const [chatHistory, setChatHistory] = useState<ChatThread[]>([]);
  const [chatKitControl, setChatKitControl] = useState<any>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);

  // Fetch real chat history from ChatKit when control is ready
  const fetchChatHistory = useCallback(async (control: any) => {
    try {
      if (process.env.NODE_ENV !== "production") {
        console.debug("[App] Fetching chat history from ChatKit");
      }

      // Try to get threads from ChatKit API
      if (control && typeof control.getThreads === "function") {
        try {
          const threads = await control.getThreads();
          if (threads && Array.isArray(threads)) {
            const formattedHistory = threads.map((thread: any) => ({
              id: thread.id,
              title: thread.title || "Untitled Chat",
              date: thread.created_at ? formatDate(new Date(thread.created_at)) : "Unknown",
            }));
            setChatHistory(formattedHistory);
            if (process.env.NODE_ENV !== "production") {
              console.debug("[App] Chat history loaded from getThreads:", formattedHistory);
            }
            return;
          }
        } catch (apiError) {
          if (process.env.NODE_ENV !== "production") {
            console.debug("[App] getThreads() failed, trying fallback:", apiError);
          }
        }
      }

      // Fallback: Check for stored threads in ChatKit's thread list
      if (control && control.threadList) {
        const threads = control.threadList;
        if (Array.isArray(threads) && threads.length > 0) {
          const formattedHistory = threads.map((thread: any) => ({
            id: thread.id,
            title: thread.title || "Untitled Chat",
            date: thread.date || formatDate(new Date()),
          }));
          setChatHistory(formattedHistory);
          if (process.env.NODE_ENV !== "production") {
            console.debug("[App] Chat history from threadList:", formattedHistory);
          }
          return;
        }
      }

      // Fallback: Check ChatKit's internal structure
      if (control && control._threads) {
        const threads = control._threads;
        if (Array.isArray(threads) && threads.length > 0) {
          const formattedHistory = threads.map((thread: any) => ({
            id: thread.id,
            title: thread.title || "Untitled Chat",
            date: thread.date || formatDate(new Date()),
          }));
          setChatHistory(formattedHistory);
          if (process.env.NODE_ENV !== "production") {
            console.debug("[App] Chat history from _threads:", formattedHistory);
          }
          return;
        }
      }

      // No threads found
      if (process.env.NODE_ENV !== "production") {
        console.debug("[App] No chat history found in any location", {
          hasGetThreads: typeof control?.getThreads === "function",
          hasThreadList: !!control?.threadList,
          has_threads: !!control?._threads,
        });
      }
      setChatHistory([]);
    } catch (error) {
      console.error("[App] Error fetching chat history:", error);
      setChatHistory([]);
    }
  }, []);

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
    if (!chatKitControl) {
      console.warn("[App] ChatKit control not ready");
      return;
    }
    try {
      // Call setThreadId directly on the element
      if (typeof chatKitControl.setThreadId === "function") {
        await chatKitControl.setThreadId(null);
        setCurrentThreadId(null);
        // Refresh history after creating new chat
        setTimeout(() => fetchChatHistory(chatKitControl), 500);
      } else if (chatKitControl.control && typeof chatKitControl.control.setThreadId === "function") {
        // Try nested control property
        await chatKitControl.control.setThreadId(null);
        setCurrentThreadId(null);
        // Refresh history after creating new chat
        setTimeout(() => fetchChatHistory(chatKitControl), 500);
      } else {
        console.error("[App] setThreadId method not found", {
          element: chatKitControl.tagName,
          methods: Object.getOwnPropertyNames(Object.getPrototypeOf(chatKitControl)).slice(0, 10),
        });
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
        // Call setThreadId directly on the element
        if (typeof chatKitControl.setThreadId === "function") {
          await chatKitControl.setThreadId(threadId);
          setCurrentThreadId(threadId);
          // Refresh history after selecting chat
          setTimeout(() => fetchChatHistory(chatKitControl), 500);
        } else if (chatKitControl.control && typeof chatKitControl.control.setThreadId === "function") {
          // Try nested control property
          await chatKitControl.control.setThreadId(threadId);
          setCurrentThreadId(threadId);
          // Refresh history after selecting chat
          setTimeout(() => fetchChatHistory(chatKitControl), 500);
        } else {
          console.error("[App] setThreadId method not found");
        }
      } catch (error) {
        console.error("[App] Error selecting chat", error);
      }
    },
    [chatKitControl, fetchChatHistory]
  );

  const handleThreadChange = useCallback((threadId: string | null) => {
    setCurrentThreadId(threadId);
  }, []);

  const handleChatKitReady = useCallback((element: any) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[App] ChatKit ready, element:", {
        tagName: element?.tagName,
        hasSetThreadId: typeof element?.setThreadId === "function",
        hasGetThreads: typeof element?.getThreads === "function",
      });
    }
    setChatKitControl(element);
    
    // Fetch real chat history from ChatKit
    fetchChatHistory(element);
    
    // Listen for thread changes and refresh history
    if (element && element.addEventListener) {
      const handleThreadChange = () => {
        if (process.env.NODE_ENV !== "production") {
          console.debug("[App] Thread changed, refreshing history");
        }
        fetchChatHistory(element);
      };

      element.addEventListener("chatkit.thread-change", handleThreadChange);
      element.addEventListener("chatkit.thread-created", handleThreadChange);
      element.addEventListener("chatkit.thread-deleted", handleThreadChange);

      // Cleanup listeners
      return () => {
        element.removeEventListener("chatkit.thread-change", handleThreadChange);
        element.removeEventListener("chatkit.thread-created", handleThreadChange);
        element.removeEventListener("chatkit.thread-deleted", handleThreadChange);
      };
    }
  }, [fetchChatHistory]);

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
        />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
