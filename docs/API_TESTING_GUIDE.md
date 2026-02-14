# LegaLink360 API Testing Guide

**Date**: February 14, 2026  
**Environment**: Development (localhost:3001)  
**Authentication**: JWT Bearer Token  
**Test User ID**: `7a14cbe5-4d14-4c5e-83e8-4fb009465b29`

---

## Quick Setup

### For Local Development (localhost:3001):
```powershell
# Authentication token (test JWT with user ID 7a14cbe5-4d14-4c5e-83e8-4fb009465b29)
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YTE0Y2JlNS00ZDE0LTRjNWUtODNlOC00ZmIwMDk0NjViMjkifQ.test"
$h = @{"Authorization"="Bearer $token"; "Content-Type"="application/json"}
$userId = "7a14cbe5-4d14-4c5e-83e8-4fb009465b29"
$baseUrl = "http://localhost:3001"
```

### For Production (Render):
```powershell
# Use your production token here
$token = "YOUR_PRODUCTION_JWT_TOKEN"
$h = @{"Authorization"="Bearer $token"; "Content-Type"="application/json"}
$userId = "YOUR_USER_ID"
$baseUrl = "https://legalink360-api.onrender.com"
```

---

## ⚠️ Important: GET vs POST for Messages Endpoint

| Method | URL | Purpose | Body |
|--------|-----|---------|------|
| **GET** | `/api/chat/threads/:threadId/messages` | **Retrieve** all messages | ❌ No body needed |
| **POST** | `/api/chat/threads/:threadId/messages` | **Save** a new message | ✅ Requires `role` and `content` |

**Error you're seeing:**
```json
{
  "error": "Missing required fields",
  "required": ["role", "content"]
}
```

This means you're hitting the **POST endpoint** without the required fields. You need to send:
```json
{
  "role": "user",
  "content": "Your message here",
  "tokensUsed": 5
}
```

---

## Production API (Render)

Your API is also deployed to production:

**Base URL**: `https://legalink360-api.onrender.com`

### Testing Production Endpoints

#### GET Messages (Retrieve)
```powershell
$token = "YOUR_PRODUCTION_TOKEN"
$threadId = "your-thread-id"
$h = @{"Authorization"="Bearer $token"; "Content-Type"="application/json"}

# This works - GET requires no body
$resp = Invoke-WebRequest -Uri "https://legalink360-api.onrender.com/api/chat/threads/$threadId/messages" `
  -Headers $h -UseBasicParsing
$resp.Content | ConvertFrom-Json | ConvertTo-Json
```

✅ **Expected**: Returns array of messages

#### POST Message (Save)
```powershell
$token = "YOUR_PRODUCTION_TOKEN"
$threadId = "your-thread-id"
$h = @{"Authorization"="Bearer $token"; "Content-Type"="application/json"}

# This works - POST requires role and content
$body = @{
    role = "user"
    content = "What is contract law?"
    tokensUsed = 5
} | ConvertTo-Json

$resp = Invoke-WebRequest -Uri "https://legalink360-api.onrender.com/api/chat/threads/$threadId/messages" `
  -Method POST -Headers $h -Body $body -UseBasicParsing
$resp.Content | ConvertFrom-Json | ConvertTo-Json
```

✅ **Expected**: Status 201, returns saved message

### Fix for Your Error

**What you did** (Browser):
```
https://legalink360-api.onrender.com/api/chat/threads/:threadId/messages
```
❌ This hits POST endpoint with NO BODY → Missing fields error

**What you should do** (Postman/PowerShell):
1. Use **GET** method to retrieve messages (no body needed)
2. Use **POST** method to save messages (include role & content)

**Browser won't work** because:
- ❌ Browser defaults to GET
- ❌ Can't send custom headers (Authorization)
- ❌ Can't send JSON body

**Use Postman instead:**
1. Method: **POST**
2. URL: `https://legalink360-api.onrender.com/api/chat/threads/:threadId/messages`
3. Headers: `Authorization: Bearer YOUR_TOKEN`
4. Body (raw JSON):
```json
{
  "role": "user",
  "content": "Your question here",
  "tokensUsed": 10
}
```

---

