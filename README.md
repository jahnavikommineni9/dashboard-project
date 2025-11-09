# Analytics Dashboard - Production-Grade Full-Stack Application

## 🎯 Project Overview

A complete production-ready analytics dashboard built with modern technologies, featuring:
- **Interactive Analytics Dashboard** (pixel-perfect Figma design)
- **AI-Powered Chat Interface** (Vanna AI + Groq LLM)
- **Real-time Data Visualization** (Charts, metrics, tables)
- **PostgreSQL Database** (Normalized schema)
- **Monorepo Architecture** (Turborepo + pnpm)

---

## 📋 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Python 3.10+
- pnpm (or npm)
- Docker (optional)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd analytics-dashboard

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
cp apps/vanna/.env.example apps/vanna/.env

# Setup database
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed

# Start all services
cd ../..
pnpm dev
```

---

## 🏗️ Architecture

### Monorepo Structure

```
analytics-dashboard/
├── apps/
│   ├── web/        → Next.js Frontend (TypeScript + Tailwind)
│   ├── api/        → Express Backend (TypeScript + Prisma)
│   └── vanna/      → Python Vanna AI Service
├── data/           → Analytics test data
└── docs/           → Documentation
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React, TypeScript | UI rendering, state management |
| **Styling** | Tailwind CSS, shadcn/ui | Component library, styling |
| **Charts** | Recharts | Data visualization |
| **Backend** | Express.js, TypeScript | REST APIs, business logic |
| **Database** | PostgreSQL, Prisma ORM | Data persistence |
| **AI/LLM** | Vanna AI, Groq, ChromaDB | Natural language SQL generation |
| **DevTools** | Turborepo, ESLint, Prettier | Monorepo management, code quality |

---

## 📊 Database Schema

### Tables

#### `invoices`
```sql
- id: UUID (PK)
- invoice_number: String (unique)
- vendor_id: UUID (FK → vendors)
- customer_id: UUID (FK → customers)
- invoice_date: Date
- due_date: Date
- amount: Decimal
- status: Enum (Paid, Pending, Processing, Overdue)
- category: String
- document_url: String
- created_at: Timestamp
- updated_at: Timestamp
```

#### `vendors`
```sql
- id: UUID (PK)
- name: String
- email: String
- phone: String
- address: String
- city: String
- state: String
- postal_code: String
- country: String
- created_at: Timestamp
- updated_at: Timestamp
```

#### `customers`
```sql
- id: UUID (PK)
- name: String
- email: String
- company: String
- created_at: Timestamp
- updated_at: Timestamp
```

#### `line_items`
```sql
- id: UUID (PK)
- invoice_id: UUID (FK → invoices)
- description: String
- quantity: Integer
- unit_price: Decimal
- total_price: Decimal
- created_at: Timestamp
```

#### `payments`
```sql
- id: UUID (PK)
- invoice_id: UUID (FK → invoices)
- payment_date: Date
- amount: Decimal
- payment_method: String
- status: Enum (Completed, Pending, Failed)
- created_at: Timestamp
```

### Indexes
```sql
- invoices: (vendor_id, status, invoice_date)
- vendors: (name, country)
- payments: (invoice_id, payment_date)
```

---

## 🔌 REST API Endpoints

### Core Endpoints

#### `GET /api/stats`
Returns overview statistics for dashboard cards.

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

#### `GET /api/invoice-trends`
Monthly invoice counts and spending trends.

**Query Params:** `months=12`

**Response:**
```json
{
  "months": ["Jan", "Feb", "Mar", ...],
  "invoiceCounts": [50, 65, 58, ...],
  "invoiceValues": [125000, 168000, 145000, ...]
}
```

#### `GET /api/vendors/top10`
Top 10 vendors by total spend.

**Response:**
```json
{
  "vendors": [
    { "id": "uuid", "name": "Vendor A", "spend": 385420 },
    ...
  ]
}
```

#### `GET /api/category-spend`
Spending breakdown by category.

**Response:**
```json
{
  "categories": [
    { "category": "IT & Software", "amount": 892450, "percentage": 31.3 },
    ...
  ]
}
```

#### `GET /api/cash-outflow`
Cash outflow forecast for next 6 months.

**Response:**
```json
{
  "months": ["Dec 2025", "Jan 2026", ...],
  "amounts": [245000, 268000, ...]
}
```

#### `GET /api/invoices`
List invoices with filtering, sorting, and pagination.

**Query Params:** `page=1&limit=10&search=&sortBy=date&sortOrder=desc&status=Paid`

