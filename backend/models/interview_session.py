from pydantic import BaseModel
from typing import List, Optional


class SessionQuestion(BaseModel):
    question: str
    difficulty: str
    score: int
    expected_topics: List[str]
    missing_topics: List[str]
    question_category: Optional[str] = ""


class InterviewSession(BaseModel):
    session_id: str = ""
    role: str = ""
    topic: str = ""
    current_difficulty: str = "Easy"
    question_number: int = 1
    total_score: int = 0
    questions: List[SessionQuestion] = []
    weak_topics: List[str] = []
    strong_topics: List[str] = []

    @property
    def average_score(self) -> float:
        if not self.questions:
            return 0
        return round(self.total_score / len(self.questions), 1)

    @property
    def question_history(self) -> List[str]:
        return [q.question for q in self.questions]
