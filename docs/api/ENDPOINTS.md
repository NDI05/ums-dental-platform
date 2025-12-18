# 📡 API Endpoints Reference

Quick reference untuk semua 38 backend endpoints UMS Dental Platform.

## Base URL
- **Development:** `http://localhost:3000`
- **Production:** `https://api.ums-dental.ac.id`

## Legend
- 🔓 = Public (no auth)
- 🔐 = Requires token
- 👑 = Admin/CM only
- ⚡ = Super Admin only

---

## Authentication (6 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | 🔓 | Register new student |
| POST | `/api/auth/login` | 🔓 | Login & get JWT token |
| GET | `/api/auth/me` | 🔐 | Get current user profile |
| PUT | `/api/auth/profile` | 🔐 | Update profile |
| POST | `/api/auth/change-password` | 🔐 | Change password |
| POST | `/api/auth/logout` | 🔐 | Logout user |

---

## Videos (5 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/videos` | 🔓 | List videos (paginated) |
| GET | `/api/videos/:id` | 🔓 | Get video details |
| POST | `/api/videos/:id/view` | 🔐 | Track video view (+10pts) |
| POST | `/api/videos` | 👑 | Create new video |
| PUT | `/api/videos/:id` | 👑 | Update video |
| DELETE | `/api/videos/:id` | 👑 | Delete video |

**Query Parameters (GET /api/videos):**
- `page` (int, default: 1)
- `limit` (int, default: 10, max: 100)
- `search` (string) - Search in title/description
- `targetGrade` (string) - Filter by grade

---

## Quizzes (6 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/quizzes` | 🔓 | List quiz questions |
| POST | `/api/quizzes/attempt` | 🔐 | Submit quiz attempt (+50pts) |
| GET | `/api/quizzes/attempts` | 🔐 | Get quiz history |
| POST | `/api/quizzes` | 👑 | Create quiz question |
| PUT | `/api/quizzes/:id` | 👑 | Update quiz |
| DELETE | `/api/quizzes/:id` | 👑 | Delete quiz |

**Query Parameters (GET /api/quizzes):**
- `page`, `limit`
- `category` (string)
- `difficulty` (EASY|MEDIUM|HARD)

---

## Comics (5 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/comics` | 🔓 | List comics (paginated) |
| GET | `/api/comics/:id` | 🔓 | Get comic with pages |
| POST | `/api/comics/:id/read` | 🔐 | Track comic reading (+20pts) |
| POST | `/api/comics` | 👑 | Create comic with pages |
| PUT | `/api/comics/:id` | 👑 | Update comic metadata |
| DELETE | `/api/comics/:id` | 👑 | Delete comic |

**Query Parameters (GET /api/comics):**
- `page`, `limit`
- `search` (string)
- `category` (string)

---

## Games (4 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/games` | 🔓 | List mini games |
| POST | `/api/games/:id/click` | 🔐 | Track game play (+5pts) |
| POST | `/api/games` | 👑 | Create new game |
| PUT | `/api/games/:id` | 👑 | Update game |
| DELETE | `/api/games/:id` | 👑 | Delete game |

**Query Parameters (GET /api/games):**
- `page`, `limit`
- `difficulty` (EASY|MEDIUM|HARD)

---

## Gamification (4 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/points/balance` | 🔐 | Get current points & rank |
| GET | `/api/points/history` | 🔐 | Get point transaction history |
| GET | `/api/leaderboard` | 🔐 | Global leaderboard (top 100) |
| GET | `/api/leaderboard/class/:kelas` | 🔐 | Class leaderboard |

**Point Rewards:**
- Video View (completed): +10 pts
- Quiz Attempt (passed): +50 pts  
- Comic Read (completed): +20 pts
- Game Play: +5 pts per session

---

## User Management (3 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | ⚡ | List all users (admin) |
| GET | `/api/users/:id` | ⚡ | Get user details |
| GET | `/api/analytics/overview` | 👑 | Platform analytics |

**Query Parameters (GET /api/users):**
- `page`, `limit`
- `role` (STUDENT|CONTENT_MANAGER|SUPER_ADMIN)
- `kelas` (string)
- `search` (string)

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description in Bahasa Indonesia"
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | When It Occurs |
|------|---------|----------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

---

## Rate Limiting (Future)

Planned rate limits:
- **Public endpoints:** 100 requests/minute
- **Authenticated endpoints:** 500 requests/minute  
- **Admin endpoints:** 1000 requests/minute

---

## Pagination Pattern

All list endpoints support pagination:

**Request:**
```
GET /api/videos?page=2&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "page": 2,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

**Last Updated:** December 14, 2025  
**API Version:** 1.0.0  
**Total Endpoints:** 38
