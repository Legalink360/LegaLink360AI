# LegaLink360 AI Bot

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![NextJS](https://img.shields.io/badge/Built_with-NextJS-blue)
![OpenAI API](https://img.shields.io/badge/Powered_by-OpenAI_API-orange)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)

---

## About LegaLink360

**LegaLink360** is an innovative legal technology platform designed to revolutionize how individuals and businesses access, understand, and manage legal services. Our mission is to democratize legal expertise by combining cutting-edge AI technology with professional legal knowledge to provide accessible, affordable, and reliable legal solutions.

### Company Vision

LegaLink360 aims to become the trusted digital gateway for legal assistance, offering a comprehensive suite of AI-powered services that bridge the gap between legal professionals and those in need of legal guidance. We leverage advanced artificial intelligence to make legal services more accessible, faster, and more cost-effective.

---

## LegaLink360 AI Bot - Product Overview

### What is LegaLink360 AI Bot?

The **LegaLink360 AI Bot** is an intelligent conversational assistant powered by OpenAI's state-of-the-art language models and deployed through a modern Next.js web application. It serves as your 24/7 legal information companion, providing instant guidance on a wide range of legal matters.

### Core Features

- **Intelligent Legal Assistance**: Leverages advanced AI to provide informed responses to legal questions and scenarios
- **24/7 Availability**: Accessible anytime, anywhere through a web-based interface
- **User-Friendly Chat Interface**: Intuitive conversational experience with the OpenAI ChatKit web component
- **Real-time Responses**: Powered by OpenAI's API for accurate and contextually-aware answers
- **Session Management**: Secure session handling for continuous conversation context
- **Theme Customization**: Adaptable UI themes to match brand identity and user preferences

### How It Works

1. **User Interaction**: Users access the chat interface through a web browser and pose legal questions or scenarios
2. **AI Processing**: The OpenAI-powered agent processes the inquiry using advanced language understanding and legal knowledge
3. **Intelligent Response**: The bot provides comprehensive, context-aware responses based on the latest legal information
4. **Conversation Context**: Session management maintains conversation history for contextual follow-up questions
5. **Continuous Learning**: The system leverages OpenAI's capabilities to provide increasingly refined responses

### Technical Architecture

- **Frontend**: Next.js 14+ with React for a responsive, modern user interface
- **Backend**: Next.js API routes for secure session management and OpenAI integration
- **AI Engine**: OpenAI's GPT models via Agent Builder and ChatKit API
- **Component Library**: OpenAI's ChatKit web component for seamless chat integration
- **Styling**: CSS and theme customization for professional branding
- **Type Safety**: Full TypeScript support for robust development

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- OpenAI API key with Agent Builder access
- An OpenAI organization and project setup

### Installation

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Create Environment Configuration

Copy the example environment file and update it with your credentials:

```bash
cp .env.example .env.local
```

#### 3. Configure OpenAI Credentials

Update `.env.local` with the following variables:

- **`OPENAI_API_KEY`** — Your OpenAI API key (must be created within the same org & project as your Agent Builder)
  - If you have an existing `OPENAI_API_KEY` in your terminal, run: `set OPENAI_API_KEY=` (Windows) or `unset OPENAI_API_KEY` (Mac/Linux)
- **`NEXT_PUBLIC_CHATKIT_WORKFLOW_ID`** — Your Agent Builder workflow ID (starts with `wf_...`)
  - Get this from [Agent Builder](https://platform.openai.com/agent-builder) after publishing
- **`CHATKIT_API_BASE`** (optional) — Custom base URL for ChatKit API endpoint

> **Important**: If your workflow uses models requiring organization verification (e.g., GPT-5), verify your organization first at [Organization Settings](https://platform.openai.com/settings/organization/general).

#### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and begin testing. Use the provided prompts to verify your workflow connection.

#### 5. Build for Production

```bash
npm run build
```

Before deployment, add your domain to the [Domain Allowlist](https://platform.openai.com/settings/organization/security/domain-allowlist) in your OpenAI dashboard.

---

## Configuration & Customization

### Customize Bot Behavior

Edit [lib/config.ts](lib/config.ts) to configure:
- Starter prompts and greeting messages
- ChatKit theme and styling
- Placeholder text and UI copy
- Bot personality and tone

### Customize UI Components

Edit [components/ChatKitPanel.tsx](components/ChatKitPanel.tsx) to:
- Modify chat layout and styling
- Add event handlers for analytics and storage
- Integrate with your backend services
- Customize user experience and interactions

### Update Layout & Styling

Modify [app/layout.tsx](app/layout.tsx) and [app/globals.css](app/globals.css) for:
- Global styling and branding
- Responsive design adjustments
- Theme variables and customization

---

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout and provider setup
│   ├── page.tsx                # Home page with chat interface
│   ├── globals.css             # Global styles and theme variables
│   └── api/
│       └── create-session/
│           └── route.ts        # Session creation endpoint
├── components/
│   ├── ChatKitPanel.tsx        # Main chat component
│   ├── ErrorOverlay.tsx        # Error handling UI
│   └── ...
├── hooks/
│   └── useColorScheme.ts       # Theme management hook
├── lib/
│   └── config.ts               # Configuration and prompts
├── public/
│   └── docs/                   # Documentation assets
├── .env.local                  # Environment variables (create from .env.example)
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

---

## API Endpoints

### Session Creation

**Endpoint**: `POST /api/create-session`

Creates a new ChatKit session with OpenAI Agent Builder workflow.

**Request**:
```json
{
  "workflow_id": "wf_..."
}
```

**Response**:
```json
{
  "session_id": "sess_...",
  "chat_token": "token_..."
}
```

---

## Development Workflow

### Available Scripts

- `npm run dev` — Start development server with hot reload
- `npm run build` — Create optimized production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint for code quality

### Code Quality

This project uses ESLint for code quality. Run linting before committing:

```bash
npm run lint
```

---

## Deployment

### Recommended Platforms

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Custom Node.js hosting**

### Pre-Deployment Checklist

- [ ] Environment variables configured securely
- [ ] Domain added to OpenAI allowlist
- [ ] API keys secured and never committed
- [ ] Build passes without errors (`npm run build`)
- [ ] All linting issues resolved (`npm run lint`)
- [ ] Testing completed locally

---

## Roadmap & Future Features

As part of the LegaLink360 platform expansion, upcoming features include:

- **Document Analysis**: AI-powered legal document review and summarization
- **Case Management**: Integrated case tracking and management tools
- **Lawyer Marketplace**: Connect with verified legal professionals
- **Legal Research Tools**: Comprehensive legal database and research capabilities
- **Contract Templates**: Customizable, AI-assisted legal templates
- **Multi-language Support**: Global accessibility
- **Mobile Applications**: Native iOS and Android apps
- **Advanced Analytics**: User insights and legal trend analysis

---

## Support & Documentation

- **OpenAI ChatKit Docs**: [ChatKit JavaScript Library](http://openai.github.io/chatkit-js/)
- **Next.js Documentation**: [Next.js Docs](https://nextjs.org/docs)
- **OpenAI API Reference**: [OpenAI API Docs](https://platform.openai.com/docs)
- **Advanced Examples**: [OpenAI ChatKit Advanced Samples](https://github.com/openai/openai-chatkit-advanced-samples)

---

## Contributing

We welcome contributions to improve the LegaLink360 AI Bot. Please ensure:

1. Code follows our linting standards
2. All tests pass
3. New features include documentation
4. Commit messages are clear and descriptive

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact & Resources

- **Company**: LegaLink360
- **Documentation**: See `docs/` folder for detailed reference materials
- **Status**: Active Development

---

**Last Updated**: January 2026  
**Version**: 1.0.0
