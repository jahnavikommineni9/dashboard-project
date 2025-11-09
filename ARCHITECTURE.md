# 📐 Architecture & System Design Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (TypeScript + React + Tailwind CSS)   │  │
│  │                                                           │  │
│  │  ┌─────────────────┬──────────────────────────────────┐ │  │
│  │  │   Sidebar       │    Dashboard/Chat Views          │ │  │
│  │  │  - Navigation   │  - Analytics Components          │ │  │
│  │  │  - Auth         │  - Charts (Recharts)             │ │  │
│  │  │                 │  - Tables with Sorting/Filtering │ │  │
│  │  │                 │  - Chat Interface                │ │  │
│  │  └─────────────────┴──────────────────────────────────┘ │  │
│  │                                                           │  │
│  │  HTTP Requests (JSON) over REST API                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                   HTTPS/Secure CORS
                            │
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL FRONTEND CDN                           │
│             (Next.js Server-Side Rendering)                     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND API LAYER                              │
│            (Express.js + Node.js TypeScript)                     │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  HTTP Routing & Middleware                               │  │
│  │  - CORS Handling                                         │  │
│  │  - Request Logging                                       │  │
│  │  - Error Handling                                        │  │
│  │  - Authentication (optional)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│  ┌─────────────────────────┼─────────────────────────────────┐ │
│  │                         ▼                                   │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Business Logic Layer (Services)                    │ │ │
│  │  │                                                      │ │ │
│  │  │  - StatsService        - VendorService             │ │ │
│  │  │  - InvoiceService      - AnalyticsService          │ │ │
│  │  │  - VannaService (LLM Integration)                  │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                         │                                   │ │
│  │  ┌──────────────────────┴──────────────────────────────┐ │ │
│  │  │  Data Access Layer (Prisma ORM)                    │ │ │
│  │  │  - Query Building  - Transaction Management         │ │ │
│  │  │  - Type Safety     - Migration Handling             │ │ │
│  │  └──────────────────────┬──────────────────────────────┘ │ │
│  └─────────────────────────┼───────────────────────────────┘ │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                   PostgreSQL Protocol
                              │
                   (Connection Pool)
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│                    DATABASE LAYER                                │
│                   (PostgreSQL 14+)                               │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Normalized Relational Schema                            │  │
│  │                                                           │  │
│  │  Tables:                                                 │  │
│  │  - vendors          - line_items                        │  │
│  │  - customers        - payments                          │  │
│  │  - invoices                                              │  │
│  │                                                           │  │
│  │  Indexes: (vendor_id, status, date, category)           │  │
│  │  Constraints: FK relationships, NOT NULL, UNIQUE        │  │
│  │                                                           │  │
│  │  Backups: Daily automated backups to S3                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Schema Versioning: Prisma Migrations                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                   (Optional: Async Job)
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│                   AI/LLM SERVICE LAYER                           │
│              (Python FastAPI + Vanna AI)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Natural Language Processing                             │  │
│  │                                                           │  │
│  │  Request: "What's the total spend in last 90 days?"     │  │
│  │     │                                                    │  │
│  │     ├─ ChromaDB Vector Store (RAG)                      │  │
│  │     │  └─ Schema embeddings + Sample SQL + Docs        │  │
│  │     │                                                    │  │
│  │     ├─ Groq LLM (Mixtral 8x7B)                         │  │
│  │     │  └─ SQL Generation using prompt                   │  │
│  │     │                                                    │  │
│  │     └─ Output: "SELECT SUM(amount)..."                 │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                     │
│  ┌──────────────────────────┴──────────────────────────────┐   │
│  │ SQL Execution Engine                                    │   │
│  │ - Query Validation                                      │   │
│  │ - Result Processing                                     │   │
│  │ - Error Handling                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                   PostgreSQL Driver
                             │
                   (Direct DB Connection)
                             │
                   (Results returned as JSON)
                             │
┌────────────────────────────┴─────────────────────────────────────┐
│                    RESPONSE FLOW                                  │
│                                                                   │
│  Backend ← Vanna AI Response (SQL + Results)                     │
│     │                                                            │
│     ├─ Process results                                          │
│     ├─ Format as JSON                                           │
│     └─ Return to Frontend                                       │
│                                                                   │
│  Frontend                                                        │
│     ├─ Display SQL (syntax highlighted)                         │
│     ├─ Render Results Table                                     │
│     ├─ Generate Chart (if applicable)                           │
│     └─ Show in Chat Interface                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Dashboard Data Flow

