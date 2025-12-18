# ⚠️ Error Handling Guide

Comprehensive guide untuk semua error codes, causes, dan solutions di UMS Dental Platform API.

## Error Response Format

Semua error mengikuti format standar:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message in Bahasa Indonesia"
  }
}
```

---

## HTTP Status Codes

| Status | Code | Category |
|--------|------|----------|
| 200 | OK | Success |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error/ invalid input |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 500 | Server Error | Internal server error |

---

## Error Codes Reference

### 1. UNAUTHORIZED (401)

#### Missing Token
**Response:**
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
- No `Authorization` header
- Header doesn't start with `Bearer`

**Solution:**
```bash
# ❌ Wrong
curl -X GET http://localhost:3000/api/auth/me

# ✅ Correct
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGc..."
```

#### Invalid Token
**Response:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token tidak valid atau expired"
  }
}
```

**Causes:**
- Token signature verification failed
- Token expired (>15 minutes)
- Malformed JWT

**Solution:**
- Login again to get fresh token
- Check token hasn't been tampered with

#### Invalid Credentials
**Response:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Email atau password salah"
  }
}
```

**Causes:**
- Wrong email or password during login

**Solution:**
- Verify credentials
- Use password reset if forgotten

---

### 2. FORBIDDEN (403)

#### Insufficient Role
**Response:**
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
- STUDENT trying to access admin endpoints
- Non-admin trying to create/update/delete content

**Example:**
```bash
# Student token trying to create video
curl -X POST http://localhost:3000/api/videos \
  -H "Authorization: Bearer {student_token}" \
  -d '{"title":"Test"}' 
# ❌ 403 Forbidden
```

**Solution:**
- Login with appropriate role (Admin/CM)
- Request admin privileges from super admin

#### Ownership Violation
**Response:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Anda hanya dapat mengupdate video yang Anda buat"
  }
}
```

**Causes:**
- Content Manager trying to modify another CM's content

**Solution:**
- Only modify your own content
- Request admin to make changes

---

### 3. NOT_FOUND (404)

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Video tidak ditemukan"
  }
}
```

**Causes:**
- Resource ID doesn't exist
- Resource was deleted
- Typo in ID

**Example:**
```bash
curl -X GET http://localhost:3000/api/videos/invalid_id
# ❌ 404 Not Found
```

**Solution:**
- Verify resource ID is correct
- Check resource exists via list endpoint first

**Variations:**
- "Video tidak ditemukan"
- "Komik tidak ditemukan"
- "Game tidak ditemukan"
- "Quiz tidak ditemukan"
- "User tidak ditemukan"

---

### 4. VALIDATION_ERROR (400)

#### Missing Required Fields
**Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": {
      "title": {
        "_errors": ["Required"]
      },
      "youtubeUrl": {
        "_errors": ["Required"]
      }
    }
  }
}
```

**Causes:**
- Missing required fields in request body
- Zod schema validation failed

**Example:**
```bash
# Missing required fields
curl -X POST http://localhost:3000/api/videos \
  -H "Authorization: Bearer {admin_token}" \
  -d '{"description":"Test"}'
# ❌ Missing title, youtubeUrl, duration
```

**Solution:**
- Include all required fields
- Check API documentation for requirements

#### Invalid Field Format
**Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": {
      "email": {
        "_errors": ["Invalid email"]
      },
      "password": {
        "_errors": ["String must contain at least 6 character(s)"]
      }
    }
  }
}
```

**Causes:**
- Invalid email format
- Password too short (<6 chars)
- Invalid URL format
- Invalid enum value

**Example:**
```bash
# Invalid email
curl -X POST http://localhost:3000/api/auth/register \
  -d '{"email":"invalid-email","password":"123"}'
# ❌ Invalid email & password too short
```

**Solution:**
- Use valid email format
- Password minimum 6 characters
- Check enum values (EASY|MEDIUM|HARD)

#### Duplicate Entry
**Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email sudah terdaftar"
  }
}
```

**Causes:**
- Trying to register with existing email
- Unique constraint violation

**Solution:**
- Use different email
- Login instead if account exists

---

### 5. SERVER_ERROR (500)

**Response:**
```json
{
  "success": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "Terjadi kesalahan pada server"
  }
}
```

**Causes:**
- Database connection failed
- Unexpected exception
- Bug in server code

**Solution:**
- Retry the request
- Contact support if persists
- Check server logs

**Specific Messages:**
- "Terjadi kesalahan saat membuat video"
- "Terjadi kesalahan saat mengupdate quiz"
- "Terjadi kesalahan saat menghapus komik"

---

## Error Handling by Endpoint

### Authentication Errors

| Endpoint | Error | Status | Message |
|----------|-------|--------|---------|
| POST /api/auth/register | Duplicate email | 400 | "Email sudah terdaftar" |
| POST /api/auth/register | Duplicate username | 400 | "Username sudah digunakan" |
| POST /api/auth/login | Wrong credentials | 401 | "Email atau password salah" |
| POST /api/auth/login | Blocked user | 403 | "Akun Anda telah diblokir" |
| POST /api/auth/change-password | Wrong current password | 401 | "Password lama tidak sesuai" |

### Content Access Errors

| Endpoint | Error | Status | Message |
|----------|-------|--------|---------|
| POST /api/videos | Not admin | 403 | "Hanya admin/content manager yang dapat membuat video" |
| PUT /api/videos/:id | Not owner | 403 | "Anda hanya dapat mengupdate video yang Anda buat" |
| GET /api/videos/:id | Not found | 404 | "Video tidak ditemukan" |
| POST /api/videos/:id/view | Not student | 403 | "Endpoint ini hanya untuk student" |

