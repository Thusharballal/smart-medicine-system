# Phase 18 - Quick Reference Guide
**Billing Module APIs**

---

## ✅ Status: COMPLETE

All Phase 18 billing module APIs are implemented and ready for use.

---

## 🚀 Quick Start

### Start Backend Server
```bash
cd Backend
python run.py
```

**Server will run on:** `http://localhost:8000`

### API Documentation
**Interactive Docs:** `http://localhost:8000/docs`

---

## 📡 Available APIs

### 1. Create Bill
**Endpoint:** `POST /api/v1/billing`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_phone": "9876543210",
  "payment_method": "CASH",
  "discount": 10.00,
  "items": [
    {
      "medicine_id": "60d5ec49f1b2c72b8c8e4f1a",
      "quantity": 2
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "bill_number": "INV-20240702112400",
  "customer_name": "John Doe",
  "customer_phone": "9876543210",
  "items": [...],
  "subtotal": 36.00,
  "discount": 10.00,
  "tax": 0.00,
  "total_amount": 26.00,
  "payment_method": "CASH",
  "payment_status": "PAID",
  "created_by": "user_id",
  "created_at": "2024-07-02T11:24:00"
}
```

---

### 2. Get Bill History (Paginated)
**Endpoint:** `GET /api/v1/billing/history`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| page_size | integer | No | 10 | Items per page (max: 100) |
| search | string | No | - | Search by bill number, customer name, or phone |
| status | string | No | - | Filter by status: paid, pending, cancelled |

**Examples:**
```
GET /api/v1/billing/history?page=1&page_size=10
GET /api/v1/billing/history?search=John
GET /api/v1/billing/history?status=paid
GET /api/v1/billing/history?page=2&page_size=20&search=John&status=paid
```

**Response:** `200 OK`
```json
{
  "bills": [
    {
      "bill_number": "INV-20240702112400",
      "customer_name": "John Doe",
      "customer_phone": "9876543210",
      "medicine_count": 3,
      "total_amount": 450.50,
      "payment_method": "CASH",
      "payment_status": "PAID",
      "created_at": "2024-07-02T11:24:00",
      "created_by": "user_id"
    }
  ],
  "total": 45,
  "page": 1,
  "page_size": 10,
  "total_pages": 5
}
```

---

### 3. Get Bill Details
**Endpoint:** `GET /api/v1/billing/{bill_number}`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| bill_number | string | Yes | Bill number (e.g., INV-20240702112400) |

**Example:**
```
GET /api/v1/billing/INV-20240702112400
```

**Response:** `200 OK`
```json
{
  "bill_number": "INV-20240702112400",
  "customer_name": "John Doe",
  "customer_phone": "9876543210",
  "items": [
    {
      "medicine_id": "60d5ec49f1b2c72b8c8e4f1a",
      "medicine_name": "Paracetamol IP 500mg",
      "batch_id": "60d5ec49f1b2c72b8c8e4f1b",
      "batch_number": "BATCH-001",
      "quantity": 2,
      "unit_price": 18.00,
      "total_price": 36.00
    }
  ],
  "subtotal": 450.00,
  "discount": 0.00,
  "tax": 0.00,
  "total_amount": 450.00,
  "payment_method": "CASH",
  "payment_status": "PAID",
  "created_by": "user_id",
  "created_at": "2024-07-02T11:24:00",
  "updated_at": "2024-07-02T11:24:00"
}
```

**Error Response:** `404 Not Found`
```json
{
  "detail": "Bill not found."
}
```

---

## 💻 Frontend Integration

### Import Service
```javascript
import billingService from '../services/billingService'
```

### Usage Examples

#### Create Bill
```javascript
try {
  const response = await billingService.create({
    customer_name: "John Doe",
    customer_phone: "9876543210",
    payment_method: "CASH",
    discount: 10.00,
    items: [
      { medicine_id: "xyz123", quantity: 2 }
    ]
  })
  console.log("Bill created:", response.data.bill_number)
} catch (error) {
  console.error("Error creating bill:", error.response?.data?.detail)
}
```

#### Get Bill History
```javascript
try {
  const response = await billingService.getHistory({
    page: 1,
    page_size: 10,
    search: "John",
    status: "paid"
  })
  const { bills, total, page, total_pages } = response.data
  console.log(`Showing ${bills.length} of ${total} bills`)
} catch (error) {
  console.error("Error fetching history:", error.response?.data?.detail)
}
```

#### Get Bill Details
```javascript
try {
  const response = await billingService.getByBillNumber("INV-20240702112400")
  const bill = response.data
  console.log("Bill details:", bill)
} catch (error) {
  if (error.response?.status === 404) {
    console.error("Bill not found")
  } else {
    console.error("Error fetching bill:", error.response?.data?.detail)
  }
}
```

---

## 🧪 Testing with cURL

### Get JWT Token First
```bash
# Login to get token
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

**Copy the access_token from response**

### Create Bill
```bash
curl -X POST "http://localhost:8000/api/v1/billing" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test Customer",
    "customer_phone": "1234567890",
    "payment_method": "CASH",
    "discount": 0,
    "items": [{"medicine_id": "MEDICINE_ID", "quantity": 1}]
  }'
```

### Get Bill History
```bash
curl -X GET "http://localhost:8000/api/v1/billing/history?page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Bill Details
```bash
curl -X GET "http://localhost:8000/api/v1/billing/INV-20240702112400" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔐 Authentication

All billing endpoints require JWT authentication.

**Header Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Get Token:**
1. Register: `POST /api/v1/auth/register`
2. Verify OTP: `POST /api/v1/auth/verify-otp`
3. Login: `POST /api/v1/auth/login`

---

## ⚠️ Error Codes

| Status Code | Meaning | Example |
|-------------|---------|---------|
| 200 | Success | Bill history retrieved |
| 201 | Created | New bill created |
| 400 | Bad Request | Invalid medicine ID or insufficient stock |
| 401 | Unauthorized | Missing or invalid JWT token |
| 404 | Not Found | Bill number doesn't exist |
| 422 | Validation Error | Invalid request body format |
| 500 | Server Error | Internal server error |

---

## 📊 Business Logic

### Bill Creation Flow
1. Validate all medicine IDs exist
2. For each item, find available batch using **FEFO** (First Expiry First Out)
3. Validate sufficient stock in batch
4. Calculate pricing (unit price × quantity)
5. Apply discount if provided
6. Generate unique bill number
7. Create bill record
8. Reduce batch quantities
9. Log inventory movements (SALE type)
10. Return bill details

### FEFO (First Expiry First Out)
Bills automatically select batches with nearest expiry date to minimize waste.

---

## 🗂️ File Structure

### Backend
```
Backend/
├── app/
│   ├── routers/
│   │   └── billing_router.py       # API endpoints
│   ├── services/
│   │   └── billing_service.py      # Business logic
│   ├── schemas/
│   │   └── billing_schema.py       # Request/response models
│   └── models/
│       └── billing_model.py        # Database model
```

### Frontend
```
Frontend/
├── src/
│   ├── services/
│   │   └── billingService.js       # API client
│   └── pages/
│       └── pharmacy/
│           ├── BillingPage.jsx     # Create bill UI
│           └── BillHistoryPage.jsx # History UI
```

---

## 🎯 Key Features

### ✅ Implemented
- [x] Create bill with multiple items
- [x] FEFO batch selection
- [x] Stock validation
- [x] Automatic stock reduction
- [x] Inventory movement logging
- [x] Paginated bill history
- [x] Search bills (bill number, customer name, phone)
- [x] Filter by payment status
- [x] View complete bill details
- [x] Optional customer information
- [x] Discount support

### 🔜 Future Enhancements
- [ ] PDF generation
- [ ] Email invoice
- [ ] Print bill
- [ ] Bill cancellation/refund
- [ ] Payment gateway integration
- [ ] Sales reports & analytics

---

## 📞 Need Help?

### Documentation
- **Full Audit Report:** `PHASE_18_COMPLETION_AND_COMPATIBILITY_AUDIT_REPORT.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`
- **API Docs:** `http://localhost:8000/docs` (when server is running)

### Common Issues

**Issue:** Server won't start
**Solution:** Check MongoDB is running and `.env` file is configured

**Issue:** 401 Unauthorized
**Solution:** Ensure JWT token is valid and included in Authorization header

**Issue:** 404 Bill not found
**Solution:** Verify bill number is correct and exists in database

**Issue:** 400 Insufficient stock
**Solution:** Check batch has available quantity before billing

---

## ✅ Checklist for Integration

- [ ] Backend server running on `http://localhost:8000`
- [ ] MongoDB running and accessible
- [ ] JWT token obtained from login
- [ ] Test create bill with Postman
- [ ] Test get bill history with pagination
- [ ] Test get bill details by bill number
- [ ] Update frontend BillHistoryPage to use real API
- [ ] Remove mock data from frontend
- [ ] Test frontend billing workflow end-to-end

---

**Phase 18 Status:** ✅ COMPLETE  
**Last Updated:** January 2025  
**Version:** 1.0.0
