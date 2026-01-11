# LegaLink360 AI Bot - Technical Implementation Guide

**Version**: 1.0.0  
**Last Updated**: January 11, 2026  
**Status**: Architecture Planning

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Database Schema](#2-database-schema)
3. [API Specifications](#3-api-specifications)
4. [Authentication Flow](#4-authentication-flow)
5. [Data Encryption & Security](#5-data-encryption--security)
6. [Deployment Architecture](#6-deployment-architecture)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        Frontend Layer                       │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Web Browser  │  │ Mobile App   │  │ Desktop App  │    │
│  │ (React)      │  │ (React Native)│  │ (Electron)   │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         └────────────┬─────────────────────┘              │
│                      │                                     │
│              Authentication & WebSocket                    │
│                      │                                     │
└────────────────┬─────────────────────────────────────────┘
                 │
┌────────────────┴─────────────────────────────────────────┐
│                   API Gateway Layer                       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────┐     │
│  │  API Gateway (Kong/AWS API Gateway)              │     │
│  │  ├─ Authentication & Authorization               │     │
│  │  ├─ Rate Limiting & Throttling                  │     │
│  │  ├─ Request/Response Logging                    │     │
│  │  ├─ Load Balancing                              │     │
│  │  └─ Request Transformation                      │     │
│  └──────┬────────────────────┬─────────────────────┘     │
│         │                    │                            │
└─────────┼────────────────────┼────────────────────────────┘
          │                    │
    ┌─────▼────────┐    ┌─────▼────────────┐
    │ REST APIs    │    │ WebSocket Server │
    │ (Express)    │    │ (Socket.io)      │
    └─────┬────────┘    └─────┬────────────┘
          │                    │
          └────────┬───────────┘
                   │
        ┌──────────▼────────────┐
        │ Business Logic Layer  │
        ├──────────────────────┤
        │                      │
        │ ┌──────────────────┐ │
        │ │ Auth Service     │ │
        │ ├──────────────────┤ │
        │ │ User Service     │ │
        │ ├──────────────────┤ │
        │ │ Chat Service     │ │
        │ ├──────────────────┤ │
        │ │ Document Service │ │
        │ ├──────────────────┤ │
        │ │ AI Service       │ │
        │ └──────────────────┘ │
        │                      │
        └──────────┬───────────┘
                   │
        ┌──────────▼────────────┐
        │ Data Access Layer     │
        ├──────────────────────┤
        │                      │
        │ ┌──────────────────┐ │
        │ │ PostgreSQL       │ │
        │ │ (Main Database)  │ │
        │ └──────────────────┘ │
        │                      │
        │ ┌──────────────────┐ │
        │ │ Redis            │ │
        │ │ (Cache & Sessions)│ │
        │ └──────────────────┘ │
        │                      │
        │ ┌──────────────────┐ │
        │ │ S3/Cloud Storage │ │
        │ │ (Documents)      │ │
        │ └──────────────────┘ │
        │                      │
        └──────────────────────┘
                   │
        ┌──────────▼────────────┐
        │ External Services     │
        ├──────────────────────┤
        │                      │
        │ ┌──────────────────┐ │
        │ │ OpenAI API       │ │
        │ │ (GPT Models)     │ │
        │ └──────────────────┘ │
        │                      │
        │ ┌──────────────────┐ │
        │ │ Document Processing│
        │ │ (PDFParser, etc)  │ │
        │ └──────────────────┘ │
        │                      │
        │ ┌──────────────────┐ │
        │ │ Email Service    │ │
        │ │ (SendGrid)       │ │
        │ └──────────────────┘ │
        │                      │
        │ ┌──────────────────┐ │
        │ │ Payment Gateway  │ │
        │ │ (Stripe)         │ │
        │ └──────────────────┘ │
        │                      │
        └──────────────────────┘
```

---

## 2. Database Schema

### 2.1 Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL DEFAULT 'customer',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  deleted_at TIMESTAMP,
  
  -- Constraints
  CONSTRAINT role_check CHECK (role IN ('customer', 'lawyer', 'admin', 'support')),
  CONSTRAINT status_check CHECK (status IN ('active', 'pending', 'suspended', 'deleted'))
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

#### User Profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  bio TEXT,
  profile_picture_url VARCHAR(500),
  timezone VARCHAR(50),
  language VARCHAR(10),
  jurisdiction VARCHAR(100),
  
  -- Professional fields (for lawyers)
  bar_license_number VARCHAR(50),
  bar_state VARCHAR(50),
  license_verified BOOLEAN DEFAULT FALSE,
  practice_areas TEXT[], -- Array of practice areas
  years_experience INTEGER,
  hourly_rate DECIMAL(10, 2),
  
  -- Settings
  notification_email_enabled BOOLEAN DEFAULT TRUE,
  notification_sms_enabled BOOLEAN DEFAULT FALSE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id)
);
```

#### Conversations Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  is_archived BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP,
  deleted_at TIMESTAMP,
  
  -- Indexing
  CONSTRAINT user_not_deleted CHECK (deleted_at IS NULL)
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_conversations_archived ON conversations(is_archived);
```

#### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  sender_type VARCHAR(20) NOT NULL, -- 'user' or 'bot'
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'document', 'system'
  tokens_used INTEGER,
  confidence_score DECIMAL(3, 2),
  source_citations JSONB, -- References and sources
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

#### Documents Table
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  conversation_id UUID REFERENCES conversations(id),
  file_name VARCHAR(500) NOT NULL,
  file_type VARCHAR(20), -- 'pdf', 'docx', 'txt', 'jpg'
  file_size INTEGER, -- in bytes
  file_url VARCHAR(500), -- S3/Cloud Storage URL
  encrypted BOOLEAN DEFAULT TRUE,
  encryption_key_id VARCHAR(100),
  
  -- Document metadata
  document_type VARCHAR(100), -- 'contract', 'agreement', 'brief', etc
  extracted_text TEXT, -- OCR or text extraction
  metadata JSONB, -- Additional structured data
  
  -- Analysis results
  analysis_summary TEXT,
  key_sections JSONB,
  risks_identified JSONB,
  recommendations JSONB,
  
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  analyzed_at TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_conversation_id ON documents(conversation_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
```

#### Access Logs Table
```sql
CREATE TABLE access_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX idx_access_logs_timestamp ON access_logs(timestamp);
CREATE INDEX idx_access_logs_action ON access_logs(action);
```

#### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  session_token VARCHAR(500) NOT NULL UNIQUE,
  refresh_token VARCHAR(500) UNIQUE,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

---

### 2.2 Row-Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own data
CREATE POLICY user_isolation ON conversations
  FOR SELECT
  USING (auth.uid() = user_id OR 
         auth.role() = 'admin');

CREATE POLICY document_isolation ON documents
  FOR SELECT
  USING (auth.uid() = user_id OR 
         auth.role() = 'admin' OR
         shared_with @> ARRAY[auth.uid()]);

-- RLS Policy: Lawyers can see shared client data
CREATE POLICY lawyer_client_access ON documents
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    auth.role() = 'lawyer' AND user_id IN (
      SELECT client_id FROM lawyer_client_relationships
      WHERE lawyer_id = auth.uid()
    ) OR
    auth.role() = 'admin'
  );
```

---

## 3. API Specifications

### 3.1 Authentication Endpoints

#### POST /api/auth/register
```typescript
// Request
{
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'lawyer';
  timezone?: string;
}

// Response
{
  id: string;
  email: string;
  role: string;
  verification_token: string;
  message: string;
}

// Security: Password requirements
// - Minimum 8 characters
// - 1 uppercase letter
// - 1 lowercase letter
// - 1 number
// - 1 special character
```

#### POST /api/auth/login
```typescript
// Request
{
  email: string;
  password: string;
  remember_me?: boolean;
}

// Response
{
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  mfa_required?: boolean;
}
```

#### POST /api/auth/verify-mfa
```typescript
// Request
{
  token: string;
  code: string; // 6-digit TOTP code
}

// Response
{
  verified: boolean;
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}
```

#### POST /api/auth/logout
```typescript
// Request
{
  token: string;
}

// Response
{
  message: string;
}
```

---

### 3.2 Conversation Endpoints

#### POST /api/conversations
```typescript
// Request
{
  title: string;
  category?: string;
}

// Response
{
  id: string;
  title: string;
  created_at: string;
}
```

#### GET /api/conversations
```typescript
// Query Parameters
{
  limit?: number;
  offset?: number;
  archived?: boolean;
  search?: string;
}

// Response
{
  conversations: Conversation[];
  total: number;
  limit: number;
  offset: number;
}
```

#### GET /api/conversations/:id
```typescript
// Response
{
  id: string;
  title: string;
  messages: Message[];
  documents: Document[];
  created_at: string;
  updated_at: string;
}
```

---

### 3.3 Chat Endpoints

#### POST /api/conversations/:id/messages
```typescript
// Request
{
  content: string;
  type?: 'text' | 'document_query';
  document_id?: string;
}

// Response (Streaming)
{
  id: string;
  content: string;
  sender_type: 'bot';
  citations?: Citation[];
  confidence_score?: number;
  created_at: string;
}
```

#### WebSocket: /ws/conversations/:id
```typescript
// Client -> Server
{
  type: 'message' | 'typing' | 'document_upload';
  payload: any;
}

// Server -> Client
{
  type: 'message' | 'bot_typing' | 'bot_response' | 'error';
  data: any;
}
```

---

### 3.4 Document Endpoints

#### POST /api/documents
```typescript
// Request (multipart/form-data)
{
  file: File;
  document_type?: string;
  conversation_id?: string;
}

// Response
{
  id: string;
  file_name: string;
  file_type: string;
  upload_status: 'processing' | 'completed';
  analysis?: DocumentAnalysis;
}
```

#### GET /api/documents/:id/analysis
```typescript
// Response
{
  id: string;
  summary: string;
  key_sections: Section[];
  identified_risks: Risk[];
  recommendations: string[];
  legal_citations: Citation[];
}
```

---

## 4. Authentication Flow

### 4.1 JWT Token Structure

```typescript
// Access Token (15 minutes expiry)
{
  sub: "user_id",
  email: "user@example.com",
  role: "customer",
  iat: 1704974400,
  exp: 1704975300,
  aud: "legalink360-api"
}

// Refresh Token (30 days expiry)
{
  sub: "user_id",
  type: "refresh",
  iat: 1704974400,
  exp: 1707566400,
  aud: "legalink360-api"
}

// Signing: RS256 (RSA with SHA-256)
```

### 4.2 OAuth Flow (Google/Microsoft)

```
1. User clicks "Login with Google"
2. Redirect to Google OAuth endpoint
3. User grants permission
4. Google redirects to callback URL
5. Exchange authorization code for tokens
6. Create/update user in database
7. Generate JWT tokens
8. Redirect to dashboard
```

---

## 5. Data Encryption & Security

### 5.1 Encryption Strategy

#### At Rest (Database)
```
- Algorithm: AES-256-GCM
- Key Management: AWS KMS or HashiCorp Vault
- Key Rotation: Quarterly

Encrypted Fields:
├─ Document content
├─ Sensitive user data
├─ Payment information
├─ Client case details
└─ Communication logs
```

#### In Transit
```
- Protocol: TLS 1.3
- Certificate: Let's Encrypt (auto-renewal)
- HSTS: Enabled (1 year)
- Perfect Forward Secrecy: Enabled
```

#### End-to-End (Sensitive Documents)
```
- Client generates encryption key
- Documents encrypted before upload
- Only client can decrypt
- Server cannot access plaintext
```

### 5.2 Password Security

```typescript
// Password Hashing
Algorithm: bcrypt
Rounds: 12
Example:
const hashedPassword = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(inputPassword, hashedPassword);

// Password Requirements
- Minimum 8 characters
- Complexity: uppercase + lowercase + number + special char
- No dictionary words
- No repeated patterns
```

### 5.3 API Security

```typescript
// Rate Limiting
- General: 100 requests per minute per IP
- Auth endpoints: 5 attempts per minute
- Document upload: 10 files per hour

// CORS Configuration
Allowed origins: legalink360.com, app.legalink360.com
Methods: GET, POST, PUT, DELETE, OPTIONS
Headers: Authorization, Content-Type

// Input Validation
- All inputs sanitized
- SQL injection prevention
- XSS protection
- CSRF tokens required

// Request Signing
- API requests signed with HMAC-SHA256
- Nonce for replay attack prevention
```

---

## 6. Deployment Architecture

### 6.1 Cloud Infrastructure

```
┌─────────────────────────────────────┐
│        AWS/GCP/Azure Cloud          │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ CDN (CloudFront/Cloudflare) │   │
│  │ - Static assets             │   │
│  │ - API responses caching     │   │
│  └──────────────┬──────────────┘   │
│                 │                   │
│  ┌──────────────▼──────────────┐   │
│  │ Load Balancer (ALB/NLB)     │   │
│  │ - SSL/TLS termination       │   │
│  │ - Traffic distribution      │   │
│  └──────────────┬──────────────┘   │
│                 │                   │
│  ┌──────────────▼──────────────┐   │
│  │ Kubernetes Cluster          │   │
│  │ ├─ API Pods (3+)            │   │
│  │ ├─ Worker Pods (2+)         │   │
│  │ ├─ Cache Pods (2)           │   │
│  │ └─ Monitoring (Prometheus)  │   │
│  └────────────────────────────┘   │
│                 │                   │
│  ┌──────────────┼──────────────┐   │
│  │              │              │   │
│  ▼              ▼              ▼   │
│ RDS         Redis Cluster    S3   │
│ (Database)  (Cache/Session) (Docs)│
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Secrets Manager             │   │
│  │ - API Keys                  │   │
│  │ - Database credentials      │   │
│  │ - Encryption keys           │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 6.2 Monitoring & Logging

```
┌─────────────────────────────────┐
│ Application Monitoring          │
├─────────────────────────────────┤
│                                 │
│ Prometheus + Grafana            │
│ ├─ CPU usage                    │
│ ├─ Memory usage                 │
│ ├─ Request latency              │
│ ├─ Error rates                  │
│ └─ Custom metrics               │
│                                 │
│ ELK Stack (Elasticsearch)       │
│ ├─ Application logs             │
│ ├─ API request logs             │
│ ├─ Error tracking               │
│ └─ Full-text search             │
│                                 │
│ Sentry (Error Tracking)         │
│ ├─ Exception monitoring         │
│ ├─ Stack traces                 │
│ ├─ Release tracking             │
│ └─ User impact analysis         │
│                                 │
│ DataDog/New Relic               │
│ ├─ APM (Application Performance)│
│ ├─ Distributed tracing          │
│ ├─ Real-time alerting           │
│ └─ Dashboard management         │
│                                 │
└─────────────────────────────────┘
```

### 6.3 CI/CD Pipeline

```
Git Push
   ↓
GitHub Actions / GitLab CI
   ├─ Unit Tests
   ├─ Integration Tests
   ├─ Linting
   ├─ SAST (Security Analysis)
   ├─ Build Docker Image
   ├─ Push to Registry
   └─ Deploy to Staging
   ↓
Staging Environment Tests
   ├─ E2E Tests
   ├─ Performance Tests
   ├─ Security Tests
   └─ Manual Testing
   ↓
Deploy to Production
   ├─ Rolling deployment
   ├─ Health checks
   ├─ Smoke tests
   └─ Monitoring
```

### 6.4 Backup & Disaster Recovery

```
Backup Strategy:
├─ Database: Daily automated backups
│  ├─ Storage: Separate region
│  ├─ Retention: 30 days
│  └─ RTO: < 1 hour
│
├─ Documents: Real-time sync
│  ├─ Primary: S3
│  ├─ Secondary: Cross-region replication
│  └─ RTO: < 15 minutes
│
└─ Configuration: Version control
   ├─ Git repositories
   ├─ Infrastructure as Code
   └─ Instant recovery possible

Recovery Time Objectives:
├─ Critical Services: < 15 minutes
├─ Important Services: < 1 hour
└─ Non-critical: < 4 hours

Recovery Point Objectives:
├─ Database: < 1 hour
├─ Documents: < 5 minutes
└─ Configuration: No data loss (Git-backed)
```

---

## Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Set up cloud infrastructure
- [ ] Configure PostgreSQL database
- [ ] Set up Redis cache
- [ ] Configure S3/Cloud Storage
- [ ] Set up monitoring and logging

### Phase 2: Authentication
- [ ] Implement user registration
- [ ] Implement login with JWT
- [ ] Add MFA support
- [ ] Add OAuth integration
- [ ] Implement session management

### Phase 3: Chat & Conversation
- [ ] Implement WebSocket server
- [ ] Create conversation API
- [ ] Implement message saving
- [ ] Add streaming responses
- [ ] Implement conversation search

### Phase 4: Document Handling
- [ ] Implement document upload
- [ ] Add document processing
- [ ] Implement OCR/text extraction
- [ ] Create analysis pipeline
- [ ] Add encrypted storage

### Phase 5: Security & Compliance
- [ ] Implement RLS policies
- [ ] Add encryption at rest
- [ ] Set up audit logging
- [ ] Implement GDPR compliance
- [ ] Add security testing

### Phase 6: Testing & Deployment
- [ ] Set up CI/CD pipeline
- [ ] Implement automated testing
- [ ] Performance testing
- [ ] Security testing
- [ ] Load testing

---

**Document Status**: Architecture Planning  
**Next Review**: February 2026  
**Version**: 1.0.0
