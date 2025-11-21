# dAItaniverse Express Server

**VERSE-005: Express Server** - Complete Backend Infrastructure for The dAItaniverse Platform

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Overview

This is the main Express server that powers the dAItaniverse platform, featuring:

- ✅ **Express.js** - Fast, minimal web framework
- ✅ **Prisma ORM** - Type-safe database access
- ✅ **PostgreSQL/SQLite** - Flexible database support
- ✅ **Security** - Helmet, CORS, and secure headers
- ✅ **Error Handling** - Centralized error management with Prisma error support
- ✅ **Logging** - Morgan HTTP request logging
- ✅ **Compression** - Response compression for better performance
- ✅ **Graceful Shutdown** - Proper cleanup on SIGTERM/SIGINT
- ✅ **Health Checks** - Database and server health monitoring

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Project Structure

```
server/
├── src/
│   ├── server.js           # Main server file
│   ├── routes/
│   │   └── auth.js         # Authentication routes
│   ├── middleware/
│   │   └── errorHandler.js # Error handling middleware
│   ├── utils/
│   │   └── database.js     # Database connection utility
│   └── config/             # Configuration files
├── prisma/
│   └── schema.prisma       # Prisma database schema
├── .env                    # Environment variables (not committed)
└── .env.example            # Example environment variables
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your database connection and other settings.

### 3. Set Up Database

For PostgreSQL (Production):
```bash
# Update DATABASE_URL in .env to PostgreSQL connection string
# Example: DATABASE_URL="postgresql://user:password@localhost:5432/daitaniverse"

# Update prisma/schema.prisma datasource provider to "postgresql"

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

For SQLite (Development):
```bash
# DATABASE_URL is already set to SQLite in .env
# Provider is already set to "sqlite" in schema.prisma

# Generate Prisma client
npm run prisma:generate

# Create database
npx prisma db push
```

### 4. Start Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## API Endpoints

### Health Check

**GET** `/health`

Returns server and database health status.

```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-21T03:47:00.000Z",
  "environment": "development",
  "database": {
    "status": "healthy",
    "connected": true
  },
  "server": {
    "uptime": 123.45,
    "memory": {...},
    "version": "v18.0.0"
  }
}
```

### Authentication Routes

All auth routes are prefixed with `/api/auth`:

- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user
- **POST** `/api/auth/logout` - Logout user
- **GET** `/api/auth/me` - Get current user
- **POST** `/api/auth/refresh` - Refresh access token
- **POST** `/api/auth/forgot-password` - Request password reset
- **POST** `/api/auth/reset-password` - Reset password with token

> **Note:** Auth routes currently return placeholder responses. Full implementation coming in future VERSES.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Configuration

### Environment Variables

See `.env.example` for all available configuration options.

Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | Database connection string | - |
| `FRONTEND_URL` | Frontend URL for CORS | - |
| `JWT_SECRET` | Secret for JWT signing | - |

### CORS Configuration

The server allows requests from:
- `http://localhost:3000` (Frontend dev server)
- `http://localhost:5173` (Vite dev server)
- Custom frontend URL from `FRONTEND_URL` env variable

Credentials (cookies) are enabled for all allowed origins.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Middleware Stack

The server uses the following middleware (in order):

1. **Helmet** - Security headers
2. **CORS** - Cross-origin resource sharing
3. **Morgan** - HTTP request logging
4. **express.json()** - JSON body parsing (10MB limit)
5. **express.urlencoded()** - URL-encoded body parsing
6. **cookie-parser** - Cookie parsing
7. **Compression** - Response compression

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Error Handling

The server includes comprehensive error handling:

### Prisma Error Handling

Automatically converts Prisma errors to user-friendly messages:

- `P2002` - Unique constraint violation → 409 Conflict
- `P2025` - Record not found → 404 Not Found
- `P2003` - Foreign key violation → 400 Bad Request
- `P2014` - Invalid ID → 400 Bad Request

### JWT Error Handling

- `JsonWebTokenError` → 401 Unauthorized
- `TokenExpiredError` → 401 Unauthorized

### Environment-Based Responses

**Development:**
- Full error details
- Stack traces
- Error objects

**Production:**
- Clean error messages
- No sensitive information
- Generic 500 errors for unexpected issues

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Database

### Prisma Schema

The server uses Prisma ORM with the following models:

- **User** - User accounts with authentication
- **Session** - User sessions and tokens

### Prisma Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Create and apply migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Push schema changes without migrations (dev only)
npx prisma db push

# Reset database
npx prisma migrate reset
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Graceful Shutdown

The server handles shutdown signals gracefully:

1. Receives `SIGTERM` or `SIGINT`
2. Stops accepting new requests
3. Completes in-flight requests
4. Disconnects from database
5. Exits process

Forced shutdown after 30 seconds if graceful shutdown fails.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Development

### Running in Development

```bash
npm run dev
```

This starts the server with nodemon for auto-reload on file changes.

### Logging

Development mode includes detailed logging:
- HTTP requests (Morgan 'dev' format)
- Prisma queries
- Database operations
- Error stack traces

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Production

### Running in Production

```bash
npm start
```

Production mode optimizations:
- Minimal logging (Morgan 'combined' format)
- Error logging only (Prisma)
- Compressed responses
- Clean error messages

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production `DATABASE_URL`
- [ ] Set strong `JWT_SECRET`
- [ ] Configure `FRONTEND_URL`
- [ ] Run database migrations
- [ ] Set up process manager (PM2, systemd)
- [ ] Configure reverse proxy (nginx, Apache)
- [ ] Set up SSL/TLS certificates
- [ ] Enable monitoring and logging
- [ ] Configure backup strategy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Testing

Test the server is running:

```bash
# Health check
curl http://localhost:3000/health

# Root endpoint
curl http://localhost:3000/

# Auth endpoint (placeholder)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Success Criteria

- ✅ Server starts successfully
- ✅ Database connects on startup
- ✅ Auth routes mounted at /api/auth
- ✅ CORS configured properly
- ✅ Error handling catches all errors
- ✅ Health check returns 200
- ✅ Morgan logs requests in dev
- ✅ Helmet security headers applied
- ✅ Graceful shutdown on SIGINT/SIGTERM
- ✅ Ready for VERSE-006 (Subscription System)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Next Steps

**VERSE-006: Subscription System** will build upon this foundation to add:
- Subscription plans and tiers
- Payment processing
- Billing management
- Usage tracking
- Feature gating

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL/SQLite** - Database
- **Helmet** - Security middleware
- **Morgan** - HTTP logger
- **CORS** - Cross-origin support
- **Compression** - Response compression
- **Cookie Parser** - Cookie handling
- **dotenv** - Environment variables

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Support

For issues or questions, refer to the main repository documentation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
