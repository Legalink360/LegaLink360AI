**Test All Endpoints:**

```bash
# Set your JWT token
TOKEN="your_jwt_token_here"

# 1. Health Check
curl http://localhost:3001/health

# 2. Get All Threads (empty for new user)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/chat/threads

# 3. Create New Thread
curl -X POST http://localhost:3001/api/chat/threads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Thread","topic":"legal"}'

# Note: Copy the returned thread ID for next tests

# 4. Get Specific Thread
THREAD_ID="paste-returned-id-here"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/chat/threads/$THREAD_ID

# 5. Update Thread
curl -X PUT http://localhost:3001/api/chat/threads/$THREAD_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

# 6. Pin Thread
curl -X POST http://localhost:3001/api/chat/threads/$THREAD_ID/pin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isPinned":true}'

# 7. Archive Thread
curl -X POST http://localhost:3001/api/chat/threads/$THREAD_ID/archive \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# 8. Delete Thread
curl -X DELETE http://localhost:3001/api/chat/threads/$THREAD_ID \
  -H "Authorization: Bearer $TOKEN"

# 9. Chat thread test with mock data. 
GET http://localhost:3001/api/chat/threads/test
```
