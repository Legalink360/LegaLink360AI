"use client";

import { useCallback, useState, useEffect } from "react";
import { type FactAction } from "@/components/ChatArea";
import { type ChatThread } from "@/components/Sidebar";
import { useColorScheme } from "@/hooks/useColorScheme";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ChatArea from "@/components/ChatArea";
import Footer from "@/components/Footer";

export default function App() {
  const { scheme, setScheme } = useColorScheme();
  const [chatHistory, setChatHistory] = useState<ChatThread[]>([]);
  const [chatKitControl, setChatKitControl] = useState<any>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);

  // Fetch chat history on mount
  useEffect(() => {
    // TODO: Replace with actual backend API call to fetch threads
    // For now, using mock data
    const mockHistory: ChatThread[] = [
      { id: "thread-1", title: "Contract Review Discussion", date: "Today" },
      { id: "thread-2", title: "Corporate Law Query", date: "Yesterday" },
      { id: "thread-3", title: "Dispute Resolution", date: "2 days ago" },
      { id: "thread-4", title: "Legal Compliance Check", date: "1 week ago" },
    ];
    setChatHistory(mockHistory);
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
      } else if (chatKitControl.control && typeof chatKitControl.control.setThreadId === "function") {
        // Try nested control property
        await chatKitControl.control.setThreadId(null);
        setCurrentThreadId(null);
      } else {
        console.error("[App] setThreadId method not found", {
          element: chatKitControl.tagName,
          methods: Object.getOwnPropertyNames(Object.getPrototypeOf(chatKitControl)).slice(0, 10),
        });
      }
    } catch (error) {
      console.error("[App] Error creating new chat", error);
    }
  }, [chatKitControl]);

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
        } else if (chatKitControl.control && typeof chatKitControl.control.setThreadId === "function") {
          // Try nested control property
          await chatKitControl.control.setThreadId(threadId);
          setCurrentThreadId(threadId);
        } else {
          console.error("[App] setThreadId method not found");
        }
      } catch (error) {
        console.error("[App] Error selecting chat", error);
      }
    },
    [chatKitControl]
  );

  const handleThreadChange = useCallback((threadId: string | null) => {
    setCurrentThreadId(threadId);
  }, []);

  const handleChatKitReady = useCallback((element: any) => {
    console.debug("[App] ChatKit ready, element:", {
      tagName: element?.tagName,
      hasSetThreadId: typeof element?.setThreadId === "function",
      methods: element ? Object.getOwnPropertyNames(Object.getPrototypeOf(element)).slice(0, 15) : [],
    });
    setChatKitControl(element);
    
    // Add event listener for thread updates
    if (element && element.addEventListener) {
      element.addEventListener("chatkit.thread-change", (event: any) => {
        if (process.env.NODE_ENV !== "production") {
          console.debug("[App] thread changed", event);
        }
      });
    }
  }, []);

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
