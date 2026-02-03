# Chat History System Architecture

**Document Version:** 1.0  
**Date:** February 3, 2026  
**Status:** In Progress - Backend API Complete, Frontend Integration In Progress

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Data Flow](#data-flow)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Frontend Integration](#frontend-integration)
7. [Storage Strategy](#storage-strategy)
8. [Implementation Checklist](#implementation-checklist)

---

## Overview

The chat history system provides persistent storage and retrieval of user chat conversations in LegaLink360. Instead of relying on ChatKit's internal state (which is unreliable and undocumented), we maintain a database-backed history that:

- Persists chat threads across browser sessions
- Tracks message counts and metadata
- Allows thread archival and pinning
- Synchronizes between frontend UI and database
- Supports searching and filtering conversations

### Key Features

- ✅ Database-backed persistent storage
- ✅ REST API for CRUD operations
- ✅ JWT authentication for secure access
- ✅ Thread metadata (title, topic, document IDs)
- ✅ Message tracking and timestamps
- ✅ Archive and pin functionality
- 🔄 Frontend synchronization (in progress)
- 🔄 Local storage fallback (planned)

---

## System Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React/Next.js)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  App.tsx (Main Component)                                  │
│  ├── ChatArea (ChatKit UI)                                 │
│  ├── Sidebar (Thread List)                                 │
│  └── useAuth Hook (Session Management)                     │
│                                                             │
│  chatThreadApi.ts (API Service)                            │
│  ├── getThreads()                                          │
│  ├── createThread()                                        │
│  ├── updateThread()                                        │
│  ├── deleteThread()                                        │
│  └── togglePin() / archiveThread()                         │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
                       │ JWT Token in Authorization Header
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Express.js)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  server.ts (API Server)                                    │
│  ├── POST /api/chat/threads          (Create)             │
│  ├── GET  /api/chat/threads          (List)               │
│  ├── GET  /api/chat/threads/:id      (Get One)            │
│  ├── PUT  /api/chat/threads/:id      (Update)             │
│  ├── DELETE /api/chat/threads/:id    (Delete)             │
│  ├── POST /api/chat/threads/:id/archive (Archive)        │
│  └── POST /api/chat/threads/:id/pin  (Toggle Pin)         │
│                                                             │
│  chatThreadService.ts (Database Layer)                     │
│  ├── getUserChatThreads()                                  │
│  ├── getChatThread()                                       │
│  ├── createChatThread()                                    │
│  ├── updateChatThread()                                    │
│  ├── updateThreadMessage()                                 │
│  ├── archiveThread()                                       │
│  ├── deleteThread()                                        │
│  └── togglePinThread()                                     │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ Supabase Client
                       │ Service Key Authentication
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE (Supabase/PostgreSQL)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  chat_threads Table                                        │
│  ├── id (UUID)                                             │
│  ├── user_id (UUID)                                        │
│  ├── title (String)                                        │
│  ├── topic (String, optional)                              │
│  ├── document_ids (Array)                                  │
│  ├── message_count (Integer)                               │
│  ├── last_message_text (String)                            │
│  ├── last_message_at (Timestamp)                           │
│  ├── is_archived (Boolean)                                 │
│  ├── is_pinned (Boolean)                                   │
│  ├── created_at (Timestamp)                                │
│  ├── updated_at (Timestamp)                                │
│  └── archived_at (Timestamp, optional)                     │
│                                                             │
│  Indexes:                                                   │
│  ├── (user_id, is_archived, last_message_at)              │
│  └── (user_id, is_pinned)                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. User Loads App (Initial Load)

```
1. Frontend: App component mounts
2. Frontend: Extract user ID from Supabase session (useAuth)
3. Frontend: Call chatThreadApi.getThreads(userId)
4. Frontend: Make GET request to /api/chat/threads with JWT token
5. Backend: Verify JWT token in Authorization header
6. Backend: Extract user_id from JWT claims
7. Backend: Query database for all threads where user_id matches
8. Backend: Return sorted list of non-archived threads
9. Frontend: Parse JSON response into ChatThread[] array
10. Frontend: Update component state with threads
11. Frontend: Render thread list in Sidebar component
```

### 2. User Starts New Chat

```
1. Frontend: User clicks "New Chat" button
2. Frontend: Call chatThreadApi.createThread(userId, title, topic?, documentIds?)
3. Frontend: Make POST request to /api/chat/threads with JWT token
4. Backend: Verify JWT token
5. Backend: Create new thread record with:
   - Generated UUID for id
   - User's user_id
   - title (default "New Chat")
   - topic (optional)
   - document_ids (optional)
   - message_count = 0
   - is_archived = false
   - is_pinned = false
   - Timestamps
6. Backend: Return created thread object with id
7. Frontend: Parse response and add to local threads state
8. Frontend: Select new thread in UI
9. Frontend: Render ChatKit component with new empty thread
```

### 3. User Sends Message in Chat

```
1. Frontend: ChatKit captures message text
2. Frontend: Get current thread ID from state
3. Frontend: Call chatThreadApi.updateThreadMessage(threadId, userId, messageText)
4. Backend: Verify JWT token
5. Backend: RPC call to increment_thread_message_count (if exists)
   OR fallback: Update record directly with:
   - last_message_text = message text (first 100 chars)
   - last_message_at = current timestamp
   - updated_at = current timestamp
6. Backend: Return success/failure
7. Frontend: UI already shows message in ChatKit
8. Frontend: Update local thread metadata
```

### 4. User Updates Thread Title

```
1. Frontend: User edits thread title in UI
2. Frontend: Call chatThreadApi.updateThread(threadId, userId, { title: newTitle })
3. Backend: Verify JWT token and user ownership
4. Backend: Update thread record with new title and timestamp
5. Backend: Return updated thread
6. Frontend: Update local state with new title
7. Frontend: Sidebar re-renders with updated thread name
```

### 5. User Archives Thread

```
1. Frontend: User clicks archive button on thread
2. Frontend: Call chatThreadApi.archiveThread(threadId, userId)
3. Backend: Verify JWT token
4. Backend: Update thread with:
   - is_archived = true
   - archived_at = current timestamp
5. Backend: Return success
6. Frontend: Remove thread from "Recent Chats" list
7. Frontend: Move to "Archived" section (if exists)
```

### 6. User Pins/Unpins Thread

```
1. Frontend: User clicks pin icon on thread
2. Frontend: Determine new pin state (toggle)
3. Frontend: Call chatThreadApi.togglePin(threadId, userId, isPinned)
4. Backend: Verify JWT token
5. Backend: Update thread with:
   - is_pinned = isPinned
   - updated_at = current timestamp
6. Backend: Return success
7. Frontend: Move thread to pinned section at top
8. Frontend: Re-sort thread list (pinned first, then by last_message_at)
```

---

## API Endpoints

### Base URL
- Development: `http://localhost:3001`
- Production: `https://api.legalink360.com` (configured via env)

### Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <supabase_jwt_token>
```

### Endpoints

#### 1. Get All User Threads
```
GET /api/chat/threads

Query Parameters: None

Request Headers:
  Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "success": true,
  "threads": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "user-123",
      "title": "Legal Question about Contract",
      "topic": "contract-law",
      "document_ids": ["doc-1", "doc-2"],
      "message_count": 12,
      "last_message_text": "What are the key clauses...",
      "last_message_at": "2026-02-03T07:00:00Z",
      "is_archived": false,
      "is_pinned": true,
      "created_at": "2026-02-01T10:00:00Z",
      "updated_at": "2026-02-03T07:00:00Z"
    }
  ],
  "count": 1
}