### Direct Browser Access (GET requests only)

These endpoints can be tested directly in your browser's address bar:

| Endpoint | Browser URL | Notes |
|----------|-------------|-------|
| **Health Check** | `http://localhost:3001/health` | ✅ No auth required, works in browser |
| **Get All Threads** | `http://localhost:3001/api/chat/threads` | ⚠️ Requires auth token in header (won't work in browser) |

### Using Postman or Insomnia

For complete API testing with authentication:

1. **Import these endpoints into Postman/Insomnia**:
   - **Base URL**: `http://localhost:3001`
   - **Default Header**: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YTE0Y2JlNS00ZDE0LTRjNWUtODNlOC00ZmIwMDk0NjViMjkifQ.test`
   - **Content-Type**: `application/json`

2. **Create requests for each endpoint** listed below

---

## All Available Endpoints

### 1. Health Check
```
GET http://localhost:3001/health
```
- **Auth**: Not required
- **Browser**: ✅ Yes, paste in address bar
- **Response**: Server status info

### 2. Get All Threads
```
GET http://localhost:3001/api/chat/threads
```
- **Auth**: ✅ Required
- **Browser**: ❌ No (needs header)
- **Postman**: ✅ Yes
- **PowerShell**: ✅ Yes (see tests below)

### 3. Create New Thread
```
POST http://localhost:3001/api/chat/threads
```
- **Auth**: ✅ Required
- **Body**: `{ "title": "...", "topic": "...", "documentIds": [] }`
- **Browser**: ❌ No
- **Postman**: ✅ Yes

### 4. Get Specific Thread
```
GET http://localhost:3001/api/chat/threads/:threadId
```
- **Auth**: ✅ Required
- **Example**: `GET http://localhost:3001/api/chat/threads/82667f94-bac8-4528-88ad-fefaf187204a`
- **Browser**: ❌ No
- **Postman**: ✅ Yes

### 5. Update Thread
```
PUT http://localhost:3001/api/chat/threads/:threadId
```
- **Auth**: ✅ Required
- **Body**: `{ "title": "...", "topic": "...", ... }`
- **Browser**: ❌ No
- **Postman**: ✅ Yes

### 6. Save Message to Thread
```
POST http://localhost:3001/api/chat/threads/:threadId/messages
```
- **Auth**: ✅ Required
- **Example**: `POST http://localhost:3001/api/chat/threads/82667f94-bac8-4528-88ad-fefaf187204a/messages`
- **Body**: `{ "role": "user", "content": "...", "tokensUsed": 5 }`
- **Browser**: ❌ No
- **Postman**: ✅ Yes

### 7. Get All Messages in Thread
```
GET http://localhost:3001/api/chat/threads/:threadId/messages
```
- **Auth**: ✅ Required
- **Example**: `GET http://localhost:3001/api/chat/threads/82667f94-bac8-4528-88ad-fefaf187204a/messages`
- **Browser**: ❌ No
- **Postman**: ✅ Yes

### 8. Pin/Unpin Thread
```
POST http://localhost:3001/api/chat/threads/:threadId/pin
```
- **Auth**: ✅ Required
- **Body**: `{ "isPinned": true }`
- **Browser**: ❌ No
- **Postman**: ✅ Yes

### 9. Archive Thread
```
POST http://localhost:3001/api/chat/threads/:threadId/archive
```
- **Auth**: ✅ Required
- **Browser**: ❌ No
- **Postman**: ✅ Yes

### 10. Delete Thread
```
DELETE http://localhost:3001/api/chat/threads/:threadId
```
- **Auth**: ✅ Required
- **Browser**: ❌ No
- **Postman**: ✅ Yes

### 11. Store OpenAI Thread ID
```
POST http://localhost:3001/api/chat/threads/:threadId/openai-thread
```
- **Auth**: ✅ Required
- **Body**: `{ "openaiThreadId": "thread_...", "openaiSessionId": "..." }`
- **Browser**: ❌ No
- **Postman**: ✅ Yes

### 12. Get OpenAI Thread ID
```
GET http://localhost:3001/api/chat/threads/:threadId/openai-thread
```
- **Auth**: ✅ Required
- **Browser**: ❌ No
- **Postman**: ✅ Yes

---

## Browser Testing Alternatives

### Option 1: Use Chrome DevTools (for testing with auth)
```javascript
// Open browser console (F12), then paste:
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YTE0Y2JlNS00ZDE0LTRjNWUtODNlOC00ZmIwMDk0NjViMjkifQ.test";

// Test GET threads
fetch('http://localhost:3001/api/chat/threads', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log(data));

// Test POST message
fetch('http://localhost:3001/api/chat/threads/82667f94-bac8-4528-88ad-fefaf187204a/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    role: 'user',
    content: 'Hello!',
    tokensUsed: 5
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

### Option 2: Use Postman (Recommended) ⭐

**Postman** is the easiest way to test all endpoints with a GUI. Follow the complete guide below.

### Option 3: Use VS Code REST Client Extension
Create file `test.http`:
```http
### Health Check
GET http://localhost:3001/health

### Get All Threads
GET http://localhost:3001/api/chat/threads
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YTE0Y2JlNS00ZDE0LTRjNWUtODNlOC00ZmIwMDk0NjViMjkifQ.test

### Create Thread
POST http://localhost:3001/api/chat/threads
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YTE0Y2JlNS00ZDE0LTRjNWUtODNlOC00ZmIwMDk0NjViMjkifQ.test
Content-Type: application/json

{
  "title": "Test Thread",
  "topic": "General"
}
```
Then click "Send Request" above each request.

---

## Complete Postman Setup Guide

### Step 1: Download & Install Postman

1. Download from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
2. Install and open Postman
3. Sign up (free) or skip and use locally

### Step 2: Create a New Collection

1. Click **+ New** → **Collection**
2. Name it: `LegaLink360 API Tests`
3. Add description: `Testing LegaLink360 chat API endpoints`
4. Click **Create**

### Step 3: Set Up Environment Variables

1. Click the gear icon ⚙️ → **Environments** → **Create New Environment**
2. Name: `LegaLink360 Dev`
3. Add these variables:

| Variable | Initial Value | Type |
|----------|---------------|------|
| `baseUrl` | `http://localhost:3001` | string |
| `token` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YTE0Y2JlNS00ZDE0LTRjNWUtODNlOC00ZmIwMDk0NjViMjkifQ.test` | string |
| `userId` | `7a14cbe5-4d14-4c5e-83e8-4fb009465b29` | string |
| `threadId` | `` (leave empty, will be auto-populated) | string |

4. Click **Save**
5. In top-right, select environment: `LegaLink360 Dev`

### Step 4: Create Requests in Collection

#### Request 1: Health Check

1. In collection, click **+ Add Request**
2. Name: `Health Check`
3. Set **GET** method
4. URL: `{{baseUrl}}/health`
5. Click **Send**

✅ Expected: Status 200

---

#### Request 2: Get All Threads

1. **+ Add Request**
2. Name: `Get All Threads`
3. Method: **GET**
4. URL: `{{baseUrl}}/api/chat/threads`
5. **Headers** tab:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`
6. Click **Send**

✅ Expected: Status 200, returns threads array

---

#### Request 3: Create New Thread

1. **+ Add Request**
2. Name: `Create Thread`
3. Method: **POST**
4. URL: `{{baseUrl}}/api/chat/threads`
5. **Headers** tab:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`
6. **Body** tab → Select **raw** → **JSON**
7. Paste:
```json
{
  "title": "Legal Question Test",
  "topic": "Contract Law",
  "documentIds": []
}
```
8. **Tests** tab (auto-save threadId):
```javascript
// Auto-save thread ID to environment
if (pm.response.code === 201) {
  var jsonData = pm.response.json();
  pm.environment.set("threadId", jsonData.thread.id);
  console.log("✅ Thread created:", jsonData.thread.id);
}
```
9. Click **Send**

✅ Expected: Status 201, `threadId` saved to environment

---

#### Request 4: Save User Message

1. **+ Add Request**
2. Name: `Save User Message`
3. Method: **POST**
4. URL: `{{baseUrl}}/api/chat/threads/{{threadId}}/messages`
5. **Headers**:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`
6. **Body** → **raw** → **JSON**:
```json
{
  "role": "user",
  "content": "What are the main types of employment contracts?",
  "tokensUsed": 12
}
```
7. Click **Send**

✅ Expected: Status 201

---

#### Request 5: Save Assistant Message

1. **+ Add Request**
2. Name: `Save Assistant Message`
3. Method: **POST**
4. URL: `{{baseUrl}}/api/chat/threads/{{threadId}}/messages`
5. **Headers**:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`
6. **Body** → **raw** → **JSON**:
```json
{
  "role": "assistant",
  "content": "There are several types of employment contracts:\n1. At-Will Employment\n2. Fixed-Term Contracts\n3. Permanent Contracts\n4. Temporary/Casual Contracts\n5. Part-Time Contracts",
  "tokensUsed": 38,
  "responseTimeMs": 1250,
  "modelUsed": "gpt-4-turbo"
}
```
7. Click **Send**

✅ Expected: Status 201

---

#### Request 6: Get All Messages in Thread

1. **+ Add Request**
2. Name: `Get Thread Messages`
3. Method: **GET**
4. URL: `{{baseUrl}}/api/chat/threads/{{threadId}}/messages`
5. **Headers**:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`
6. Click **Send**

✅ Expected: Status 200, returns array of 2 messages

---

#### Request 7: Pin Thread

1. **+ Add Request**
2. Name: `Pin Thread`
3. Method: **POST**
4. URL: `{{baseUrl}}/api/chat/threads/{{threadId}}/pin`
5. **Headers**:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`
6. **Body** → **raw** → **JSON**:
```json
{
  "isPinned": true
}
```
7. Click **Send**

✅ Expected: Status 200

---

#### Request 8: Archive Thread

1. **+ Add Request**
2. Name: `Archive Thread`
3. Method: **POST**
4. URL: `{{baseUrl}}/api/chat/threads/{{threadId}}/archive`
5. **Headers**:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`
6. Click **Send**

✅ Expected: Status 200

---

#### Request 9: Delete Thread

1. **+ Add Request**
2. Name: `Delete Thread`
3. Method: **DELETE**
4. URL: `{{baseUrl}}/api/chat/threads/{{threadId}}`
5. **Headers**:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`
6. Click **Send**

✅ Expected: Status 200

---

### Step 5: Run All Tests in Sequence

#### Option A: Run Collection (Best for testing flow)

1. Click the **▶ Run** button next to collection name
2. Select all requests (check the checkboxes)
3. Set **Delay**: 500ms (between requests)
4. Click **Run LegaLink360 API Tests**
5. Watch tests execute in order
6. View results in **Results** panel

#### Option B: Manual Testing (Recommended for learning)

1. Run **Health Check** first (verify server is running)
2. Run **Get All Threads** (verify auth works)
3. Run **Create Thread** (creates test thread, auto-saves ID)
4. Run **Save User Message** (uses saved threadId)
5. Run **Save Assistant Message**
6. Run **Get Thread Messages** (see both messages)
7. Run **Pin Thread**
8. Run **Archive Thread**
9. Run **Delete Thread**

Each request shows:
- ✅ **Status code** (green = success)
- 📋 **Response body** (JSON)
- ⏱️ **Response time** (ms)
- 🔍 **Headers** sent

---

### Step 6: Create a Postman Test Suite (Optional)

Add **Tests** tab to each request for automated validation:

**Health Check - Tests tab:**
```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has status ok", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.status).to.equal("ok");
});
```

**Create Thread - Tests tab:**
```javascript
pm.test("Status code is 201", function () {
  pm.response.to.have.status(201);
});

