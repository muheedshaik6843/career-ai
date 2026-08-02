@echo off
echo Starting AI Career Assistant Backend...
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
