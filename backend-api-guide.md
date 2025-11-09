# Backend API Implementation Guide

## Overview
This guide provides the complete backend API specifications for the Invoice Analytics Dashboard application. Implement these endpoints to connect your PostgreSQL database and Vanna AI integration.

---

## API Endpoints Specification

### 1. GET /api/stats
**Description**: Returns overview statistics for dashboard cards

**Response Schema**:
```json
{
  "total_spend_ytd": 2847392,
  "total_invoices": 1247,
  "documents_uploaded": 3891,
  "average_invoice_value": 2283,
  "spend_growth": 12.5,
  "invoice_growth": 8.3,
  "documents_growth": 15.2,
  "avg_value_growth": 3.8
}
```

**SQL Query Example**:
```sql
SELECT 
  SUM(amount) as total_spend_ytd,
  COUNT(*) as total_invoices,
  COUNT(DISTINCT document_id) as documents_uploaded,
  AVG(amount) as average_invoice_value
FROM invoices
WHERE EXTRACT(YEAR FROM invoice_date) = EXTRACT(YEAR FROM CURRENT_DATE);
```

---

### 2. GET /api/invoice-trends
**Description**: Returns monthly invoice counts and total spend for trend analysis

**Query Parameters**:
- `months` (optional): Number of months to retrieve (default: 12)

**Response Schema**:
```json
{
  "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  "invoice_counts": [50, 65, 58, 72, 80, 75, 88, 95, 90, 102, 98, 105],
  "invoice_values": [125000, 168000, 145000, 198000, 220000, 195000, 238000, 255000, 242000, 275000, 265000, 287000]
}
```

**SQL Query Example**:
```sql
SELECT 
  TO_CHAR(invoice_date, 'Mon') as month,
  COUNT(*) as invoice_count,
  SUM(amount) as total_value
FROM invoices
WHERE invoice_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY EXTRACT(MONTH FROM invoice_date), TO_CHAR(invoice_date, 'Mon')
ORDER BY EXTRACT(MONTH FROM invoice_date);
```

---

### 3. GET /api/vendors/top10
**Description**: Returns top 10 vendors by total spend

**Query Parameters**:
- `limit` (optional): Number of vendors to return (default: 10)
- `start_date` (optional): Filter by date range
- `end_date` (optional): Filter by date range

**Response Schema**:
```json
{
  "vendors": [
    {
      "name": "Acme Corp",
      "spend": 385420
    },
    {
      "name": "TechSupply Inc",
      "spend": 312580
    }
  ]
}
```

**SQL Query Example**:
```sql
SELECT 
  vendor_name as name,
  SUM(amount) as spend
FROM invoices
GROUP BY vendor_name
ORDER BY spend DESC
LIMIT 10;
```

---

### 4. GET /api/category-spend
**Description**: Returns spend grouped by category for pie chart

**Response Schema**:
```json
{
  "categories": [
    {
      "category": "IT & Software",
      "amount": 892450,
      "percentage": 31.3
    },
    {
      "category": "Office Supplies",
      "amount": 625380,
      "percentage": 22.0
    }
  ]
}
```

**SQL Query Example**:
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
ORDER BY amount DESC;
```

---

### 5. GET /api/cash-outflow
**Description**: Returns expected cash outflow forecast

**Query Parameters**:
- `months` (optional): Number of future months (default: 6)

**Response Schema**:
```json
{
  "months": ["Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026"],
  "amounts": [245000, 268000, 252000, 278000, 265000, 290000]
}
```

**SQL Query Example**:
```sql
SELECT 
  TO_CHAR(due_date, 'Mon YYYY') as month,
  SUM(amount) as amount
FROM invoices
WHERE due_date >= CURRENT_DATE
  AND due_date < CURRENT_DATE + INTERVAL '6 months'
  AND status IN ('Pending', 'Processing')
GROUP BY TO_CHAR(due_date, 'Mon YYYY'), EXTRACT(YEAR FROM due_date), EXTRACT(MONTH FROM due_date)
ORDER BY EXTRACT(YEAR FROM due_date), EXTRACT(MONTH FROM due_date)
LIMIT 6;
```

---

### 6. GET /api/invoices
**Description**: Returns paginated list of invoices with filtering and sorting

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for filtering
- `sort_by` (optional): Field to sort by (invoice_number, vendor, date, amount, status)
- `sort_order` (optional): asc or desc (default: desc)
- `status` (optional): Filter by status

**Response Schema**:
```json
{
  "invoices": [
    {
      "invoice_number": "INV-2025-1234",
      "vendor": "Acme Corp",
      "date": "2025-11-05",
      "amount": 12450.00,
      "status": "Paid"
    }
  ],
  "total": 1247,
  "page": 1,
  "limit": 10,
  "total_pages": 125
}
```

**SQL Query Example**:
```sql
SELECT 
  invoice_number,
  vendor_name as vendor,
  invoice_date as date,
  amount,
  status