pm.test("Thread ID is UUID", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.thread.id).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}/);
  pm.environment.set("threadId", jsonData.thread.id);
});

pm.test("Response has thread data", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.thread).to.have.property("id");
  pm.expect(jsonData.thread).to.have.property("title");
  pm.expect(jsonData.thread).to.have.property("user_id");
});
```

**Save Message - Tests tab:**
```javascript
pm.test("Status code is 201", function () {
  pm.response.to.have.status(201);
});

pm.test("Message has required fields", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.message).to.have.property("id");
  pm.expect(jsonData.message).to.have.property("thread_id");
  pm.expect(jsonData.message).to.have.property("role");
  pm.expect(jsonData.message).to.have.property("content");
});
```

---

### Postman Tips & Tricks

| Task | How To |
|------|--------|
| **Save response to variable** | Tests tab: `pm.environment.set("varName", value)` |
| **Use variable in URL** | `{{variableName}}` in URL bar |
| **Reuse values between requests** | Set in Environment, use `{{varName}}` |
| **See request history** | Click **History** tab on left |
| **Export collection** | Menu → **Export** → Share with team |
| **Import collection** | **File** → **Import** → Select `.json` file |
| **Create pre-request script** | Use before sending (e.g., generate timestamps) |
| **Debug responses** | Click response → **Visualize** or **JSON** tabs |
| **Run requests in order** | Use **Collection Runner** (▶ Run button) |
| **Share with team** | Export collection and email `.json` file |

---

### Export Postman Collection for Team

To share your test collection:

1. Right-click collection → **Export**
2. Choose format: **Collection v2.1** (most compatible)
3. Save as: `LegaLink360-API-Tests.json`
4. Share with team - they can import it

**To import:**
- Click **File** → **Import**
- Select `.json` file
- All requests appear in new collection

---

## Test 1: Health Check ✅

**Purpose**: Verify server is running  
**Method**: GET  
**Endpoint**: `/health`

```powershell
Write-Host "1️⃣ HEALTH CHECK" -ForegroundColor Cyan
$resp = Invoke-WebRequest -Uri "$baseUrl/health" -UseBasicParsing
Write-Host "Status: $($resp.StatusCode)" -ForegroundColor Green
$resp.Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response** (201):
```json
{
  "status": "ok",
  "timestamp": "2026-02-14T20:19:44.430Z",
  "service": "LegaLink360 Backend",
  "version": "1.0.0"
}
```

