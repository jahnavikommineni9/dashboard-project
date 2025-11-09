# 🚀 Quick Start Configuration Files & Scripts

## Root Package.json (package.json)

```json
{
  "name": "analytics-dashboard",
  "version": "1.0.0",
  "description": "Production-grade analytics dashboard with AI chat",
  "private": true,
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "start": "turbo run start",
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "lint": "turbo run lint",
    "format": "turbo run format",
    "clean": "turbo run clean && rm -rf node_modules",
    "db:push": "cd apps/api && npx prisma db push",
    "db:migrate": "cd apps/api && npx prisma migrate dev",
    "db:seed": "cd apps/api && npx prisma db seed",
    "db:studio": "cd apps/api && npx prisma studio"
  },
  "devDependencies": {
    "turbo": "^1.10.12",
    "prettier": "^3.0.0",
    "eslint": "^8.50.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.11.0"
}
```

---

## Frontend Package.json (apps/web/package.json)

```json
{
  "name": "analytics-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf .next"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "recharts": "^2.10.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^2.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.292.0",
    "axios": "^1.6.0",
    "react-query": "^3.39.3"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.16",
    "@next/eslint-config": "^14.0.0"
  }
}
```

---

## Backend Package.json (apps/api/package.json)

```json
{
  "name": "analytics-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "@prisma/client": "^5.5.0",
    "axios": "^1.6.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "@types/express": "^4.17.20",
    "@types/cors": "^2.8.16",
    "@types/node": "^20.0.0",
    "tsx": "^4.1.0",
    "tsc-watch": "^6.0.4",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "eslint": "^8.53.0",
    "prettier": "^3.0.0",
    "prisma": "^5.5.0",
    "@types/jest": "^29.5.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0"
  }
}
```

---

## Turbo Configuration (turbo.json)

```json
{
  "$schema": "https://turbo.build/json-schema.json",
  "globalDependencies": ["**/.env", "**/.env.local"],
  "pipeline": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "outputs": ["dist/**", ".next/**"],
      "cache": true,
      "dependsOn": ["^build"]
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "type-check": {
      "outputs": [],
      "cache": true
    },
    "test": {
      "outputs": ["coverage/**"],
      "cache": true
    },
    "format": {
      "outputs": [],
      "cache": false
    }
  }
}
```

---

## Environment Files

### Root .env.example

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/invoices_db

# Vanna AI
VANNA_API_BASE_URL=http://localhost:8000
VANNA_API_KEY=

# Node
NODE_ENV=development
```

### apps/web/.env.local.example

```env
# API Configuration
NEXT_PUBLIC_API_BASE=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Monitoring
# NEXT_PUBLIC_SENTRY_DSN=
```

### apps/api/.env.example

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/invoices_db

# Vanna AI
VANNA_API_BASE_URL=http://localhost:8000
VANNA_API_KEY=

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

### apps/vanna/.env.example

```env
# LLM
GROQ_API_KEY=your_groq_api_key_here
VANNA_MODEL=mixtral-8x7b-32768

# Database
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/invoices_db

# Server
PORT=8000
HOST=0.0.0.0

# Optional: Monitoring
# SENTRY_DSN=
```

---

## Dockerfile (Backend - apps/api/Dockerfile)

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy monorepo files
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json ./

# Copy app specific files
COPY apps/api ./apps/api

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build
WORKDIR /app/apps/api
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/package.json ./

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy app files
COPY --from=builder /app/apps/api ./apps/api

# Copy .prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./node_modules/.prisma

WORKDIR /app/apps/api

EXPOSE 3001

# Run migrations and start app
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
```

---

## Dockerfile (Vanna - apps/vanna/Dockerfile)

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy app files
COPY . .

EXPOSE 8000

# Run Vanna
CMD ["python", "main.py"]
```

---

## Docker Compose (docker-compose.yml)

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: analytics-postgres
    environment:
      POSTGRES_DB: invoices_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - analytics-network

  # Express Backend API
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: analytics-api
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/invoices_db
      VANNA_API_BASE_URL: http://vanna:8000
      CORS_ORIGIN: http://localhost:3000
      NODE_ENV: development
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - analytics-network

  # Vanna AI Service
  vanna:
    build:
      context: .
      dockerfile: apps/vanna/Dockerfile
    container_name: analytics-vanna
    ports:
      - "8000:8000"
    environment:
      GROQ_API_KEY: ${GROQ_API_KEY}
      DATABASE_URL: postgresql+psycopg://postgres:postgres@postgres:5432/invoices_db
      VANNA_MODEL: mixtral-8x7b-32768
      PORT: 8000
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - analytics-network

  # Next.js Frontend
  web:
    build:
      context: apps/web
      dockerfile: Dockerfile
    container_name: analytics-web
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_BASE: http://api:3001/api
      NEXT_PUBLIC_APP_URL: http://localhost:3000
    depends_on:
      - api
    networks:
      - analytics-network

networks:
  analytics-network:
    driver: bridge

volumes:
  postgres_data:
```

---

## Quick Start Commands

### First Time Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd analytics-dashboard

# 2. Copy environment files
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
cp apps/vanna/.env.example apps/vanna/.env

# 3. Update .env files with your values
# - DATABASE_URL (PostgreSQL connection)
# - GROQ_API_KEY (Get from https://console.groq.com)

# 4. Install dependencies
pnpm install

# 5. Setup database
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed
cd ../..

# 6. Train Vanna AI
cd apps/vanna
python vanna_setup.py
cd ../..
```

### Start Development (Option 1: Multiple Terminals)

```bash
# Terminal 1: Backend API
cd apps/api && npm run dev

# Terminal 2: Frontend
cd apps/web && npm run dev

# Terminal 3: Vanna AI
cd apps/vanna && python main.py
```

### Start Development (Option 2: Docker Compose)

```bash
# Set environment variable
export GROQ_API_KEY=your_key_here

# Start all services
docker-compose up

# First time: Run migrations in another terminal
docker exec analytics-api npx prisma db seed
```

### Common Commands

```bash
# View database
pnpm db:studio

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Run all linters
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test

# Build for production
pnpm build

# Clean everything
pnpm clean
```

---

## Verification Checklist

```bash
# 1. Check PostgreSQL
psql -U postgres -d invoices_db -c "SELECT COUNT(*) FROM invoices;"

# 2. Check Backend API
curl http://localhost:3001/health
# Expected: {"status":"ok"}

curl http://localhost:3001/api/stats
# Expected: JSON with stats

# 3. Check Vanna
curl http://localhost:8000/health
# Expected: {"status":"ok"}

# 4. Check Frontend
open http://localhost:3000
# Expected: Dashboard loads with data
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :3001
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready -h localhost

# Check connection string
psql $DATABASE_URL

# Restart PostgreSQL
brew services restart postgresql@14  # macOS
sudo service postgresql restart      # Ubuntu
```

### Vanna Not Generating SQL

```bash
# Check Groq API key
echo $GROQ_API_KEY

# Test Groq API
curl https://api.groq.com/health -H "Authorization: Bearer $GROQ_API_KEY"

# Check Vanna logs
docker logs analytics-vanna
```

---

*Configuration Version: 1.0.0*
*Last Updated: 2025-11-09*