FROM invoices
WHERE 
  ($1 IS NULL OR (
    invoice_number ILIKE $1 OR
    vendor_name ILIKE $1 OR
    status ILIKE $1
  ))
  AND ($2 IS NULL OR status = $2)
ORDER BY 
  CASE WHEN $3 = 'invoice_number' THEN invoice_number END,
  CASE WHEN $3 = 'vendor' THEN vendor_name END,
  CASE WHEN $3 = 'date' THEN invoice_date END,
  CASE WHEN $3 = 'amount' THEN amount END,
  CASE WHEN $3 = 'status' THEN status END
LIMIT $4 OFFSET $5;
```

---

### 7. POST /api/chat-with-data
**Description**: Forwards natural language queries to Vanna AI and returns SQL + results

**Request Body**:
```json
{
  "query": "What's the total spend in the last 90 days?"
}
```

**Response Schema**:
```json
{
  "query": "What's the total spend in the last 90 days?",
  "sql": "SELECT SUM(amount) as total_spend FROM invoices WHERE invoice_date >= CURRENT_DATE - INTERVAL '90 days'",
  "results": [
    {
      "total_spend": 732450.00
    }
  ],
  "columns": ["total_spend"],
  "row_count": 1,
  "execution_time_ms": 45
}
```

**Error Response**:
```json
{
  "error": "Failed to generate SQL",
  "message": "The query could not be processed. Please try rephrasing your question."
}
```

---

## Backend Implementation Examples

### Python (FastAPI) Implementation

```python
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg
from datetime import datetime
import os

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")

def get_db():
    conn = psycopg.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        conn.close()

# Models
class ChatQuery(BaseModel):
    query: str

# Endpoints
@app.get("/api/stats")
async def get_stats():
    conn = psycopg.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Get current year stats
    cursor.execute("""
        SELECT 
            SUM(amount) as total_spend_ytd,
            COUNT(*) as total_invoices,
            COUNT(DISTINCT document_id) as documents_uploaded,
            AVG(amount) as average_invoice_value
        FROM invoices
        WHERE EXTRACT(YEAR FROM invoice_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    """)
    
    result = cursor.fetchone()
    conn.close()
    
    return {
        "total_spend_ytd": float(result[0] or 0),
        "total_invoices": int(result[1] or 0),
        "documents_uploaded": int(result[2] or 0),
        "average_invoice_value": float(result[3] or 0),
        "spend_growth": 12.5,  # Calculate from previous year
        "invoice_growth": 8.3,
        "documents_growth": 15.2,
        "avg_value_growth": 3.8
    }

@app.get("/api/invoice-trends")
async def get_invoice_trends(months: int = 12):
    conn = psycopg.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            TO_CHAR(invoice_date, 'Mon') as month,
            COUNT(*) as invoice_count,
            SUM(amount) as total_value
        FROM invoices
        WHERE invoice_date >= CURRENT_DATE - INTERVAL '%s months'
        GROUP BY EXTRACT(MONTH FROM invoice_date), TO_CHAR(invoice_date, 'Mon')
        ORDER BY EXTRACT(MONTH FROM invoice_date)
    """ % months)
    
    results = cursor.fetchall()
    conn.close()
    
    return {
        "months": [r[0] for r in results],
        "invoice_counts": [r[1] for r in results],
        "invoice_values": [float(r[2]) for r in results]
    }

@app.get("/api/vendors/top10")
async def get_top_vendors(limit: int = 10):
    conn = psycopg.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            vendor_name as name,
            SUM(amount) as spend
        FROM invoices
        GROUP BY vendor_name
        ORDER BY spend DESC
        LIMIT %s
    """, (limit,))
    
    results = cursor.fetchall()
    conn.close()
    
    return {
        "vendors": [
            {"name": r[0], "spend": float(r[1])}
            for r in results
        ]
    }

