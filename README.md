# 🎯 InterviewIQ — AI-Powered Interview Coach

InterviewIQ is a full-stack AI interview preparation platform that simulates real interview experiences, evaluates your answers, and provides personalized coaching feedback. Built with a modern React frontend and FastAPI Python backend with PostgreSQL.

## ✨ Features

- **AI-Powered Questions**: Generate role-specific, topic-focused interview questions at adjustable difficulty levels (easy, medium, hard)
- **Real-Time Answer Evaluation**: Get instant feedback on your answers with scoring, strengths/weaknesses analysis, and ideal answer comparison
- **Adaptive Interviewing**: The AI adapts follow-up questions based on your previous answers and performance
- **Voice Recording**: Record and transcribe your answers using built-in speech recognition (browser-supported)
- **Performance Dashboard**: Track your progress with visual charts, score distributions, difficulty breakdowns, and topic mastery analysis
- **Personalized Recommendations**: Get tailored study plans, resource suggestions, and skill-gap analysis
- **Authentication**: JWT-based auth with access/refresh tokens, session management, and secure logout
- **Progress Tracking**: View interview history, session scores, and improvement trends over time

## 🏗️ Project Structure

```
interview/
├── backend/                      # FastAPI Python backend
│   ├── main.py                   # App entry point & middleware
│   ├── database.py               # PostgreSQL async connection (SQLAlchemy)
│   ├── auth_utils.py             # JWT creation, verification, password hashing
│   ├── requirements.txt          # Python dependencies
│   ├── routes/
│   │   ├── auth.py               # Signup, login, logout, refresh, me endpoints
│   │   ├── ai.py                 # AI question generation
│   │   ├── question.py           # Question serving & next-question logic
│   │   ├── evaluation.py         # Answer evaluation & scoring
│   │   ├── dashboard.py          # Dashboard analytics aggregation
│   │   ├── analytics.py          # History, recommendations endpoints
│   │   ├── adaptive.py           # Adaptive interview session management
│   │   └── __init__.py
│   ├── models/
│   │   ├── user.py               # User model with password hashing
│   │   ├── session.py            # Interview session model
│   │   ├── question_models.py    # Question & attempt models
│   │   ├── interview_models.py   # Interview session data models
│   │   ├── interview_session.py  # Session tracking
│   │   ├── evaluation_models.py  # Evaluation result models
│   │   └── __init__.py
│   ├── services/
│   │   ├── groq_service.py       # Groq AI API integration
│   │   ├── question_service.py   # Question generation logic
│   │   ├── evaluation_service.py # Answer evaluation logic
│   │   ├── adaptive_engine.py    # Adaptive questioning engine
│   │   ├── analytics_service.py  # Analytics computation
│   │   ├── progress_service.py   # Progress tracking
│   │   ├── report_service.py     # Report generation
│   │   ├── recommendation_service.py # Recommendation logic
│   │   ├── resource_service.py   # Resource suggestions
│   │   ├── skill_analyzer.py     # Skill gap analysis
│   │   └── __init__.py
│   ├── prompts/
│   │   ├── question_prompt.txt   # AI prompt template for questions
│   │   ├── evaluation_prompt.txt # AI prompt template for evaluation
│   │   └── report_prompt.txt     # AI prompt template for reports
│   ├── utils/
│   │   └── ...
│   └── data/
│       └── ...
├── frontend/                     # React + Vite frontend
│   ├── index.html                # Root HTML
│   ├── vite.config.js            # Vite configuration
│   ├── package.json              # NPM dependencies
│   ├── .oxlintrc.json            # Linter config
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── main.jsx              # App entry point
│       ├── App.jsx               # Root component with routing & nav
│       ├── index.css             # Global styles (dark/light mode)
│       ├── context/
│       │   ├── AuthContext.jsx    # Auth state management (login, logout, user)
│       │   └── InterviewContext.jsx # Interview session state
│       ├── services/
│       │   └── api.js            # Axios API client with all endpoints
│       ├── pages/
│       │   ├── Home.jsx          # Landing page with interview setup
│       │   ├── Question.jsx      # Active interview question page
│       │   ├── Feedback.jsx      # Answer feedback & scoring
│       │   ├── Dashboard.jsx     # Performance dashboard
│       │   ├── Progress.jsx      # Progress & history tracking
│       │   ├── Login.jsx         # Login form
│       │   └── Signup.jsx        # Registration form
│       ├── components/
│       │   ├── PrivateRoute.jsx  # Auth guard for protected routes
│       │   ├── ErrorBoundary.jsx # Error boundary component
│       │   ├── ScoreChart.jsx    # Score visualization
│       │   ├── TopicChart.jsx    # Topic breakdown chart
│       │   ├── ResourceCard.jsx  # Resource display card
│       │   ├── VoicePlayer.jsx   # Audio playback component
│       │   ├── VoiceRecorder.jsx # Speech-to-text recorder
│       │   └── dashboard/
│       │       ├── Header.jsx
│       │       ├── StatsCards.jsx
│       │       ├── PerformanceChart.jsx
│       │       ├── DifficultyBreakdown.jsx
│       │       ├── TopicChart.jsx
│       │       ├── ScoreCard.jsx
│       │       ├── ReportSection.jsx
│       │       └── ResourceCard.jsx
│       ├── hooks/
│       │   ├── useAnimatedCounter.js
│       │   ├── useAnimatedScore.js
│       │   ├── useConfetti.js
│       │   ├── useFloatingParticles.js
│       │   ├── useSpeechRecognition.js
│       │   ├── useSpeechSynthesis.js
│       │   └── useTypewriter.js
│       └── utils/
│           └── speechSupport.js
├── check_db.py                   # Database connection checker
├── test_api_flow.py              # API test script
├── test_login.json               # Test login payload
├── test_signup.json              # Test signup payload
├── TODO.md                       # Development tasks
├── .gitignore
└── README.md
```

