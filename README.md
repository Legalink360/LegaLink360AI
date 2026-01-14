# Legalink360 AI Platform

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![NextJS](https://img.shields.io/badge/Built_with-NextJS-blue)
![OpenAI API](https://img.shields.io/badge/Powered_by-OpenAI_API-orange)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Platform Components](#platform-components)
4. [Getting Started](#getting-started)
5. [Development](#development)
6. [Documentation](#documentation)
7. [Roadmap](#roadmap)

---

## Overview

**Legalink360 AI** is a comprehensive legal technology platform that provides AI-powered legal assistance through multiple interfaces. The platform consists of two main deployment options:

1. **Web-Based Application** (`/client`) - A modern Next.js web application accessible through any browser
2. **Microsoft 365 Integration** (`/M365`) - An Office Add-in that integrates directly into Word and Outlook

Both interfaces share the same powerful AI backend (Next.js API routes in the client application), ensuring consistent capabilities and quality regardless of how users access the platform.

### Mission

Democratize legal expertise by combining cutting-edge AI technology with professional legal knowledge to provide accessible, affordable, and reliable legal solutions.

### Key Capabilities

- **Intelligent Legal Assistance** - AI-powered responses to legal questions and scenarios
- **Document Analysis** - Comprehensive legal document review and analysis
- **24/7 Availability** - Accessible anytime, anywhere
- **Multi-Platform Access** - Web browser or Microsoft 365 applications
- **Session Management** - Persistent conversation context
- **Secure & Private** - Enterprise-grade security and data protection

---

## Project Structure

The project is organized into clear, modular sections:

```
legalink360-ai/
├── client/                    # Web Application (Next.js)
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API Routes (Backend)
│   │   │   └── create-session/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── ...
│   ├── components/            # React Components
│   ├── hooks/                 # React Hooks
│   ├── lib/                   # Utilities & Config
│   ├── public/                # Static Assets
│   ├── package.json
│   └── README.md              # Client-specific README
│
├── M365/                      # Microsoft 365 Office Add-in
│   ├── src/
│   │   ├── taskpane/          # Task Pane Application
│   │   ├── commands/          # Office Commands
│   │   ├── lib/               # Utilities
│   │   └── types/             # TypeScript Types
│   ├── assets/                # Icons & Images
│   ├── manifest.xml           # Office Add-in Manifest
│   ├── package.json
│   └── README.md              # M365-specific README
│
├── backend/                   # Reserved for Future Backend Services
│   └── README.md              # Backend README
│
├── docs/                      # Documentation
│   ├── MICROSOFT_365_INTEGRATION.md
│   ├── IMPLEMENTATION_PLAN_M365.md
│   ├── OFFICE_ADDIN_README.md
│   └── ... (other docs)
│
└── README.md                  # This file (Main README)
```

### Structure Explanation

- **`client/`** - Next.js web application (frontend + API routes)
  - Includes both UI components and backend API routes
  - See [`client/README.md`](client/README.md) for details

- **`M365/`** - Microsoft 365 Office Add-in
  - Separate project for Word/Outlook integration
  - See [`M365/README.md`](M365/README.md) for details

- **`backend/`** - Reserved for future standalone backend services
  - Currently, backend is implemented as Next.js API routes in `client/app/api/`
  - See [`backend/README.md`](backend/README.md) for details

- **`docs/`** - Comprehensive project documentation
  - Technical guides, implementation plans, and references

---

## Platform Components

### Web Application (`/client`)

The web-based client application built with Next.js 15.

**Status**: ✅ Production Ready

**Features**:
- Conversational AI interface with OpenAI ChatKit
- Session management
- Theme support (light/dark)
- Responsive design

**Technology Stack**:
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- OpenAI ChatKit

**Documentation**: See [`client/README.md`](client/README.md)

### Microsoft 365 Integration (`/M365`)

Office Add-in for Word and Outlook integration.

**Status**: 📋 In Development

**Features** (Planned):
- Document analysis in Word
- Legal question answering
- Outlook integration
- Azure AD authentication

**Technology Stack**:
- React with TypeScript
- Office.js
- MSAL.js
- Webpack

**Documentation**: See [`M365/README.md`](M365/README.md)

### Backend Services

**Current Implementation**: Next.js API Routes in `client/app/api/`

**Status**: ✅ Active (API routes)
- Session management API
- Future: Office Add-in APIs

**Future Considerations**: See [`backend/README.md`](backend/README.md)

---

## Getting Started

### Quick Start

Each component has its own setup instructions:

1. **Web Application**: See [`client/README.md`](client/README.md)
2. **Office Add-in**: See [`M365/README.md`](M365/README.md)

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **OpenAI API Key** (for web application)
- **Microsoft 365 Account** (for Office Add-in development)
- **Azure Account** (for Office Add-in authentication)

---

## Development

### Working with Each Component

Each component is independently developed:

```bash
# Web Application
cd client
npm install
npm run dev

# Office Add-in
cd M365
npm install
npm run start
```

### Development Workflow

1. **Web Application**: Develop in `client/` directory
   - Frontend: React components in `client/components/`
   - Backend: API routes in `client/app/api/`
   - See [`client/README.md`](client/README.md) for details

2. **Office Add-in**: Develop in `M365/` directory
   - Components in `M365/src/taskpane/components/`
   - Utilities in `M365/src/lib/`
   - See [`M365/README.md`](M365/README.md) for details

3. **Shared Backend**: API routes in `client/app/api/`
   - Currently serves both web app and Office Add-in
   - Future: May move to standalone backend service

---

## Documentation

### Component Documentation

- **Web Application**: [`client/README.md`](client/README.md)
- **Office Add-in**: [`M365/README.md`](M365/README.md)
- **Backend Services**: [`backend/README.md`](backend/README.md)

### Technical Documentation

All technical documentation is in the [`docs/`](docs/) directory:

- **Microsoft 365 Integration**: [`docs/MICROSOFT_365_INTEGRATION.md`](docs/MICROSOFT_365_INTEGRATION.md)
- **Implementation Plan**: [`docs/IMPLEMENTATION_PLAN_M365.md`](docs/IMPLEMENTATION_PLAN_M365.md)
- **Office Add-in Developer Guide**: [`docs/OFFICE_ADDIN_README.md`](docs/OFFICE_ADDIN_README.md)
- **Technical Implementation Guide**: [`docs/TECHNICAL_IMPLEMENTATION_GUIDE.md`](docs/TECHNICAL_IMPLEMENTATION_GUIDE.md)
- **Product Roadmap**: [`docs/PRODUCT_ROADMAP_AND_USER_ROLES.md`](docs/PRODUCT_ROADMAP_AND_USER_ROLES.md)

### Quick References

- **Company Reference**: [`docs/COMPANY_REFERENCE.md`](docs/COMPANY_REFERENCE.md)
- **Development Guidelines**: [`docs/DEVELOPMENT_GUIDELINES.md`](docs/DEVELOPMENT_GUIDELINES.md)
- **Documentation Index**: [`docs/DOCUMENTATION_INDEX.md`](docs/DOCUMENTATION_INDEX.md)

---

## Roadmap

### Current Status

- ✅ **Web Application**: Production ready with conversational AI
- 📋 **Office Add-in**: Development phase - structure created
- ✅ **Backend API Routes**: Active in Next.js app

### Upcoming Features

- **Web Application**:
  - User authentication
  - Document analysis
  - Conversation history

- **Office Add-in**:
  - Document analysis in Word
  - Legal question answering
  - Outlook integration

- **Backend**:
  - Office Add-in API endpoints
  - Enhanced authentication
  - Document processing services

For detailed roadmaps, see:
- [`docs/PRODUCT_ROADMAP_AND_USER_ROLES.md`](docs/PRODUCT_ROADMAP_AND_USER_ROLES.md)
- [`docs/IMPLEMENTATION_PLAN_M365.md`](docs/IMPLEMENTATION_PLAN_M365.md)

---

## Contributing

We welcome contributions to improve Legalink360 AI. Please ensure:

1. Code follows linting standards
2. All tests pass
3. New features include documentation
4. Commit messages are clear and descriptive
5. Pull requests include description of changes

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact & Resources

- **Company**: LegaLink360
- **Web Application**: https://legalink360ai.netlify.app (when deployed)
- **Documentation**: See [`docs/`](docs/) folder for detailed reference materials
- **Status**: Active Development

---

**Last Updated**: January 2026  
**Version**: 2.0.0  
**Platform Status**: 
- Web Application (`/client`): ✅ Production Ready
- Microsoft 365 Integration (`/M365`): 📋 In Development
- Backend Services: ✅ Active (Next.js API Routes)