Error Responses:
  401 Unauthorized - Invalid or missing JWT token
  500 Internal Server Error
```

#### 2. Create New Thread
```
POST /api/chat/threads

Request Body:
{
  "title": "My New Chat",           // optional, default "New Chat"
  "topic": "criminal-law",          // optional
  "documentIds": ["doc-1"]          // optional
}

Request Headers:
  Authorization: Bearer <jwt_token>
  Content-Type: application/json

Response (201 Created):
{
  "success": true,
  "thread": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "user-123",
    "title": "My New Chat",
    "topic": "criminal-law",
    "document_ids": ["doc-1"],
    "message_count": 0,
    "last_message_text": null,
    "last_message_at": null,
    "is_archived": false,
    "is_pinned": false,
    "created_at": "2026-02-03T07:10:00Z",
    "updated_at": "2026-02-03T07:10:00Z"
  }
}

Error Responses:
  400 Bad Request - Invalid data
  401 Unauthorized
  500 Internal Server Error
```

#### 3. Get Specific Thread
```
GET /api/chat/threads/:id

Path Parameters:
  id: UUID of the thread

Request Headers:
  Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "success": true,
  "thread": { ...thread object... }
}

Error Responses:
  401 Unauthorized
  404 Not Found - Thread doesn't exist or not owned by user
  500 Internal Server Error
