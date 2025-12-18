# 🔐 Authentication & Authorization Guide

## Overview

UMS Dental Platform menggunakan **JWT (JSON Web Token)** based authentication dengan role-based access control (RBAC).

## Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database

    Client->>API: POST /api/auth/login<br/>{email, password}
    API->>Database: Verify credentials
    Database-->>API: User data
    API-->>Client: {accessToken, refreshToken, user}
    
    Note over Client: Store tokens securely
    
    Client->>API: Request with<br/>Authorization: Bearer {token}
    API->>API: Verify JWT
    API-->>Client: Protected resource
```

## Getting Started

### 1. Register New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@student.com",
    "password": "password123",
    "kelas": "1A"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm4udfbk600011v3r86xkrxcf",
      "username": "johndoe",
      "email": "john@student.com",
      "role": "STUDENT",
      "totalPoints": 0
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "message": "User berhasil didaftarkan"
}
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ums.ac.id",
    "password": "admin123"
  }'
```

### 3. Use Token for Protected Endpoints
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Token Format

### Access Token Structure
```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "userId": "cm4udfbk600011v3r86xkrxcf",
  "email": "student@ums.ac.id",
  "role": "STUDENT",
  "iat": 1734182400,
  "exp": 1734186000
}
```

### Token Expiry
- **Access Token:** 15 minutes (900 seconds)
- **Refresh Token:** 7 days (604800 seconds)

## User Roles

### STUDENT
**Permissions:**
- ✅ View educational content (videos, comics, quizzes, games)
- ✅ Submit quizzes
- ✅ Track progress (views, reads, attempts)
- ✅ Earn points
- ✅ View leaderboard
- ✅ Update own profile
- ❌ Create/update/delete content
- ❌ Access admin endpoints

**Access Level:** Read-only + Self-tracking

### CONTENT_MANAGER
**Permissions:**
- ✅ All STUDENT permissions
- ✅ Create content (videos, quizzes, comics, games)
- ✅ Update own content
- ✅ Delete own content
- ✅ View basic analytics
- ❌ Modify other users' content
- ❌ Access superadmin endpoints

**Access Level:** CRUD for own content

### SUPER_ADMIN
**Permissions:**
- ✅ All CONTENT_MANAGER permissions
- ✅ Full CRUD on all content
- ✅ User management
- ✅ Platform analytics
- ✅ Block/unblock users

**Access Level:** Full system access

## Authorization Patterns

### Public Endpoints
No authentication required:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/videos` (list)
- `GET /api/comics` (list)
- `GET /api/quizzes` (list)
- `GET /api/games` (list)

### Student Protected Endpoints
Requires: Valid JWT token
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `POST /api/auth/change-password`
- `POST /api/videos/:id/view`
- `POST /api/quizzes/attempt`
- `GET /api/points/balance`
- `GET /api/leaderboard`

### Admin Only Endpoints
Requires: Admin or Content Manager role
- `POST /api/videos`
- `PUT /api/videos/:id`
- `DELETE /api/videos/:id`
- `POST /api/quizzes`
- `POST /api/comics`
- `POST /api/games`

### Super Admin Only Endpoints
Requires: Super Admin role
- `GET /api/users`
- `PUT /api/users/:id`
- `GET /api/analytics/overview`

## Authorization Checks

### Example Implementation

```typescript
// 1. Token Verification
const decoded = verifyToken(token);
if (!decoded) {
  return unauthorizedResponse();
}

// 2. Role Check
if (user.role !== 'SUPER_ADMIN' && user.role !== 'CONTENT_MANAGER') {
  return forbiddenResponse();
}

// 3. Ownership Check (for Content Managers)
if (user.role === 'CONTENT_MANAGER' && resource.createdById !== user.id) {
  return forbiddenResponse();
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token tidak ditemukan"
  }
}
```

**Causes:**
- Missing Authorization header
- Invalid token format
- Expired token
- Malformed JWT

**Solution:** Login again to get fresh token

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Hanya admin yang dapat mengakses resource ini"
  }
}
```

**Causes:**
- Insufficient role permissions
- Attempting to modify other user's content (for CM)

**Solution:** Check user role and permissions

## Security Best Practices

### Client-Side
1. **Store tokens securely**
   - Use httpOnly cookies (recommended)
   - Or localStorage with XSS protection
   
2. **Always use HTTPS in production**

3. **Include token in header**
   ```javascript
   headers: {
     'Authorization': `Bearer ${accessToken}`
   }
   ```

4. **Handle token expiry**
   ```javascript
   if (response.status === 401) {
     // Token expired, redirect to login
     window.location.href = '/login';
   }
   ```

### Server-Side
1. ✅ JWT signature verification
2. ✅ Token expiry validation
3. ✅ Null checks on decoded payload
4. ✅ Role-based access control
5. ✅ Ownership validation for resources

## Test Credentials

For testing purposes:

```yaml
Super Admin:
  email: admin@ums.ac.id
  password: admin123

Content Manager:
  email: content@ums.ac.id
  password: admin123

Student:
  email: andi@student.com
  password: student123
```

## Common Scenarios

### Scenario 1: Student Viewing Content
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"andi@student.com","password":"student123"}' \
  | jq -r '.data.tokens.accessToken')

# 2. View videos
curl -X GET http://localhost:3000/api/videos \
  -H "Authorization: Bearer $TOKEN"

# 3. Track video view (earn points)
curl -X POST http://localhost:3000/api/videos/{video_id}/view \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

### Scenario 2: Content Manager Creating Content
```bash
# 1. Login as CM
CM_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"content@ums.ac.id","password":"admin123"}' \
  | jq -r '.data.tokens.accessToken')

# 2. Create video
curl -X POST http://localhost:3000/api/videos \
  -H "Authorization: Bearer $CM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Educational Video",
    "description": "Learn about dental health",
    "youtubeUrl": "https://youtube.com/watch?v=abc123",
    "duration": 300,
    "targetGrade": "Kelas 2"
  }'

# 3. Update own video (allowed)
curl -X PUT http://localhost:3000/api/videos/{video_id} \
  -H "Authorization: Bearer $CM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

# 4. Cannot update other's video (403)
```

### Scenario 3: Admin Viewing Analytics
```bash
# 1. Login as admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ums.ac.id","password":"admin123"}' \
  | jq -r '.data.tokens.accessToken')

# 2. Get platform overview
curl -X GET http://localhost:3000/api/analytics/overview \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Token Refresh (Future Implementation)

While not currently implemented, here's the planned refresh flow:

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token_here"
  }
}
```

---

**Last Updated:** December 14, 2025  
**Version:** 1.0.0