@app.get("/api/category-spend")
async def get_category_spend():
    conn = psycopg.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
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
    """)
    
    results = cursor.fetchall()
    conn.close()
    
    return {
        "categories": [
            {
                "category": r[0],
                "amount": float(r[1]),
                "percentage": float(r[2])
            }
            for r in results
        ]
    }

@app.get("/api/cash-outflow")
async def get_cash_outflow(months: int = 6):
    conn = psycopg.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT 
            TO_CHAR(due_date, 'Mon YYYY') as month,
            SUM(amount) as amount
        FROM invoices
        WHERE due_date >= CURRENT_DATE
            AND due_date < CURRENT_DATE + INTERVAL '%s months'
            AND status IN ('Pending', 'Processing')
        GROUP BY TO_CHAR(due_date, 'Mon YYYY'), EXTRACT(YEAR FROM due_date), EXTRACT(MONTH FROM due_date)
        ORDER BY EXTRACT(YEAR FROM due_date), EXTRACT(MONTH FROM due_date)
        LIMIT %s
    """ % (months, months))
    
    results = cursor.fetchall()
    conn.close()
    
    return {
        "months": [r[0] for r in results],
        "amounts": [float(r[1]) for r in results]
    }

@app.get("/api/invoices")
async def get_invoices(
    page: int = 1,
    limit: int = 10,
    search: str = None,
    sort_by: str = "date",
    sort_order: str = "desc",
    status: str = None
):
    conn = psycopg.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    offset = (page - 1) * limit
    search_pattern = f"%{search}%" if search else None
    
    # Build query
    query = """
        SELECT 
            invoice_number,
            vendor_name as vendor,
            invoice_date as date,
            amount,
            status
        FROM invoices
        WHERE 
            ($1 IS NULL OR (
                invoice_number ILIKE $1 OR
                vendor_name ILIKE $1 OR
                status ILIKE $1
            ))
            AND ($2 IS NULL OR status = $2)
        ORDER BY {} {}
        LIMIT $3 OFFSET $4
    """.format(sort_by, sort_order.upper())
    
    cursor.execute(query, (search_pattern, status, limit, offset))
    results = cursor.fetchall()
    
    # Get total count
    cursor.execute("""
        SELECT COUNT(*) FROM invoices
        WHERE 
            ($1 IS NULL OR (
                invoice_number ILIKE $1 OR
                vendor_name ILIKE $1 OR
                status ILIKE $1
            ))
            AND ($2 IS NULL OR status = $2)
    """, (search_pattern, status))
    
    total = cursor.fetchone()[0]
    conn.close()
    
    return {
        "invoices": [
            {
                "invoice_number": r[0],
                "vendor": r[1],
                "date": r[2].isoformat(),
                "amount": float(r[3]),
                "status": r[4]
            }
            for r in results
        ],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

@app.post("/api/chat-with-data")
async def chat_with_data(query: ChatQuery):
    try:
        import vanna as vn
        from vanna.openai import OpenAI_Chat
        from vanna.chromadb import ChromaDB_VectorStore
        
        # Initialize Vanna with Groq
        class MyVanna(ChromaDB_VectorStore, OpenAI_Chat):
            def __init__(self, config=None):
                ChromaDB_VectorStore.__init__(self, config=config)
                OpenAI_Chat.__init__(self, config=config)
        
        vanna_instance = MyVanna(config={
            'api_key': os.getenv('GROQ_API_KEY'),
            'model': 'mixtral-8x7b-32768'
        })
        
        # Connect to database
        vanna_instance.connect_to_postgres(
            host=os.getenv('DB_HOST'),
            dbname=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=os.getenv('DB_PORT', 5432)
        )
        
        # Generate SQL
        sql = vanna_instance.generate_sql(query.query)
        
        # Execute SQL
        import time
        start_time = time.time()
        df = vanna_instance.run_sql(sql)
        execution_time = (time.time() - start_time) * 1000
        
        # Convert results to JSON
        results = df.to_dict('records')
        columns = df.columns.tolist()
        
        return {
            "query": query.query,
            "sql": sql,
            "results": results,
            "columns": columns,
            "row_count": len(results),
            "execution_time_ms": round(execution_time, 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## Vanna AI Setup

### Installation
```bash
pip install vanna
pip install psycopg[binary]
pip install chromadb
```

### Training Vanna Model

```python
import vanna as vn
from vanna.chromadb import ChromaDB_VectorStore
from vanna.openai import OpenAI_Chat

class MyVanna(ChromaDB_VectorStore, OpenAI_Chat):
    def __init__(self, config=None):
        ChromaDB_VectorStore.__init__(self, config=config)
        OpenAI_Chat.__init__(self, config=config)

# Initialize
vn = MyVanna(config={
    'api_key': 'your-groq-api-key',
    'model': 'mixtral-8x7b-32768'
})

# Connect to your database
vn.connect_to_postgres(
    host='localhost',
    dbname='invoices_db',
    user='postgres',
    password='password',
    port=5432
)

# Train with DDL
vn.train(ddl="""
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_name VARCHAR(200) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    category VARCHAR(100),
    document_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
""")

# Train with documentation
vn.train(documentation="""
The invoices table contains all invoice records.
- Status can be: 'Paid', 'Pending', 'Processing', 'Overdue'
- Categories include: 'IT & Software', 'Office Supplies', 'Professional Services', 'Equipment', 'Utilities', 'Other'
- YTD means Year-to-Date (current year)
- Amount is in USD
""")

# Train with sample queries
vn.train(sql="SELECT SUM(amount) FROM invoices WHERE EXTRACT(YEAR FROM invoice_date) = EXTRACT(YEAR FROM CURRENT_DATE)")
vn.train(sql="SELECT vendor_name, SUM(amount) as total_spend FROM invoices GROUP BY vendor_name ORDER BY total_spend DESC LIMIT 10")
vn.train(sql="SELECT * FROM invoices WHERE status = 'Overdue' AND due_date < CURRENT_DATE")
```

---

## Database Schema

```sql
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_name VARCHAR(200) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Paid', 'Pending', 'Processing', 'Overdue')),
    category VARCHAR(100),
    document_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_vendor ON invoices(vendor_name);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_category ON invoices(category);

-- Sample data insertion
INSERT INTO invoices (invoice_number, vendor_name, invoice_date, due_date, amount, status, category, document_id)
VALUES 
    ('INV-2025-1234', 'Acme Corp', '2025-11-05', '2025-12-05', 12450.00, 'Paid', 'IT & Software', 'DOC-001'),
    ('INV-2025-1235', 'TechSupply Inc', '2025-11-04', '2025-12-04', 8750.00, 'Pending', 'Office Supplies', 'DOC-002');
```

---

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_BASE=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/invoices_db
DB_HOST=localhost
DB_NAME=invoices_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=5432

# Vanna AI
GROQ_API_KEY=your_groq_api_key
VANNA_MODEL=mixtral-8x7b-32768

# Server
PORT=8000
HOST=0.0.0.0
```

---

## Deployment

### Backend Deployment (Docker)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Requirements.txt
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
psycopg[binary]==3.1.13
vanna==0.5.5
chromadb==0.4.18
python-dotenv==1.0.0
pydantic==2.5.0
```

---

## Testing the APIs

### Using cURL

```bash
# Test stats endpoint
curl http://localhost:8000/api/stats

# Test invoice trends
curl http://localhost:8000/api/invoice-trends?months=12

# Test top vendors
curl http://localhost:8000/api/vendors/top10

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the total spend in the last 90 days?"}'
```

### Using Python requests

```python
import requests

BASE_URL = "http://localhost:8000/api"

# Get stats
response = requests.get(f"{BASE_URL}/stats")
print(response.json())

# Chat query
response = requests.post(
    f"{BASE_URL}/chat-with-data",
    json={"query": "List top 5 vendors by spend"}
)
print(response.json())
```

---

## Frontend API Integration

Update the frontend to connect to your backend by modifying the API base URL:

```javascript
// In your frontend code, replace the simulated API calls with:
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api';

async function fetchStats() {
    const response = await fetch(`${API_BASE}/stats`);
    return response.json();
}

async function fetchInvoices(page, limit, search, sortBy, sortOrder) {
    const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        sort_by: sortBy,
        sort_order: sortOrder
    });
    
    const response = await fetch(`${API_BASE}/invoices?${params}`);
    return response.json();
}

async function chatWithData(query) {
    const response = await fetch(`${API_BASE}/chat-with-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });
    return response.json();
}
```

---

## Security Considerations

1. **API Authentication**: Add JWT or API key authentication
2. **Rate Limiting**: Implement rate limiting for chat endpoint
3. **SQL Injection**: Vanna handles this, but validate inputs
4. **CORS**: Configure proper CORS origins in production
5. **Environment Variables**: Never commit secrets to repository
6. **Database Connections**: Use connection pooling
7. **Error Handling**: Don't expose sensitive error details to clients

---

## Performance Optimization

1. **Database Indexing**: Ensure proper indexes on frequently queried columns
2. **Caching**: Cache frequently accessed endpoints (Redis)
3. **Connection Pooling**: Use connection pooling for database
4. **Query Optimization**: Monitor and optimize slow queries
5. **Pagination**: Always paginate large result sets
6. **Compression**: Enable gzip compression

---

## Monitoring and Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response
```

---

## Next Steps

1. Set up PostgreSQL database with schema
2. Implement backend API endpoints using FastAPI
3. Train Vanna AI model with your schema and sample queries
4. Configure environment variables
5. Test all endpoints locally
6. Update frontend API base URL
7. Deploy backend and frontend
8. Monitor and optimize performance

For questions or issues, refer to:
- Vanna AI Documentation: https://vanna.ai/
- FastAPI Documentation: https://fastapi.tiangolo.com/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
