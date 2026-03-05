# Canvas LMS

A learning management platform with course creation, assignment submission, and real-time grading. Built with Next.js 14, Node.js API routes, and MongoDB.

**Design aesthetic:** Academic editorial — Source Serif 4 headings, Outfit body, warm parchment palette.

---

## Features

**Instructor**
- Create, edit, and publish courses with modules, colour coding, and levels
- Add assignments with descriptions, deadlines, and point values
- Real-time grading interface — submissions appear automatically every 5 seconds
- Live grade indicator shows pending/graded counts at a glance
- Course analytics: enrolled students, pending grades, submissions graded

**Student**
- Browse and enroll in published courses
- Submit assignments as text
- View grades and instructor feedback as soon as they're posted
- Track progress per course (assignments submitted / total)

**Auth**
- JWT in httpOnly cookie (no localStorage)
- Next.js middleware for server-side route protection
- Role-based redirects (instructor → /instructor/courses, student → /dashboard)

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| API | Next.js Route Handlers |
| Database | MongoDB + Mongoose |
| Auth | JWT via `jose` (Edge-compatible) |
| Styling | Global CSS with CSS variables |
| Fonts | Source Serif 4 + Outfit (Google Fonts) |
| Deploy | Vercel (frontend + API) + MongoDB Atlas |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/                     # Login, Register — no navbar
│   │   ├── login/page.js
│   │   └── register/page.js
│   ├── (app)/                      # Authenticated routes with Navbar
│   │   ├── layout.js               # Reads session, passes to Navbar
│   │   ├── dashboard/page.js       # Student: enrolled courses + grades
│   │   ├── courses/
│   │   │   ├── page.js             # Catalogue
│   │   │   └── [id]/
│   │   │       ├── page.js         # Course detail — enroll, view assignments
│   │   │       ├── EnrollButton.js # Client component — enroll/unenroll
│   │   │       └── assignments/[assignmentId]/page.js
│   │   └── instructor/courses/
│   │       ├── page.js             # Instructor dashboard
│   │       ├── new/page.js         # Create course
│   │       └── [id]/
│   │           ├── page.js         # Server: fetch data
│   │           ├── CourseManageClient.js  # Client: tabs, edit, add assignments
│   │           └── grades/page.js  # ⭐ Real-time grading interface
│   ├── api/
│   │   ├── auth/{register,login,logout,me}/route.js
│   │   ├── courses/{route.js,[id]/route.js}
│   │   ├── assignments/route.js
│   │   ├── submissions/{route.js,[id]/route.js}
│   │   └── enrollments/route.js
│   ├── layout.js                   # Root layout — Google Fonts
│   ├── globals.css                 # Full design system
│   └── page.js                     # Landing page
├── components/
│   └── Navbar.js
├── lib/
│   ├── auth.js                     # signToken, verifyToken, getSession
│   ├── db.js                       # Mongoose singleton connection
│   ├── api.js                      # ok() / err() helpers
│   ├── seed.js                     # Demo data seeder
│   └── models/
│       ├── User.js
│       ├── Course.js
│       ├── Assignment.js
│       └── index.js                # Submission, Enrollment
└── middleware.js                   # JWT verification + role-based redirects
```

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Install & Run

```bash
git clone <repo-url>
cd canvas-lms
npm install

# Configure environment
cp .env.example .env.local
# Set MONGODB_URI and JWT_SECRET

# Seed demo data
node src/lib/seed.js

# Start dev server
npm run dev
```

### Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/canvas_lms
JWT_SECRET=<generate with: openssl rand -hex 64>
```

---

## Demo Accounts

After seeding:

| Role       | Email                  | Password   |
|------------|------------------------|------------|
| Instructor | instructor@demo.com    | demo1234   |
| Student    | student@demo.com       | demo1234   |
| Student 2  | priya@demo.com         | demo1234   |

---

## Real-Time Grading

The grading interface polls `/api/submissions` every 5 seconds. When a new submission arrives:
1. It appears in the left sidebar instantly (on next poll)
2. The instructor selects it, reads the content, enters a grade + feedback
3. On save, the UI updates immediately (optimistic update) without a page reload
4. The student sees the grade the next time they load their dashboard

This is polling rather than WebSockets — a deliberate trade-off for simplicity and serverless compatibility. For a production system with many concurrent users, upgrading to Socket.io or Server-Sent Events would be the natural next step.

---

## Deployment

### Vercel (recommended)
```bash
npm install -g vercel
vercel
```

Set env vars in the Vercel dashboard:
- `MONGODB_URI` → your Atlas connection string
- `JWT_SECRET` → a 64-byte hex secret

---

## Dev Log Talking Points

**"Designing a multi-role system without making it a mess"**

1. The core tension: instructor and student need fundamentally different UIs from the same codebase
2. Next.js App Router groups `(auth)` and `(app)` solve layout splitting cleanly
3. Middleware at the edge for route protection — no client-side flicker
4. Single JWT cookie contains `{ id, name, email, role }` — no extra DB lookups for basic auth
5. The `getSession()` utility works in both server components and API routes — one mental model
6. Why polling beats WebSockets for this use case: serverless-compatible, no persistent connections, 5s delay is acceptable for grading
7. Server components for data fetching, client components only where interactivity is needed — keeps the bundle small
