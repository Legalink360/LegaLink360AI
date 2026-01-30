"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import {
  PLACEHOLDER_INPUT,
  CREATE_SESSION_ENDPOINT,
  WORKFLOW_ID,
  getThemeConfig,
  WELCOME_GREETING,
  STARTER_PROMPTS,
} from "@/lib/config";
import type { ColorScheme } from "@/hooks/useColorScheme";
import { useLegalChat } from "@/hooks/useLegalChat";

// Get API base URL from environment, default to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export type FactAction = {
  type: "save";
  factId: string;
  factText: string;
};

type ChatAreaProps = {
  theme: ColorScheme;
  onWidgetAction: (action: FactAction) => Promise<void>;
  onResponseEnd: () => void;
  onThemeRequest: (scheme: ColorScheme) => void;
  onThreadChange?: (threadId: string | null) => void;
  onChatKitReady?: (control: any) => void;
};

type ErrorState = {
  script: string | null;
  session: string | null;
  integration: string | null;
  retryable: boolean;
};

const isBrowser = typeof window !== "undefined";
const isDev = process.env.NODE_ENV !== "production";

const createInitialErrors = (): ErrorState => ({
  script: null,
  session: null,
  integration: null,
  retryable: false,
});

export default function ChatArea({
  theme,
  onWidgetAction,
  onResponseEnd,
  onThemeRequest,
  onThreadChange,
  onChatKitReady,
}: ChatAreaProps) {
  // Legal Chat Hook - exposes queryLegalAI and retrieveDocuments functions
  const { 
    queryLegalAI: queryLegalAIFromHook
  } = useLegalChat();

  // ChatKit Logic
  const processedFacts = useRef(new Set<string>());
  const chatKitRef = useRef<any>(null);
  const [errors, setErrors] = useState<ErrorState>(() => createInitialErrors());
  const [isInitializingSession, setIsInitializingSession] = useState(true);
  const isMountedRef = useRef(true);
  const [scriptStatus, setScriptStatus] = useState<
    "pending" | "ready" | "error"
  >(() =>
    isBrowser && window.customElements?.get("openai-chatkit")
      ? "ready"
      : "pending"
  );
  const [widgetInstanceKey, setWidgetInstanceKey] = useState(0);

  const setErrorState = useCallback((updates: Partial<ErrorState>) => {
    setErrors((current) => ({ ...current, ...updates }));
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    const handleLoaded = () => {
      if (!isMountedRef.current) {
        return;
      }
      setScriptStatus("ready");
      setErrorState({ script: null });
    };

    const handleError = (event: Event) => {
      console.error("Failed to load chatkit.js for some reason", event);
      if (!isMountedRef.current) {
        return;
      }
      setScriptStatus("error");
      const detail = (event as CustomEvent<unknown>)?.detail ?? "unknown error";
      setErrorState({ script: `Error: ${detail}`, retryable: false });
      setIsInitializingSession(false);
    };

    window.addEventListener("chatkit-script-loaded", handleLoaded);
    window.addEventListener(
      "chatkit-script-error",
      handleError as EventListener
    );

    if (window.customElements?.get("openai-chatkit")) {
      handleLoaded();
    }

    return () => {
      window.removeEventListener("chatkit-script-loaded", handleLoaded);
      window.removeEventListener(
        "chatkit-script-error",
        handleError as EventListener
      );
    };
  }, [scriptStatus, setErrorState]);

  const isWorkflowConfigured = Boolean(
    WORKFLOW_ID && !WORKFLOW_ID.startsWith("wf_replace")
  );

  useEffect(() => {
    if (!isWorkflowConfigured && isMountedRef.current) {
      setErrorState({
        session: "Set NEXT_PUBLIC_CHATKIT_WORKFLOW_ID in your .env.local file.",
        retryable: false,
      });
      setIsInitializingSession(false);
    }
  }, [isWorkflowConfigured, setErrorState]);

  const handleResetChat = useCallback(() => {
    processedFacts.current.clear();
    if (isBrowser) {
      setScriptStatus(
        window.customElements?.get("openai-chatkit") ? "ready" : "pending"
      );
    }
    setIsInitializingSession(true);
    setErrors(createInitialErrors());
    setWidgetInstanceKey((prev) => prev + 1);
  }, []);

  const getClientSecret = useCallback(
    async (currentSecret: string | null) => {
      if (isDev) {
        console.info("[ChatArea] getClientSecret invoked", {
          currentSecretPresent: Boolean(currentSecret),
          workflowId: WORKFLOW_ID,
          endpoint: CREATE_SESSION_ENDPOINT,
        });
      }

      if (!isWorkflowConfigured) {
        const detail =
          "Set NEXT_PUBLIC_CHATKIT_WORKFLOW_ID in your .env.local file.";
        if (isMountedRef.current) {
          setErrorState({ session: detail, retryable: false });
          setIsInitializingSession(false);
        }
        throw new Error(detail);
      }

      if (isMountedRef.current) {
        // Only set initializing if we don't have a current secret
        // and it's not already initializing
        if (!currentSecret) {
          setIsInitializingSession((prev) => {
            if (prev === false) {
              if (isDev) {
                console.debug("[ChatArea] Starting session initialization");
              }
              return true;
            }
            return prev;
          });
        }
        setErrorState({ session: null, integration: null, retryable: false });
      }

      try {
        const response = await fetch(CREATE_SESSION_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workflow: { id: WORKFLOW_ID },
            chatkit_configuration: {
              file_upload: {
                enabled: true,
              },
            },
          }),
        });

        const raw = await response.text();

        if (isDev) {
          console.info("[ChatArea] createSession response", {
            status: response.status,
            ok: response.ok,
            bodyPreview: raw.slice(0, 1600),
          });
        }

        let data: Record<string, unknown> = {};
        if (raw) {
          try {
            data = JSON.parse(raw) as Record<string, unknown>;
          } catch (parseError) {
            console.error(
              "Failed to parse create-session response",
              parseError
            );
          }
        }

        if (!response.ok) {
          const detail = extractErrorDetail(data, response.statusText);
          console.error("Create session request failed", {
            status: response.status,
            body: data,
          });
          throw new Error(detail);
        }

        const clientSecret = data?.client_secret as string | undefined;
        if (!clientSecret) {
          throw new Error("Missing client secret in response");
        }

        if (isMountedRef.current) {
          setErrorState({ session: null, integration: null });
          if (isDev) {
            console.debug("[ChatArea] Session initialized successfully");
          }
        }

        return clientSecret;
      } catch (error) {
        console.error("Failed to create ChatKit session", error);
        const detail =
          error instanceof Error
            ? error.message
            : "Unable to start ChatKit session.";
        if (isMountedRef.current) {
          setErrorState({ session: detail, retryable: false });
        }
        throw error instanceof Error ? error : new Error(detail);
      } finally {
        if (isMountedRef.current) {
          setIsInitializingSession(false);
          if (isDev) {
            console.debug("[ChatArea] Session initialization complete (finally block)");
          }
        }
      }
    },
    [isWorkflowConfigured, setErrorState]
  );

  /**
   * Get the disclaimer to append to responses
   */
  const getDisclaimer = useCallback((): string => {
    return `

---

⚖️ **DISCLAIMER**

This response is based on available legal documents and is provided for informational purposes only. It does not constitute legal advice.

**Would you like to speak with a qualified lawyer?** 

Visit **[www.legalink360.com](https://www.legalink360.com)** to connect with our legal professionals and get personalized legal guidance for your specific situation.`;
  }, []);

  /**
   * Query legal AI and format response for ChatKit
   * This is called via the custom client tool handler
   */
  const handleLegalQuery = useCallback(
    async (query: string) => {
      try {
        if (isDev) {
          console.debug("[ChatArea] handleLegalQuery invoked", { query });
        }

        let response;

        // Use the hook's queryLegalAI if available
        if (queryLegalAIFromHook) {
          const result = await queryLegalAIFromHook(query);
          if (!result) {
            throw new Error('Query failed');
          }
          response = result;
        } else {
          // Fallback: Direct API call
          const apiResponse = await fetch(`${API_BASE_URL}/api/query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
          });

          if (!apiResponse.ok) {
            throw new Error(`API error: ${apiResponse.status}`);
          }

          response = await apiResponse.json();
        }
        
        if (isDev) {
          console.debug("[ChatArea] Legal AI response received", {
            sources: response.sourceCount,
            time: response.elapsedTime,
          });
        }

        // Format response with sources and disclaimer
        let formattedResponse = response.answer;
        
        // Add sources section if available
        if (response.sources && response.sources.length > 0) {
          formattedResponse += '\n\n**Sources:**\n';
          response.sources.forEach((source: { title: string; category: string }, index: number) => {
            formattedResponse += `${index + 1}. ${source.title} (${source.category})\n`;
          });
        }

        // Add disclaimer
        formattedResponse += getDisclaimer();

        return {
          success: true,
          message: formattedResponse,
          metadata: {
            sources: response.sourceCount,
            elapsedTime: response.elapsedTime,
          },
        };
      } catch (error) {
        console.error("[ChatArea] Legal query error", error);
        return {
          success: false,
          message: `I encountered an error while querying the legal knowledge base. Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          metadata: {},
        };
      }
    },
    [getDisclaimer, queryLegalAIFromHook]
  );

  const chatkit = useChatKit({
    api: { getClientSecret },
    theme: {
      colorScheme: theme,
      ...getThemeConfig(theme),
    },
    startScreen: {
      greeting: WELCOME_GREETING,
      prompts: STARTER_PROMPTS,
    },
    composer: {
      placeholder: PLACEHOLDER_INPUT,
      attachments: {
        enabled: true,
      },
    },
    threadItemActions: {
      feedback: false,
    },
    onClientTool: async (invocation: {
      name: string;
      params: Record<string, unknown>;
    }) => {
      if (invocation.name === "switch_theme") {
        const requested = invocation.params.theme;
        if (requested === "light" || requested === "dark") {
          if (isDev) {
            console.debug("[ChatArea] switch_theme", requested);
          }
          onThemeRequest(requested);
          return { success: true };
        }
        return { success: false };
      }

      if (invocation.name === "record_fact") {
        const id = String(invocation.params.fact_id ?? "");
        const text = String(invocation.params.fact_text ?? "");
        if (!id || processedFacts.current.has(id)) {
          return { success: true };
        }
        processedFacts.current.add(id);
        void onWidgetAction({
          type: "save",
          factId: id,
          factText: text.replace(/\s+/g, " ").trim(),
        });
        return { success: true };
      }

      // NEW: Handle legal knowledge queries
      if (invocation.name === "query_legal_knowledge") {
        const query = String(invocation.params.query ?? "");
        if (!query) {
          return { 
            success: false, 
            message: "No query provided" 
          };
        }

        if (isDev) {
          console.debug("[ChatArea] query_legal_knowledge invoked", { query });
        }

        return await handleLegalQuery(query);
      }

      return { success: false };
    },
    onResponseEnd: () => {
      onResponseEnd();
    },
    onResponseStart: () => {
      setErrorState({ integration: null, retryable: false });
    },
    onThreadChange: () => {
      processedFacts.current.clear();
      onThreadChange?.(null);
    },
    onError: ({ error }: { error: unknown }) => {
      console.error("ChatKit error", error);
    },
  });

  const activeError = errors.session ?? errors.integration;
  const blockingError = errors.script ?? activeError;

  if (isDev) {
    console.debug("[ChatArea] render state", {
      isInitializingSession,
      hasControl: Boolean(chatkit.control),
      scriptStatus,
      hasError: Boolean(blockingError),
      workflowId: WORKFLOW_ID,
      sessionError: errors.session,
      integrationError: errors.integration,
    });
  }

  useEffect(() => {
    if (chatkit.control && onChatKitReady) {
      // Wait a tick to ensure ChatKit element is fully ready with all methods
      setTimeout(() => {
        // Pass the ref element directly so parent can call methods on it
        if (chatKitRef.current) {
          onChatKitReady(chatKitRef.current);
        }
      }, 0);
    }
  }, [chatkit.control, onChatKitReady]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-800">
      {/* Chat Area with Welcome Content Inside */}
      <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-slate-800">
        {/* ChatKit Component - Welcome content will display inside it */}
        <ChatKit
          ref={chatKitRef}
          key={widgetInstanceKey}
          control={chatkit.control}
          className="flex-1 w-full"
        />
      </div>
    </div>
  );
}

function extractErrorDetail(
  payload: Record<string, unknown> | undefined,
  fallback: string
): string {
  if (!payload) {
    return fallback;
  }

  const error = payload.error;
  if (typeof error === "string") {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  const details = payload.details;
  if (typeof details === "string") {
    return details;
  }

  if (details && typeof details === "object" && "error" in details) {
    const nestedError = (details as { error?: unknown }).error;
    if (typeof nestedError === "string") {
      return nestedError;
    }
    if (
      nestedError &&
      typeof nestedError === "object" &&
      "message" in nestedError &&
      typeof (nestedError as { message?: unknown }).message === "string"
    ) {
      return (nestedError as { message: string }).message;
    }
  }

  if (typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}