---

## Test 2: Get All Threads

**Purpose**: Retrieve all chat threads for authenticated user  
**Method**: GET  
**Endpoint**: `/api/chat/threads`  
**Auth**: Required ✔️

```powershell
Write-Host "`n2️⃣ GET ALL THREADS" -ForegroundColor Cyan
$resp = Invoke-WebRequest -Uri "$baseUrl/api/chat/threads" -Headers $h -UseBasicParsing
Write-Host "Status: $($resp.StatusCode)" -ForegroundColor Green
$resp.Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response** (200):
```json
{
  "success": true,
  "threads": [
    {
      "id": "82667f94-bac8-4528-88ad-fefaf187204a",
      "user_id": "7a14cbe5-4d14-4c5e-83e8-4fb009465b29",
      "title": "Test",
      "topic": null,
      "document_ids": [],
      "message_count": 0,
      "last_message_text": null,
      "last_message_at": null,
      "is_archived": false,
      "is_pinned": false,
      "archived_at": null,
      "created_at": "2026-02-14T18:31:52.706+00:00",
      "updated_at": "2026-02-14T19:14:03.883+00:00",
      "openai_thread_id": null,
      "openai_session_id": null
    }
  ],
  "count": 1
}
```

---

## Test 3: Create New Thread

**Purpose**: Create a new chat thread  
**Method**: POST  
**Endpoint**: `/api/chat/threads`  
**Auth**: Required ✔️  
**Body Fields**:
- `title` (string): Thread title (default: "New Chat")
- `topic` (string, optional): Topic/category
- `documentIds` (array, optional): Associated document IDs

