# Finance Dashboard API - OpenAPI Specification

Base URL: `http://localhost:3000/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Register New User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "string (3-50 chars, alphanumeric)",
  "password": "string (min 6 chars)",
  "role": "viewer | analyst | admin (optional, default: viewer)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "role": "viewer | analyst | admin",
      "status": "active | inactive",
      "createdAt": "timestamp"
    },
    "token": "jwt_token_string"
  },
  "message": "User registered successfully"
}
```

#### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* user object without password */ },
    "token": "jwt_token_string"
  },
  "message": "Login successful"
}
```

#### Get Current Profile
```http
GET /auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "role": "viewer | analyst | admin",
      "status": "active | inactive",
      "createdAt": "timestamp"
    }
  }
}
```

---

### Users

#### List All Users
```http
GET /users
```

**Headers:**
```
Authorization: Bearer <token> (admin only)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "username": "string",
        "role": "viewer | analyst | admin",
        "status": "active | inactive",
        "createdAt": "timestamp"
      }
    ],
    "count": 10
  }
}
```

#### Get User by ID
```http
GET /users/:id
```

**Headers:**
```
Authorization: Bearer <token> (admin or self)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ }
  }
}
```

#### Create User (Admin Only)
```http
POST /users
```

**Headers:**
```
Authorization: Bearer <token> (admin only)
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "role": "viewer | analyst | admin",
  "status": "active | inactive (optional, default: active)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { /* user object without password */ }
  },
  "message": "User created successfully"
}
```

#### Update User
```http
PUT /users/:id
```

**Headers:**
```
Authorization: Bearer <token> (admin or self)
```

**Request Body:**
```json
{
  "username": "string (optional)",
  "password": "string (optional, will be hashed)",
  "role": "viewer | analyst | admin (admin only)",
  "status": "active | inactive (admin only)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { /* updated user object */ }
  },
  "message": "User updated successfully"
}
```

#### Delete User (Admin Only)
```http
DELETE /users/:id
```

**Headers:**
```
Authorization: Bearer <token> (admin only)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully",
    "id": "uuid"
  }
}
```

---

### Financial Records

#### List Records with Filtering
```http
GET /records
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (all optional):**
- `type` (string): `income` or `expense`
- `category` (string): Category name
- `startDate` (string): Format `YYYY-MM-DD`
- `endDate` (string): Format `YYYY-MM-DD`
- `minAmount` (number): Minimum amount filter
- `maxAmount` (number): Maximum amount filter

**Note:** Non-admin users always get filtered to their own records.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "uuid",
        "amount": 1500.50,
        "type": "income | expense",
        "category": "string",
        "date": "YYYY-MM-DD",
        "description": "string | null",
        "user": {
          "id": "uuid",
          "username": "string"
        },
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    ],
    "count": 25
  }
}
```

#### Get Single Record
```http
GET /records/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "record": { /* record object */ }
  }
}
```

#### Create Record
```http
POST /records
```

**Headers:**
```
Authorization: Bearer <token> (analyst or admin)
```

**Request Body:**
```json
{
  "amount": 1500.50,
  "type": "income | expense",
  "category": "string",
  "date": "YYYY-MM-DD",
  "description": "string (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "record": { /* created record object */ }
  },
  "message": "Record created successfully"
}
```

#### Update Record
```http
PUT /records/:id
```

**Headers:**
```
Authorization: Bearer <token> (admin or owner)
```

**Request Body (any fields):**
```json
{
  "amount": 2000.00,
  "type": "income",
  "category": "string",
  "date": "YYYY-MM-DD",
  "description": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "record": { /* updated record object */ }
  },
  "message": "Record updated successfully"
}
```

#### Delete Record
```http
DELETE /records/:id
```

**Headers:**
```
Authorization: Bearer <token> (admin or owner)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Record deleted successfully",
    "id": "uuid"
  }
}
```

---

### Dashboard Summaries

#### Overall Summary
```http
GET /dashboard/summary
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 25000.00,
      "totalExpenses": 12000.50,
      "netBalance": 12999.50,
      "recordCount": 50
    }
  }
}
```

#### Category Totals
```http
GET /dashboard/category-totals
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categoryTotals": [
      {
        "category": "Salary",
        "income": 15000.00,
        "expense": 0,
        "net": 15000.00
      },
      {
        "category": "Rent",
        "income": 0,
        "expense": 5000.00,
        "net": -5000.00
      }
    ]
  }
}
```

#### Monthly Trends
```http
GET /dashboard/monthly-trends?months=12
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `months` (number, default: 12) - Number of months to include

