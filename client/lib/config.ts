import { ColorScheme, StartScreenPrompt, ThemeOption } from "@openai/chatkit";

export const WORKFLOW_ID =
  process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID?.trim() ?? "";

export const CREATE_SESSION_ENDPOINT = "/api/create-session";

export const STARTER_PROMPTS: StartScreenPrompt[] = [
  {
    label: "What legal services do you offer?",
    prompt: "What legal services does LegaLink360 offer?",
  },
  {
    label: "How can you help me?",
    prompt: "How can LegaLink360 AI assist with my legal questions?",
  },
  {
    label: "Schedule a consultation",
    prompt: "How do I schedule a consultation with LegaLink360?",
  },
];

export const PLACEHOLDER_INPUT = "Ask your legal question...";

export const GREETING = "How can I assist you today?";

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
  // Add other theme options here
  // chatkit.studio/playground to explore config options
});
