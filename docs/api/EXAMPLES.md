# 📘 API Examples - Request & Response Samples

Comprehensive examples untuk semua endpoint categories di UMS Dental Platform API.

## Table of Contents
- [Authentication Examples](#authentication-examples)
- [Video Examples](#video-examples)
- [Quiz Examples](#quiz-examples)
- [Comic Examples](#comic-examples)
- [Game Examples](#game-examples)
- [Gamification Examples](#gamification-examples)
- [Admin Examples](#admin-examples)

---

## Authentication Examples

### 1. Register New Student

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "budi_santoso",
    "email": "budi@student.com",
    "password": "password123",
    "kelas": "2B"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm4xyz123",
      "username": "budi_santoso",
      "email": "budi@student.com",
      "role": "STUDENT",
      "kelas": "2B",
      "totalPoints": 0,
      "avatarUrl": null,
      "isBlocked": false,
      "createdAt": "2025-12-14T14:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbTR4eXoxMjMiLCJlbWFpbCI6ImJ1ZGlAc3R1ZGVudC5jb20iLCJyb2xlIjoiU1RVREVOVCIsImlhdCI6MTczNDE4MjQwMCwiZXhwIjoxNzM0MTgzMzAwfQ.signature",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh_payload.signature"
    }
  },
  "message": "User berhasil didaftarkan"
}
```

**Error Response - Email Already Exists (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email sudah terdaftar"
  }
}
```

### 2. Login

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ums.ac.id",
    "password": "admin123"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "admin001",
      "username": "Super Admin",
      "email": "admin@ums.ac.id",
      "role": "SUPER_ADMIN",
      "totalPoints": 0
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  },
  "message": "Login berhasil"
}
```

### 3. Get Current User Profile

**Request:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cm4xyz123",
    "username": "budi_santoso",
    "email": "budi@student.com",
    "role": "STUDENT",
    "kelas": "2B",
    "totalPoints": 125,
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=budi",
    "createdAt": "2025-12-14T14:00:00.000Z"
  },
  "message": "Berhasil mengambil data user"
}
```

### 4. Update Profile

**Request:**
```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "budi_updated",
    "kelas": "3A",
    "avatarUrl": "https://example.com/avatar.jpg"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cm4xyz123",
    "username": "budi_updated",
    "kelas": "3A",
    "avatarUrl": "https://example.com/avatar.jpg",
    "totalPoints": 125
  },
  "message": "Profile berhasil diupdate"
}
```

---

## Video Examples

### 1. List Videos (Paginated)

**Request:**
```bash
curl -X GET "http://localhost:3000/api/videos?page=1&limit=10&search=gigi" \
  -H "Content-Type: application/json"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "video001",
        "youtubeId": "dQw4w9WgXcQ",
        "title": "Cara Menyikat Gigi yang Benar",
        "description": "Tutorial lengkap teknik menyikat gigi untuk anak-anak",
        "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        "category": "Kelas 1",
        "keyPoints": [
          "Sikat 2x sehari",
          "Gerakan memutar",
          "Jangan terlalu keras"
        ],
        "viewCount": 45,
        "isPublished": true,
        "publishedAt": "2025-12-01T10:00:00.000Z",
        "createdAt": "2025-11-28T08:00:00.000Z",
        "createdBy": {
          "id": "cm001",
          "username": "Content Manager"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  },
  "message": "Berhasil mengambil daftar video"
}
```

### 2. Track Video View (Student)

**Request:**
```bash
curl -X POST http://localhost:3000/api/videos/video001/view \
  -H "Authorization: Bearer {student_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

**Success Response - First View (200):**
```json
{
  "success": true,
  "data": {
    "videoView": {
      "id": "view001",
      "userId": "student123",
      "videoId": "video001",
      "completed": true,
      "watchedAt": "2025-12-14T14:30:00.000Z"
    },
    "pointsEarned": 10,
    "newTotalPoints": 135
  },
  "message": "Video view berhasil dicatat. Anda mendapat 10 poin!"
}
```

**Success Response - Duplicate View (200):**
```json
{
  "success": true,
  "data": {
    "videoView": {
      "id": "view001",
      "completed": true,
      "watchedAt": "2025-12-14T14:30:00.000Z"
    },
    "pointsEarned": 0,
    "newTotalPoints": 135
  },
  "message": "Video view berhasil diupdate"
}
```

### 3. Create Video (Admin)

**Request:**
```bash
curl -X POST http://localhost:3000/api/videos \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pentingnya Flossing untuk Anak",
    "description": "Mengapa benang gigi penting untuk kesehatan mulut",
    "youtubeUrl": "https://www.youtube.com/watch?v=abc123xyz",
    "duration": 420,
    "targetGrade": "Kelas 2",
    "pointReward": 15
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "video_new_001",
    "youtubeId": "abc123xyz",
    "title": "Pentingnya Flossing untuk Anak",
    "description": "Mengapa benang gigi penting untuk kesehatan mulut",
    "thumbnailUrl": "https://img.youtube.com/vi/abc123xyz/maxresdefault.jpg",
    "category": "Kelas 2",
    "keyPoints": [],
    "viewCount": 0,
    "isPublished": false,
    "createdById": "admin001",
    "createdAt": "2025-12-14T14:45:00.000Z",
    "createdBy": {
      "id": "admin001",
      "username": "Super Admin"
    }
  },
  "message": "Video berhasil dibuat"
}
```

### 4. Update Video (Admin/CM Owner)

**Request:**
```bash
curl -X PUT http://localhost:3000/api/videos/video001 \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Cara Menyikat Gigi - Updated",
    "description": "Tutorial lengkap dengan animasi baru"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "video001",
    "title": "Cara Menyikat Gigi - Updated",
    "description": "Tutorial lengkap dengan animasi baru",
    "updatedAt": "2025-12-14T15:00:00.000Z"
  },
  "message": "Video berhasil diupdate"
}
```

---

## Quiz Examples

### 1. List Quizzes

**Request:**
```bash
curl -X GET "http://localhost:3000/api/quizzes?difficulty=EASY&limit=5"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "quiz001",
        "question": "Apakah menyikat gigi harus dilakukan minimal 2 kali sehari?",
        "category": "DENTAL_HYGIENE",
        "difficulty": "EASY",
        "createdAt": "2025-12-01T10:00:00.000Z"
      },
      {
        "id": "quiz002",
        "question": "Apakah makan permen setiap hari baik untuk gigi?",
        "category": "DENTAL_HYGIENE",
        "difficulty": "EASY",
        "createdAt": "2025-12-01T10:05:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 5,
      "totalPages": 1
    }
  },
  "message": "Berhasil mengambil daftar kuis"
}
```

### 2. Submit Quiz Attempt

**Request:**
```bash
curl -X POST http://localhost:3000/api/quizzes/attempt \
  -H "Authorization: Bearer {student_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "questionId": "quiz001",
        "answer": true
      },
      {
        "questionId": "quiz002",
        "answer": false
      }
    ],
    "timeSpent": 120
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "attempt": {
      "id": "attempt001",
      "score": 100,
      "totalQuestions": 2,
      "correctAnswers": 2,
      "timeSpent": 120,
      "completedAt": "2025-12-14T15:30:00.000Z"
    },
    "pointsEarned": 50,
    "newTotalPoints": 185,
    "isPassed": true
  },
  "message": "Kuis berhasil diselesaikan! Score: 100%. Anda mendapat 50 poin!"
}
```

### 3. Create Quiz Question (Admin)

**Request:**
```bash
curl -X POST http://localhost:3000/api/quizzes \
  -H "Authorization: Bearer {cm_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Apakah fluoride membantu mencegah gigi berlubang?",
    "answer": true,
    "explanation": "Fluoride memperkuat email gigi dan membantu mencegah kerusakan gigi",
    "category": "DENTAL_HYGIENE",
    "difficulty": "MEDIUM"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "quiz_new_001",
    "question": "Apakah fluoride membantu mencegah gigi berlubang?",
    "category": "DENTAL_HYGIENE",
    "difficulty": "MEDIUM",
    "isActive": true,
    "createdById": "cm001",
    "createdAt": "2025-12-14T16:00:00.000Z",
    "createdBy": {
      "id": "cm001",
      "username": "Content Manager"
    }
  },
  "message": "Soal kuis berhasil dibuat"
}
```

---

## Comic Examples

### 1. Get Comic Details

**Request:**
```bash
curl -X GET http://localhost:3000/api/comics/comic001
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "comic001",
    "title": "Petualangan Gigi Sehat",
    "description": "Komik edukatif tentang menjaga kesehatan gigi",
    "coverUrl": "https://via.placeholder.com/400x600?text=Comic+Cover",
    "pages": [
      "https://via.placeholder.com/800x1200?text=Page+1",
      "https://via.placeholder.com/800x1200?text=Page+2",
      "https://via.placeholder.com/800x1200?text=Page+3",
      "https://via.placeholder.com/800x1200?text=Page+4",
      "https://via.placeholder.com/800x1200?text=Page+5"
    ],
    "totalPages": 5,
    "category": "Edukasi",
    "tags": ["kesehatan", "gigi", "anak"],
    "readCount": 12,
    "isPublished": true,
    "publishedAt": "2025-12-01T10:00:00.000Z",
    "createdBy": {
      "id": "cm001",
      "username": "Content Manager"
    }
  },
  "message": "Berhasil mengambil detail komik"
}
```

### 2. Track Comic Reading

**Request:**
```bash
curl -X POST http://localhost:3000/api/comics/comic001/read \
  -H "Authorization: Bearer {student_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "lastPage": 5,
    "completed": true
  }'
