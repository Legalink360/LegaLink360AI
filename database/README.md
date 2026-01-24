# Database - LegaLink360 AI

Complete database management for frontend and backend services.

## 📁 Folder Structure

```
database/
├── .env.local                          # Database credentials (gitignore)
├── DATABASE_SETUP.sql                  # Legacy setup script
│
├── migrations/                         # All database migrations
│   ├── README.md                       # Complete migration documentation
│   ├── 001_create_user_profiles.sql
│   ├── 002_create_documents_table.sql
│   ├── 003_create_chat_threads.sql
│   ├── 004_create_chat_messages.sql
│   ├── 005_create_backend_documents.sql
│   ├── 006_create_document_chunks.sql
│   ├── 007_create_ingestion_logs.sql
│   └── 008_create_query_logs.sql
│
├── MIGRATION_STATUS.md                 # Current migration status
├── QUICK_MIGRATION_GUIDE.md           # Quick reference for applying migrations
└── MIGRATIONS_SUMMARY.md               # Overview and summary
```

## 🎯 Quick Links

### Getting Started
- **New to migrations?** → Start with [QUICK_MIGRATION_GUIDE.md](QUICK_MIGRATION_GUIDE.md)
- **Need details?** → See [migrations/README.md](migrations/README.md)
- **Check current state?** → Review [MIGRATION_STATUS.md](MIGRATION_STATUS.md)
- **Want overview?** → Read [MIGRATIONS_SUMMARY.md](MIGRATIONS_SUMMARY.md)

### Database Connection

```javascript
// JavaScript/Node.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://otbsvaxnzvrphysooinh.supabase.co',
  'your_anon_key'
);
```

```python
# Python
import supabase

client = supabase.create_client(
  'https://otbsvaxnzvrphysooinh.supabase.co',
  'your_anon_key'
)
```

## 📋 All Migrations at a Glance

### Frontend Tables (4)

| Migration | Table | Purpose | RLS | Indexes |
|-----------|-------|---------|-----|---------|
| 001 | `user_profiles` | User authentication & profiles | ✅ | 2 |
| 002 | `documents` | User-uploaded documents | ✅ | 4 |
| 003 | `chat_threads` | Chat conversations | ✅ | 4 |
| 004 | `chat_messages` | Individual messages | ✅ | 4 |

### Backend Tables (4)

| Migration | Table | Purpose | RLS | Indexes |
|-----------|-------|---------|-----|---------|
| 005 | `backend_documents` | Document metadata | ✅ | 4 |
| 006 | `document_chunks` | Text chunks for vectors | ✅ | 5 |
| 007 | `ingestion_logs` | Ingestion audit trail | ✅ | 5 |
| 008 | `query_logs` | Query tracking & analytics | ✅ | 7 |

## 🚀 Applying Migrations

### One-Step: Apply All Migrations

**Via Supabase Dashboard (easiest):**
1. Go to SQL Editor
2. Open each migration file and run in order (001-008)

**Via Command Line:**
```bash
# Set your database URL
export PGPASSWORD="your_password"
export DB_HOST="db.supabase.co"

# Apply all migrations
for i in {1..8}; do
  psql -h $DB_HOST -U postgres -d postgres \
    -f migrations/00${i}_*.sql
done
```

### Verification

```sql
-- Check all tables created
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public';
-- Expected: 8

-- Check RLS enabled
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN (
  'user_profiles', 'documents', 'chat_threads', 'chat_messages',
  'backend_documents', 'document_chunks', 'ingestion_logs', 'query_logs'
);
-- Expected: 8 rows

-- Check indexes created
SELECT COUNT(*) as index_count FROM pg_indexes 
WHERE schemaname = 'public';
-- Expected: 36+
```

## 🔒 Security Features

All tables include:
- ✅ **Row Level Security (RLS)** - Users see only their data
- ✅ **Foreign Key Constraints** - Data integrity
- ✅ **Cascading Deletes** - Clean-up of related data
- ✅ **Timestamping** - Audit trail

## ⚡ Performance Optimizations

All tables have strategic indexes on:
- User ownership (user_id)
- Sorting (created_at, updated_at)
- Filtering (status, type)
- Search (keywords using GIN)
- Relationships (foreign keys)

## 🎯 Table Relationships

```
auth.users (Supabase managed)
├── user_profiles (1:1)
│   ├── documents (1:N)
│   └── chat_threads (1:N)
│       └── chat_messages (1:N)
└── query_logs (1:N)

backend_documents (Independent)
└── document_chunks (1:N)
└── ingestion_logs (1:N)
```

## 📊 Current Status

**Status**: ✅ All 8 Migrations Applied

| Item | Count | Status |
|------|-------|--------|
| Tables | 8 | ✅ Created |
| Indexes | 36+ | ✅ Created |
| RLS Policies | 20+ | ✅ Enabled |
| Foreign Keys | 5+ | ✅ Configured |
| Cascade Deletes | Enabled | ✅ Active |

## 🛠️ Common Operations

### Create User Profile
```sql
INSERT INTO user_profiles (auth_id, email, first_name, last_name)
VALUES ('user-uuid', 'user@example.com', 'John', 'Doe');
```