```

#### 4. Update Thread
```
PUT /api/chat/threads/:id

Path Parameters:
  id: UUID of the thread

Request Body:
{
  "title": "Updated Title",         // optional
  "topic": "new-topic",             // optional
  "document_ids": ["new-doc"]       // optional
}

Request Headers:
  Authorization: Bearer <jwt_token>
  Content-Type: application/json

Response (200 OK):
{
  "success": true,
  "thread": { ...updated thread object... }
}

Error Responses:
  401 Unauthorized
  404 Not Found
  500 Internal Server Error
```

#### 5. Archive Thread
```
POST /api/chat/threads/:id/archive

Path Parameters:
  id: UUID of the thread

Request Body: {}

Request Headers:
  Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "success": true,
  "message": "Thread archived"
}

Error Responses:
  401 Unauthorized
  404 Not Found
  500 Internal Server Error
```

#### 6. Delete Thread
```
DELETE /api/chat/threads/:id

Path Parameters:
  id: UUID of the thread

Request Headers:
  Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "success": true,
  "message": "Thread deleted"
}

Error Responses:
  401 Unauthorized
  404 Not Found
  500 Internal Server Error
```

#### 7. Toggle Pin State
```
POST /api/chat/threads/:id/pin

Path Parameters:
  id: UUID of the thread

Request Body:
{
  "isPinned": true  // or false
}

Request Headers:
  Authorization: Bearer <jwt_token>
  Content-Type: application/json

Response (200 OK):
{
  "success": true,
  "message": "Thread pinned"  // or "Thread unpinned"
}

Error Responses:
  401 Unauthorized
  404 Not Found
  500 Internal Server Error
```

---

## Database Schema

### Table: `chat_threads`

```sql
CREATE TABLE chat_threads (
  -- Primary Keys & Foreign Keys
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Thread Metadata
  title TEXT NOT NULL DEFAULT 'New Chat',
  topic TEXT,
  document_ids TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Message Tracking
  message_count INTEGER NOT NULL DEFAULT 0,
  last_message_text TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,

  -- State
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_message_count CHECK (message_count >= 0)
);

-- Indexes for common queries
CREATE INDEX idx_chat_threads_user_id_archived_recent 
  ON chat_threads(user_id, is_archived, last_message_at DESC NULLS LAST);

CREATE INDEX idx_chat_threads_user_id_pinned 
  ON chat_threads(user_id, is_pinned DESC);

-- Row Level Security (RLS)
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own threads"
  ON chat_threads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create threads"
  ON chat_threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own threads"
  ON chat_threads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own threads"
  ON chat_threads FOR DELETE
  USING (auth.uid() = user_id);
```

### Table: `chat_messages` (Future - for storing individual messages)

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT messages_order CHECK (created_at > (
    SELECT created_at FROM chat_threads WHERE id = thread_id
  ))
);

CREATE INDEX idx_chat_messages_thread_id ON chat_messages(thread_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
```

---

## Frontend Integration

### Files Involved