```

**Success Response - First Completion (200):**
```json
{
  "success": true,
  "data": {
    "comicRead": {
      "id": "read001",
      "userId": "student123",
      "comicId": "comic001",
      "lastPage": 5,
      "completed": true,
      "completedAt": "2025-12-14T16:30:00.000Z"
    },
    "pointsEarned": 20,
    "newTotalPoints": 205
  },
  "message": "Comic reading berhasil dicatat. Anda mendapat 20 poin!"
}
```

### 3. Create Comic (Admin)

**Request:**
```bash
curl -X POST http://localhost:3000/api/comics \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Si Kecil Belajar Sikat Gigi",
    "description": "Komik interaktif untuk anak TK",
    "coverImageUrl": "https://example.com/cover.jpg",
    "pages": [
      {
        "pageNumber": 1,
        "imageUrl": "https://example.com/page1.jpg"
      },
      {
        "pageNumber": 2,
        "imageUrl": "https://example.com/page2.jpg"
      },
      {
        "pageNumber": 3,
        "imageUrl": "https://example.com/page3.jpg"
      }
    ]
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "comic_new_001",
    "title": "Si Kecil Belajar Sikat Gigi",
    "description": "Komik interaktif untuk anak TK",
    "coverUrl": "https://example.com/cover.jpg",
    "pages": [
      "https://example.com/page1.jpg",
      "https://example.com/page2.jpg",
      "https://example.com/page3.jpg"
    ],
    "totalPages": 3,
    "category": "",
    "tags": [],
    "isPublished": false,
    "createdAt": "2025-12-14T17:00:00.000Z",
    "createdBy": {
      "id": "admin001",
      "username": "Super Admin"
    }
  },
  "message": "Komik berhasil dibuat"
}
```

---

## Game Examples

### 1. List Games

**Request:**
```bash
curl -X GET "http://localhost:3000/api/games?difficulty=EASY"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "game001",
        "title": "Tebak Gambar Gigi",
        "description": "Game interaktif mengenal bagian-bagian gigi",
        "thumbnailUrl": "https://via.placeholder.com/400x300?text=Game",
        "gameUrl": "https://example.com/games/dental-quiz",
        "difficulty": "EASY",
        "clickCount": 24,
        "sortOrder": 1,
        "isPublished": true,
        "publishedAt": "2025-12-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  },
  "message": "Berhasil mengambil daftar game"
}
```

### 2. Track Game Click

**Request:**
```bash
curl -X POST http://localhost:3000/api/games/game001/click \
  -H "Authorization: Bearer {student_token}"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "gameClick": {
      "id": "click001",
      "userId": "student123",
      "gameId": "game001",
      "clickedAt": "2025-12-14T17:30:00.000Z"
    },
    "pointsEarned": 5,
    "newTotalPoints": 210
  },
  "message": "Game click berhasil dicatat. Anda mendapat 5 poin!"
}
```

---

## Gamification Examples

### 1. Get Points Balance

**Request:**
```bash
curl -X GET http://localhost:3000/api/points/balance \
  -H "Authorization: Bearer {student_token}"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "student123",
    "username": "budi_santoso",
    "totalPoints": 210,
    "rank": 5
  },
  "message": "Berhasil mengambil saldo poin"
}
```

### 2. Get Points History

**Request:**
```bash
curl -X GET "http://localhost:3000/api/points/history?page=1&limit=10" \
  -H "Authorization: Bearer {student_token}"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "trans005",
        "activityType": "VIDEO_WATCHED",
        "pointsEarned": 10,
        "description": "Menonton video: Cara Menyikat Gigi yang Benar",
        "createdAt": "2025-12-14T14:30:00.000Z"
      },
      {
        "id": "trans004",
        "activityType": "QUIZ_COMPLETED",
        "pointsEarned": 50,
        "description": "Menyelesaikan kuis dengan score 100%",
        "createdAt": "2025-12-14T15:30:00.000Z"
      },
      {
        "id": "trans003",
        "activityType": "COMIC_READ",
        "pointsEarned": 20,
        "description": "Membaca komik: Petualangan Gigi Sehat",
        "createdAt": "2025-12-14T16:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  },
  "message": "Berhasil mengambil history poin"
}
```

### 3. Global Leaderboard

**Request:**
```bash
curl -X GET "http://localhost:3000/api/leaderboard?limit=10" \
  -H "Authorization: Bearer {student_token}"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "userId": "top_student_001",
      "username": "Andi Pratama",
      "kelas": "3A",
      "totalPoints": 1520,
      "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=andi"
    },
    {
      "rank": 2,
      "userId": "top_student_002",
      "username": "Siti Nurhaliza",
      "kelas": "2B",
      "totalPoints": 1435,
      "avatarUrl": null
    },
    {
      "rank": 5,
      "userId": "student123",
      "username": "budi_santoso",
      "kelas": "2B",
      "totalPoints": 210,
      "avatarUrl": null
    }
  ],
  "message": "Berhasil mengambil leaderboard"
}
```

---

## Admin Examples

### 1. Get Platform Analytics

**Request:**
```bash
curl -X GET http://localhost:3000/api/analytics/overview \
  -H "Authorization: Bearer {admin_token}"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "totalStudents": 5
    },
    "content": {
      "totalVideos": 2,
      "totalQuizzes": 5,
      "totalComics": 1,
      "totalGames": 2
    },
    "engagement": {
      "totalVideoViews": 45,
      "totalQuizAttempts": 23,
      "totalPointsAwarded": 2450
    },
    "recentActivity": {
      "last7Days": {
        "videoViews": 12,
        "quizAttempts": 8,
        "comicReads": 5,
        "gameClicks": 15
      }
    }
  },
  "message": "Berhasil mengambil analytics overview"
}
```

### 2. List All Users (Admin)

**Request:**
```bash
curl -X GET "http://localhost:3000/api/users?role=STUDENT&page=1&limit=20" \
  -H "Authorization: Bearer {admin_token}"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "student123",
        "username": "budi_santoso",
        "email": "budi@student.com",
        "role": "STUDENT",
        "kelas": "2B",
        "totalPoints": 210,
        "isBlocked": false,
        "createdAt": "2025-12-14T14:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  },
  "message": "Berhasil mengambil daftar users"
}
```

---

## Complete User Journey Example

### Full Student Journey: Register → Learn → Earn Points

```bash
# 1. Register
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"student_new","email":"new@student.com","password":"pass123","kelas":"1A"}')

# 2. Extract token
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.tokens.accessToken')

# 3. View available videos
curl -X GET http://localhost:3000/api/videos?limit=5

# 4. Watch a video and earn 10 points
curl -X POST http://localhost:3000/api/videos/video001/view \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# 5. Take quiz and earn 50 points
curl -X POST http://localhost:3000/api/quizzes/attempt \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"questionId":"quiz001","answer":true}]}'

# 6. Check points balance
curl -X GET http://localhost:3000/api/points/balance \
  -H "Authorization: Bearer $TOKEN"

# 7. View leaderboard position
curl -X GET http://localhost:3000/api/leaderboard \
  -H "Authorization: Bearer $TOKEN"
```

---

**Last Updated:** December 14, 2025  
**Total Examples:** 25+ comprehensive scenarios
