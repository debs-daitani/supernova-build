# Authentication API Documentation

## Overview

The dAItaniverse platform uses JWT (JSON Web Tokens) for authentication. Tokens are valid for 7 days and can be sent either as Bearer tokens in the Authorization header or as httpOnly cookies.

## Base URL

```
/api/auth
```

## Authentication Flow

1. **Register** → Receive JWT token
2. **Login** → Receive JWT token
3. **Use token** → Access protected endpoints
4. **Refresh** → Get new JWT token (optional)
5. **Logout** → Invalidate session

---

## Endpoints

### 1. Register

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "Jane Doe",
  "preferredName": "Jane",
  "pronouns": "she/her"
}
```

**Validation Rules:**
- `email`: Valid email format, will be normalized to lowercase
- `password`: Minimum 8 characters
- `fullName`: Required, cannot be empty
- `preferredName`: Required, cannot be empty
- `pronouns`: Optional

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid123...",
      "email": "user@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "profile": {
        "id": "cuid456...",
        "userId": "cuid123...",
        "fullName": "Jane Doe",
        "preferredName": "Jane",
        "pronouns": "she/her",
        "onboardingCompleted": false,
        "firstInteractionAt": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

---

### 2. Login

Authenticate with existing credentials.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid123...",
      "email": "user@example.com",
      "profile": { ... },
      "subscription": {
        "id": "cuid789...",
        "tier": {
          "name": "BOLD",
          "price": 26.00,
          "features": { ... }
        },
        "status": "active"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

### 3. Get Current User

Get the authenticated user's details.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid123...",
      "email": "user@example.com",
      "profile": { ... },
      "subscription": { ... }
    }
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

---

### 4. Logout

Invalidate the current session.

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 5. Request Password Reset

Request a password reset token.

**Endpoint:** `POST /api/auth/password-reset/request`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "If an account exists, a password reset email will be sent"
}
```

**Development Mode:**
In development (NODE_ENV !== 'production'), the response also includes:
```json
{
  "success": true,
  "message": "Password reset email sent",
  "resetToken": "a1b2c3d4e5f6..."
}
```

**Note:** For security, the endpoint always returns success even if the email doesn't exist.

---

### 6. Confirm Password Reset

Reset password using the reset token.

**Endpoint:** `POST /api/auth/password-reset/confirm`

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "NewSecurePassword456!"
}
```

**Validation Rules:**
- `token`: Required
- `newPassword`: Minimum 8 characters

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid or expired reset token"
}
```

**Note:** All existing sessions are invalidated when password is reset.

---

### 7. Refresh Token

Get a new JWT token.

**Endpoint:** `POST /api/auth/refresh`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Authentication Methods

### 1. Authorization Header (Recommended for API clients)

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. HttpOnly Cookie (Recommended for web browsers)

The server automatically sets an httpOnly cookie on successful login/register:

```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...;
            HttpOnly;
            Secure;
            SameSite=Strict;
            Max-Age=604800
```

**Cookie Properties:**
- `HttpOnly`: Prevents JavaScript access (XSS protection)
- `Secure`: Only sent over HTTPS (production)
- `SameSite=Strict`: CSRF protection
- `Max-Age=604800`: 7 days expiry

---

## Security Features

### Password Security
- Passwords hashed with bcrypt (10 salt rounds)
- Minimum 8 characters required
- Passwords never returned in API responses

### Token Security
- JWT tokens expire after 7 days
- Tokens signed with secret key (JWT_SECRET)
- Sessions stored in database for invalidation
- All sessions invalidated on password reset

### Input Validation
- Email normalization and validation
- Request body validation with express-validator
- SQL injection prevention via Prisma

### Rate Limiting (Recommended)
Consider implementing rate limiting on:
- Login endpoint (prevent brute force)
- Password reset endpoint (prevent abuse)
- Registration endpoint (prevent spam)

---

## Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created (registration successful) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (authentication required/failed) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found (user not found) |
| 500 | Internal Server Error |

---

## Example Usage

### JavaScript (Fetch API)

```javascript
// Register
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!',
    fullName: 'Jane Doe',
    preferredName: 'Jane',
    pronouns: 'she/her'
  }),
  credentials: 'include' // Include cookies
});

const data = await response.json();
const token = data.data.token;

// Use token in subsequent requests
const userResponse = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  },
  credentials: 'include'
});
```

### cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "fullName": "Jane Doe",
    "preferredName": "Jane",
    "pronouns": "she/her"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }' \
  -c cookies.txt

# Get current user (using cookie)
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

---

## Environment Variables

Required environment variables in `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/daitaniverse"
NODE_ENV="development"
JWT_SECRET="your-secret-key-generate-with-crypto"
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Testing

Run the authentication test suite:

```bash
cd server
node src/test-auth.js
```

This will test:
- User registration
- User login
- Invalid login attempts
- Password reset request
- Password reset confirmation
- Login with new password
- Session validation
- Logout functionality

---

## Next Steps

After implementing authentication, you can:
1. Add tier-based access control with `requireTier()` middleware
2. Implement rate limiting
3. Add email verification
4. Set up password complexity rules
5. Implement 2FA/MFA
6. Add OAuth providers (Google, GitHub, etc.)
