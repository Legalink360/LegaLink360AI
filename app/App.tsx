"use client";

import { useCallback } from "react";
import { ChatKitPanel, type FactAction } from "@/components/ChatKitPanel";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function App() {
  const { scheme, setScheme } = useColorScheme();

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-end bg-slate-100 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-5xl flex flex-col h-screen">
        {/* Header Section */}
        <div className="pt-6 pb-4 px-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 text-center">
            LegaLink360 AI
          </h1>
          <p className="mt-6 text-sm text-slate-600 dark:text-slate-400 text-center max-w-2xl mx-auto">
            Welcome to LegaLink360 AI by LegaLink & Co. Advocates! I&apos;m your intelligent legal assistant, here to provide guidance on corporate law, civil litigation, mediation, and more.
          </p>
        </div>
        
        {/* Chat Section */}
        <div className="flex-1 overflow-hidden mb-2">
          <ChatKitPanel
            theme={scheme}
            onWidgetAction={handleWidgetAction}
            onResponseEnd={handleResponseEnd}
            onThemeRequest={setScheme}
          />
        </div>

        {/* Footer Section */}
        <footer className="py-3 px-4 opacity-60">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
            <a 
              href="https://legalink360.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              LegaLink360.com
            </a>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <a 
              href="https://legalink360.com/contact" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Contact Us
            </a>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <a 
              href="https://legalink360.com/faq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Help
            </a>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <a 
              href="https://legalink360.com/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Terms & Conditions
            </a>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <a 
              href="https://legalink360.com/privacy-policy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