```
User Opens Dashboard
        │
        ▼
Frontend Makes Parallel API Calls:
├─ GET /api/stats              → Overview cards
├─ GET /api/invoice-trends     → Line chart
├─ GET /api/vendors/top10      → Bar chart
├─ GET /api/category-spend     → Pie chart
├─ GET /api/cash-outflow       → Forecast chart
└─ GET /api/invoices           → Table data

        │
        ▼
Backend Services Query Database:
├─ StatsService.getOverviewStats()
├─ AnalyticsService.getInvoiceTrends()
├─ VendorService.getTop10Vendors()
├─ AnalyticsService.getCategorySpend()
├─ AnalyticsService.getCashOutflow()
└─ InvoiceService.getInvoices()

        │
        ▼
Prisma ORM Builds SQL Queries:
├─ SELECT SUM(amount) FROM invoices WHERE...
├─ SELECT * FROM invoices GROUP BY month...
├─ SELECT vendor, SUM(amount) FROM invoices...
├─ SELECT category, SUM(amount) FROM invoices...
├─ SELECT due_date, SUM(amount) FROM invoices...
└─ SELECT * FROM invoices WHERE... LIMIT...

        │
        ▼
PostgreSQL Executes Queries
with Indexes for Performance

        │
        ▼
Results Formatted & Cached (optional)

        │
        ▼
JSON Response to Frontend
(5-10 requests in parallel)

        │
        ▼
Frontend State Updated
(React hooks/Context)

        │
        ▼
Charts Rendered (Recharts)
Tables Populated
Cards Updated
```

### 2. Chat with Data Flow

```
User Types Natural Language Query
"What's the total spend in last 90 days?"
        │
        ▼
Frontend Sends to Backend:
POST /api/chat-with-data
Body: { query: "..." }

        │
        ▼
Backend VannaService.query():
├─ Call Vanna AI Service at http://vanna:8000/chat
└─ Pass NL query + API Key

        │
        ▼
Vanna AI Service Processing:
├─ Load Schema from ChromaDB
│  └─ Embedding vectors of:
│     ├─ DDL (CREATE TABLE statements)
│     ├─ Sample SQL queries
│     └─ Documentation
│
├─ Use RAG (Retrieval-Augmented Generation)
│  └─ Find relevant schema context
│
├─ Send to Groq LLM:
│  ├─ System prompt with instructions
│  ├─ Schema context
│  ├─ User query
│  └─ Few-shot examples
│
└─ LLM Generates SQL:
   SELECT SUM(amount) as total_spend
   FROM invoices
   WHERE invoice_date >= CURRENT_DATE - INTERVAL '90 days'

        │
        ▼
Vanna Executes SQL on PostgreSQL

        │
        ▼
Format Results as JSON:
{
  "total_spend": 732450.00
}

        │
        ▼
Return to Backend:
{
  "sql": "SELECT SUM...",
  "results": [...],
  "columns": ["total_spend"],
  "rowCount": 1,
  "executionTime": 45
}

        │
        ▼
Backend Returns to Frontend

        │
        ▼
Frontend Displays:
├─ Chat Message from Assistant
├─ Generated SQL (code block)
├─ Results Table
└─ Optional Result Chart
   (if multiple rows/numeric data)

        │
        ▼
User Sees Answer Instantly
```

---

## API Endpoint Specifications

### Overview Stats

**Endpoint:** `GET /api/stats`

**Query Parameters:** None

**Response:**
```json
{
  "totalSpend": 2847392.50,
  "totalInvoices": 1247,
  "documentsUploaded": 3891,
  "averageInvoiceValue": 2283.45,
  "spendGrowth": 12.5,
  "invoiceGrowth": 8.3
}
```

**Backend Logic:**
```sql
SELECT 
  SUM(amount) as total_spend,
  COUNT(*) as total_invoices,
  COUNT(DISTINCT document_id) as documents_uploaded,
  AVG(amount) as average_invoice_value
FROM invoices
WHERE EXTRACT(YEAR FROM invoice_date) = EXTRACT(YEAR FROM CURRENT_DATE)
```

---

### Invoice Trends

**Endpoint:** `GET /api/invoice-trends?months=12`

**Query Parameters:**
- `months` (optional, default: 12): Number of months to retrieve

**Response:**
```json
{
  "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "invoiceCounts": [50, 65, 58, 72, 80, 75],
  "invoiceValues": [125000, 168000, 145000, 198000, 220000, 195000]
}
```

**Backend Logic:**
```sql
SELECT 
  TO_CHAR(invoice_date, 'Mon') as month,
  COUNT(*) as invoice_count,
  SUM(amount) as total_value
FROM invoices
WHERE invoice_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY EXTRACT(MONTH FROM invoice_date), TO_CHAR(invoice_date, 'Mon')
ORDER BY EXTRACT(MONTH FROM invoice_date)
```

