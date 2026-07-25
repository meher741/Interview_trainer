import requests
import json

BASE = "http://127.0.0.1:8000"

def test_health():
    r = requests.get(f"{BASE}/health")
    print(f"✅ Health: {r.status_code} - {r.json()}")
    return True

def test_signup():
    r = requests.post(f"{BASE}/auth/signup", json={
        "email": "test@example.com",
        "password": "test123"
    })
    print(f"✅ Signup: {r.status_code} - {r.json().get('message', r.json())}")
    if r.status_code == 200:
        data = r.json()
        return data.get("access_token")
    return None

def test_login():
    r = requests.post(f"{BASE}/auth/login", json={
        "email": "test@example.com",
        "password": "test123"
    })
    print(f"✅ Login: {r.status_code} - {r.json().get('message', r.json())}")
    if r.status_code == 200:
        data = r.json()
        return data.get("access_token")
    return None

def test_start_interview(token):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.post(f"{BASE}/interview/start", json={
        "role": "Software Engineer",
        "topic": "Data Structures"
    }, headers=headers)
    print(f"✅ Start Interview: {r.status_code} - {r.json()}")
    if r.status_code == 200:
        data = r.json().get("data", {})
        return data.get("session_id")
    return None

def test_save_attempt(token, session_id):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.post(f"{BASE}/interview/save", json={
        "session_id": session_id,
        "role": "Software Engineer",
        "topic": "Data Structures",
        "difficulty": "Medium",
        "question_text": "Explain the difference between stack and queue?",
        "answer_text": "Stack is LIFO, Queue is FIFO",
        "score": 8,
        "strengths": ["clear concept"],
        "weaknesses": ["needs more depth"],
        "missing_topics": ["deque"],
        "expected_topics": ["stack", "queue"],
        "question_category": "data_structures",
        "confidence": "high",
        "next_difficulty": "Hard"
    }, headers=headers)
    print(f"✅ Save Attempt: {r.status_code} - {r.json()}")
    return r.status_code == 200

def test_finish_interview(token, session_id):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.post(f"{BASE}/interview/finish", json={
        "session_id": session_id
    }, headers=headers)
    print(f"✅ Finish Interview: {r.status_code} - {r.json()}")
    return r.status_code == 200

def test_dashboard_analytics(token):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE}/analytics/dashboard", headers=headers)
    print(f"✅ Dashboard Analytics: {r.status_code}")
    if r.status_code == 200:
        data = r.json().get("data", {})
        print(f"   Stats: {json.dumps(data.get('stats', {}), indent=2)}")
        print(f"   Topics: {len(data.get('topic_performance', []))} topics")
        print(f"   Weak: {len(data.get('weak_topics', []))} weak topics")
        print(f"   Strong: {len(data.get('strong_topics', []))} strong topics")
        print(f"   Sessions: {len(data.get('recent_sessions', []))} recent")
        print(f"   Trend: {len(data.get('improvement_trend', []))} trend points")
        print(f"   Streak: {data.get('learning_streak', {})}")
    return r.status_code == 200

def test_history(token):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE}/analytics/history", headers=headers)
    print(f"✅ History: {r.status_code}")
    if r.status_code == 200:
        data = r.json().get("data", {})
        sessions = data.get("sessions", [])
        print(f"   Sessions: {len(sessions)}")
        for s in sessions:
            print(f"   - {s['role']} ({s['topic']}): avg={s['average_score']}, attempts={s['question_count']}")
    return r.status_code == 200

def test_recommendations(token):
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE}/analytics/recommendations", headers=headers)
    print(f"✅ Recommendations: {r.status_code}")
    if r.status_code == 200:
        data = r.json().get("data", {})
        print(f"   Priority Topics: {data.get('priority_topics', [])}")
        print(f"   Resources: {len(data.get('resources', []))} recs")
        print(f"   Tips: {len(data.get('interview_tips', []))} tips")
    return r.status_code == 200

def test_adaptive_question():
    r = requests.post(f"{BASE}/generate-next-question", json={
        "role": "Software Engineer",
        "topic": "Data Structures",
        "difficulty": "Easy",
        "questions": [],
        "used_categories": []
    })
    print(f"✅ Adaptive Question: {r.status_code}")
    if r.status_code == 200:
        data = r.json().get("data", {})
        question_data = data.get('question', {})
        if isinstance(question_data, dict):
            print(f"   Question: {question_data.get('question', str(question_data))[:100]}...")
        else:
            print(f"   Question: {str(question_data)[:100]}...")
    return r.status_code == 200

# Run all tests
print("=" * 60)
print("INTERVIEW IQ - API TEST SUITE")
print("=" * 60)

print("\n📋 1. Health Check")
test_health()

print("\n📋 2. Signup")
token = test_signup()

if not token:
    print("\n📋 3. Login (since signup already exists)")
    token = test_login()

if token:
    print(f"\n📋 4. Start Interview (token: {token[:20]}...)")
    session_id = test_start_interview(token)

    if session_id:
        print(f"\n📋 5. Save Attempt (session: {session_id})")
        test_save_attempt(token, session_id)

        # Save another attempt
        test_save_attempt(token, session_id)

        print(f"\n📋 6. Finish Interview")
        test_finish_interview(token, session_id)

    print("\n📋 7. Dashboard Analytics")
    test_dashboard_analytics(token)

    print("\n📋 8. Interview History")
    test_history(token)

    print("\n📋 9. AI Recommendations")
    test_recommendations(token)

print("\n📋 10. Adaptive Question Generation")
test_adaptive_question()

print("\n" + "=" * 60)
print("TEST SUITE COMPLETE")
print("=" * 60)