1. **[chatThreadApi.ts](../client/lib/chatThreadApi.ts)** - HTTP service layer
2. **[App.tsx](../client/app/App.tsx)** - Main component managing state
3. **[Sidebar.tsx](../client/components/Sidebar.tsx)** - Thread list display
4. **[useAuth.ts](../client/hooks/useAuth.ts)** - Authentication context

### Chat Thread API Service

**Location:** `client/lib/chatThreadApi.ts`

```typescript
interface ChatThread {
  id: string;
  user_id: string;
  title: string;
  topic?: string;
  document_ids?: string[];
  message_count: number;
  last_message_text?: string;
  last_message_at?: string;
  is_archived: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

class ChatThreadApi {
  // Get all threads for current user
  async getThreads(): Promise<ChatThread[]>
  
  // Create new thread
  async createThread(title?: string, topic?: string, documentIds?: string[]): Promise<ChatThread | null>
  
  // Get single thread
  async getThread(threadId: string): Promise<ChatThread | null>
  
  // Update thread metadata
  async updateThread(threadId: string, updates: Partial<ChatThread>): Promise<ChatThread | null>
  
  // Archive thread (soft delete)
  async archiveThread(threadId: string): Promise<boolean>
  
  // Delete thread permanently
  async deleteThread(threadId: string): Promise<boolean>
  
  // Toggle pin state
  async togglePin(threadId: string, isPinned: boolean): Promise<boolean>
}
```

### App Component Flow

**Location:** `client/app/App.tsx`

```typescript
export default function App() {
  const { user, session } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // On mount: Fetch user's chat history from database
  useEffect(() => {
    if (user) {
      fetchChatHistory();
    }
  }, [user]);

  // Fetch all threads from database
  const fetchChatHistory = async () => {
    try {
      setIsLoading(true);
      const userThreads = await chatThreadApi.getThreads();
      setThreads(userThreads);
      
      // Sync existing threads with ChatKit
      if (userThreads.length > 0) {
        syncThreadsWithChatKit(userThreads);
      }
    } catch (error) {
      console.error('[App] Error fetching chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new chat thread
  const handleNewChat = async () => {
    try {
      const newThread = await chatThreadApi.createThread('New Chat');
      if (newThread) {
        setThreads([newThread, ...threads]);
        setSelectedThreadId(newThread.id);
      }
    } catch (error) {
      console.error('[App] Error creating thread:', error);
    }
  };

  // Select and load thread
  const handleSelectChat = async (threadId: string) => {
    setSelectedThreadId(threadId);
    // Load thread details and sync to ChatKit
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      loadThreadInChatKit(thread);
    }
  };

  // Update thread after new message
  const handleThreadChange = async () => {
    if (selectedThreadId) {
      // Re-fetch thread to get updated message count
      await fetchChatHistory();
    }
  };

  return (
    <div className="app-layout">
      <Sidebar threads={threads} selectedId={selectedThreadId} onSelectThread={handleSelectChat} onNewChat={handleNewChat} />
      <ChatArea threadId={selectedThreadId} onThreadChange={handleThreadChange} />
    </div>
  );
}
```

### Sidebar Component

**Location:** `client/components/Sidebar.tsx`

Displays threads with:
- Pinned threads at top
- Recent threads sorted by last_message_at
- Archive section for archived threads
- New chat button
- Thread actions (archive, delete, pin, rename)

---

## Storage Strategy

### Option 1: Database-Only (Current Implementation)

**Pros:**
- Persistent across devices
- Centralized backup
- Works with team collaboration
- Can be synced with multiple clients
- Easy to implement archival and search

**Cons:**
- Requires network calls
- Slower initial load
- Privacy concerns (data on server)
- API rate limiting possible

**Suitable for:** Production, multi-device, team collaboration

### Option 2: Local Storage + Database Sync

**Pros:**
- Fast initial load
- Works offline
- Reduces server load
- Better UX for quick interactions

**Cons:**
- Complex sync logic
- Duplicate data
- Storage limits (~5-10MB)
- Needs conflict resolution