---

### Top 10 Vendors

**Endpoint:** `GET /api/vendors/top10?limit=10`

**Query Parameters:**
- `limit` (optional, default: 10): Number of vendors

**Response:**
```json
{
  "vendors": [
    {"id": "uuid", "name": "Acme Corp", "spend": 385420},
    {"id": "uuid", "name": "TechSupply Inc", "spend": 312580},
    ...
  ]
}
```

**Backend Logic:**
```sql
SELECT vendor_id, vendor_name as name, SUM(amount) as spend
FROM invoices
GROUP BY vendor_id, vendor_name
ORDER BY spend DESC
LIMIT 10
```

---

### Category Spend

**Endpoint:** `GET /api/category-spend`

**Response:**
```json
{
  "categories": [
    {"category": "IT & Software", "amount": 892450, "percentage": 31.3},
    {"category": "Office Supplies", "amount": 625380, "percentage": 22.0},
    ...
  ]
}
```

**Backend Logic:**
```sql
WITH total_spend AS (
  SELECT SUM(amount) as total FROM invoices
)
SELECT 
  category,
  SUM(amount) as amount,
  ROUND((SUM(amount) / (SELECT total FROM total_spend) * 100)::numeric, 1) as percentage
FROM invoices
GROUP BY category
ORDER BY amount DESC
```

---

### Cash Outflow Forecast

**Endpoint:** `GET /api/cash-outflow?months=6`

**Response:**
```json
{
  "months": ["Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026"],
  "amounts": [245000, 268000, 252000, 278000, 265000, 290000]
}
```

---

### List Invoices

**Endpoint:** `GET /api/invoices`

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `search` (optional): Search term
- `sortBy` (optional, default: invoiceDate): Field to sort by
- `sortOrder` (optional, default: desc): asc or desc
- `status` (optional): Filter by status

**Response:**
```json
{
  "invoices": [
    {
      "id": "uuid",
      "invoiceNumber": "INV-2025-1234",
      "vendor": "Acme Corp",
      "date": "2025-11-05",
      "amount": 12450.00,
      "status": "Paid"
    }
  ],
  "total": 1247,
  "page": 1,
  "limit": 10,
  "totalPages": 125
}
```

---

### Chat with Data

**Endpoint:** `POST /api/chat-with-data`

**Request Body:**
```json
{
  "query": "What's the total spend in the last 90 days?"
}
```

**Response:**
```json
{
  "query": "What's the total spend in the last 90 days?",
  "sql": "SELECT SUM(amount) as total_spend FROM invoices WHERE invoice_date >= CURRENT_DATE - INTERVAL '90 days'",
  "results": [{"total_spend": 732450.00}],
  "columns": ["total_spend"],
  "rowCount": 1,
  "executionTime": 45
}
```

**Error Response:**
```json
{
  "error": "Failed to generate SQL",
  "message": "Unable to process the query. Please try rephrasing your question."
}
```

---

## Technology Stack Rationale

| Component | Technology | Why Chosen |
|-----------|-----------|-----------|
| Frontend Framework | Next.js 14 | SSR, API routes, performance, deployment |
| Language | TypeScript | Type safety, developer experience, fewer bugs |
| Styling | Tailwind CSS | Utility-first, responsive, fast development |
| Components | shadcn/ui | Accessible, customizable, built on Radix |
| Charts | Recharts | React native, composable, responsive |
| Backend | Express.js | Lightweight, flexible, large ecosystem |
| ORM | Prisma | Type-safe, auto-migrations, developer friendly |
| Database | PostgreSQL | ACID compliance, advanced features, reliability |
| AI/LLM | Vanna AI | Text-to-SQL RAG, no training needed |
| LLM Provider | Groq | Fast inference, affordable, reliable |
| Vector DB | ChromaDB | Open-source, easy to use, good RAG support |
| Monorepo | Turborepo | Fast builds, code sharing, workspace management |

---

## Performance Optimization Strategies

### Frontend Performance
- Code splitting per route
- Image optimization (next/image)
- CSS-in-JS with critical path extraction
- Client-side caching with React Query
- Lazy loading for charts

### Backend Performance
- Database indexes on frequently filtered columns
- Query result caching (Redis)
- Connection pooling (pgBouncer)
- Pagination for large result sets
- Aggregate query materialization

### Database Performance
- Strategic indexing on (vendor_id, status, date)
- Partitioning by date for large tables
- Regular VACUUM and ANALYZE
- Query plan analysis
- Read replicas for reporting

---

*Documentation Version: 1.0.0*
*Last Updated: 2025-11-09*