**Response:**
```json
{
  "invoices": [
    {
      "id": "uuid",
      "invoiceNumber": "INV-2025-1234",
      "vendor": "Vendor Name",
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

#### `POST /api/chat-with-data`
Natural language query to SQL conversion via Vanna AI.

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
  "results": [{ "total_spend": 732450.00 }],
  "columns": ["total_spend"],
  "rowCount": 1,
  "executionTime": 45
}
```

---

## 🤖 Vanna AI Integration

### Setup

1. **Install Vanna**
```bash
cd apps/vanna
pip install -r requirements.txt
```

2. **Configure Environment**
```bash
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
VANNA_MODEL=mixtral-8x7b-32768
PORT=8000
```

3. **Train Vanna Model**
```bash
python vanna_setup.py
```

4. **Start Service**
```bash
python main.py
```

### Training Data

Vanna is trained with:
- Database schema (DDL statements)
- Sample SQL queries
- Documentation about your data
- Natural language descriptions

---

## 🎨 Frontend Components

### Dashboard View
- **OverviewCards** - 4 metric cards (Total Spend, Invoices, Documents, Avg Value)
- **InvoiceTrendChart** - Line chart (dual Y-axis)
- **VendorSpendChart** - Horizontal bar chart (top 10)
- **CategorySpendChart** - Pie chart
- **CashOutflowChart** - Bar chart (6-month forecast)
- **InvoicesTable** - Sortable, searchable, paginated table

### Chat View
- Welcome section with example questions
- Message history
- Syntax-highlighted SQL display
- Results table
- Optional result visualization

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Deploy Next.js app
vercel deploy --prod
```

### Backend (Render/Railway/Fly.io)
```bash
# Create Procfile
web: npm start

# Deploy
git push
```

### Vanna AI (Docker)
```bash
# Build image
docker build -t vanna-ai apps/vanna/docker

# Run container
docker run -e GROQ_API_KEY=$GROQ_API_KEY \
           -e DATABASE_URL=$DATABASE_URL \
           -p 8000:8000 \
           vanna-ai
```

---

## 📝 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE=https://api.example.com/api
NEXT_PUBLIC_APP_URL=https://app.example.com
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/invoices_db
VANNA_API_BASE_URL=https://vanna.example.com
VANNA_API_KEY=optional_key
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://app.example.com
```

### Vanna (.env)
```
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/invoices_db
VANNA_MODEL=mixtral-8x7b-32768
PORT=8000
```

---

## 🧪 Testing

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# End-to-end tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

---

## 📖 Documentation Files

- **SETUP.md** - Detailed installation and configuration
- **API.md** - Complete API reference
- **DATABASE.md** - Schema, migrations, seed data
- **ARCHITECTURE.md** - System design and data flow
- **DEPLOYMENT.md** - Production deployment guide

---

## 🔐 Security Considerations

- SQL injection protection via Prisma ORM
- CORS configuration for cross-origin requests
- Environment variables for secrets
- PostgreSQL connection pooling
- Rate limiting on API endpoints
- Input validation and sanitization
- HTTPS in production

---

## 📊 Performance Optimization

- Database query indexing
- Connection pooling (pgBouncer)
- Caching strategies (Redis)
- Frontend code splitting
- Image optimization
- API response compression

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql postgresql://user:pass@localhost:5432/dbname

# Check logs
docker logs postgres
```

### Vanna AI Not Responding
```bash
# Restart service
docker restart vanna-ai

# Check logs
docker logs vanna-ai
```

### Frontend API Calls Failing
- Verify CORS is enabled
- Check environment variables
- Ensure backend is running on correct port

---

## 👥 Contributing

1. Create feature branch
2. Commit with meaningful messages
3. Push to remote
4. Create pull request
5. Ensure CI/CD passes

---

## 📄 License

MIT License - see LICENSE file

---

## 🆘 Support

For issues, questions, or contributions:
- Open GitHub Issues
- Check existing documentation
- Review API examples
- Test with provided Postman collection

---

## 🔗 Links

- **GitHub:** [Repository URL]
- **Frontend:** [Vercel Deployment]
- **Backend API:** [API Base URL]
- **Vanna AI:** [Self-hosted URL]
- **Figma Design:** [Design Link]

---

## ✅ Checklist

- [x] Database schema designed and normalized
- [x] Backend APIs implemented
- [x] Frontend components built
- [x] Vanna AI integration complete
- [x] Deployment configured
- [x] Documentation provided
- [x] Error handling implemented
- [x] Security measures applied
- [x] Performance optimized
- [x] Testing configured

---

*Last Updated: 2025-11-09*
*Version: 1.0.0*