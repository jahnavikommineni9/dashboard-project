# Database Schema & Seed Script

## Prisma Schema (schema.prisma)

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Vendor {
  id        String   @id @default(cuid())
  name      String   @db.VarChar(255)
  email     String?  @db.VarChar(255)
  phone     String?  @db.VarChar(20)
  address   String?  @db.Text
  city      String?  @db.VarChar(100)
  state     String?  @db.VarChar(100)
  postalCode String? @db.VarChar(20)
  country   String?  @db.VarChar(100)
  
  invoices  Invoice[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([name])
  @@index([country])
  @@map("vendors")
}

model Customer {
  id        String   @id @default(cuid())
  name      String   @db.VarChar(255)
  email     String?  @db.VarChar(255)
  company   String?  @db.VarChar(255)
  
  invoices  Invoice[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("customers")
}

model Invoice {
  id                String   @id @default(cuid())
  invoiceNumber     String   @unique @db.VarChar(50)
  vendorId          String
  vendor            Vendor   @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  
  customerId        String
  customer          Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  invoiceDate       DateTime @db.Date
  dueDate           DateTime @db.Date
  amount            Decimal  @db.Decimal(12, 2)
  status            InvoiceStatus @default(PENDING)
  category          String?  @db.VarChar(100)
  documentUrl       String?  @db.Text
  
  lineItems         LineItem[]
  payments          Payment[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([vendorId])
  @@index([customerId])
  @@index([status])
  @@index([invoiceDate])
  @@index([category])
  @@map("invoices")
}

model LineItem {
  id              String   @id @default(cuid())
  invoiceId       String
  invoice         Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  description     String   @db.Text
  quantity        Int
  unitPrice       Decimal  @db.Decimal(10, 2)
  totalPrice      Decimal  @db.Decimal(12, 2)
  
  createdAt       DateTime @default(now())
  
  @@index([invoiceId])
  @@map("line_items")
}

model Payment {
  id              String   @id @default(cuid())
  invoiceId       String
  invoice         Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  paymentDate     DateTime @db.Date
  amount          Decimal  @db.Decimal(12, 2)
  paymentMethod   String   @db.VarChar(50)
  status          PaymentStatus @default(PENDING)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([invoiceId])
  @@index([paymentDate])
  @@map("payments")
}

enum InvoiceStatus {
  PAID
  PENDING
  PROCESSING
  OVERDUE
}

enum PaymentStatus {
  COMPLETED
  PENDING
  FAILED
}
```

## SQL Seed Script (seed.sql)

```sql
-- Seed Vendors
INSERT INTO vendors (id, name, email, phone, address, city, state, "postalCode", country, "createdAt", "updatedAt") VALUES
('vendor-001', 'Acme Corp', 'contact@acme.com', '+1-555-0001', '123 Tech Lane', 'San Francisco', 'CA', '94105', 'USA', NOW(), NOW()),
('vendor-002', 'TechSupply Inc', 'info@techsupply.com', '+1-555-0002', '456 Silicon Ave', 'Mountain View', 'CA', '94043', 'USA', NOW(), NOW()),
('vendor-003', 'Global Services', 'support@globalservices.com', '+1-555-0003', '789 Enterprise Blvd', 'New York', 'NY', '10001', 'USA', NOW(), NOW()),
('vendor-004', 'Premier Products', 'sales@premier.com', '+1-555-0004', '321 Commerce St', 'Chicago', 'IL', '60601', 'USA', NOW(), NOW()),
('vendor-005', 'Metro Supplies', 'orders@metro.com', '+1-555-0005', '654 Distribution Way', 'Boston', 'MA', '02101', 'USA', NOW(), NOW()),
('vendor-006', 'Innovate Solutions', 'info@innovate.com', '+1-555-0006', '987 Innovation Park', 'Austin', 'TX', '78701', 'USA', NOW(), NOW()),
('vendor-007', 'Quality Goods', 'support@quality.com', '+1-555-0007', '159 Excellence Dr', 'Seattle', 'WA', '98101', 'USA', NOW(), NOW()),
('vendor-008', 'Swift Logistics', 'shipping@swift.com', '+1-555-0008', '753 Logistics Ln', 'Atlanta', 'GA', '30303', 'USA', NOW(), NOW()),
('vendor-009', 'Atlas Equipment', 'sales@atlas.com', '+1-555-0009', '456 Equipment Pl', 'Denver', 'CO', '80202', 'USA', NOW(), NOW()),
('vendor-010', 'Zenith Materials', 'info@zenith.com', '+1-555-0010', '789 Supply St', 'Dallas', 'TX', '75201', 'USA', NOW(), NOW());

-- Seed Customers
INSERT INTO customers (id, name, email, company, "createdAt", "updatedAt") VALUES
('customer-001', 'John Smith', 'john@company.com', 'Your Company Inc', NOW(), NOW()),
('customer-002', 'Jane Doe', 'jane@company.com', 'Your Company Inc', NOW(), NOW());

-- Seed Invoices (20 sample invoices)
INSERT INTO invoices (id, "invoiceNumber", "vendorId", "customerId", "invoiceDate", "dueDate", amount, status, category, "createdAt", "updatedAt") VALUES
('inv-001', 'INV-2025-1234', 'vendor-001', 'customer-001', '2025-11-05', '2025-12-05', 12450.00, 'PAID', 'IT & Software', NOW(), NOW()),
('inv-002', 'INV-2025-1235', 'vendor-002', 'customer-001', '2025-11-04', '2025-12-04', 8750.00, 'PENDING', 'Office Supplies', NOW(), NOW()),
('inv-003', 'INV-2025-1236', 'vendor-003', 'customer-001', '2025-11-03', '2025-12-03', 15200.00, 'PAID', 'Professional Services', NOW(), NOW()),
('inv-004', 'INV-2025-1237', 'vendor-004', 'customer-001', '2025-11-02', '2025-12-02', 3890.00, 'PROCESSING', 'Equipment', NOW(), NOW()),
('inv-005', 'INV-2025-1238', 'vendor-005', 'customer-001', '2025-10-30', '2025-11-30', 22100.00, 'OVERDUE', 'Utilities', NOW(), NOW()),
-- Add more invoices to reach ~1247 total across all months
-- (Truncated for brevity - full seed would have all data)
;

-- Seed Line Items
INSERT INTO line_items (id, "invoiceId", description, quantity, "unitPrice", "totalPrice", "createdAt") VALUES
('li-001', 'inv-001', 'Software License - Annual', 1, 10000.00, 10000.00, NOW()),
('li-002', 'inv-001', 'Support and Maintenance', 1, 2450.00, 2450.00, NOW()),
('li-003', 'inv-002', 'Office Supplies', 50, 175.00, 8750.00, NOW());

-- Seed Payments
INSERT INTO payments (id, "invoiceId", "paymentDate", amount, "paymentMethod", status, "createdAt", "updatedAt") VALUES
('pay-001', 'inv-001', '2025-11-10', 12450.00, 'Bank Transfer', 'COMPLETED', NOW(), NOW()),
('pay-002', 'inv-003', '2025-11-08', 15200.00, 'Credit Card', 'COMPLETED', NOW(), NOW());
```

## Prisma Seed File (seed.ts)

```typescript
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.payment.deleteMany({})
  await prisma.lineItem.deleteMany({})
  await prisma.invoice.deleteMany({})
  await prisma.customer.deleteMany({})
  await prisma.vendor.deleteMany({})

  console.log('🗑️  Cleared existing data')

  // Seed vendors
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: {
        name: 'Acme Corp',
        email: 'contact@acme.com',
        phone: '+1-555-0001',
        address: '123 Tech Lane',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'USA',
      },
    }),
    // ... more vendors
  ])

  console.log(`✅ Seeded ${vendors.length} vendors`)

  // Seed customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'John Smith',
        email: 'john@company.com',
        company: 'Your Company Inc',
      },
    }),
  ])

  console.log(`✅ Seeded ${customers.length} customers`)

  // Seed invoices and related data
  const invoices = await Promise.all([
    prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2025-1234',
        vendor: { connect: { id: vendors[0].id } },
        customer: { connect: { id: customers[0].id } },
        invoiceDate: new Date('2025-11-05'),
        dueDate: new Date('2025-12-05'),
        amount: 12450.00,
        status: 'PAID',
        category: 'IT & Software',
        lineItems: {
          create: [
            {
              description: 'Software License - Annual',
              quantity: 1,
              unitPrice: 10000.00,
              totalPrice: 10000.00,
            },
            {
              description: 'Support and Maintenance',
              quantity: 1,
              unitPrice: 2450.00,
              totalPrice: 2450.00,
            },
          ],
        },
        payments: {
          create: [
            {
              paymentDate: new Date('2025-11-10'),
              amount: 12450.00,
              paymentMethod: 'Bank Transfer',
              status: 'COMPLETED',
            },
          ],
        },
      },
    }),
    // ... more invoices
  ])

  console.log(`✅ Seeded ${invoices.length} invoices`)

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## Migration Steps

```bash
# Create database
createdb invoices_db

# Run migrations
npx prisma migrate dev --name init

# Verify schema
npx prisma db push

# Run seed
npx prisma db seed

# View data
npx prisma studio
```

## Backup & Restore

```bash
# Backup database
pg_dump invoices_db > backup.sql

# Restore database
psql invoices_db < backup.sql
```

---

*This schema follows database normalization principles with proper referential integrity and indexes for query performance.*