**Suitable for:** PWA, offline-first applications

### Option 3: Browser IndexedDB + Database Sync

**Pros:**
- Large storage capacity (~50MB+)
- Structured queries possible
- Works offline
- Still persistent

**Cons:**
- More complex to implement
- Sync logic still needed
- Browser-specific

**Suitable for:** Advanced offline support, large datasets

### Recommended Approach

**Phase 1 (Current):** Database-only for simplicity
**Phase 2:** Add local storage caching for recent threads
**Phase 3:** Full IndexedDB sync if offline support needed

---

## Implementation Checklist

### ✅ Completed

- [x] Database table `chat_threads` created with proper schema
- [x] Backend service layer `ChatThreadService` with all CRUD methods
- [x] Express REST API endpoints for all operations
- [x] JWT authentication and authorization
- [x] Frontend API service `chatThreadApi.ts` with all methods
- [x] App component refactored to fetch threads from database
- [x] Logging throughout for debugging

### 🔄 In Progress

- [ ] Fix backend server startup (Pinecone API key issue)
- [ ] Test API endpoints end-to-end
- [ ] Verify frontend successfully fetches threads
- [ ] Ensure ChatKit integration works with database threads

### 📋 TODO - Phase 2 (Storage Enhancement)

- [ ] Local storage caching for recent threads
  - [ ] Store last fetch timestamp
  - [ ] Implement cache invalidation logic
  - [ ] Add fallback if API fails
  - [ ] Consider encryption for sensitive data

- [ ] Thread list pagination (if many threads)
  - [ ] Add limit/offset to API
  - [ ] Implement infinite scroll or pagination UI
  - [ ] Load more threads on demand

### 📋 TODO - Phase 3 (Advanced Features)

- [ ] Full-text search on thread titles and content
- [ ] Advanced filtering (by date, topic, archived status)
- [ ] Thread categories/tags
- [ ] Message export (PDF, JSON)
- [ ] Thread sharing/collaboration
- [ ] Auto-save as user types
- [ ] Message history within thread (separate table)

---

## Current Status

### Working
✅ Database infrastructure complete  
✅ Backend API endpoints defined  
✅ Frontend API service created  
✅ App component refactored  

### Blocked
🚫 Backend server startup - Pinecone configuration issue  
🚫 End-to-end testing - Cannot test until server runs  

### Next Steps
1. Resolve backend server startup
2. Test all API endpoints with curl/Postman
3. Verify frontend fetches threads correctly
4. Debug any integration issues
5. Implement local storage fallback
6. Add advanced features

---

## Environment Setup

### Backend (.env.local)


### Frontend (.env)

---

## Troubleshooting

### Backend Server Won't Start

**Problem:** `PineconeConfigurationError: The client configuration must have required property: apiKey`

**Solution:**
1. Add `PINECONE_API_KEY` to `.env.local`
2. Use placeholder if not configured: `placeholder-key-for-chat-threads-only`
3. Restart server with `npm run dev`

### API Returns 404

**Problem:** Endpoints like `/api/chat/threads` return 404 instead of JSON

**Possible Causes:**
- Server not running (port 3001 not listening)
- Old process still using port (kill and restart)
- API endpoints not implemented yet
- Wrong URL path

**Debug:**
```bash
# Check if server is running
netstat -ano | findstr :3001

# Test health endpoint
curl http://localhost:3001/health

# Check logs for errors
npm run dev
```

### Frontend Can't Connect to Backend

**Problem:** `fetch() failed`, `ERR_CONNECTION_REFUSED`

**Possible Causes:**
- Backend not running
- CORS misconfigured
- Wrong API base URL in env

**Debug:**
1. Verify `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001`
2. Check browser DevTools Network tab
3. Check backend CORS settings in `server.ts`

---

## References

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Express.js Middleware](https://expressjs.com/en/guide/using-middleware.html)
- [REST API Best Practices](https://restfulapi.net/)
- [JWT Authentication](https://jwt.io/)
