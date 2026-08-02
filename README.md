# AI Career Assistant — Production SaaS Platform

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker" />
</div>

---

## 🚀 Overview

**AI Career Assistant** is a production-ready SaaS platform designed to supercharge job seekers' careers using cutting-edge AI. Similar to Jobscan, Teal, and Rezi — built from scratch as a commercial-grade product.

### Key Features
- 📄 **AI Resume Parsing** — PDF/DOCX upload, skill & experience extraction
- 🎯 **ATS Scoring Engine** — Real-time keyword match analysis and scoring
- 🪄 **Resume Bullet Optimizer** — Rewrite weak resume bullet points with action verbs & metrics
- 🤖 **AI Career Copilot Chat** — 24/7 conversational career advisor for resume, interview & salary guidance
- 💼 **Live Job Matching** — Multi-source real-time internet job scraping & recommendations
- 🧠 **Skill Gap Analysis** — Identify missing skills with learning recommendations
- 📝 **Cover Letter Generator** — AI-powered, tailored cover letters
- 🎤 **Mock Interview Prep** — Behavioral & technical AI interview simulation
- 🗺️ **Career Roadmap** — Personalized 3–6 month career path generation
- 📊 **Analytics Dashboard & Application Tracker** — Application funnel tracking and progress metrics

---

## 🏗️ Architecture

```
career-ai/
├── frontend/          # Next.js 15 App Router (TypeScript)
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
└── .github/workflows/ # CI/CD pipelines
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Python 3.10+
- Node.js 20+
- Docker Desktop (for PostgreSQL + Redis)

### 1. Clone & Configure

```bash
git clone https://github.com/your-org/career-ai.git
cd career-ai
cp .env.example .env
# Edit .env with your secrets
```

### 2. Start Database Services

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

Current coverage: **22 / 22 tests passing** ✅

---

## 🛡️ Security

- **JWT Access + Refresh Token** rotation
- **Bcrypt** password hashing (passlib)
- **CORS** middleware with configurable origins
- **OWASP** best practices
- **SQL Injection** prevention via SQLAlchemy ORM
- **Input Validation** via Pydantic v2
- **Environment Variables** for all secrets

---

## 📋 Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Foundation: Auth, Dashboard, Infrastructure |
| Phase 2 | 🔜 Next | Resume Intelligence: Parsing, ATS Engine |
| Phase 3 | ⏳ Planned | Job Matching: Embeddings, Skill Gap |
| Phase 4 | ⏳ Planned | AI Career Assistant: Cover Letters, Interviews |
| Phase 5 | ⏳ Planned | Production: Deployment, CI/CD, Monitoring |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, TanStack Query |
| Backend | FastAPI, Python 3.12+, SQLAlchemy 2, Pydantic v2 |
| Database | PostgreSQL 16 + Alembic migrations |
| Cache | Redis 7 |
| AI | Gemini / OpenAI (abstracted), Sentence Transformers |
| Auth | JWT + Bcrypt, RBAC |
| DevOps | Docker, GitHub Actions, Vercel, Render |

---

## 📄 License

MIT License — Built as a production SaaS reference implementation.