```powershell
Write-Host "`n3️⃣ CREATE NEW THREAD" -ForegroundColor Cyan
$createBody = @{
    title = "Employment Law Questions"
    topic = "Employment"
    documentIds = @()
} | ConvertTo-Json
$resp = Invoke-WebRequest -Uri "$baseUrl/api/chat/threads" -Method POST -Headers $h -Body $createBody -UseBasicParsing
Write-Host "Status: $($resp.StatusCode)" -ForegroundColor Green
$threadData = $resp.Content | ConvertFrom-Json
$threadId = $threadData.thread.id
Write-Host "✅ Created thread: $threadId" -ForegroundColor Green
$resp.Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response** (201):
```json
{
  "success": true,
  "thread": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "7a14cbe5-4d14-4c5e-83e8-4fb009465b29",
    "title": "Employment Law Questions",
    "topic": "Employment",
    "message_count": 0,
    "created_at": "2026-02-14T20:25:00.000Z"
  }
}
```

---

## Test 4: Save User Message

**Purpose**: Save a user's message to a thread  
**Method**: POST  
**Endpoint**: `/api/chat/threads/:threadId/messages`  
**Auth**: Required ✔️  
**Body Fields**:
- `role` (string): "user" or "assistant"
- `content` (string): Message text
- `tokensUsed` (number, optional): Token count
- `responseTimeMs` (number, optional): Response time in milliseconds
- `modelUsed` (string, optional): AI model name

