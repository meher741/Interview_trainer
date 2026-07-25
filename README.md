# 🎯 InterviewIQ — AI-Powered Interview Coach

InterviewIQ is a full-stack AI interview preparation platform that simulates real interview experiences, evaluates your answers, and provides personalized coaching feedback.

## 🏗️ Project Structure

```
interview/
├── backend/          # FastAPI Python backend
├── frontend/         # React + Vite frontend
├── .gitignore
└── README.md
```

## 🚀 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, TailwindCSS         |
| Backend   | FastAPI, Python 3.11+               |
| AI/ML     | Google Gemini API / OpenAI          |
| Database  | PostgreSQL + SQLAlchemy             |
| Auth      | JWT (OAuth2 + Bearer Token)         |
| Deploy    | Docker + Docker Compose             |

## ⚡ Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📄 License
MIT
