# 🎓 Rural Roots Finance  
### AI-Powered Financial Learning Platform

Rural Roots Finance is a **gamified financial education platform** designed to make financial literacy accessible, engaging, and practical for students and first-time learners.

The platform delivers structured learning through **YouTube-powered video lessons**, interactive quizzes, XP-based progression, and streak-based motivation.

Inspired by platforms like **Duolingo, Khan Academy, and Coursera**, Rural Roots Finance transforms financial concepts into a:

> Course → Module → Lesson → Quiz → XP → Level Up

---

## 🚀 Key Features

### 1. Structured Learning System

Each lesson maps to **one YouTube video** followed by a quiz.

---

### 2. YouTube Playlist Integration
YouTube playlists are converted into individual lessons.

Example:
Playlist
├─ Video 1 → Lesson 1: What is Money?
├─ Video 2 → Lesson 2: Why Saving Matters
└─ Video 3 → Lesson 3: Needs vs Wants

---

### 3. Gamification Engine
- XP rewards per lesson  
- Level system based on XP  
- Daily learning streaks  
- Progress bars per module  

---

### 4. Interactive Quiz System
- MCQ based quizzes  
- Instant feedback  
- Score calculation  
- Required for XP unlock  

---

### 5. User Progress Tracking
Tracks:
- Completed lessons  
- Quiz scores  
- XP earned  
- Daily activity streak  

---

## 🧠 System Architecture
Frontend (React + Tailwind)
↓
Supabase (Postgres + Auth)
↓
YouTube Embed API

---

## 🗄️ Database Schema

### courses
| Field | Type |
|------|------|
| id | uuid |
| title | text |
| description | text |
| category | text |

---

### modules
| Field | Type |
|------|------|
| id | uuid |
| course_id | uuid |
| title | text |
| order_index | int |

---

### lessons
| Field | Type |
|------|------|
| id | uuid |
| module_id | uuid |
| title | text |
| video_url | text |
| xp_reward | int |
| order_index | int |

---

### quizzes
| Field | Type |
|------|------|
| id | uuid |
| lesson_id | uuid |
| questions | jsonb |

---

### user_progress
| Field | Type |
|------|------|
| user_id | uuid |
| lesson_id | uuid |
| completed | boolean |
| score | int |
| xp_earned | int |
| completed_at | timestamp |

---

## 🎯 Lesson Flow (Core UX)

1. User selects a course  
2. Opens a module  
3. Clicks a lesson  
4. YouTube video plays  
5. Quiz appears  
6. XP awarded  
7. Progress saved  

---

## 🔧 Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Backend | Supabase (Postgres + Auth) |
| Video | YouTube Embed |
| UI Components | ShadCN UI |
| Icons | Lucide |
| Notifications | Sonner |

---

## 🧩 How Lessons Are Created

Lessons are generated from YouTube playlists.