```powershell
Write-Host "`n4️⃣ SAVE USER MESSAGE" -ForegroundColor Cyan
$msgBody = @{
    role = "user"
    content = "What are the key provisions in employment contracts?"
    tokensUsed = 12
} | ConvertTo-Json
$resp = Invoke-WebRequest -Uri "$baseUrl/api/chat/threads/$threadId/messages" -Method POST -Headers $h -Body $msgBody -UseBasicParsing
Write-Host "Status: $($resp.StatusCode)" -ForegroundColor Green
$resp.Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response** (201):
```json
{
  "success": true,
  "message": {
    "id": "msg-550e8400-e29b-41d4-a716-446655440001",
    "thread_id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "user",
    "content": "What are the key provisions in employment contracts?",
    "created_at": "2026-02-14T20:25:15.000Z"
  }
}
```

---

## Test 5: Save Assistant Message

**Purpose**: Save an AI assistant's response message  
**Method**: POST  
**Endpoint**: `/api/chat/threads/:threadId/messages`  
**Auth**: Required ✔️

```powershell
Write-Host "`n5️⃣ SAVE ASSISTANT MESSAGE" -ForegroundColor Cyan
$assnMsg = @{
    role = "assistant"
    content = "Key employment contract provisions include: 1) Job duties, 2) Compensation, 3) Benefits, 4) Termination clauses, 5) Confidentiality agreements."
    tokensUsed = 45
    responseTimeMs = 1250
    modelUsed = "gpt-4-turbo"
} | ConvertTo-Json
$resp = Invoke-WebRequest -Uri "$baseUrl/api/chat/threads/$threadId/messages" -Method POST -Headers $h -Body $assnMsg -UseBasicParsing
Write-Host "Status: $($resp.StatusCode)" -ForegroundColor Green
$resp.Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response** (201):
```json
{
  "success": true,
  "message": {
    "id": "msg-550e8400-e29b-41d4-a716-446655440002",
    "thread_id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "assistant",
    "content": "Key employment contract provisions include...",
    "created_at": "2026-02-14T20:25:20.000Z"
  }
}
```

---

## Test 6: Get All Messages in Thread

**Purpose**: Retrieve all messages from a specific thread  
**Method**: GET  
**Endpoint**: `/api/chat/threads/:threadId/messages`  
**Auth**: Required ✔️

```powershell
Write-Host "`n6️⃣ GET ALL MESSAGES IN THREAD" -ForegroundColor Cyan
$resp = Invoke-WebRequest -Uri "$baseUrl/api/chat/threads/$threadId/messages" -Headers $h -UseBasicParsing
Write-Host "Status: $($resp.StatusCode)" -ForegroundColor Green
$resp.Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response** (200):
```json
{
  "success": true,
  "threadId": "550e8400-e29b-41d4-a716-446655440000",
  "messages": [
    {
      "id": "msg-550e8400-e29b-41d4-a716-446655440001",
      "thread_id": "550e8400-e29b-41d4-a716-446655440000",
      "role": "user",
      "content": "What are the key provisions in employment contracts?",
      "tokens_used": 12,
      "created_at": "2026-02-14T20:25:15.000Z"
    },
    {
      "id": "msg-550e8400-e29b-41d4-a716-446655440002",
      "thread_id": "550e8400-e29b-41d4-a716-446655440000",
      "role": "assistant",
      "content": "Key employment contract provisions include...",
      "tokens_used": 45,
      "response_time_ms": 1250,
      "created_at": "2026-02-14T20:25:20.000Z"
    }
  ],
  "count": 2
}
```

