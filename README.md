# Legalink360 AI Platform

<div align="center">
  <img src="client/public/logo/LegaLink360.jpg" alt="LegaLink360 Logo" width="200" height="auto" />
</div>

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![NextJS](https://img.shields.io/badge/Built_with-NextJS-blue)
![OpenAI API](https://img.shields.io/badge/Powered_by-OpenAI_API-orange)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![Architecture](https://img.shields.io/badge/Architecture-Mermaid-9370DB.svg)

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture) ⭐ **[View Full Diagram](ARCHITECTURE_DIAGRAM.mmd)**
3. [Project Structure](#project-structure)
4. [Platform Components](#platform-components)
5. [Getting Started](#getting-started)
6. [Development](#development)
7. [Documentation](#documentation)
8. [Roadmap](#roadmap)

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

## System Architecture

### High-Level Architecture Overview

LegaLink360 uses a modern, scalable architecture with clear separation of concerns:

**📊 Full Interactive Architecture Diagram:** [View ARCHITECTURE_DIAGRAM.mmd](ARCHITECTURE_DIAGRAM.mmd)
- Copy the Mermaid code to [Mermaid Live Editor](https://mermaid.live/) to see interactive diagrams
- Includes component view, sequence diagram, and deployment architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                       │
│  ChatArea Component → useLegalChat Hook → HTTP Requests     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP (JSON)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (Express.js)                        │
│  server.ts (Port 3001)                                      │
│  ├─ GET /health                                             │
│  ├─ POST /api/retrieve → RetrievalService                  │
│  ├─ POST /api/query → RetrievalService + LLMService        │
│  └─ POST /api/query/stream → Streaming Response             │
└────────────────┬──────────────┬──────────────┬──────────────┘
                 │              │              │
        ┌────────▼──┐   ┌───────▼──┐  ┌──────▼────┐
        │  Pinecone │   │ Supabase │  │   OpenAI  │
        │  (Vectors)│   │(Metadata)│  │  (Models) │
        └───────────┘   └──────────┘  └───────────┘
```

### Component Details

#### Frontend Layer
- **ChatArea Component** - React component for displaying chat interface
- **useLegalChat Hook** - Custom hook managing API communication and state
- **HTTP Requests** - JSON-based REST API calls to backend

#### Backend API Layer
- **Express.js Server** - Port 3001, handles HTTP requests
- **Health Endpoint** - Server status monitoring
- **Retrieval Endpoint** - Semantic search against legal documents
- **Query Endpoint** - Full RAG (Retrieval-Augmented Generation) pipeline
- **Streaming Endpoint** - Real-time response streaming

#### Service Layer
- **RetrievalService** - Semantic search using Pinecone vectors
  - Generates embeddings for queries
  - Searches vector database for relevant documents
  - Retrieves full content from Supabase
  
- **LLMService** - Answer generation using GPT-4
  - Receives retrieved documents as context
  - Generates comprehensive legal answers
  - Supports streaming for real-time responses

#### Data Layer
- **Pinecone** - Vector database for semantic search
  - 20 Uganda law document vectors indexed
  - 3072-dimensional embeddings (OpenAI)
  - Fast, scalable similarity search

- **Supabase** - PostgreSQL database for metadata
  - 8 tables for document management
  - User profiles, chat history, metadata
  - Row-level security (RLS) enabled

- **OpenAI** - LLM and embedding models
  - GPT-4-turbo for answer generation
  - text-embedding-3-large for vector embeddings
  - Streaming support for real-time responses

### Data Flow

#### Query Process (Full RAG Pipeline)

```
1. USER QUERY
   └─> ChatArea Component
       └─> useLegalChat Hook (queryLegalAI)
           └─> HTTP POST /api/query
               
2. BACKEND RETRIEVAL
   └─> RetrievalService.semanticSearch()
       ├─> Generate query embedding (OpenAI)
       ├─> Search Pinecone for top-K matches
       └─> Fetch full content from Supabase
       
3. ANSWER GENERATION
   └─> LLMService.generateAnswer()
       ├─> Build context from retrieved documents
       ├─> Call GPT-4-turbo with prompt + context
       └─> Return answer with source citations
       
4. RESPONSE TO FRONTEND
   └─> JSON response with answer + sources
       └─> Render in ChatArea Component
```

#### Streaming Response Process

```
1. USER QUERY
   └─> HTTP POST /api/query/stream
       
2. BACKEND STREAMING
   └─> RetrievalService.semanticSearch()
       └─> LLMService.generateAnswerStream()
           ├─> Server-Sent Events (SSE)
           ├─> Stream GPT-4 tokens in real-time
           └─> Send sources after completion
           
3. FRONTEND STREAMING DISPLAY
   └─> useLegalChat Hook (streamLegalAI)
       └─> onChunk callback receives each token
           └─> Render streaming response in real-time
```

### Technology Stack

#### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.1.1 | React framework with server features |
| React | 19 | UI component library |
| TypeScript | 5.x | Type-safe JavaScript |
| Tailwind CSS | 4.x | Styling framework |

#### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Express.js | 4.18.2 | HTTP server framework |
| Node.js | 18+ | JavaScript runtime |
| TypeScript | 5.x | Type-safe JavaScript |
| ts-node | 10.9.2 | TypeScript execution |

#### External Services
| Service | Model/Version | Purpose |
|---------|--------------|---------|
| OpenAI | GPT-4-turbo | Answer generation |
| OpenAI | text-embedding-3-large | Query/doc embeddings (3072-dim) |
| Pinecone | Latest | Vector database & semantic search |
| Supabase | PostgreSQL | Metadata storage & user management |

### Performance Metrics

#### Response Times
| Operation | Latency | Status |
|-----------|---------|--------|
| Health Check | <10ms | ✅ |
| Semantic Search | 300-500ms | ✅ |
| Full RAG Query | 2000-3500ms | ✅ |
| Streaming Response | 2000-3500ms | ✅ |

#### Throughput
- Concurrent connections: Unlimited (Express.js)
- Vector operations: Sub-100ms (Pinecone)
- Streaming throughput: 50-100 tokens/sec (GPT-4)

### Data Management

#### Ingested Data
- **Documents**: 20 Uganda law chunks
- **Categories**: 8 (Constitutional, Criminal, Civil, Family, Labor, Corporate, Tax, Land)
- **Vector Index**: Pinecone (legalink360-legal-docs)
- **Metadata Storage**: Supabase PostgreSQL

#### Data Security
- Row-level security (RLS) on all tables
- Environment variable protection for API keys
- Secure authentication via Supabase Auth
- Encrypted connections to external services

### Deployment Architecture

The system is designed for cloud deployment:

```
┌────────────────┐
│ Vercel/Netlify │ (Frontend - Next.js)
│  Port 3000     │
└────────┬───────┘
         │
         │ HTTPS
         ↓
┌────────────────────────┐
│ Railway/Heroku/AWS EC2 │ (Backend - Express)
│  Port 3001             │
└────────┬───────┬───────┬────────┘
         │       │       │
    ┌────▼──┐ ┌──▼───┐ ┌─▼──────┐
    │Pinecone│ │Supabase│ │OpenAI │
    │  API  │ │  API  │ │ API  │
    └───────┘ └───────┘ └──────┘
```

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
- **Logo**: ![LegaLink360](client/public/logo/LegaLink360.jpg)
- **Web Application**: https://legalink360ai.netlify.app (when deployed)
- **Architecture Diagrams**: [ARCHITECTURE_DIAGRAM.mmd](ARCHITECTURE_DIAGRAM.mmd)
- **Documentation**: See [`docs/`](docs/) folder for detailed reference materials
- **Status**: Active Development

---

**Last Updated**: January 2026  
**Version**: 2.0.0  
**Platform Status**: 
- Web Application (`/client`): ✅ Production Ready
- Microsoft 365 Integration (`/M365`): 📋 In Development
- Backend Services: ✅ Active (Next.js API Routes)