**Response (200):**
```json
{
  "success": true,
  "data": {
    "monthlyTrends": [
      {
        "month": "2024-01",
        "income": 5000.00,
        "expense": 3200.00,
        "net": 1800.00,
        "recordCount": 15
      },
      {
        "month": "2024-02",
        "income": 5200.00,
        "expense": 3100.00,
        "net": 2100.00,
        "recordCount": 18
      }
    ]
  }
}
```

#### Recent Activity
```http
GET /dashboard/recent-activity?limit=10
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (number, default: 10) - Number of recent records

**Response (200):**
```json
{
  "success": true,
  "data": {
    "recentActivity": [
      {
        "id": "uuid",
        "amount": 1500.00,
        "type": "income",
        "category": "Freelance",
        "date": "2024-02-20",
        "description": "Project payment",
        "user": {
          "id": "uuid",
          "username": "string"
        },
        "createdAt": "timestamp"
      }
    ]
  }
}
```

#### Full Dashboard
```http
GET /dashboard
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "dashboard": {
      "summary": { /* summary object */ },
      "categoryTotals": [ /* array */ ],
      "monthlyTrends": [ /* array */ ],
      "recentActivity": [ /* array */ ]
    }
  }
}
```

---

### Error Responses

#### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Amount must be a positive number",
    "Date is required"
  ]
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided. Please authenticate."
}
```
or
```json
{
  "success": false,
  "message": "Invalid token"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "requiredRoles": ["admin"],
  "currentRole": "viewer"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

#### 409 Conflict
```json
{
  "success": false,
  "message": "Resource conflict",
  "errors": ["Username already exists"]
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Role Permissions Matrix

| Endpoint                     | Viewer | Analyst | Admin |
|------------------------------|--------|---------|-------|
| POST /auth/register          | ✓      | ✓       | ✓     |
| POST /auth/login             | ✓      | ✓       | ✓     |
| GET /auth/profile            | ✓      | ✓       | ✓     |
| PUT /auth/profile            | ✓      | ✓       | ✓     |
| GET /users                   | ✗      | ✗       | ✓     |
| POST /users                  | ✗      | ✗       | ✓     |
| GET /users/:id (own)         | ✓      | ✓       | ✓     |
| GET /users/:id (others)      | ✗      | ✗       | ✓     |
| PUT /users/:id (own)         | ✓      | ✓       | ✓     |
| PUT /users/:id (others)      | ✗      | ✗       | ✓     |
| DELETE /users/:id            | ✗      | ✗       | ✓     |
| GET /records                 | ✓      | ✓       | ✓     |
| POST /records                | ✗      | ✓       | ✓     |
| PUT /records/:id             | ✗      | ✓*      | ✓     |
| DELETE /records/:id          | ✗      | ✓*      | ✓     |
| GET /dashboard/*             | ✓      | ✓       | ✓     |

* Only for own records

## Rate Limits

This implementation does not include rate limiting. Consider adding `express-rate-limit` in production.

## Data Types

- **UUID**: All IDs are UUID v4 format (36 characters with hyphens)
- **Amount**: DECIMAL(10,2) with 2 decimal precision (e.g., `1500.50`)
- **Date**: ISO 8601 date format without time (`YYYY-MM-DD`)
- **Timestamps**: ISO 8601 timestamps in UTC (`YYYY-MM-DDTHH:MM:SS.mmmZ`)

## Notes

- In development, a default admin user is created: `admin` / `admin123`. Change this in production!
- SQLite database file: `database.sqlite` (or in-memory for tests)
- JWT tokens expire according to `JWT_EXPIRE` environment variable (default: 7 days)
- All amounts are stored with 2 decimal places
- Records are associated with users via `userId` foreign key
- Admin users can view and manage all records regardless of ownership
- Non-admin users can only see their own records in dashboard summaries
