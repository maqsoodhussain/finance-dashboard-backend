# Finance Dashboard Backend

A RESTful API backend for a finance dashboard system with role-based access control, financial records management, and dashboard analytics.

## Features

- **User & Role Management**: Register, manage users with roles (Viewer, Analyst, Admin)
- **Financial Records**: Full CRUD operations for income/expense tracking
- **Dashboard Analytics**: Summary endpoints for totals, trends, and category breakdowns
- **Role-Based Access Control**: Fine-grained permissions per user role
- **Input Validation**: Comprehensive validation using Joi
- **JWT Authentication**: Secure token-based authentication
- **MongoDB Database**: Document-based persistence with Mongoose ODM

## User Roles

| Role    | Permissions                                                                 |
|---------|-----------------------------------------------------------------------------|
| Viewer  | View dashboard summaries only                                              |
| Analyst | View records, access all summaries, create/update own records              |
| Admin   | Full access: manage all records, users, and system settings               |

## Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- MongoDB running (local or MongoDB Atlas)

### Installation

```bash
# Install dependencies
npm install

# Create .env file (see Configuration section)

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

The API will be available at `http://localhost:3000`

## Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

**Configuration Options:**

- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
  - Local: `mongodb://localhost:27017/finance_dashboard`
  - Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/finance_dashboard`
- `JWT_SECRET`: Secret key for signing JWT tokens (change in production!)
- `JWT_EXPIRE`: Token expiration time (default: 7d)
- `NODE_ENV`: Environment (development|production)

## API Endpoints

### Authentication

| Method | Endpoint        | Description          | Access   |
|--------|-----------------|----------------------|----------|
| POST   | /api/auth/register | Register new user   | Public   |
| POST   | /api/auth/login    | Login user         | Public   |
| GET    | /api/auth/profile  | Get current user  | Authenticated |

### Users (Admin only unless accessing own data)

| Method | Endpoint               | Description              | Access   |
|--------|------------------------|--------------------------|----------|
| GET    | /api/users           | List all users          | Admin    |
| GET    | /api/users/:id       | Get user by ID          | Admin/Self |
| PUT    | /api/users/:id       | Update user             | Admin/Self |
| DELETE | /api/users/:id       | Delete user             | Admin    |

### Financial Records

| Method | Endpoint                     | Description                      | Access           |
|--------|------------------------------|----------------------------------|------------------|
| GET    | /api/records               | List records with filters        | Authenticated    |
| POST   | /api/records               | Create new record                | Analyst/Admin    |
| GET    | /api/records/:id           | Get specific record              | Authenticated    |
| PUT    | /api/records/:id           | Update record                    | Owner/Admin      |
| DELETE | /api/records/:id           | Delete record                    | Owner/Admin      |

### Dashboard Summaries

| Method | Endpoint                        | Description                  | Access            |
|--------|---------------------------------|------------------------------|-------------------|
| GET    | /api/dashboard/summary         | Overall financial summary    | Authenticated    |
| GET    | /api/dashboard/category-totals | Totals by category           | Authenticated    |
| GET    | /api/dashboard/monthly-trends  | Monthly income/expense trends| Authenticated    |
| GET    | /api/dashboard/recent-activity | Recent transactions          | Authenticated    |

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, alphanumeric, 3-50 chars),
  password: String (hashed with bcrypt, excluded from queries),
  role: String (enum: 'viewer'|'analyst'|'admin'),
  status: String (enum: 'active'|'inactive'),
  createdAt: Date,
  updatedAt: Date
}
```

### FinancialRecords Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  amount: Number (minimum 0.01, stored with 2 decimal precision),
  type: String (enum: 'income'|'expense'),
  category: String (max 100 chars),
  date: String (format: YYYY-MM-DD),
  description: String (optional, max 1000 chars),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `financial_records`: { userId: 1, date: -1 }
- `financial_records`: { date: -1 }
- `financial_records`: { type: 1 }
- `financial_records`: { category: 1 }
- `users`: { username: 1 } (unique)
- `users`: { role: 1 }
- `users`: { status: 1 }

## Example Usage

### 1. Register a user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secure123","role":"analyst"}'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secure123"}'
# Returns: { "token": "eyJhbGci..." }
```

### 3. Create a financial record (with token)
```bash
curl -X POST http://localhost:3000/api/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 1500.50,
    "type": "income",
    "category": "Salary",
    "date": "2024-01-15",
    "description": "Monthly salary"
  }'
