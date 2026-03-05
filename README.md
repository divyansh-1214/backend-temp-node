# 🚀 MERN Dual-DB Backend

A **production-ready** RESTful backend built with **Express.js**, featuring a dual-database architecture using **MongoDB** and **PostgreSQL**. Includes JWT authentication with refresh token rotation, role-based access control (RBAC), Swagger API docs, and a clean layered codebase.

---

## 📑 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Request Flow](#-request-flow)
- [Database Design](#-database-design)
- [Authentication & Authorization](#-authentication--authorization)
- [API Reference](#-api-reference)
  - [Health Check](#health-check)
  - [Auth Routes](#auth-routes)
  - [User Routes](#user-routes)
  - [Product Routes](#product-routes)
- [Standardized Response Format](#-standardized-response-format)
- [Middleware Pipeline](#-middleware-pipeline)
- [Error Handling](#-error-handling)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)

---

## 🏗 Architecture Overview

The backend follows a **layered service architecture** with clear separation of concerns:

```
Client Request
      │
      ▼
┌─────────────────────────────────────────────────────┐
│                    Express App                       │
│  ┌───────────┐  ┌──────┐  ┌────────┐  ┌──────────┐ │
│  │  Helmet   │→ │ CORS │→ │  Rate  │→ │  Body    │ │
│  │ (Security)│  │      │  │ Limiter│  │  Parser  │ │
│  └───────────┘  └──────┘  └────────┘  └──────────┘ │
│                       │                              │
│                       ▼                              │
│              ┌──────────────┐                        │
│              │  Morgan      │                        │
│              │  (Logger)    │                        │
│              └──────────────┘                        │
│                       │                              │
│                       ▼                              │
│  ┌────────────────────────────────────────────────┐  │
│  │               Routes Layer                     │  │
│  │  /api/auth  │  /api/users  │  /api/products    │  │
│  └─────────────┴──────────────┴───────────────────┘  │
│                       │                              │
│              ┌────────┼────────┐                     │
│              ▼        ▼        ▼                     │
│  ┌────────────┐ ┌──────────┐ ┌─────────────────┐    │
│  │ Validators │ │   Auth   │ │   Authorize     │    │
│  │   (Joi)    │ │Middleware│ │  (RBAC check)   │    │
│  └────────────┘ └──────────┘ └─────────────────┘    │
│                       │                              │
│                       ▼                              │
│            ┌────────────────────┐                    │
│            │  Controllers Layer │                    │
│            │  (Thin — delegates │                    │
│            │   to services)     │                    │
│            └────────────────────┘                    │
│                       │                              │
│                       ▼                              │
│            ┌────────────────────┐                    │
│            │   Services Layer   │                    │
│            │  (Business logic)  │                    │
│            └────────────────────┘                    │
│                    │       │                         │
│                    ▼       ▼                         │
│           ┌──────────┐ ┌───────────┐                 │
│           │ MongoDB  │ │PostgreSQL │                 │
│           │(Mongoose)│ │(Sequelize)│                 │
│           └──────────┘ └───────────┘                 │
│                                                      │
│            ┌────────────────────┐                    │
│            │  Error Middleware  │                    │
│            │ (Global handler)  │                    │
│            └────────────────────┘                    │
└─────────────────────────────────────────────────────┘
```

---

## 🧰 Tech Stack

| Category         | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Runtime          | Node.js                                        |
| Framework        | Express.js 4                                   |
| Auth             | JSON Web Tokens (access + refresh tokens)      |
| Validation       | Joi                                            |
| MongoDB ORM      | Mongoose 8                                     |
| PostgreSQL ORM   | Sequelize 6                                    |
| Password Hashing | bcryptjs                                       |
| Security         | Helmet, CORS, express-rate-limit, hpp, express-mongo-sanitize |
| Logging          | Morgan                                         |
| API Docs         | Swagger (swagger-jsdoc + swagger-ui-express)   |
| Dev Tools        | Nodemon                                        |

---

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.mongo.js          # MongoDB connection (Mongoose)
│   ├── db.postgres.js       # PostgreSQL connection (Sequelize)
│   ├── env.js               # Centralized environment config
│   └── swagger.js           # Swagger/OpenAPI specification
│
├── controllers/
│   ├── auth.controller.js   # Auth request handlers
│   ├── product.controller.js # Product request handlers
│   └── user.controller.js   # User request handlers
│
├── middleware/
│   ├── auth.middleware.js    # JWT authenticate & role authorize
│   ├── error.middleware.js   # Global error handler
│   ├── logger.middleware.js  # HTTP request logging (Morgan)
│   └── validate.middleware.js # Joi schema validation
│
├── models/
│   ├── mongo/
│   │   └── User.model.js    # User schema (MongoDB)
│   └── postgres/
│       └── Product.model.js # Product model (PostgreSQL)
│
├── routes/
│   ├── auth.routes.js       # /api/auth/*
│   ├── product.routes.js    # /api/products/*
│   └── user.routes.js       # /api/users/*
│
├── services/
│   ├── auth.service.js      # Auth business logic & token mgmt
│   ├── product.service.js   # Product CRUD & filtering logic
│   └── user.service.js      # User profile & admin operations
│
├── utils/
│   ├── ApiError.js          # Custom error class with HTTP codes
│   ├── ApiResponse.js       # Standardized response helper
│   └── asyncHandler.js      # Async wrapper (no try/catch needed)
│
├── validators/
│   ├── auth.validator.js    # Joi schemas for auth & user updates
│   └── product.validator.js # Joi schemas for products & queries
│
├── app.js                   # Express app setup & middleware chain
├── server.js                # Entry point — starts server & connects DBs
├── package.json
├── .env.example             # Sample environment variables
└── .gitignore
```

---

## 🔄 Request Flow

Every request passes through the following pipeline:

```
Request → Helmet → CORS → Rate Limiter → Mongo Sanitize → HPP
        → Body Parser → Morgan Logger → Route Matching
        → [Validator] → [Auth Middleware] → [Authorize]
        → Controller → Service → Database
        → ApiResponse (success) ─── or ─── Error Middleware (failure)
```

---

## 🗄 Database Design

### MongoDB — `User` Model

Managed via **Mongoose**. Stores user accounts and authentication data.

| Field          | Type     | Notes                                       |
| -------------- | -------- | ------------------------------------------- |
| `_id`          | ObjectId | Auto-generated                              |
| `name`         | String   | Required, 2–100 chars                       |
| `email`        | String   | Required, unique, lowercase                 |
| `password`     | String   | Hashed with bcrypt (salt rounds: 10)        |
| `avatar`       | String   | Optional URL                                |
| `role`         | String   | `user` \| `admin` \| `superadmin`           |
| `preferences`  | Mixed    | Free-form JSON object                       |
| `refreshToken` | String   | Hidden by default (`select: false`)         |
| `isDeleted`    | Boolean  | Soft-delete flag                            |
| `deletedAt`    | Date     | Timestamp of soft deletion                  |
| `createdAt`    | Date     | Auto (timestamps)                           |
| `updatedAt`    | Date     | Auto (timestamps)                           |

**Indexes:** `email`, `role`, `isDeleted`

### PostgreSQL — `Product` Model

Managed via **Sequelize**. Stores product catalog data.

| Field         | Type          | Notes                           |
| ------------- | ------------- | ------------------------------- |
| `id`          | UUID (v4)     | Primary key, auto-generated     |
| `name`        | STRING(255)   | Required, 1–255 chars           |
| `description` | TEXT          | Optional                        |
| `price`       | DECIMAL(10,2) | Required, ≥ 0                   |
| `stock`       | INTEGER       | Default: 0, ≥ 0                 |
| `category`    | STRING(100)   | Optional                        |
| `imageUrl`    | STRING(500)   | Optional, must be valid URL     |
| `isActive`    | BOOLEAN       | Default: `true` (soft-delete)   |
| `createdAt`   | TIMESTAMP     | Auto                            |
| `updatedAt`   | TIMESTAMP     | Auto                            |

**Indexes:** `category`, `isActive`, `price`, `name`

---

## 🔐 Authentication & Authorization

### Token Strategy

| Token          | Lifetime | Contains                    | Secret              |
| -------------- | -------- | --------------------------- | -------------------- |
| Access Token   | 15 min   | `id`, `email`, `role`       | `JWT_SECRET`         |
| Refresh Token  | 7 days   | `id`                        | `JWT_REFRESH_SECRET` |

### Auth Flow

```
1. Register / Login → receive accessToken + refreshToken
2. Attach accessToken as: Authorization: Bearer <token>
3. When accessToken expires → POST /api/auth/refresh with refreshToken
4. Old refresh token is blacklisted (MongoDB TTL collection)
5. Logout → blacklist refreshToken and clear from user record
```

### Roles (RBAC)

| Role         | Permissions                                        |
| ------------ | -------------------------------------------------- |
| `user`       | Own profile (view, update, change password)        |
| `admin`      | Everything `user` can + manage users & products    |
| `superadmin` | Everything `admin` can                             |

---

## 📡 API Reference

**Base URL:** `http://localhost:3000/api`

### Health Check

| Method | Endpoint       | Auth | Description          |
| ------ | -------------- | ---- | -------------------- |
| `GET`  | `/api/health`  | ❌   | Server health check  |

**Response:**

```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "environment": "development",
    "timestamp": "2026-03-06T00:00:00.000Z"
  },
  "errors": null
}
```

---

### Auth Routes

Base path: `/api/auth`

| Method | Endpoint          | Auth | Description                           |
| ------ | ----------------- | ---- | ------------------------------------- |
| `POST` | `/auth/register`  | ❌   | Register a new user                   |
| `POST` | `/auth/login`     | ❌   | Login with email & password           |
| `POST` | `/auth/refresh`   | ❌   | Refresh access & refresh tokens       |
| `POST` | `/auth/logout`    | 🔒   | Logout & blacklist refresh token      |

#### `POST /api/auth/register`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "user"           // optional — defaults to "user"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { "_id": "...", "name": "John Doe", "email": "john@example.com", "role": "user", ... },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  },
  "errors": null
}
```

**Error Responses:** `400` Validation error · `409` Email already exists

---

#### `POST /api/auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success Response (200):** Same shape as register.

**Error Responses:** `401` Invalid credentials

---

#### `POST /api/auth/refresh`

**Request Body:**

```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  },
  "errors": null
}
```

**Error Responses:** `401` Invalid / expired / revoked refresh token

---

#### `POST /api/auth/logout`

> 🔒 Requires `Authorization: Bearer <accessToken>`

**Request Body:**

```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null,
  "errors": null
}
```

---

### User Routes

Base path: `/api/users` — **All routes require authentication**

| Method   | Endpoint             | Auth      | Description                             |
| -------- | -------------------- | --------- | --------------------------------------- |
| `GET`    | `/users/me`          | 🔒        | Get own profile                         |
| `PUT`    | `/users/me`          | 🔒        | Update own profile                      |
| `PUT`    | `/users/me/password` | 🔒        | Change own password                     |
| `GET`    | `/users`             | 🔒 Admin  | List all users (paginated)              |
| `DELETE` | `/users/:id`         | 🔒 Admin  | Soft-delete a user                      |

#### `GET /api/users/me`

> 🔒 Requires `Authorization: Bearer <accessToken>`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "avatar": null,
      "preferences": {},
      "createdAt": "...",
      "updatedAt": "..."
    }
  },
  "errors": null
}
```

---

#### `PUT /api/users/me`

> 🔒 Requires `Authorization: Bearer <accessToken>`

**Request Body** (at least one field required):

```json
{
  "name": "Jane Doe",
  "avatar": "https://example.com/avatar.jpg",
  "preferences": { "theme": "dark" }
}
```

**Success Response (200):** Returns the updated user object.

---

#### `PUT /api/users/me/password`

> 🔒 Requires `Authorization: Bearer <accessToken>`

**Request Body:**

```json
{
  "oldPassword": "currentPassword",
  "newPassword": "newStrongPassword"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null,
  "errors": null
}
```

**Error Responses:** `400` Incorrect old password · `401` Not authenticated

---

#### `GET /api/users`

> 🔒 Requires `admin` or `superadmin` role

**Query Parameters:**

| Param     | Type    | Default | Description                 |
| --------- | ------- | ------- | --------------------------- |
| `page`    | integer | 1       | Page number                 |
| `limit`   | integer | 10      | Items per page (max 100)    |
| `search`  | string  | —       | Search by name or email     |
| `role`    | string  | —       | Filter by role              |
| `isDeleted` | boolean | false | Include soft-deleted users |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": { "users": [ ... ] },
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 },
  "errors": null
}
```

---

#### `DELETE /api/users/:id`

> 🔒 Requires `admin` or `superadmin` role

**Success Response (200):** Returns the deactivated user object.

**Error Responses:** `403` Forbidden · `404` User not found

---

### Product Routes

Base path: `/api/products`

| Method   | Endpoint          | Auth      | Description                                    |
| -------- | ----------------- | --------- | ---------------------------------------------- |
| `GET`    | `/products`       | ❌        | List products (filters, search, pagination)    |
| `GET`    | `/products/:id`   | ❌        | Get a single product by ID                     |
| `POST`   | `/products`       | 🔒 Admin  | Create a new product                           |
| `PUT`    | `/products/:id`   | 🔒 Admin  | Update a product                               |
| `DELETE` | `/products/:id`   | 🔒 Admin  | Soft-delete a product                          |

#### `GET /api/products`

**Query Parameters:**

| Param      | Type    | Default     | Description                              |
| ---------- | ------- | ----------- | ---------------------------------------- |
| `page`     | integer | 1           | Page number                              |
| `limit`    | integer | 10          | Items per page (max 100)                 |
| `sort`     | string  | `createdAt` | Sort field: `name`, `price`, `stock`, `category`, `createdAt`, `updatedAt` |
| `order`    | string  | `DESC`      | `ASC` or `DESC`                          |
| `search`   | string  | —           | Search in product name & category        |
| `category` | string  | —           | Filter by exact category (case-insensitive) |
| `minPrice` | number  | —           | Minimum price filter                     |
| `maxPrice` | number  | —           | Maximum price filter                     |
| `inStock`  | boolean | —           | `true` = stock > 0, `false` = stock = 0  |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "id": "a1b2c3d4-...",
        "name": "Wireless Headphones",
        "description": "Noise-cancelling over-ear headphones",
        "price": 49.99,
        "stock": 100,
        "category": "Electronics",
        "imageUrl": null,
        "isActive": true,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  },
  "pagination": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 },
  "errors": null
}
```

---

#### `GET /api/products/:id`

**Success Response (200):** Returns a single product object.

**Error Responses:** `404` Product not found

---

#### `POST /api/products`

> 🔒 Requires `admin` or `superadmin` role

**Request Body:**

```json
{
  "name": "Wireless Headphones",
  "description": "Noise-cancelling over-ear headphones",
  "price": 49.99,
  "stock": 100,
  "category": "Electronics",
  "imageUrl": "https://example.com/headphones.jpg",
  "isActive": true
}
```

**Required fields:** `name`, `price`

**Success Response (201):** Returns the created product object.

**Error Responses:** `400` Validation error · `401` Not authenticated · `403` Forbidden

---

#### `PUT /api/products/:id`

> 🔒 Requires `admin` or `superadmin` role

**Request Body** (at least one field):

```json
{
  "price": 39.99,
  "stock": 150
}
```

**Success Response (200):** Returns the updated product object.

**Error Responses:** `400` Validation error · `404` Product not found

---

#### `DELETE /api/products/:id`

> 🔒 Requires `admin` or `superadmin` role

Performs a **soft-delete** (sets `isActive = false`).

**Success Response (200):** Returns the deactivated product object.

**Error Responses:** `404` Product not found

---

## 📦 Standardized Response Format

Every API response follows this consistent shape:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... } | null,
  "errors": [ { "field": "email", "message": "..." } ] | null,
  "pagination": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 }  // only on lists
}
```

---

## 🛡 Middleware Pipeline

| Order | Middleware              | Purpose                                          |
| ----- | ----------------------- | ------------------------------------------------ |
| 1     | `helmet`                | Sets secure HTTP headers                         |
| 2     | `cors`                  | Configurable cross-origin resource sharing       |
| 3     | `express-rate-limit`    | 100 requests / 15 min per IP on `/api/*`         |
| 4     | `express-mongo-sanitize`| Prevents NoSQL injection attacks                 |
| 5     | `hpp`                   | Prevents HTTP parameter pollution                |
| 6     | `express.json`          | Parses JSON bodies (10 KB limit)                 |
| 7     | `express.urlencoded`    | Parses URL-encoded bodies (10 KB limit)          |
| 8     | `morgan`                | HTTP request logging (`dev` / `combined`)        |
| 9     | `validate`              | Joi schema validation (per-route)                |
| 10    | `authenticate`          | JWT verification & user attachment (per-route)   |
| 11    | `authorize`             | Role-based access check (per-route)              |
| 12    | `errorHandler`          | Global error handler (catches all)               |

---

## ⚠️ Error Handling

The global error handler catches errors from all layers and returns a standardized response:

| Error Type                             | HTTP Code | Notes                          |
| -------------------------------------- | --------- | ------------------------------ |
| `ApiError` (custom)                    | varies    | Operational errors             |
| Mongoose `ValidationError`            | 400       | Schema validation              |
| Mongoose duplicate key (`11000`)       | 409       | Unique field conflict          |
| Mongoose `CastError`                  | 400       | Invalid ObjectId               |
| Sequelize `ValidationError`           | 400       | Model validation               |
| Sequelize `UniqueConstraintError`     | 409       | Unique field conflict          |
| Sequelize `DatabaseError`            | 500       | Generic DB error               |
| `JsonWebTokenError`                   | 401       | Invalid token                  |
| `TokenExpiredError`                   | 401       | Expired token                  |
| Unknown error                          | 500       | Fallback (message hidden in prod) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local or Atlas)
- **PostgreSQL** (local or cloud)

### Installation

```bash
# 1. Clone the repo
git clone <repository-url>
cd backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your actual database credentials and secrets

# 4. Start in development mode
npm run dev
```

The server will start at `http://localhost:3000`.

### Swagger Docs

Once the server is running, visit:

- **Interactive UI:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Raw JSON spec:** [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)

---

## 🔧 Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/E-com-temp

# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=E-com-temp
PG_USER=your_pg_user
PG_PASSWORD=your_pg_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CLIENT_ORIGIN=http://localhost:3000
```

---

## 📜 Scripts

| Command         | Description                            |
| --------------- | -------------------------------------- |
| `npm start`     | Start the server (production)          |
| `npm run dev`   | Start with Nodemon (auto-reload)       |

---

## 📄 License

ISC