### Tracking Errors

| Endpoint | Error | Status | Message |
|----------|-------|--------|---------|
| POST /api/videos/:id/view | Video not found | 404 | "Video tidak ditemukan" |
| POST /api/comics/:id/read | Comic not found | 404 | "Komik tidak ditemukan" |
| POST /api/games/:id/click | Game not found | 404 | "Game tidak ditemukan" |

---

## Error Handling Best Practices

### Client-Side

#### 1. Always Check Response Success
```javascript
const response = await fetch('/api/videos', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await response.json();

if (!data.success) {
  // Handle error
  console.error('API Error:', data.error.message);
  showErrorToUser(data.error.message);
}
```

#### 2. Handle Specific Status Codes
```javascript
try {
  const response = await fetch('/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (response.status === 401) {
    // Token expired, redirect to login
    window.location.href = '/login';
    return;
  }

  if (response.status === 403) {
    // Insufficient permissions
    showError('You don\'t have permission to access this resource');
    return;
  }

  const data = await response.json();
  // Process successful response
} catch (error) {
  // Network error
  showError('Network error. Please check your connection.');
}
```

#### 3. Retry Logic for Server Errors
```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 500 && i < maxRetries - 1) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

#### 4. Display User-Friendly Messages
```javascript
const ERROR_MESSAGES = {
  'Token tidak ditemukan': 'Please login to continue',
  'Token tidak valid atau expired': 'Your session has expired. Please login again',
  'Email sudah terdaftar': 'This email is already registered',
  'Email atau password salah': 'Invalid email or password',
};

function showError(apiMessage) {
  const userMessage = ERROR_MESSAGES[apiMessage] || apiMessage;
  alert(userMessage);
}
```

### Server-Side

#### Error Logging
```typescript
catch (error) {
  console.error('Create video error:', {
    error: error.message,
    stack: error.stack,
    userId: decoded.userId,
    timestamp: new Date().toISOString()
  });
  return serverErrorResponse('Terjadi kesalahan saat membuat video');
}
```

---

## Testing Error Scenarios

### 1. Test Unauthorized Access
```bash
# Test without token
curl -X GET http://localhost:3000/api/auth/me
# Expected: 401 Unauthorized

# Test with invalid token
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer invalid_token"
# Expected: 401 Unauthorized
```

### 2. Test Forbidden Access
```bash
# Student trying to create video
curl -X POST http://localhost:3000/api/videos \
  -H "Authorization: Bearer {student_token}" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'
# Expected: 403 Forbidden
```

### 3. Test Validation Errors
```bash
# Missing required fields
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{}'
# Expected: 400 Validation Error

# Invalid email format
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"123456"}'
# Expected: 400 Validation Error
```

### 4. Test Not Found
```bash
# Invalid resource ID
curl -X GET http://localhost:3000/api/videos/nonexistent_id
# Expected: 404 Not Found
```

---

## Common Error Scenarios & Solutions

### Scenario 1: "Token tidak ditemukan"
**Problem:** Forgot to include Authorization header

**Fix:**
```bash
# ❌ Wrong
curl -X GET http://localhost:3000/api/points/balance

# ✅ Correct
curl -X GET http://localhost:3000/api/points/balance \
  -H "Authorization: Bearer {your_token}"
```

### Scenario 2: "Hanya admin yang dapat mengakses"
**Problem:** Using student token for admin endpoint

**Fix:**
```bash
# Login as admin first
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ums.ac.id","password":"admin123"}' \
  | jq -r '.data.tokens.accessToken')

# Then use admin token
curl -X POST http://localhost:3000/api/videos \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{...}'
```

### Scenario 3: "Email sudah terdaftar"
**Problem:** Trying to register with existing email

**Fix:**
```bash
# Option 1: Use different email
curl -X POST http://localhost:3000/api/auth/register \
  -d '{"email":"newemail@student.com",...}'

# Option 2: Login instead
curl -X POST http://localhost:3000/api/auth/login \
  -d '{"email":"existing@student.com","password":"..."}'
```

### Scenario 4: Validation Error with Zod
**Problem:** Invalid field values

**Fix:**
```bash
# ❌ Wrong - password too short
curl -X POST http://localhost:3000/api/auth/register \
  -d '{"email":"test@test.com","password":"123"}'

# ✅ Correct - password >= 6 chars
curl -X POST http://localhost:3000/api/auth/register \
  -d '{"email":"test@test.com","password":"123456"}'
```

---

## Error Code Quick Reference

| Code | Status | When to Use |
|------|--------|-------------|
| UNAUTHORIZED | 401 | Missing/invalid token, wrong credentials |
| FORBIDDEN | 403 | Insufficient role, ownership violation |
| NOT_FOUND | 404 | Resource doesn't exist |
| VALIDATION_ERROR | 400 | Invalid input, missing fields, format errors |
| SERVER_ERROR | 500 | Unexpected errors, database issues |

---

## Debugging Tips

### 1. Enable Verbose Logging
```bash
# Add -v flag to curl for full request/response
curl -v -X GET http://localhost:3000/api/videos \
  -H "Authorization: Bearer {token}"
```

### 2. Check Response Headers
```bash
curl -i -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer {token}"
# Check Content-Type, status code, etc.
```

### 3. Validate JWT Token
```bash
# Decode JWT to check expiry
echo "eyJhbGc..." | cut -d. -f2 | base64 -d | jq .
```

### 4. Test with Postman
- Import `postman_collection.json`
- Check Console for detailed error info
- Use Tests tab to validate responses

---

**Last Updated:** December 14, 2025  
**Version:** 1.0.0  
**Error Codes Documented:** 5 main codes + variations
