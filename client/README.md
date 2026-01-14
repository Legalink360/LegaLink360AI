# Legalink360 AI - Web Application (Client)

The web-based client application for Legalink360 AI, built with Next.js 15.

## Overview

This is the main web application that provides a browser-based interface for Legalink360 AI. It includes both the frontend user interface and API routes that serve as the backend for the web application.

## Architecture

This Next.js application uses the App Router and includes:

- **Frontend**: React-based user interface with OpenAI ChatKit integration
- **API Routes**: Backend API endpoints (located in `app/api/`)
- **Session Management**: Cookie-based session handling
- **AI Integration**: OpenAI ChatKit API for conversational AI

## Project Structure

```
client/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── App.tsx              # Main application component
│   ├── globals.css          # Global styles
│   └── api/                 # API routes (backend)
│       └── create-session/  # Session creation endpoint
│           └── route.ts
├── components/              # React components
│   ├── ChatKitPanel.tsx    # Main chat interface
│   └── ErrorOverlay.tsx    # Error handling UI
├── hooks/                   # React hooks
│   └── useColorScheme.ts   # Theme management
├── lib/                     # Utilities and configuration
│   └── config.ts           # App configuration
├── public/                  # Static assets
│   └── docs/               # Documentation assets
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── next.config.ts          # Next.js config
└── netlify.toml            # Netlify deployment config
```

## Features

- ✅ Conversational AI interface with OpenAI ChatKit
- ✅ Session management with persistent conversations
- ✅ Theme support (light/dark mode)
- ✅ Responsive design
- ✅ Error handling and recovery
- 🚧 User authentication (planned)
- 🚧 Document analysis (planned)
- 🚧 Conversation history (planned)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key with Agent Builder access

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Configure environment variables
# Edit .env.local with your OpenAI credentials
```

### Environment Variables

```env
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_CHATKIT_WORKFLOW_ID=wf_your-workflow-id
CHATKIT_API_BASE=https://api.openai.com
```

### Development

```bash
# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## API Endpoints

### POST /api/create-session

Creates a new ChatKit session for the web application.

**Request**: 
```json
{
  "workflow_id": "wf_...",
  "chatkit_configuration": {
    "file_upload": {
      "enabled": false
    }
  }
}
```

**Response**:
```json
{
  "client_secret": "secret_...",
  "expires_after": 3600
}
```

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **AI Integration**: OpenAI ChatKit
- **Deployment**: Netlify (or Vercel)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for all code
- Functional React components with hooks
- ESLint for code quality
- Tailwind CSS for styling

## Deployment

The application is configured for deployment on:
- **Netlify** (primary) - See `netlify.toml`
- **Vercel** (recommended for Next.js)
- Any Node.js hosting platform

### Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Domain added to OpenAI allowlist
- [ ] Build passes without errors
- [ ] All tests pass
- [ ] Production build tested locally

## Documentation

- **Main Project README**: See root `/README.md`
- **Technical Documentation**: See `/docs/` directory
- **API Documentation**: See `/docs/TECHNICAL_IMPLEMENTATION_GUIDE.md`

## Related Projects

- **M365 Add-in**: See `/M365/` directory
- **Backend Services**: API routes are in this project (`app/api/`)

---

**Status**: ✅ Production Ready  
**Last Updated**: January 2026

