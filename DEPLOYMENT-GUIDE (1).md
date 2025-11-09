# 🚀 Complete Deployment & Production Setup Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Database Configuration](#database-configuration)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Vanna AI Deployment](#vanna-ai-deployment)
6. [Production Checklist](#production-checklist)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Local Development Setup

### 1. Prerequisites Installation

```bash
# Install Node.js 18+
node --version  # Should be v18+

# Install Python 3.10+
python --version  # Should be 3.10+

# Install pnpm
npm install -g pnpm

# Install PostgreSQL 14+
# macOS
brew install postgresql@14

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### 2. Clone & Setup Monorepo

```bash
# Clone repository
git clone <your-repo-url>
cd analytics-dashboard

# Install dependencies
pnpm install

# Setup environment files
cat > .env << EOF
DATABASE_URL=postgresql://postgres:password@localhost:5432/invoices_db
VANNA_API_BASE_URL=http://localhost:8000
NODE_ENV=development
EOF

cat > apps/web/.env.local << EOF
NEXT_PUBLIC_API_BASE=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

cat > apps/api/.env << EOF
DATABASE_URL=postgresql://postgres:password@localhost:5432/invoices_db
VANNA_API_BASE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:3000
PORT=3001
NODE_ENV=development
EOF

cat > apps/vanna/.env << EOF
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/invoices_db
VANNA_MODEL=mixtral-8x7b-32768
PORT=8000
EOF
```

### 3. Database Setup

```bash
# Create database
createdb invoices_db

# Or using psql
psql -U postgres -c "CREATE DATABASE invoices_db;"

# Navigate to API directory
cd apps/api

# Run Prisma migrations
npx prisma migrate dev --name init

# Seed database
npx prisma db seed

# View database (optional)
npx prisma studio
```

### 4. Start Development Services

#### Terminal 1: Backend API
```bash
cd apps/api
npm run dev
# Output: 🚀 Server running on port 3001
```

#### Terminal 2: Frontend
```bash
cd apps/web
npm run dev
# Output: ▲ Next.js runs on http://localhost:3000
```

#### Terminal 3: Vanna AI Service
```bash
cd apps/vanna
python main.py
# Output: Uvicorn running on http://0.0.0.0:8000
```

### 5. Verify Setup

```bash
# Check APIs
curl http://localhost:3001/health
# Expected: {"status":"ok"}

curl http://localhost:3001/api/stats
# Expected: JSON with stats

# Check Vanna
curl http://localhost:8000/health
# Expected: {"status":"ok"}

# Open frontend
open http://localhost:3000
```

---

## Database Configuration

### PostgreSQL Connection Pool (pgBouncer)

For production, use connection pooling:

```ini
# /etc/pgbouncer/pgbouncer.ini
[databases]
invoices_db = host=localhost port=5432 dbname=invoices_db

[pgbouncer]
pool_mode = transaction
max_client_conn = 100
default_pool_size = 25
min_pool_size = 10
reserve_pool_size = 5
reserve_pool_timeout = 30
```

### Backup Strategy

```bash
# Daily backup
pg_dump invoices_db > backup_$(date +%Y%m%d).sql

# Automated backup (add to crontab)
0 2 * * * pg_dump invoices_db | gzip > /backups/invoices_db_$(date +\%Y\%m\%d).sql.gz

# Restore from backup
psql invoices_db < backup_20251109.sql
```

### Migration Management

```bash
# Create new migration
cd apps/api
npx prisma migrate dev --name add_new_field

# Deploy migration to production
npx prisma migrate deploy

# Rollback (create new migration to revert)
npx prisma migrate resolve --rolled-back migration_name
```

---

## Backend Deployment

### Option 1: Render.com Deployment

```bash
# 1. Create Render.com account and connect GitHub

# 2. Create Web Service
# - Name: analytics-dashboard-api
# - Environment: Node
# - Build Command: cd apps/api && pnpm install && npx prisma migrate deploy
# - Start Command: cd apps/api && npm start

# 3. Add Environment Variables
# DATABASE_URL=...
# VANNA_API_BASE_URL=https://vanna.render.com
# CORS_ORIGIN=https://yourapp.vercel.app
# NODE_ENV=production

# 4. Deploy
git push origin main
```

### Option 2: Railway.app Deployment

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Create project
railway init

# 4. Link database (PostgreSQL add-on)
railway add
# Select PostgreSQL

# 5. Configure env
railway variables set DATABASE_URL $DATABASE_URL
railway variables set VANNA_API_BASE_URL https://vanna.railway.app
railway variables set NODE_ENV production

# 6. Deploy
railway deploy
```

### Option 3: Docker Deployment

```dockerfile
# apps/api/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

WORKDIR /app/apps/api

RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t analytics-api:latest .
docker run -p 3001:3001 \
  -e DATABASE_URL=$DATABASE_URL \
  -e VANNA_API_BASE_URL=$VANNA_API_BASE_URL \
  analytics-api:latest
```

### Docker Compose (Full Stack)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: invoices_db
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/invoices_db
      VANNA_API_BASE_URL: http://vanna:8000
      NODE_ENV: production
    depends_on:
      - postgres
    command: sh -c "npx prisma migrate deploy && npm start"

  vanna:
    build:
      context: .
      dockerfile: apps/vanna/Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+psycopg://postgres:postgres@postgres:5432/invoices_db
      GROQ_API_KEY: ${GROQ_API_KEY}
    depends_on:
      - postgres

  web:
    build:
      context: apps/web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_BASE: http://api:3001/api
    depends_on:
      - api

volumes:
  postgres_data:
```

```bash
# Run full stack locally
docker-compose up
```

---

## Frontend Deployment

### Vercel Deployment (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy frontend only
cd apps/web
vercel --prod \
  --env NEXT_PUBLIC_API_BASE=https://api.yourapp.com/api \
  --env NEXT_PUBLIC_APP_URL=https://app.yourapp.com

# 4. Configure project settings
# - Root Directory: apps/web
# - Build Command: pnpm run build
# - Output Directory: .next
```

### GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy API to Render
        run: |
          curl -X POST https://api.render.com/deploy/srv-${{ secrets.RENDER_SERVICE_ID }}?key=${{ secrets.RENDER_API_KEY }}

  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

---

## Vanna AI Deployment

### Self-Hosted on Render

```dockerfile
# apps/vanna/Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
```

```bash
# Deploy to Render
# 1. Connect GitHub repo to Render
# 2. Create Web Service
# 3. Settings:
#    - Build Command: pip install -r apps/vanna/requirements.txt
#    - Start Command: cd apps/vanna && python main.py
#    - Environment: Python
# 4. Add environment variables:
#    - GROQ_API_KEY
#    - DATABASE_URL
#    - VANNA_MODEL
```

### Self-Hosted on Fly.io

```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth login

# 3. Create app
fly apps create vanna-ai

# 4. Deploy
fly deploy -c apps/vanna/fly.toml
```

---

## Production Checklist

### Security
- [ ] HTTPS enabled on all endpoints
- [ ] CORS properly configured
- [ ] SQL injection protection (Prisma ORM)
- [ ] Environment variables not committed
- [ ] Database credentials encrypted
- [ ] API rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] CSRF protection enabled