---

## Test 7: Pin Thread

**Purpose**: Pin or unpin a thread (pinned threads appear at top)  
**Method**: POST  
**Endpoint**: `/api/chat/threads/:threadId/pin`  
**Auth**: Required ✔️  
**Body Fields**:
- `isPinned` (boolean): true to pin, false to unpin

```powershell
Write-Host "`n7️⃣ PIN THREAD" -ForegroundColor Cyan
$pinBody = @{ isPinned = $true } | ConvertTo-Json
$resp = Invoke-WebRequest -Uri "$baseUrl/api/chat/threads/$threadId/pin" -Method POST -Headers $h -Body $pinBody -UseBasicParsing
Write-Host "Status: $($resp.StatusCode)" -ForegroundColor Green
$resp.Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Thread pinned"
}
```

---

## Test 8: Archive Thread

**Purpose**: Archive a thread (hidden from main list)  
**Method**: POST  
**Endpoint**: `/api/chat/threads/:threadId/archive`  
**Auth**: Required ✔️

```powershell
Write-Host "`n8️⃣ ARCHIVE THREAD" -ForegroundColor Cyan
$resp = Invoke-WebRequest -Uri "$baseUrl/api/chat/threads/$threadId/archive" -Method POST -Headers $h -UseBasicParsing
Write-Host "Status: $($resp.StatusCode)" -ForegroundColor Green
$resp.Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Thread archived"
}
```

---

## Test 9: Delete Thread

**Purpose**: Permanently delete a thread  
**Method**: DELETE  
**Endpoint**: `/api/chat/threads/:threadId`  
**Auth**: Required ✔️

```powershell
Write-Host "`n9️⃣ DELETE THREAD" -ForegroundColor Cyan
$resp = Invoke-WebRequest -Uri "$baseUrl/api/chat/threads/$threadId" -Method DELETE -Headers $h -UseBasicParsing
Write-Host "Status: $($resp.StatusCode)" -ForegroundColor Green
$resp.Content | ConvertFrom-Json | ConvertTo-Json
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Thread deleted"
}
```

---

## Complete Test Suite (All Tests)

Run this entire block to test all endpoints in sequence:

```powershell
# Setup
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YTE0Y2JlNS00ZDE0LTRjNWUtODNlOC00ZmIwMDk0NjViMjkifQ.test"
$h = @{"Authorization"="Bearer $token"; "Content-Type"="application/json"}
$baseUrl = "http://localhost:3001"

# TEST 1: Health Check
Write-Host "1️⃣ HEALTH CHECK" -ForegroundColor Cyan
$resp = Invoke-WebRequest -Uri "$baseUrl/health" -UseBasicParsing
Write-Host "Status: $($resp.StatusCode)" -ForegroundColor Green

# TEST 2: Get all threads
Write-Host "`n2️⃣ GET ALL THREADS" -ForegroundColor Cyan
$threads = Invoke-WebRequest -Uri "$baseUrl/api/chat/threads" -Headers $h -UseBasicParsing
Write-Host "Status: $($threads.StatusCode)" -ForegroundColor Green
Write-Host "Found $($([System.Management.Automation.PSObject]$threads.Content | ConvertFrom-Json).count) threads"

# TEST 3: Create new thread
Write-Host "`n3️⃣ CREATE NEW THREAD" -ForegroundColor Cyan
$createBody = @{ title = "API Test - $(Get-Date -Format 'HH:mm:ss')"; topic = "Testing" } | ConvertTo-Json
$newThread = Invoke-WebRequest -Uri "$baseUrl/api/chat/threads" -Method POST -Headers $h -Body $createBody -UseBasicParsing
$threadData = $newThread.Content | ConvertFrom-Json
$threadId = $threadData.thread.id
Write-Host "Status: $($newThread.StatusCode)" -ForegroundColor Green
Write-Host "✅ Created thread: $threadId" -ForegroundColor Green

