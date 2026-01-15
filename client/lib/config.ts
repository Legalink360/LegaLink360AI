import { ColorScheme, StartScreenPrompt, ThemeOption } from "@openai/chatkit";

export const WORKFLOW_ID =
  process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID?.trim() ?? "";

export const CREATE_SESSION_ENDPOINT = "/api/create-session";

export const PLACEHOLDER_INPUT = "Ask your legal question...";

export const WELCOME_GREETING = "How can I help you today?";

export const WELCOME_DESCRIPTION = 
  "I'm your intelligent legal assistant by LegaLink & Co. Advocates. I'm here to provide guidance on corporate law, civil litigation, mediation, contract review, and more. Ask me anything about legal matters, and I'll help you understand complex legal concepts in simple terms.";

export const STARTER_PROMPTS: StartScreenPrompt[] = [
  {
    label: "Contract Review",
    prompt: "Help me review and analyze a contract",
  },
  {
    label: "Legal Consultation",
    prompt: "I have a legal question I need help with",
  },
  {
    label: "Compliance Check",
    prompt: "Help me understand regulatory compliance requirements",
  },
  {
    label: "Dispute Resolution",
    prompt: "What are my options for resolving a legal dispute",
  },
];

export const getThemeConfig = (theme: ColorScheme): ThemeOption => ({
  color: {
    grayscale: {
      hue: 220,
      tint: 6,
      shade: theme === "dark" ? -1 : -4,
    },
    accent: {
      primary: theme === "dark" ? "#f1f5f9" : "#0f172a",
      level: 1,
    },
  },
  radius: "round",
});