```

### 4. Get dashboard summary
```bash
curl -X GET http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Filter records
```bash
curl -X GET "http://localhost:3000/api/records?type=income&category=Salary&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Access Control Rules

- **Viewers** can only view dashboard summaries
- **Analysts** can view all records and create/update their own records
- **Admins** have full access to all operations on all records and users
- Users can only update/delete their own records unless they are admins

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (duplicate username)
- `500` - Internal server error

Example error response:
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

## Design Decisions & Assumptions

### 1. Architecture & Patterns
- **Layered Architecture**: Clear separation between Routes (API layer), Services (business logic), Models (data layer), and Middleware (cross-cutting concerns)
- **Service Layer Pattern**: All business logic encapsulated in services, making routes thin and testable
- **Mongoose ODM**: Provides MongoDB abstraction, schema validation, and virtuals

### 2. Authentication & Authorization
- **JWT Tokens**: Stateless authentication suitable for horizontal scaling and API clients
- **Role-Based Access Control (RBAC)**: Three roles with clearly defined permissions
- **Middleware-based Enforcement**: Centralized auth and RBAC checks in middleware for consistency

### 3. Database Design
- **MongoDB**: Document database with flexible schema, ideal for rapidly evolving applications
- **Mongoose Models**: With explicit validations, constraints, references, and indexes
- **Embedded References**: User reference in records using ObjectId with population
- **Indexes**: Strategically placed for optimal query performance

### 4. Data Modeling
- **Financial Records**: Separate collection with user reference for extensibility
- **Amount Precision**: Stored as Number with getter for fixed 2-decimal rounding
- **Date Format**: ISO 8601 date strings (YYYY-MM-DD) for consistency
- **User status**: Active/inactive for soft account management
- **Password Security**: Stored as bcrypt hash, excluded from queries by default

### 5. Input Validation
- **Joi Schemas**: Centralized validation with clear error messages
- **Multi-layer**: Request params, query, and body validated separately per endpoint
- **Error Format**: Consistent 400 responses with detailed field-level errors

### 6. Error Handling
- **Centralized Error Middleware**: Single place for all error formatting
- **Error Classification**: Differentiates validation, auth, DB, and unknown errors
- **Development vs Production**: Detailed errors in dev, generic messages in prod

### 7. API Design
- **RESTful**: Resource-oriented endpoints following REST conventions
- **Consistent Response Format**: `{ success, data, message }` envelope
- **Standard HTTP Codes**: Meaningful status codes for different scenarios
- **Filtering**: Query parameters for list endpoints

### 8. Scalability Considerations
- **Stateless API**: JWT tokens make scaling horizontally trivial
- **MongoDB Sharding**: Can scale horizontally with sharding if needed
- **Service Layer**: Business logic isolated for potential extraction to microservices
- **Connection Pooling**: Mongoose manages connection pool automatically

### Assumptions
- **MongoDB Available**: Assumes MongoDB is running (local or cloud)
- **Small to Medium Scale**: Suitable for typical dashboard workloads
- **No complex transactions**: Single document operations sufficient
- **No full-text search**: Basic filtering only
- **Basic audit**: Timestamps present but no extended audit trail
- **No email verification**: Registration creates active account immediately
- **No rate limiting**: Would need middleware like `express-rate-limit` in production
- **No refresh tokens**: Single long-lived JWT token (7 days) for simplicity

## Testing

```bash
# Run tests
npm test
```

**Note**: Tests require a MongoDB instance running. The test suite uses an in-memory MongoDB mock or requires database access.

## Seeding Sample Data

To populate the database with sample users and financial records:

```bash
npm run seed
```

This will create:
- 3 users (admin, analyst1, viewer1)
- Sample financial records with test data across multiple months

**Default credentials after seeding:**
- Admin: `admin` / `admin123`
- Analyst: `analyst1` / `analyst123`
- Viewer: `viewer1` / `viewer123`

## Project Structure

```
finance-backend/
├── src/
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth & RBAC middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic layer
│   ├── validators/      # Request validation schemas
│   └── utils/           # Helper functions
├── .env                 # Environment variables (create from .env.example)
├── app.js               # Application entry point
├── package.json
└── README.md
```

## Future Enhancements

- Pagination support for record lists
- Advanced aggregation pipelines for analytics
- Full-text search with MongoDB Atlas Search
- Soft delete functionality
- Audit logging for all changes
- CSV export for records
- Email notifications for large transactions
- Caching layer (Redis) for dashboard summaries
- Rate limiting
- Refresh token mechanism
- API documentation with Swagger/OpenAPI
- Comprehensive test coverage

## License

MIT
