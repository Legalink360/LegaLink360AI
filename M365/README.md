# Legalink360 AI - Microsoft 365 Office Add-in

Microsoft 365 Office Add-in for Legalink360 AI - bringing AI-powered legal assistance directly into Word and Outlook.

## Overview

This Office Add-in integrates Legalink360 AI capabilities into Microsoft Word and Outlook, enabling legal professionals to access AI-powered document analysis and legal question answering without leaving their productivity applications.

## Features

- 🚧 Document Analysis - Analyze legal documents directly in Word
- 🚧 Legal Question Answering - Ask legal questions with document context
- 🚧 Outlook Integration - AI assistance in Outlook emails
- 🚧 Azure AD Authentication - Single sign-on with Microsoft 365

## Project Structure

```
M365/
├── src/
│   ├── taskpane/              # Task pane application
│   │   ├── taskpane.html      # HTML entry point
│   │   ├── taskpane.tsx       # TypeScript entry point
│   │   ├── App.tsx            # Main React component
│   │   ├── index.css          # Styles
│   │   └── components/        # React components
│   │       ├── DocumentAnalysis.tsx
│   │       ├── LegalQuestion.tsx
│   │       ├── ResultsView.tsx
│   │       ├── AuthProvider.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorDisplay.tsx
│   ├── commands/              # Office commands
│   │   └── commands.ts
│   ├── lib/                   # Utilities
│   │   ├── office-utils.ts    # Office.js utilities
│   │   ├── api-client.ts      # API client
│   │   └── auth.ts            # Authentication
│   └── types/                 # TypeScript types
│       └── index.ts
├── assets/                    # Static assets (icons, images)
├── manifest.xml               # Office Add-in manifest
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── webpack.config.js          # Webpack build config
```

## Technology Stack

- **Framework**: React with TypeScript
- **Office APIs**: Office.js (@microsoft/office-js)
- **Authentication**: MSAL.js (@azure/msal-browser)
- **Build Tool**: Webpack
- **Hosting**: Separate hosting infrastructure (HTTPS required)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Microsoft 365 account (for testing)
- Azure account (for Azure AD app registration)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables
# Edit .env with your Azure AD credentials
```

### Environment Variables

```env
AZURE_CLIENT_ID=your-client-id
AZURE_TENANT_ID=your-tenant-id
API_BASE_URL=http://localhost:3000/api
NODE_ENV=development
```

### Development

```bash
# Start development server
npm run start

# Build for production
npm run build
```

### Testing

See `/docs/OFFICE_ADDIN_README.md` for detailed testing instructions.

## Development Status

**Status**: 📋 In Development

Current phase: Project structure and skeleton files created. Implementation pending.

## Documentation

- **Developer Guide**: See `/docs/OFFICE_ADDIN_README.md`
- **Implementation Plan**: See `/docs/IMPLEMENTATION_PLAN_M365.md`
- **Integration Guide**: See `/docs/MICROSOFT_365_INTEGRATION.md`
- **Main Project README**: See root `/README.md`

## Related Projects

- **Web Client**: See `/client/` directory
- **Backend APIs**: Backend APIs will be in `/client/app/api/office/` (Next.js API routes)

---

**Status**: 📋 Development Phase  
**Last Updated**: January 2026