### Insert Document
```sql
INSERT INTO documents (user_id, title, file_name, document_type, status)
VALUES ('user-uuid', 'Sample Contract', 'contract.pdf', 'contract', 'completed');
```

### Create Chat Thread
```sql
INSERT INTO chat_threads (user_id, title, topic)
VALUES ('user-uuid', 'Contract Review', 'contract_analysis')
RETURNING id;
```

### Log Query
```sql
INSERT INTO query_logs (
  user_id, 
  query_text, 
  documents_returned,
  status,
  total_latency_ms,
  total_cost_usd
) VALUES ('user-uuid', 'What are the payment terms?', 5, 'success', 250, 0.0015);
```

### Check User's Documents
```sql
SELECT * FROM documents 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

## 📈 Data Growth Expectations

**Year 1 Projections:**
- Users: 100-1,000
- Documents: 1,000-10,000
- Chat messages: 20,000-200,000
- Query logs: 50,000-500,000

## 🚨 Monitoring & Maintenance

### Daily Checks
```sql
-- Check failed operations
SELECT DATE(created_at), COUNT(*) 
FROM ingestion_logs 
WHERE status = 'failed' 
GROUP BY DATE(created_at);

-- Monitor API costs
SELECT 
  DATE(created_at) as date,
  SUM(total_cost_usd) as daily_cost
FROM query_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Weekly Reviews
- Check database size growth
- Review slow query logs
- Analyze error trends
- Monitor RLS policies

### Monthly Maintenance
- Analyze and reindex tables
- Review and optimize indexes
- Archive old logs (optional)
- Backup verification

## 🔄 Backup & Recovery

**Automatic Backups:**
- Supabase creates daily backups
- 7-day point-in-time recovery
- Access via Supabase Dashboard → Backups

**Manual Backup:**
```bash
pg_dump -h db.supabase.co -U postgres -d postgres \
  --exclude-schema=auth > backup_$(date +%Y%m%d).sql
```

**Restore:**
```bash
psql -h db.supabase.co -U postgres -d postgres < backup_20260123.sql
```

## 📞 Support & Troubleshooting

### Connection Issues
- Verify credentials in `.env.local`
- Check internet connectivity
- Test with `npm run test-connections`

### RLS Permission Errors
- Confirm using correct API key (anon vs service)
- Check RLS policies are correct
- Verify auth.uid() matches user_id

### Migration Failures
- Check table doesn't already exist
- Verify database role has CREATE permission
- Review Supabase logs

### Performance Issues
- Check indexes are created: `SELECT * FROM pg_indexes`
- Analyze query plans: `EXPLAIN ANALYZE SELECT ...`
- Review slow log in Supabase Dashboard

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [QUICK_MIGRATION_GUIDE.md](QUICK_MIGRATION_GUIDE.md) | Fast reference for applying migrations |
| [MIGRATION_STATUS.md](MIGRATION_STATUS.md) | Current status and statistics |
| [MIGRATIONS_SUMMARY.md](MIGRATIONS_SUMMARY.md) | Complete overview |
| [migrations/README.md](migrations/README.md) | Detailed documentation per migration |
| Individual `.sql` files | Actual migration SQL code |

## 🎓 Learning Resources

- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Supabase Guides**: https://supabase.com/docs/
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Best Practices**: https://supabase.com/docs/guides/database/best-practices

## ✅ Pre-Launch Checklist

Before going to production:

- [ ] All 8 migrations applied
- [ ] RLS policies tested and working
- [ ] Indexes created and analyzed
- [ ] Backups configured
- [ ] Connection from backend verified
- [ ] Connection from frontend verified
- [ ] Sample data loaded
- [ ] Query performance acceptable
- [ ] Monitoring configured
- [ ] Disaster recovery plan documented

## 🔐 Security Checklist

- [ ] Service keys are secret (not in git)
- [ ] RLS enabled on all tables
- [ ] No direct database access from frontend
- [ ] All API calls use appropriate keys
- [ ] Audit logging enabled (ingestion_logs, query_logs)
- [ ] Row-level policies tested
- [ ] Foreign key constraints enforced
- [ ] Cascading deletes working
- [ ] Backups are encrypted
- [ ] Access logs are monitored

## 🎯 Next Steps

1. **Apply migrations** - See [QUICK_MIGRATION_GUIDE.md](QUICK_MIGRATION_GUIDE.md)
2. **Test connections** - Run `npm run test-connections`
3. **Seed data** - Add sample documents
4. **Configure monitoring** - Set up alerts
5. **Test RLS** - Verify security policies
6. **Load documents** - Start ingesting legal documents

## 📞 Questions?

1. Check the migration docs (start with QUICK_MIGRATION_GUIDE.md)
2. Review your specific migration file
3. Check Supabase Dashboard → Logs
4. Review this README

---

**Created**: January 23, 2026  
**Status**: 🟢 Production Ready  
**Database**: Supabase PostgreSQL  
**Project ID**: otbsvaxnzvrphysooinh  
**Last Updated**: January 23, 2026