# TEST 4: Save user message
Write-Host "`n4️⃣ SAVE USER MESSAGE" -ForegroundColor Cyan
$msgBody = @{ role = "user"; content = "What is contract law?"; tokensUsed = 5 } | ConvertTo-Json
$userMsg = Invoke-WebRequest -Uri "$baseUrl/api/chat/threads/$threadId/messages" -Method POST -Headers $h -Body $msgBody -UseBasicParsing
Write-Host "Status: $($userMsg.StatusCode)" -ForegroundColor Green
Write-Host "✅ Message saved" -ForegroundColor Green

# TEST 5: Save assistant message
Write-Host "`n5️⃣ SAVE ASSISTANT MESSAGE" -ForegroundColor Cyan
$assnMsg = @{ role = "assistant"; content = "Contract law is the body of law that governs agreements between parties."; tokensUsed = 20; responseTimeMs = 1500 } | ConvertTo-Json
$assistantMsg = Invoke-WebRequest -Uri "$baseUrl/api/chat/threads/$threadId/messages" -Method POST -Headers $h -Body $assnMsg -UseBasicParsing
Write-Host "Status: $($assistantMsg.StatusCode)" -ForegroundColor Green
Write-Host "✅ Assistant message saved" -ForegroundColor Green

# TEST 6: Get all messages
Write-Host "`n6️⃣ GET ALL MESSAGES IN THREAD" -ForegroundColor Cyan
$msgs = Invoke-WebRequest -Uri "$baseUrl/api/chat/threads/$threadId/messages" -Headers $h -UseBasicParsing
$msgData = $msgs.Content | ConvertFrom-Json
Write-Host "Status: $($msgs.StatusCode)" -ForegroundColor Green
Write-Host "✅ Retrieved $($msgData.count) messages" -ForegroundColor Green

# TEST 7: Pin thread
Write-Host "`n7️⃣ PIN THREAD" -ForegroundColor Cyan
$pinBody = @{ isPinned = $true } | ConvertTo-Json
$pinResp = Invoke-WebRequest -Uri "$baseUrl/api/chat/threads/$threadId/pin" -Method POST -Headers $h -Body $pinBody -UseBasicParsing
Write-Host "Status: $($pinResp.StatusCode)" -ForegroundColor Green
Write-Host "✅ Thread pinned" -ForegroundColor Green

# Summary
Write-Host "`n" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ ALL TESTS COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
```

---

## Error Handling Reference

| Status Code | Meaning | Common Cause |
|---|---|---|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid auth token |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend error (check server logs) |

### Common Errors:

**"Unauthorized"** → Token missing or invalid
```powershell
# Verify token is set
Write-Host $h
```

**"Failed to save message"** → Thread doesn't exist or permission denied
```powershell
# Verify thread ID exists
$threads = Invoke-WebRequest -Uri "$baseUrl/api/chat/threads" -Headers $h -UseBasicParsing
$threads.Content | ConvertFrom-Json
```

**"Connection refused"** → Server not running
```powershell
# Start server
cd d:\LegaLink360\LegaLink360AI\backend
npm run dev
```

---

## Database Schema Reference

### chat_threads table
```
- id (uuid): Unique thread identifier
- user_id (uuid): Owner of the thread
- title (text): Thread title
- topic (text): Optional topic/category
- message_count (integer): Number of messages
- is_pinned (boolean): Pin status
- is_archived (boolean): Archive status
- created_at (timestamp): Creation time
- updated_at (timestamp): Last update time
```

### chat_messages table
```
- id (uuid): Unique message identifier
- thread_id (uuid): Parent thread ID
- role (text): "user" or "assistant"
- content (text): Message body
- tokens_used (integer): Token count
- response_time_ms (integer): Response time
- model_used (text): AI model name
- created_at (timestamp): Message time
```

---

## Notes

- **User ID**: `7a14cbe5-4d14-4c5e-83e8-4fb009465b29`
- **Server URL**: `http://localhost:3001`
- **All endpoints require Bearer token authentication** (except `/health`)
- **Thread IDs are UUIDs** - they're returned from create/get calls
- **Messages are ordered by creation time** (oldest first)
- **Pinned threads appear at top** of thread list

---

**Last Updated**: February 14, 2026  
**Version**: 1.0