## 🚀 Tech Stack

| Layer         | Technology                                      |
|---------------|--------------------------------------------------|
| Frontend      | React 18, Vite, React Router DOM v6              |
| Styling       | CSS (custom properties, dark/light mode, responsive) |
| Backend       | FastAPI, Python 3.11+, Uvicorn                   |
| AI/ML         | Groq AI / Google Gemini / OpenAI compatible      |
| Database      | PostgreSQL + SQLAlchemy (async)                  |
| Auth          | JWT (access + refresh tokens), bcrypt, OAuth2 Bearer |
| HTTP Client   | Axios (frontend)                                 |
| Voice         | Web Speech API (SpeechRecognition, SpeechSynthesis) |
| Charts        | Recharts (if used)                               |
| Build         | Vite, NPM                                        |

## ⚡ Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL running locally

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (create .env file)
# Required: DATABASE_URL, SECRET_KEY, GEMINI_API_KEY

# Run server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be available at** `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Frontend will be available at** `http://localhost:5173`

## 🔐 Authentication

The app uses JWT-based authentication with the following flow:

### Auth Endpoints
| Method | Endpoint          | Description                        |
|--------|-------------------|------------------------------------|
| POST   | `/auth/signup`    | Create account (email + password)  |
| POST   | `/auth/login`     | Login, returns access + refresh tokens |
| POST   | `/auth/logout`    | Clear session, delete refresh token |
| POST   | `/auth/refresh`   | Refresh access token using refresh token |
| GET    | `/auth/me`        | Get current authenticated user info |

### Auth Flow
1. User signs up or logs in → backend returns `access_token` + sets `refresh_token` as HTTP-only cookie
2. Frontend stores `access_token` in memory via Axios interceptor (Authorization header)
3. On logout → backend deletes all user sessions, clears cookie, frontend clears in-memory token
4. Protected routes redirect to `/login` if not authenticated (`PrivateRoute` component)

## 🌐 API Endpoints

### Interview
| Method | Endpoint                 | Description                          |
|--------|--------------------------|--------------------------------------|
| POST   | `/generate-question`     | Generate a new interview question    |
| POST   | `/generate-next-question`| Generate follow-up question          |
| POST   | `/evaluate-answer`       | Evaluate a submitted answer          |
| POST   | `/interview/start`       | Start a new interview session        |
| POST   | `/interview/save`        | Save an interview attempt            |
| POST   | `/interview/finish`      | Finish an interview session          |

### Analytics
| Method | Endpoint                   | Description                    |
|--------|----------------------------|--------------------------------|
| POST   | `/dashboard`               | Generate dashboard data        |
| GET    | `/analytics/dashboard`     | Get dashboard analytics        |
| GET    | `/analytics/history`       | Get interview history           |
| GET    | `/analytics/recommendations`| Get personalized recommendations |

## 🔧 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/interview
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
# Optional alternative provider:
# GROQ_API_KEY=your-groq-api-key
```

## 🧪 Testing

```bash
# Check database connection
python check_db.py

# Run API flow tests
python test_api_flow.py
```

Test payload files:
- `test_login.json` — login test data
- `test_signup.json` — signup test data

## 🎨 UI/UX Features

- **Dark/Light Mode**: Automatic theme switching based on system preference
- **Responsive Design**: Optimized for mobile, tablet, laptop, and desktop screens
- **Animations**: Smooth transitions, stagger animations, floating particles, confetti effects
- **Voice Support**: Speech-to-text for answers, text-to-speech for questions
- **Error Boundaries**: Graceful error handling with retry options
- **Loading States**: Spinners, skeleton screens, and progress indicators

## 🗺️ Roadmap

- [x] User authentication (signup/login/logout)
- [x] AI question generation
- [x] Answer evaluation with scoring
- [x] Performance dashboard
- [x] Progress tracking & history
- [x] Adaptive interview flow
- [x] Voice recording & playback
- [x] Personalized recommendations & study plans
- [ ] Team/enterprise features
- [ ] Interview scheduling
- [ ] Mobile app (React Native)

## 📄 License

MIT
