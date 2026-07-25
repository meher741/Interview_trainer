from pydantic import BaseModel
from typing import List, Optional


class QuestionRequest(BaseModel):
    role: str
    topic: str
    difficulty: str
    used_categories: Optional[List[str]] = None


class QuestionResponse(BaseModel):
    question: str
    difficulty: str
    expected_topics: List[str]
    hint: str
    estimated_time: str
    question_category: str = "General"