### Performance
- [ ] Database query indexes verified
- [ ] Connection pooling configured
- [ ] Response compression enabled
- [ ] CDN configured for static assets
- [ ] Database backups automated
- [ ] Monitoring and alerting setup
- [ ] Error logging configured
- [ ] Request timeouts set

### Monitoring
- [ ] Uptime monitoring (UptimeRobot, etc)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Datadog, NewRelic)
- [ ] Log aggregation (CloudWatch, Loggly)
- [ ] Database monitoring
- [ ] API response time tracking

### Documentation
- [ ] API documentation updated
- [ ] Database schema documented
- [ ] Deployment procedures documented
- [ ] Troubleshooting guide created
- [ ] Runbook for incidents created

---

## Monitoring & Maintenance

### Log Aggregation (CloudWatch)

```typescript
// apps/api/src/utils/logger.ts
import winston from 'winston'
import WinstonCloudWatch from 'winston-cloudwatch'

const logger = winston.createLogger({
  transports: [
    new WinstonCloudWatch({
      logGroupName: '/analytics-api',
      logStreamName: `api-${process.env.NODE_ENV}`,
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
      awsRegion: process.env.AWS_REGION,
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
})

export default logger
```

### Error Tracking (Sentry)

```typescript
// apps/api/src/index.ts
import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})

app.use(Sentry.Handlers.requestHandler())
// ... routes ...
app.use(Sentry.Handlers.errorHandler())
```

### Performance Monitoring (Datadog)

```bash
# Install agent
DD_AGENT_MAJOR_VERSION=7 DD_API_KEY=$DD_API_KEY bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_agent.sh)"

# Configure
export DD_TRACE_ENABLED=true
export DD_TRACE_SAMPLE_RATE=1.0
```

### Database Maintenance

```sql
-- Monthly maintenance
VACUUM ANALYZE;
REINDEX INDEX CONCURRENTLY idx_invoices_date;
ALTER TABLE invoices CLUSTER ON idx_invoices_date;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Troubleshooting Production Issues

### Database Connection Failed

```bash
# Check connection string
psql $DATABASE_URL

# Check connection pool
# apps/api/src/db/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

# Monitor connections
SELECT datname, usename, application_name, state, count(*)
FROM pg_stat_activity
GROUP BY datname, usename, application_name, state;
```

### API Timeouts

```typescript
// Add request timeout
app.use(timeout('10s'))
app.use(handleTimeout)

function handleTimeout(req, res, next) {
  if (!req.timedout) next()
}
```

### High Memory Usage

```bash
# Monitor Node memory
node --max-old-space-size=4096 apps/api/dist/index.js

# Enable heap snapshots
node --inspect apps/api/dist/index.js
# Visit chrome://inspect
```

---

## Scheduled Tasks

### Database Backups

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups"
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/invoices_db_$DATE.sql.gz
# Keep last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### Data Refresh

```typescript
// apps/api/src/jobs/refreshCache.ts
import cron from 'node-cron'

cron.schedule('0 */6 * * *', async () => {
  // Refresh materialized views
  await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW vendor_stats`)
})
```

---

**Last Updated:** 2025-11-09
**Version:** 1.0.0