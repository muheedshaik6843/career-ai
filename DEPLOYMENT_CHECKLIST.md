# Deployment Checklist - AI Career Assistant

## 📋 Pre-Deployment Setup

### 1. Prepare Environment Variables

**Local Development** (already working):
```bash
# Root .env (copy from .env.example)
cp .env.example .env
# Edit with your local values

# Backend
cd backend && cp .env.example .env
# Uses SQLite fallback automatically

# Frontend
cd frontend && cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 🚀 Render Deployment (Backend + Database)

### 2. Create Render Services

**Option A: Using render.yaml (Recommended - Infrastructure as Code)**
```bash
# Push to GitHub - Render auto-detects render.yaml
git add .
git commit -m "Fix auth for production deployment"
git push origin main
```

**Option B: Manual Setup via Dashboard**
1. Go to https://dashboard.render.com/
2. **Create PostgreSQL Database:**
   - Name: `career-ai-db`
   - Database: `career_ai`
   - User: `career_ai`
   - Plan: Free
   - Region: Singapore (or closest to users)

3. **Create Web Service:**
   - Connect GitHub repo: `muheedshaik6843/career-ai`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Pre-Deploy Command: `alembic upgrade head`

### 3. Set Render Environment Variables

In Render Dashboard → Web Service → Environment:

| Key | Value | Notes |
|-----|-------|-------|
| `PYTHON_VERSION` | `3.12.0` | |
| `ENVIRONMENT` | `production` | |
| `SECRET_KEY` | *(auto-generated)* | Click "Generate Value" |
| `DATABASE_URL` | *(from database)* | Link to career-ai-db |
| `GEMINI_API_KEY` | `your-actual-key` | From Google AI Studio |
| `BACKEND_CORS_ORIGINS` | `["https://your-vercel-domain.vercel.app"]` | **Update after Vercel deploy** |
| `AI_PROVIDER` | `gemini` | |
| `GEMINI_MODEL` | `gemini-2.5-flash` | |

**Important:** Copy the **Render service URL** (e.g., `https://career-ai-api-xyz.onrender.com`)

---

## 🌐 Vercel Deployment (Frontend)

### 4. Deploy Frontend to Vercel

**Option A: Vercel CLI**
```bash
cd frontend
npm i -g vercel
vercel
# Follow prompts, link to GitHub repo
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import `muheedshaik6843/career-ai`
3. Root Directory: `frontend`
4. Framework: Next.js (auto-detected)
5. Build Command: `npm run build`
5. Output Directory: `.next`

### 5. Set Vercel Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-render-url.onrender.com/api/v1` | Production, Preview, Development |

**Important:** Copy the **Vercel deployment URL** (e.g., `https://career-ai-five-eta.vercel.app`)

---

## 🔗 Connect Frontend ↔ Backend

### 6. Update Render CORS with Vercel URL

In Render Dashboard → Web Service → Environment:
```
BACKEND_CORS_ORIGINS = ["https://career-ai-five-eta.vercel.app"]
```
→ Save → **Manual Deploy** → "Clear build cache & deploy"

### 7. Update Vercel API URL (if Render URL changed)

In Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL = https://your-actual-render-url.onrender.com/api/v1
```
→ Redeploy

---

## ✅ Post-Deployment Verification

### 8. Test Authentication Flow

| Test | Expected Result |
|------|-----------------|
| Visit `https://your-vercel-domain.vercel.app` | Landing page loads |
| Click "Get Started" → Register | Account created, redirected to dashboard |
| Login with credentials | JWT tokens stored, dashboard accessible |
| Refresh page | Session persists (refresh token works) |
| Check browser DevTools → Network | No CORS errors on API calls |

### 9. Verify API Health
```bash
# Backend health
curl https://your-render-url.onrender.com/api/v1/health

# Should return:
# {"success":true,"message":"AI Career Assistant Service is healthy.",...}
```

### 10. Test Key Features
- [ ] Resume upload & parsing
- [ ] ATS scoring
- [ ] Job search/matching
- [ ] AI chat assistant
- [ ] Mock interviews

---

## 🐛 Troubleshooting Common Issues

### CORS Errors
```
Access to fetch at 'https://api.onrender.com' from origin 'https://app.vercel.app' 
blocked by CORS policy
```
**Fix:** Ensure `BACKEND_CORS_ORIGINS` in Render matches exact Vercel domain (including `https://`)

### 401 Unauthorized on Refresh Token
**Fix:** Ensure `SECRET_KEY` is consistent (use `generateValue: true` in render.yaml, not manual entry)

### Database Connection Failed
**Fix:** Check `DATABASE_URL` in Render links to the correct PostgreSQL instance

### Frontend Build Fails
```bash
# Local test first
cd frontend && npm run build
# Check for TypeScript/ESLint errors
```

### Environment Variables Not Loading
- **Vercel:** Must redeploy after adding env vars
- **Render:** Must "Manual Deploy" after env changes

---

## 📝 Environment Variable Reference

### Backend (Render)
| Variable | Required | Example |
|----------|----------|---------|
| `SECRET_KEY` | ✅ | Auto-generated (32+ chars) |
| `DATABASE_URL` | ✅ | `postgresql://user:pass@host/db` |
| `BACKEND_CORS_ORIGINS` | ✅ | `["https://app.vercel.app"]` |
| `GEMINI_API_KEY` | ✅ | `AIzaSy...` |
| `ENVIRONMENT` | ✅ | `production` |
| `REDIS_URL` | ❌ | `redis://...` (for caching) |
| `AI_PROVIDER` | ❌ | `gemini` |
| `GEMINI_MODEL` | ❌ | `gemini-2.5-flash` |

### Frontend (Vercel)
| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | `https://api.onrender.com/api/v1` |

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional - for automated testing)
Create `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && python -m pytest tests/ -v
  
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd frontend && npm ci && npm run build
```

---

## 📞 Support Links

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **FastAPI CORS:** https://fastapi.tiangolo.com/tutorial/cors/
- **Next.js Env Vars:** https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

---

## ✅ Final Verification Checklist

- [ ] Render backend deployed and healthy
- [ ] PostgreSQL database connected
- [ ] Vercel frontend deployed
- [ ] `BACKEND_CORS_ORIGINS` includes Vercel domain
- [ ] `NEXT_PUBLIC_API_URL` points to Render backend
- [ ] `SECRET_KEY` is consistent (not regenerated on each deploy)
- [ ] Register → Login → Dashboard flow works
- [ ] No console errors in browser
- [ ] API calls return 200 OK