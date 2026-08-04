# AI Career Assistant — Production SaaS Platform

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker" />
</div>

---

## 🚀 Overview

**AI Career Assistant** is a production-ready SaaS platform designed to supercharge job seekers' careers using cutting-edge AI. Similar to Jobscan, Teal, and Rezi — built from scratch as a commercial-grade product.

### ✨ Key Features (All Working in Production)

| Feature | Description | Status |
|---------|-------------|--------|
| 🔐 **Username-Only Auth** | Simple username login, no passwords required | ✅ Live |
| 📄 **AI Resume Parsing** | PDF/DOCX upload, skill & experience extraction | ✅ Live |
| 🎯 **ATS Scoring Engine** | Real-time keyword match analysis and scoring | ✅ Live |
| 🪄 **Resume Bullet Optimizer** | Rewrite weak bullets with action verbs & metrics | ✅ Live |
| 🤖 **AI Career Copilot Chat** | 24/7 conversational career advisor | ✅ Live |
| 💼 **Live Job Matching** | Multi-source real-time job scraping (5 sources) | ✅ Live |
| 🧠 **Skill Gap Analysis** | Identify missing skills with learning recommendations | ✅ Live |
| 📝 **Cover Letter Generator** | AI-powered, tailored cover letters | ✅ Live |
| 🎤 **Mock Interview Prep** | Behavioral & technical AI interview simulation | ✅ Live |
| 🗺️ **Career Roadmap** | Personalized 3–6 month career path generation | ✅ Live |
| 📊 **Application Tracker** | Application funnel tracking and progress metrics | ✅ Live |

---

## 🌐 Production Deployment

| Component | URL | Status |
|-----------|-----|--------|
| **Frontend (Vercel - Production)** | https://career-ai-five-eta.vercel.app | ✅ Live |
| **Frontend (Vercel - Main Branch)** | https://career-ai-git-main-muheedshaik6843s-projects.vercel.app | ✅ Live |
| **Backend API (Render)** | https://career-ai-api-lmbh.onrender.com | ✅ Live |
| **API Documentation (Swagger)** | https://career-ai-api-lmbh.onrender.com/docs | ✅ Live |
| **Health Check** | https://career-ai-api-lmbh.onrender.com/api/v1/health | ✅ Live |

---

## 🏗️ Architecture

```
career-ai/
├── frontend/          # Next.js 14 App Router (TypeScript)
│   ├── src/app/       # App Router pages and layouts
│   ├── src/components/# Reusable UI components
│   └── src/lib/       # API client, utilities
│
├── backend/           # FastAPI Python service
│   ├── app/
│   │   ├── api/v1/    # Versioned REST endpoints
│   │   ├── core/      # Config, Security, Database
│   │   ├── models/    # SQLAlchemy ORM models
│   │   ├── repositories/ # Data access layer (Repository Pattern)
│   │   ├── schemas/   # Pydantic v2 request/response models
│   │   └── services/  # Business logic (Service Layer)
│   ├── alembic/       # Database migrations
│   └── tests/         # pytest unit & integration tests
│
├── docker-compose.yml # Local orchestration
├── .env.example       # Environment variable template
├── vercel.json        # Vercel deployment config
├── render.yaml        # Render deployment config
└── .github/workflows/ # CI/CD pipelines
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 20+
- Docker Desktop (for PostgreSQL + Redis) - optional for local dev

### 1. Clone & Configure

```bash
git clone https://github.com/muheedshaik6843/career-ai.git
cd career-ai
cp .env.example .env
# Edit .env with your secrets
```

### 2. Start Database Services (Optional)

```bash
docker-compose up db redis -d
```

### 3. Backend Setup

```bash
cd backend
pip install -r requirements.txt
# Run Alembic migrations (requires PostgreSQL running)
alembic upgrade head
# Start FastAPI dev server
uvicorn app.main:app --reload --port 8000
```

> **Local SQLite Fallback**: If PostgreSQL is unavailable, the backend defaults to SQLite (`career_ai.db`) for development — no configuration needed.

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 5. Verify Running Services

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| Health Check | http://localhost:8000/api/v1/health |

---

## 🐳 Docker Full Stack

```bash
# Start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop all services
docker-compose down
```

---

## 🧪 Testing

### Backend Tests (pytest)

```bash
cd backend
python -m pytest tests/ -v
```

**Current status: 22 / 22 tests passing** ✅

### Frontend Tests

```bash
cd frontend
npm run lint
npm run build
```

---

## 🛡️ Security

- **JWT Access + Refresh Token** rotation
- **Bcrypt** password hashing (passlib with defense-in-depth truncation handling)
- **CORS** middleware with configurable origins
- **OWASP** best practices
- **SQL Injection** prevention via SQLAlchemy ORM
- **Input Validation** via Pydantic v2
- **Environment Variables** for all secrets (no hardcoded credentials)
- **SECRET_KEY** fixed in production to prevent token invalidation on deploy

---

## 🚀 Deployment Guide

### Render (Backend)

1. Connect GitHub repo to Render
2. Create Web Service from `backend/` directory
3. Add environment variables:
   - `SECRET_KEY` — Generate: `openssl rand -base64 32`
   - `ENVIRONMENT=production`
   - `DATABASE_URL` — Auto-linked from Render PostgreSQL
   - `GEMINI_API_KEY` — Google Gemini API key
   - `BACKEND_CORS_ORIGINS` — `["https://your-vercel-url.vercel.app"]`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — For OAuth (optional)
4. Deploy — migrations run automatically on startup

### Vercel (Frontend)

1. Import GitHub repo to Vercel
2. Set Root Directory to `frontend/`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com/api/v1`
4. Deploy

---

## 📋 Project Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Foundation: Auth, Dashboard, Infrastructure |
| Phase 2 | ✅ Complete | Resume Intelligence: Parsing, ATS Engine |
| Phase 3 | ✅ Complete | Job Matching: Embeddings, Skill Gap, Live Scraping |
| Phase 4 | ✅ Complete | AI Career Assistant: Cover Letters, Interviews, Chat, Roadmap |
| Phase 5 | ✅ Complete | Production: Deployment, CI/CD, Monitoring |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, TanStack Query |
| Backend | FastAPI, Python 3.12+, SQLAlchemy 2, Pydantic v2 |
| Database | PostgreSQL 16 + Alembic migrations (Render) / SQLite (local) |
| Cache | Redis 7 (optional) |
| AI | Google Gemini (primary), Sentence Transformers (fallback) |
| Auth | JWT + Bcrypt, Username-only auth |
| DevOps | Docker, GitHub Actions, Vercel, Render |

---

## 📝 Environment Variables

### Backend (`.env`)
```env
SECRET_KEY=your-32-char-secret-key
ENVIRONMENT=development
DATABASE_URL=sqlite:///career_ai.db
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
AI_PROVIDER=gemini
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 📄 License

MIT License — Built as a production SaaS reference implementation.

---

## 🙏 Acknowledgments

- Built with FastAPI, Next.js, SQLAlchemy, Pydantic, and Google Gemini
- Inspired by Jobscan, Teal, Rezi, and other career SaaS platforms
- Deployed on Render (backend) and Vercel (frontend) free tiers