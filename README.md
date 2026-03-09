# Canvas LMS (V1 Production Grade) 🎓

A comprehensive, production-ready Learning Management System (LMS) designed with a premium, academic editorial aesthetic. Built to move beyond simple MVPs, this V1 release focuses on backend robustness, real-time interactivity, and a seamless developer-to-student experience.

**[Live Demo](https://canvas-lms-one.vercel.app/) | [Portfolio Case Study](https://teddonyesero.vercel.app)**

---

## 🚀 Key V1 Features (Advanced Implementation)

### ⚡ Real-Time Interactive Grading
Replaced traditional polling with **Server-Sent Events (SSE)**. Instructors can grade submissions in a fluid, side-by-side interface while the student dashboard updates instantly, providing a modern "chat-like" feedback loop for academic work.

### ✍️ Premium Rich Text Editing
Integrated **TipTap (based on Prosemirror)** to provide a professional writing environment. Supports formatting, placeholders, and secure HTML sanitization via **isomorphic-dompurify** to prevent XSS while maintaining styling.

### ☁️ Scalable File Attachments
Integrated **Vercel Blob** for high-performance, serverless file storage. Students can attach PDFs, images, and documents to their submissions, which are then instantly viewable and downloadable by instructors in the grading portal.

### 🔍 Smart Course Catalogue
Implements a server-side search engine and subject filter. Students can quickly discover courses by title, subject, or difficulty level with zero client-side overhead.

### 📊 Dynamic Student Dashboard
Features a **Relative Time Activity Feed** that tracks enrollments, submissions, and grade alerts. Replaced generic data tables with a "glanceable" UI that prioritizes what needs attention first.

### 🛡️ Backend Fortification
- **Mongoose Cascade Deletions**: Deleting a course automatically logic-cleanses all linked assignments, submissions, and enrollments to prevent orphaned data.
- **Database Optimizations**: Compound indexing for high-speed reads on large datasets.
- **API Rate Limiting**: Built-in protection against brute-force attacks on authentication routes.

---

## 🛠️ The Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Backend** | Node.js Route Handlers (Edge Compatible) |
| **Database** | MongoDB Atlas + Mongoose |
| **Auth** | JWT (jose) via httpOnly Cookies |
| **Storage** | Vercel Blob |
| **Email** | Nodemailer (Transactional Notifications) |
| **Styling** | Vanilla CSS (Academic Editorial Design System) |

---

## 🏗️ Project Architecture

```bash
src/
├── app/
│   ├── (auth)/         # Secure Login/Register flows
│   ├── (app)/          # Protected User & Instructor Dashboards
│   ├── api/            # Serverless Route Handlers (SSE, Uploads, Auth)
├── components/         # Reusable UI (Navbar, RichTextEditor)
├── lib/
│   ├── auth.js         # JWT & Session logic
│   ├── models/         # Mongoose Schemas with Cascade Hooks
│   ├── email.js        # Transactional mail utility
└── middleware.js       # Edge-level route protection
```

---

## 🎨 Design Philosophy: "Academic Editorial"
The system avoids generic gradients and shadows in favor of a clean, high-contrast, editorial layout. Inspired by academic journals, it uses **Source Serif 4** for authority and **Outfit** for modern UI clarity. Light mode is the intentional default to ensure readability during long study sessions.

---

## 🛠️ Local Setup

1. **Clone & Install**:
   ```bash
   git clone <repo-url>
   npm install
   ```

2. **Configure `.env.local`**:
   Copy the `.env.example` and fill in your MongoDB Atlas URI and a generated JWT Secret.

3. **Seed Demo Data**:
   ```bash
   npm run seed
   ```

4. **Dev Mode**:
   ```bash
   npm run dev
   ```

---

## 💼 Role Credits
Designed and Developed by **Tedd Onyesero**. 
Available for collaboration on high-performance web applications and design systems.
